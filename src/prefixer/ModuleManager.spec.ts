import { ModuleManager } from "./ModuleManager";
import { expect } from "chai";
import * as path from 'path';
import { util } from "../util";
import { file, fsEqual, createProjects, DepGraphNode } from "../TestHelpers.spec";

const hostDir = path.join(process.cwd(), '.tmp', 'hostApp');

describe('ModuleManager', function () {
    //tell mocha these tests take a long time
    this.timeout(20000);

    let manager: ModuleManager;

    beforeEach(() => {
        manager = new ModuleManager();
    });

    async function process() {
        manager.hostDependencies = await util.getModuleDependencies(hostDir);
        await manager.process();
    }

    async function createDependencies(dependencies: DepGraphNode[]) {
        manager.modules = createProjects(hostDir, hostDir, {
            name: 'host',
            dependencies: dependencies
        });
        await Promise.all(
            manager.modules.map(x => x.init())
        );
    }

    describe('getReducedDependencies', () => {
        it('does not throw for zero modules', () => {
            expect(manager.getReducedDependencies()).to.eql([]);
        });

        it('generates simple 1-1 map for modules', async () => {
            await createDependencies([{
                name: 'promise'
            }]);
            await process();
            expect(manager.getReducedDependencies()).to.eql([{
                npmModuleName: 'promise',
                majorVersion: 1,
                version: '1.0.0',
                ropmModuleName: 'promise'
            }]);
        });

        it('ignores the alias for non-host module dependencies', async () => {
            await createDependencies([{
                name: "logger",
                dependencies: [{
                    alias: 'p',
                    name: 'promise'
                }]
            }]);
            await process();
            expect(manager.getReducedDependencies().filter(x => x.npmModuleName === 'promise')).to.eql([{
                npmModuleName: 'promise',
                majorVersion: 1,
                version: '1.0.0',
                ropmModuleName: 'promise_v1'
            }]);
        });

        it('adds version postfix for non-host dependencies', async () => {
            await createDependencies([{
                name: 'logger',
                dependencies: [{
                    name: 'promise',
                    version: '1.0.0',
                    dependencies: [{
                        name: 'promise',
                        version: '2.0.0'
                    }]
                }]
            }]);
            await process();
            expect(manager.getReducedDependencies().filter(x => x.npmModuleName !== 'logger').sort((a, b) => a.majorVersion - b.majorVersion)).to.eql([{
                npmModuleName: 'promise',
                majorVersion: 1,
                version: '1.0.0',
                ropmModuleName: 'promise_v1'
            }, {
                npmModuleName: 'promise',
                majorVersion: 2,
                version: '2.0.0',
                ropmModuleName: 'promise_v2'
            }]);
        });

        it('uses the host alias when present', async () => {
            await createDependencies([{
                alias: 'q',
                name: 'promise',
                version: '1.2.3'
            }, {
                name: 'promise',
                version: '2.0.0'
            }]);
            await process();
            expect(manager.getReducedDependencies().sort((a, b) => a.majorVersion - b.majorVersion)).to.eql([{
                npmModuleName: 'promise',
                majorVersion: 1,
                version: '1.2.3',
                ropmModuleName: 'q'
            }, {
                npmModuleName: 'promise',
                majorVersion: 2,
                version: '2.0.0',
                ropmModuleName: 'promise'
            }]);
        });
    });

    describe('reduceModules', () => {
        it('does not remove unique dependencies', async () => {
            await createDependencies([{
                alias: 'p1',
                name: 'promise',
                version: '1.0.0'
            }, {
                alias: 'p2',
                name: 'promise',
                version: '2.0.0'
            }]);
            await process();

            await manager.reduceModules();
            expect(manager.modules.map(x => [x.npmModuleName, x.version])).to.eql([
                ['promise', '1.0.0'],
                ['promise', '2.0.0']
            ]);
        });

        it('removes unnecessary dependencies', async () => {
            await createDependencies([{
                alias: 'p1',
                name: 'promise',
                version: '1.0.0'
            }, {
                alias: 'p2',
                name: 'promise',
                version: '1.1.0'
            }, {
                alias: 'p3',
                name: 'promise',
                version: '1.2.0'
            }, {
                alias: 'p4',
                name: 'promise',
                version: '2.0.0'
            }]);
            await process();
            await manager.reduceModules();
            expect(manager.modules.map(x => [x.npmModuleName, x.version])).to.eql([
                ['promise', '1.2.0'],
                ['promise', '2.0.0']
            ]);
        });
    });

    /**
       * This test converts the dependency name "module1" to "module2", and names this package "module1"
       */
    it('handles module prefix swapping', async () => {
        createDependencies([{
            alias: 'logger',
            name: 'simple-logger',
            dependencies: [{
                alias: 'logger',
                name: 'complex-logger'
            }],
        }]);

        //simple-logger calls method from complex-logger, aliased as `logger`
        file(`${hostDir}/node_modules/logger/source/main.brs`, `
            sub WriteToLog(message)
                return logger_writeToLog(message)
            end sub
        `);
        await process();

        fsEqual(`${hostDir}/source/roku_modules/logger/main.brs`, `
            sub logger_WriteToLog(message)
                return complexlogger_v1_writeToLog(message)
            end sub
        `);
    });

});

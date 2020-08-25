import { ModuleManager } from "./ModuleManager";
import { expect } from "chai";
import * as path from 'path';
import { util } from "../util";
import { file, fsEqual, createProjects, DepGraphNode, trim } from "../TestHelpers.spec";

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
        return manager.modules;
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

            await manager.reduceModulesAndCreatePrefixMaps();
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
            await manager.reduceModulesAndCreatePrefixMaps();
            expect(manager.modules.map(x => [x.npmModuleName, x.version])).to.eql([
                ['promise', '1.2.0'],
                ['promise', '2.0.0']
            ]);
        });
    });

    describe('process', () => {

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

        it('applies a prefix to all functions of a program', async () => {
            let [logger] = await createDependencies([{
                name: 'logger'
            }]);

            file(`${logger.rootDir}/source/main.brs`, `
                sub main()
                    SanitizeText("123")
                end sub
                sub SanitizeText(text as string)
                    PrintMessage("Sanitizing text: " + text)
                end sub
            `);
            file(`${logger.rootDir}/source/lib.brs`, `
                sub PrintMessage(message)
                    print message
                end sub
            `);
            await process();

            fsEqual(`${hostDir}/source/roku_modules/logger/main.brs`, `
                sub main()
                    logger_SanitizeText("123")
                end sub
                sub logger_SanitizeText(text as string)
                    logger_PrintMessage("Sanitizing text: " + text)
                end sub
            `);

            fsEqual(`${hostDir}/source/roku_modules/logger/lib.brs`, `
                sub logger_PrintMessage(message)
                    print message
                end sub
            `);
        });

        it('applies a prefix to components and their usage', async () => {
            let [logger] = await createDependencies([{
                name: 'logger'
            }]);

            file(`${logger.rootDir}/components/Component1.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="Component1" extends="Component2" >
                </component>
            `);
            file(`${logger.rootDir}/components/Component2.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="Component2" extends="Task" >
                    <children>
                        <Component1 />
                        <Component2>
                        </Component2>
                    </children>
                </component>
            `);
            file(`${logger.rootDir}/source/main.brs`, `
                sub main()
                    comp = CreateObject("rosgnode", "Component1")
                    comp.CreateChild("Component2")
                end sub
            `);
            await process();

            fsEqual(`${hostDir}/components/roku_modules/logger/Component1.xml`, `
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="logger_Component1" extends="logger_Component2" >
                </component>
            `);
            fsEqual(`${hostDir}/components/roku_modules/logger/Component2.xml`, `
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="logger_Component2" extends="Task" >
                    <children>
                        <logger_Component1 />
                        <logger_Component2>
                        </logger_Component2>
                    </children>
                </component>
            `);

            fsEqual(`${hostDir}/source/roku_modules/logger/main.brs`, `
                sub main()
                    comp = CreateObject("rosgnode", "logger_Component1")
                    comp.CreateChild("logger_Component2")
                end sub
            `);
        });

        it('renames dependency prefixes', async () => {
            let [logger] = await createDependencies([{
                alias: 'logger',
                name: '@alpha/logger',
                dependencies: [{
                    alias: 'logger',
                    name: '@bravo/printer'
                }]
            }]);

            file(`${logger.rootDir}/source/main.brs`, `
                sub PrintValue(value)
                    print logger_writeLine(value)
                end sub
            `);

            await process();

            fsEqual(`${hostDir}/source/roku_modules/logger/main.brs`, `
                sub logger_PrintValue(value)
                    print bravo_printer_v1_writeLine(value)
                end sub
            `);
        });

        it('rewrites file paths for own package', async () => {
            let [logger] = await createDependencies([{
                name: 'logger'
            }]);

            file(`${logger.rootDir}/source/common.brs`, `
                sub echo(message)
                    print message
                end sub
            `);

            file(`${logger.rootDir}/components/common.brs`, `
                sub echo(message)
                    print message
                end sub
            `);


            file(`${logger.rootDir}/components/Component1.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="Component1">
                    <script uri="pkg:/source/common.brs" />
                    <script uri="common.brs" />
                    <script uri="./common.brs" />
                    <script uri="../components/common.brs" />
                </component>
            `);

            await process();

            fsEqual(`${hostDir}/components/roku_modules/logger/Component1.xml`, `
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="logger_Component1">
                    <script uri="pkg:/source/roku_modules/logger/common.brs" />
                    <script uri="pkg:/components/roku_modules/logger/common.brs" />
                    <script uri="pkg:/components/roku_modules/logger/common.brs" />
                    <script uri="pkg:/components/roku_modules/logger/common.brs" />
                </component>
            `);
        });
    });
});

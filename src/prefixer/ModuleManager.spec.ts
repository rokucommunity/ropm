import { ModuleManager } from "./ModuleManager";
import { expect } from "chai";
import { RopmModule } from "./RopmModule";
import * as path from 'path';

const hostRootDir = path.join(process.cwd(), '.tmp', 'hostApp');

describe.only('ModuleManager', () => {
    let manager: ModuleManager;

    beforeEach(() => {
        manager = new ModuleManager();
    });

    function addModule(npmModuleName: string, version: string, alias = npmModuleName) {
        const module = new RopmModule(
            hostRootDir,
            path.join(hostRootDir, 'roku_modules', alias)
        );
        module.npmModuleName = npmModuleName;
        module.version = version;
        manager.modules.push(module);
    }

    describe('getReducedDependencies', () => {
        it('does not throw for zero modules', () => {
            expect(manager.getReducedDependencies()).to.eql([]);
        });

        it('generates simple 1-1 map for modules', () => {
            addModule('promise', '1.0.0');
            expect(manager.getReducedDependencies()).to.eql([{
                npmModuleName: 'promise',
                majorVersion: 1,
                version: '1.0.0',
                ropmModuleName: 'promise_v1'
            }]);
        });

        it('ignores the alias for non-host module dependencies', () => {
            addModule('promise', '1.0.0', 'p');
            expect(manager.getReducedDependencies()).to.eql([{
                npmModuleName: 'promise',
                majorVersion: 1,
                version: '1.0.0',
                ropmModuleName: 'promise_v1'
            }]);
        });

        it('adds version postfix for non-host dependencies', () => {
            addModule('promise', '1.0.0');
            addModule('promise', '2.0.0');
            expect(manager.getReducedDependencies().sort((a, b) => a.majorVersion - b.majorVersion)).to.eql([{
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

        it('uses the host alias when present', () => {
            addModule('promise', '1.0.0');
            addModule('promise', '2.0.0');
            manager.hostDependencies = [{
                alias: 'q',
                npmPackageName: 'promise',
                version: '1.2.3'
            }];
            expect(manager.getReducedDependencies().sort((a, b) => a.majorVersion - b.majorVersion)).to.eql([{
                npmModuleName: 'promise',
                majorVersion: 1,
                version: '1.2.3',
                ropmModuleName: 'q'
            }, {
                npmModuleName: 'promise',
                majorVersion: 2,
                version: '2.0.0',
                ropmModuleName: 'promise_v2'
            }]);
        });
    });

    describe('reduceModules', () => {
        it('does not remove unique dependencies', () => {
            addModule('promise', '1.0.0');
            addModule('promise', '2.0.0');
            manager.reduceModules();
            expect(manager.modules.map(x => [x.npmModuleName, x.version])).to.eql([
                ['promise', '1.0.0'],
                ['promise', '2.0.0']
            ]);
        });

        it('does removes unnecessary dependencies', () => {
            addModule('promise', '1.0.0');
            addModule('promise', '1.1.0');
            addModule('promise', '1.2.0');
            addModule('promise', '2.0.0');
            manager.reduceModules();
            expect(manager.modules.map(x => [x.npmModuleName, x.version])).to.eql([
                ['promise', '1.2.0'],
                ['promise', '2.0.0']
            ]);
        });
    });
});

import { RopmModule } from "./RopmModule";
import { tempDir, mergePackageJson, createProjects, expectThrowsAsync } from "../TestHelpers.spec";
import { expect } from "chai";


const hostDir = `${tempDir}/host`;

describe('RopmModule', () => {
    describe('init', () => {
        it('invalidates with missing alias name', async () => {
            let [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            (logger as any).npmAliasName = undefined;
            await logger.init();
            expect(logger.isValid).to.be.false;
        });

        it('invalidates with missing alias name', async () => {
            let [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            mergePackageJson(logger.moduleDir, {
                //blank out the name
                name: ''
            });
            let module = new RopmModule(hostDir, logger.moduleDir);
            await module.init();
            expect(module.isValid).to.be.false;
        });

        it('handles missing `keywords` array', async () => {
            let [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            mergePackageJson(logger.moduleDir, {
                keywords: undefined
            });
            let module = new RopmModule(hostDir, logger.moduleDir);
            await module.init();
            expect(module.isValid).to.be.false;
        });
    });

    describe('createPrefixMap', () => {
        it('throws when missing own dependency', async () => {
            let [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            await expectThrowsAsync(() => logger.createPrefixMap([]));
        });

        it('throws when missing dependency', async () => {
            let [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    dependencies: [{
                        name: 'promise'
                    }]
                }]
            });
            //NOTE: omitted program dependency for `promise`
            await expectThrowsAsync(() => logger.createPrefixMap([{
                majorVersion: 1,
                version: '1.0.0',
                npmModuleName: 'logger',
                ropmModuleName: 'logger'
            }]));
        });
    });
});
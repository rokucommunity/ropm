import { RopmModule } from './RopmModule';
import { tempDir, mergePackageJson, createProjects, expectThrowsAsync } from '../TestHelpers.spec';
import { expect } from 'chai';
import type { Dependency } from './ModuleManager';
import { createSandbox } from 'sinon';
import { util } from '../util';
const sinon = createSandbox();

const hostDir = `${tempDir}/host`;

describe('RopmModule', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('init', () => {
        it('invalidates with missing alias name', async () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            (logger as any).npmAliasName = undefined;
            await logger.init();
            expect(logger.isValid).to.be.false;
        });

        it('computes dominantVersion properly for prerelease', async () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    version: '1.2.3-beta.1'
                }]
            });
            await logger.init();
            expect(logger.dominantVersion).to.equal('1.2.3-beta.1');
        });

        it('invalidates with missing alias name', async () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            mergePackageJson(logger.moduleDir, {
                //blank out the name
                name: ''
            });
            const module = new RopmModule(hostDir, logger.moduleDir);
            await module.init();
            expect(module.isValid).to.be.false;
        });

        it('handles missing `keywords` array', async () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            mergePackageJson(logger.moduleDir, {
                keywords: undefined
            });
            const module = new RopmModule(hostDir, logger.moduleDir);
            await module.init();
            expect(module.isValid).to.be.false;
        });
    });

    describe('createPrefixMap', () => {
        it('throws when missing own dependency', async () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            await expectThrowsAsync(() => logger.createPrefixMap([]));
        });

        it('throws when missing dependency', async () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    dependencies: [{
                        name: 'promise'
                    }]
                }]
            });
            await logger.init();

            //NOTE: omitted program dependency for `promise`
            await expectThrowsAsync(() => logger.createPrefixMap([{
                dominantVersion: '1',
                version: '1.0.0',
                npmModuleName: 'logger',
                ropmModuleName: 'logger'
            }]), `Cannot find suitable program dependency for promise@1.0.0`);
        });

        it('properly handles prerelease versions', async () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    dependencies: [{
                        name: 'promise',
                        version: '2.0.0-beta.1'
                    }]
                }]
            });
            await logger.init();

            //does not throw exception for prerelease promise lib
            await logger.createPrefixMap([{
                npmModuleName: 'logger',
                ropmModuleName: 'logger',
                version: '1.0.0',
                dominantVersion: '1'
            }, {
                npmModuleName: 'promise',
                ropmModuleName: 'promise',
                version: '2.0.0-beta.1',
                dominantVersion: '2.0.0-beta.1'
            }]);
        });

        it('error includes npm alias and original module name', async () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'real-name',
                    alias: 'alias'
                }]
            });
            logger.npmModuleName = 'logger';
            let error!: Error;
            try {
                sinon.stub(util, 'getModuleDependencies').returns(Promise.resolve([{ npmAlias: 'alias', npmModuleName: 'real-name', version: '1.0.0' } as any]));
                await logger.createPrefixMap([{ npmModuleName: 'logger' } as Dependency]);
            } catch (e) {
                error = e as unknown as Error;
            }
            expect(error?.message).to.include('alias(real-name)');
        });
    });

    describe('getDistinctFunctionCallNames', () => {
        it('works', () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            logger.files = [{
                functionReferences: [{
                    name: 'Main'
                }]
            }, {
                functionReferences: [{
                    name: 'Main'
                }]
            }] as any[];
            expect(logger.getDistinctFunctionCallNames()).to.eql(['main']);
        });
    });

    describe('getDistinctComponentReferenceNames', () => {
        it('finds component1', () => {
            const [logger] = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger'
                }]
            });
            logger.files = [{
                componentReferences: [{
                    name: 'Component1'
                }]
            }, {
                componentReferences: [{
                    name: 'Component1'
                }]
            }] as any[];
            expect(logger.getDistinctComponentReferenceNames()).to.eql(['component1']);
        });
    });
});

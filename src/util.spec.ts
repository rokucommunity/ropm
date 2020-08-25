import { util } from './util';
import * as fsExtra from 'fs-extra';
import { expect } from 'chai';
import * as childProcess from 'child_process';
import { createSandbox } from 'sinon';
import { tempDir, expectThrowsAsync, createProjects } from './TestHelpers.spec';
export const sinon = createSandbox();

describe('Util', () => {
    beforeEach(() => {
        sinon.restore();
    });
    describe('getModuleName', () => {
        it('finds non-namespace names', () => {
            expect(util.getModuleName('fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('some_folder/fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('some_folder\\fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('../fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('..\\fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('C:\\projects\\some_folder\\fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('C:/projects/some_folder/fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('/usr/someone/projects/some_folder/fs-extra')).to.equal('fs-extra');
        });

        it('finds namespaced names from module names', () => {
            expect(util.getModuleName('@namespace/fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('@namespace\\fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('../@namespace/fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('..\\@namespace\\fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('C:\\projects\\@namespace\\fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('C:/projects/@namespace/fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('/usr/someone/projects/@namespace/fs-extra')).to.equal('@namespace/fs-extra');
        });

        it('returns undefined for invalid or empty input', () => {
            expect(util.getModuleName('')).to.be.undefined;
            expect(util.getModuleName(false as any)).to.be.undefined;
            expect(util.getModuleName({} as any)).to.be.undefined;
        });
    });

    describe('getRopmNameFromModuleName', () => {
        it('does nothing with already-valid names', () => {
            expect(util.getRopmNameFromModuleName('module')).to.equal('module');
            expect(util.getRopmNameFromModuleName('module_1')).to.equal('module_1');
            expect(util.getRopmNameFromModuleName('some_module')).to.equal('some_module');
        });

        it('replaces invalid characters', () => {
            expect(util.getRopmNameFromModuleName('@company')).to.equal('company');
            expect(util.getRopmNameFromModuleName('.:module')).to.equal('module');
            expect(util.getRopmNameFromModuleName('mod-ule')).to.equal('module');
            expect(util.getRopmNameFromModuleName(' module ')).to.equal('module');
            expect(util.getRopmNameFromModuleName('\tmodule ')).to.equal('module');
        });

        it('handles scoped packages properly', () => {
            expect(util.getRopmNameFromModuleName('@company/module')).to.equal('company_module');
        });

        it('prefixes number-first names with underscore', () => {
            expect(util.getRopmNameFromModuleName('123module')).to.equal('_123module');
        });

        it('converts nonstandard alpha characters into standard onces', () => {
            expect(util.getRopmNameFromModuleName('ỆᶍǍᶆṔƚÉáéíóúýčďěňřšťžů')).to.equal('exampleaeiouycdenrstzu');
        });
    });

    describe('spawnAsnc', () => {
        it('uses an empty object if not specified', async () => {
            const stub = sinon.stub(childProcess, 'spawn').callsFake(() => {
                return {
                    addListener: function (name: string, callback: any) {
                        if (name === 'exit') {
                            setTimeout(() => callback(), 1);
                        }
                    }
                } as any;
            });
            await util.spawnAsync('noop');
            expect(stub.getCalls()[0].args).to.eql([
                'noop', [], { stdio: 'inherit' }
            ]);
        });
    });

    describe('spawnNpmAsync', () => {
        it('uses `npm.cmd` on windows', async () => {
            const stub = sinon.stub(util, 'spawnAsync').callsFake(() => {
                return Promise.resolve();
            });
            sinon.stub(util as any, 'isWindowsPlatform').returns(true);
            await util.spawnNpmAsync(['arg']);
            expect(stub.getCalls()[0].args[0]).to.eql('npm.cmd');
        });

        it('uses `npm` on non-windows', async () => {
            const stub = sinon.stub(util, 'spawnAsync').callsFake(() => {
                return Promise.resolve();
            });
            sinon.stub(util as any, 'isWindowsPlatform').returns(false);
            await util.spawnNpmAsync(['arg']);
            expect(stub.getCalls()[0].args[0]).to.eql('npm');
        });
    });

    describe('globAll', () => {
        it('rejects on error', async () => {
            //passing undefined results in an error
            await expectThrowsAsync(() => util.globAll(undefined));
        });
    });

    describe('copyFiles', () => {
        it('throws if failed to copy reaches threshold', async () => {
            //create a file with the same name as the target folder (this should trigger an error)
            fsExtra.ensureDirSync(`${tempDir}/dest`);
            fsExtra.writeFileSync(`${tempDir}/src`, '');
            await expectThrowsAsync(() => util.copyFiles([{
                src: `${tempDir}/src`,
                dest: `${tempDir}/dest`
            }]));
        });
    });

    describe('getModuleDependencies', () => {
        it('throws when dependency is missing', async () => {
            const hostDir = `${tempDir}/project-a`;
            createProjects(hostDir, hostDir, {
                name: 'project-a',
                dependencies: [{
                    name: 'project-b'
                }]
            });
            fsExtra.removeSync(`${hostDir}/node_modules/project-b`);

            await expectThrowsAsync(() => util.getModuleDependencies(hostDir));
        });
    });

    describe('findDependencyDir', () => {
        it('throws when dependency is missing', async () => {
            const hostDir = `${tempDir}/project-a`;
            createProjects(hostDir, hostDir, {
                name: 'project-a',
                dependencies: [{
                    name: 'project-b'
                }]
            });
            fsExtra.removeSync(`${hostDir}/node_modules/project-b`);

            expect(await util.findDependencyDir(hostDir, 'project-b')).to.be.undefined;
        });
    });
});

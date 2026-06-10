import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { expect } from 'chai';
import { createSandbox } from 'sinon';
import { util } from '../util';
import { PnpmPackageManager } from './PnpmPackageManager';
import { InstallCommand } from '../commands/InstallCommand';
import { writeProject } from '../commands/InstallCommand.spec';
import { tempDir } from '../TestHelpers.spec';

const sinon = createSandbox();

const projectName = 'pnpm-test-project';
const projectDir = path.join(tempDir, projectName);

describe('PnpmPackageManager', () => {
    let manager: PnpmPackageManager;

    beforeEach(() => {
        manager = new PnpmPackageManager();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('has the name "pnpm"', () => {
        expect(manager.name).to.eql('pnpm');
    });

    describe('binary name', () => {
        it('uses `pnpm.cmd` on windows', async () => {
            const stub = sinon.stub(util, 'spawnAsync').returns(Promise.resolve());
            sinon.stub(util, 'isWindowsPlatform').returns(true);
            await manager.install([], { cwd: process.cwd() });
            expect(stub.getCalls()[0].args[0]).to.eql('pnpm.cmd');
        });

        it('uses `pnpm` on non-windows', async () => {
            const stub = sinon.stub(util, 'spawnAsync').returns(Promise.resolve());
            sinon.stub(util, 'isWindowsPlatform').returns(false);
            await manager.install([], { cwd: process.cwd() });
            expect(stub.getCalls()[0].args[0]).to.eql('pnpm');
        });
    });

    describe('init', () => {
        it('runs `pnpm init` (ignoring force, which pnpm does not support)', async () => {
            const stub = sinon.stub(util, 'spawnAsync').returns(Promise.resolve());
            await manager.init({ cwd: process.cwd(), force: true });
            expect(stub.getCalls()[0].args[1]).to.eql(['init']);
        });
    });

    describe('integration (real pnpm install)', () => {
        it('installs local packages and prefixes them', async () => {
            writeProject('logger', {
                'source/logger.brs': 'sub log()\nend sub'
            });

            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                },
                ropm: {
                    packageManager: 'pnpm'
                }
            });

            await new InstallCommand({ cwd: projectDir }).run();

            expect(
                fsExtra.readFileSync(
                    path.join(projectDir, 'source', 'roku_modules', 'logger', 'logger.brs')
                ).toString()
            ).to.eql('sub logger_log()\nend sub');
        });

        it('installs nested dependencies (pnpm resolves them automatically)', async () => {
            writeProject('maestro', {
                'source/NodeClass.brs': ''
            });

            writeProject('logger', {
                'source/logger.brs': ''
            }, {
                dependencies: {
                    'maestro': `file:../maestro`
                }
            });

            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                },
                ropm: {
                    packageManager: 'pnpm'
                }
            });

            await new InstallCommand({ cwd: projectDir }).run();

            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'source', 'roku_modules', 'maestro_v1')
            )).to.be.true;
        });

        it('getProductionDependencies returns the host directory first', async () => {
            writeProject('logger', {
                'source/logger.brs': ''
            });

            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                },
                ropm: {
                    packageManager: 'pnpm'
                }
            });

            const command = new InstallCommand({ cwd: projectDir, packageManager: 'pnpm' });
            await command.run();

            const deps = command.getProdDependencies();
            expect(deps[0]).to.eql(projectDir);
            expect(deps.length).to.be.greaterThan(1);
        });
    });
});

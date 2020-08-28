/* eslint-disable @typescript-eslint/naming-convention */
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { InstallCommandArgs, InstallCommand } from './InstallCommand';
import { expect } from 'chai';
import { RopmPackageJson } from '../util';
import { tempDir } from '../TestHelpers.spec';

const projectName = 'test-project';
const projectDir = path.join(tempDir, projectName);

describe('InstallCommand', function () {
    //tell mocha these tests take a long time
    this.timeout(20000);

    let args: InstallCommandArgs;
    let command: InstallCommand;

    beforeEach(() => {
        args = {
            packages: [],
            cwd: projectDir
        };
        command = new InstallCommand(args);
        //make the test project
        fsExtra.ensureDirSync(tempDir);
        fsExtra.emptyDirSync(tempDir);
        fsExtra.ensureDirSync(projectDir);
    });


    afterEach(() => {
        fsExtra.ensureDirSync(tempDir);
        fsExtra.emptyDirSync(tempDir);
    });
    after(() => {
        fsExtra.emptyDirSync(tempDir);
        fsExtra.rmdirSync(tempDir);
    });

    describe('install', () => {
        it('works with local packages', async () => {

            //main project
            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                }
            });

            //lib
            writeProject('logger', {
                'source/logger.brs': ''
            });

            await command.run();
            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'source', 'roku_modules', 'logger', 'logger.brs')
            )).to.be.true;
        });

        it('uses dependency package.json ropm.rootDir when specified', async () => {

            writeProject('logger', {
                'src/source/logger.brs': ''
            }, {
                ropm: {
                    rootDir: 'src'
                }
            });

            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                }
            });

            await command.run();
            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'source', 'roku_modules', 'logger', 'logger.brs')
            )).to.be.true;
        });

        it('honors dependency package.json `files` property', async () => {

            writeProject('logger', {
                'source/logger.brs': '',
                'source/temp.brs': ''
            }, {
                files: [
                    'source/logger.brs'
                ]
            });

            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                }
            });

            await command.run();

            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'source', 'roku_modules', 'logger', 'logger.brs')
            )).to.be.true;

            //temp.brs should not have been copied
            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'source', 'roku_modules', 'logger', 'temp.brs')
            )).to.be.false;
        });

        it('honors host package.json `ropm.rootDir` property', async () => {

            writeProject('logger', {
                'source/logger.brs': '',
                'source/temp.brs': ''
            });

            writeProject(projectName, {
                'src/source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                },
                ropm: {
                    rootDir: 'src'
                }
            });

            await command.run();

            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'src', 'source', 'roku_modules', 'logger', 'logger.brs')
            )).to.be.true;
            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'src', 'source', 'roku_modules', 'logger', 'temp.brs')
            )).to.be.true;
        });

        it('works when not passing in any packages', async () => {
            //remove packages
            delete args.packages;

            writeProject(projectName, {
                'source/main.brs': ''
            });

            await command.run();
        });

        it('cleans up before installing', async () => {
            writeProject(projectName, {
                'source/main.brs': '',
                //a "leftover" file from a previous ropm install
                'customDir/roku_modules/testlib/file.brs': ''
            });

            await command.run();
            //the command should have deleted all roku_modules folders
            expect(
                fsExtra.pathExistsSync(
                    path.join(tempDir, projectName, 'customDir', 'roku_modules')
                )
            ).to.be.false;
            //the command should have deleted empty top-level folders that used to have roku_modules in them
            expect(
                fsExtra.pathExistsSync(
                    path.join(tempDir, projectName, 'customDir')
                )
            ).to.be.false;

        });

        it('shows underlying error when `npm ls` fails', async () => {
            writeProject(projectName, {
                'source/main.brs': '',
                //a "leftover" file from a previous ropm install
                'customDir/roku_modules/testlib/file.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                }
            });

            let ex;
            try {
                await command.run();
            } catch (e) {
                ex = e;
            }
            expect(ex.message).to.include('Failed to compute prod dependencies');
        });

        it('ignores prod dependencies that are missing the "ropm" keyword', async () => {
            writeProject('logger', {
                'source/logger.brs': ''
            }, {
                keywords: ['not-ropm']
            });

            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                }
            });

            await command.run();
            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'source', 'roku_modules', 'logger')
            )).to.be.false;
        });

        it('ignores top-level package files', async () => {
            writeProject('logger', {
                'source/logger.brs': '',
                //these files are at the top-level of the project and should be ignored
                'readme.md': '',
                'LICENSE': ''
            });

            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                }
            });

            await command.run();

            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'source', 'roku_modules', 'logger', 'logger.brs')
            )).to.be.true;

            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'readme.md')
            ), 'readme.md should not exist').to.be.false;

            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'LICENSE')
            ), 'LICENSE should not exist').to.be.false;
        });
    });
});

export function writeProject(projectName: string, files: { [key: string]: string }, additionalPackageJson?: Partial<RopmPackageJson>) {
    for (const relativePath in files) {
        const filePath = path.join(tempDir, projectName, relativePath);
        fsExtra.ensureDirSync(
            path.dirname(filePath)
        );
        fsExtra.writeFileSync(filePath, files[relativePath]);
    }
    const packageJson = {
        name: projectName,
        version: '1.0.0',
        description: '',
        keywords: [
            'ropm'
        ],
        ...(additionalPackageJson ?? {})
    };
    //write the package.json
    fsExtra.writeFileSync(
        path.join(
            tempDir, projectName, 'package.json'
        ),
        JSON.stringify(packageJson)
    );
}

/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-invalid-this */
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { InstallCommandArgs, InstallCommand } from './InstallCommand';
import { expect } from 'chai';
import { RopmPackageJson } from '../util';

const tempDir = path.join(process.cwd(), '.tmp');
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
                'source/main.brs': ''
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
    });

});

export function writeProject(projectName: string, files: { [key: string]: string }, additionalPackageJson?: RopmPackageJson) {
    for (let relativePath in files) {
        let filePath = path.join(tempDir, projectName, relativePath);
        fsExtra.ensureDirSync(
            path.dirname(filePath)
        );
        fsExtra.writeFileSync(filePath, files[relativePath]);
    }
    const packageJson = {
        name: projectName,
        version: '1.0.0',
        description: '',
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

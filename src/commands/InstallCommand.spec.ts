import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { InstallCommandArgs, InstallCommand } from './InstallCommand';
import { expect } from 'chai';

const tempDir = path.join(process.cwd(), '.tmp');
const projectName = 'test-project';
const projectDir = path.join(tempDir, projectName);

describe('InstallCommand', () => {
    let args: InstallCommandArgs;
    let command: InstallCommand;

    beforeEach(() => {
        args = {
            packages: [],
            cwd: projectDir
        };
        command = new InstallCommand(args);
        //make the test project
        fsExtra.ensureDirSync(projectDir);
    });

    function writeProject(projectName: string, files: { [key: string]: string }, additionalPackageJson?: any) {
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

    afterEach(() => {
        fsExtra.ensureDirSync(projectDir);
        fsExtra.emptyDirSync(projectDir);
    });
    after(() => {
        fsExtra.emptyDirSync(projectDir);
        fsExtra.rmdirSync(projectDir);
    });

    describe('install', () => {
        it.only('works with local packages', async function test() {
            this.timeout(20000);//eslint-disable-line
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
                path.join(projectDir, 'roku_modules', 'logger', 'source', 'logger.brs')
            )).to.be.true;
        });
    });

    describe('copyModuleToRokuModules', () => {
        it('uses package.json ropm.files array when specified', async () => {

        });
    });

});

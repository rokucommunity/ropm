/* eslint-disable @typescript-eslint/naming-convention */
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import * as util from 'util';
import { exec } from 'child_process';
const execPromisified = util.promisify(exec);
import type { InstallCommandArgs } from './InstallCommand';
import { InstallCommand } from './InstallCommand';
import { expect } from 'chai';
import type { RopmPackageJson } from '../util';
import { createProjects, fsEqual, standardizePath as s, tempDir } from '../TestHelpers.spec';

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

        it('processes non-default folder paths', async () => {
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
                'nonStandardFolder/logger.brs': 'sub log()\nend sub'
            });

            await command.run();

            expect(
                fsExtra.readFileSync(s`${projectDir}/nonStandardFolder/roku_modules/logger/logger.brs`).toString()
            ).to.eql(
                'sub logger_log()\nend sub'
            );
        });

        it('uses dependency package.json ropm.packageRootDir when specified', async () => {

            writeProject('logger', {
                'src/source/logger.brs': ''
            }, {
                ropm: {
                    packageRootDir: 'src'
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

        it('honors rootDir arg over package.json `ropm.rootDir` property', async () => {
            args.rootDir = 'anotherSrc';

            writeProject('logger', {
                'source/logger.brs': '',
                'source/temp.brs': ''
            });

            writeProject(projectName, {
                'anotherSrc/source/main.brs': ''
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
                path.join(projectDir, 'anotherSrc', 'source', 'roku_modules', 'logger', 'logger.brs')
            )).to.be.true;
            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'anotherSrc', 'source', 'roku_modules', 'logger', 'temp.brs')
            )).to.be.true;
        });

        it('uses module directory when `packageRootDir` is omitted', async () => {
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

        it('installs nested dependencies', async () => {
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
            // `npm install` doesn't install dependencies of local dependencies - they have to be installed in dependency directory
            await execPromisified('npm install', { cwd: path.join(tempDir, 'logger') });

            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                }
            });

            await command.run();
            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'source', 'roku_modules', 'maestro_v1')
            )).to.be.true;
        });

        it('ignores prod dependencies of prod dependencies that are missing the "ropm" keyword', async () => {
            writeProject('maestro', {
                'source/NodeClass.brs': ''
            }, { keywords: ['non-ropm'] });

            writeProject('logger', {
                'source/logger.brs': ''
            }, {
                dependencies: {
                    'maestro': `file:../maestro`
                }
            });
            // `npm install` doesn't install dependencies of local dependencies - they have to be installed in dependency directory
            await execPromisified('npm install', { cwd: path.join(tempDir, 'logger') });

            writeProject(projectName, {
                'source/main.brs': ''
            }, {
                dependencies: {
                    'logger': `file:../logger`
                }
            });

            await command.run();
            expect(fsExtra.pathExistsSync(
                path.join(projectDir, 'source', 'roku_modules', 'maestro_v1')
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

        //can't figure out how to make this test work properly. it seems like mocha intercepts stderr so we don't have access to it.
        //strangely enough, the test passes when DEBUGGING, just not when run without debugging.
        it.skip('recovers from pesky "NPM ERR! extraneous" errors', async () => {
            fsExtra.ensureDirSync(`${projectDir}/../annoying/node_modules/sub-annoying`);
            fsExtra.writeFileSync(`${projectDir}/../annoying/package.json`, `{ "name": "annoying", "version": "1.0.0"}`);
            //this is an extraneous node module
            fsExtra.writeFileSync(`${projectDir}/../annoying/node_modules/sub-annoying/package.json`, `{ "name": "sub-annoying", "version": "1.0.0"}`);
            writeProject(projectName, {}, {
                dependencies: {
                    'annoying': 'file:../annoying'
                }
            });
            await command.run();
        });
    });

    it('uses ropm alias instead of npm alias for local dependencies', async () => {
        writeProject('roku-logger', {
            'source/main.brs': `
                sub log()
                end sub
            `
        });

        writeProject(projectName, {}, {
            dependencies: {
                'roku-logger': `file:../roku-logger`
            }
        });

        await command.run();
        fsEqual(`${projectDir}/source/roku_modules/rokulogger/main.brs`, `
            sub rokulogger_log()
            end sub
        `);
    });

    it('does not corrupt class builder names', async () => {
        writeProject('maestro-core', {
            'source/NodeClass.brs': `
                function __NodeClass_builder()
                    instance = {}
                    instance.new = function(globalNode, top)
                        m.global = invalid
                        m.data = invalid
                        m.top = invalid
                        m.global = globalNode
                        m.top = top
                        m.data = top.data
                    end function
                    return instance
                end function
                function NodeClass(globalNode, top)
                    instance = __NodeClass_builder()
                    instance.new(globalNode, top)
                    return instance
                end function
            `
        });

        writeProject('maestro-core', {
            'source/NodeClass.d.bs': `
                class NodeClass
                    public global as dynamic
                    public data as dynamic
                    public top as dynamic
                    function new(globalNode, top)
                    end function
                end class
            `
        });

        writeProject(projectName, {}, {
            dependencies: {
                'mc': `file:../maestro-core`
            }
        });

        await command.run();
        fsEqual(`${projectDir}/source/roku_modules/mc/NodeClass.brs`, `
            function __mc_NodeClass_builder()
                instance = {}
                instance.new = function(globalNode, top)
                    m.global = invalid
                    m.data = invalid
                    m.top = invalid
                    m.global = globalNode
                    m.top = top
                    m.data = top.data
                end function
                return instance
            end function
            function mc_NodeClass(globalNode, top)
                instance = __mc_NodeClass_builder()
                instance.new(globalNode, top)
                return instance
            end function
        `);
    });


    describe('getProdDependencies', () => {
        it('excludes dependencies in folders above cwd for command', () => {
            const [level1, level2, level3] = createProjects(projectDir, projectDir, {
                name: projectName,
                dependencies: [{
                    name: 'level1',
                    dependencies: [{
                        name: 'level2',
                        dependencies: [{
                            name: 'level3'
                        }]
                    }]
                }]
            });

            expect(command.getProdDependencies().sort()).to.eql([
                projectDir,
                s`${projectDir}/node_modules/level1`,
                s`${projectDir}/node_modules/level1/node_modules/level2`,
                s`${projectDir}/node_modules/level1/node_modules/level2/node_modules/level3`
            ]);

            command = new InstallCommand({ cwd: level1.moduleDir });
            expect(command.getProdDependencies().sort()).to.eql([
                s`${projectDir}/node_modules/level1`,
                s`${projectDir}/node_modules/level1/node_modules/level2`,
                s`${projectDir}/node_modules/level1/node_modules/level2/node_modules/level3`
            ]);

            command = new InstallCommand({ cwd: level2.moduleDir });
            expect(command.getProdDependencies().sort()).to.eql([
                s`${projectDir}/node_modules/level1/node_modules/level2`,
                s`${projectDir}/node_modules/level1/node_modules/level2/node_modules/level3`
            ]);

            command = new InstallCommand({ cwd: level3.moduleDir });
            expect(command.getProdDependencies().sort()).to.eql([
                s`${projectDir}/node_modules/level1/node_modules/level2/node_modules/level3`
            ]);
        });

        it('excludes dependencies in folders above cwd for command', async () => {
            //create a root project, with a dependency
            createProjects(s`${tempDir}/outerProject`, s`${tempDir}/outerProject`, {
                name: 'outerProject',
                dependencies: [{
                    name: 'outerProjectDependency'
                }]
            });

            //create a folder inside of root project
            createProjects(s`${tempDir}/outerProject/innerProject`, s`${tempDir}/outerProject/innerProject`, {
                name: 'innerProject',
                dependencies: [{
                    name: 'innerProjectDependency'
                }]
            });

            //install outer project
            command.args.cwd = s`${tempDir}/outerProject`;
            await command.run();

            const innerCommand = new InstallCommand({
                cwd: s`${tempDir}/outerProject/innerProject`
            });
            await innerCommand.run();

            //innerProject should not list outerProject dependencies
            expect(innerCommand.getProdDependencies().sort()).to.eql([
                s`${tempDir}/outerProject/innerProject`,
                s`${tempDir}/outerProject/innerProject/node_modules/innerProjectDependency`
            ]);
        });

        it('recognizes workspace packages and excludes root', async () => {
            const rootProject = s`${tempDir}/root-project`;
            const workspaceProject = s`packages/workspace-project`;

            //lib
            writeProject('root-project-dependency', {});
            //lib
            writeProject('workspace-dependency', {});

            writeProject('root-project', {}, {
                dependencies: {
                    'root-project-dependency': 'file:../root-project-dependency'
                },
                workspaces: [workspaceProject]
            });

            writeProject('root-project/packages/workspace-project', {}, {
                dependencies: {
                    'workspace-dependency': 'file:../../../workspace-dependency'
                }
            });

            const workspaceCommand = new InstallCommand({
                cwd: s`${rootProject}/${workspaceProject}`
            });
            await workspaceCommand.run();

            /**
             * While this assert is for node 10, newer versions of npm
             * install workspace dependencies to the root node_modules
             * (if they don't conflict) and resolve workspaces from there
             * too. Not sure what npm version added that improvement, but
             * for example node 18 the assert would be:
             * expect(innerCommand.getProdDependencies()).to.eql([
             *   s`${rootProject}/node_modules/workspace-project`,
             *   s`${rootProject}/node_modules/workspace-dependency`
             * ]);
             */
            expect(workspaceCommand.getProdDependencies()).to.eql([
                s`${rootProject}/packages/workspace-project`,
                s`${rootProject}/packages/workspace-project/node_modules/workspace-dependency`
            ]);
        });
    });
});

export function writeProject(projectName: string, files: Record<string, string>, additionalPackageJson?: Partial<RopmPackageJson>) {
    for (const relativePath in files) {
        const filePath = path.join(tempDir, projectName, relativePath);
        fsExtra.ensureDirSync(
            path.dirname(filePath)
        );
        fsExtra.writeFileSync(filePath, files[relativePath]);
    }
    const packageJson = {
        name: projectName.split('/').slice(-1)[0],
        version: '1.0.0',
        description: '',
        keywords: [
            'ropm'
        ],
        ...(additionalPackageJson ?? {})
    };
    fsExtra.ensureDirSync(path.join(tempDir, projectName));
    //write the package.json
    fsExtra.writeFileSync(
        path.join(
            tempDir, projectName, 'package.json'
        ),
        JSON.stringify(packageJson)
    );
}

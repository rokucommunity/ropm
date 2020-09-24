/* eslint-disable no-multi-assign */
import { ModuleManager } from './ModuleManager';
import { expect } from 'chai';
import * as path from 'path';
import { util } from '../util';
import { file, fsEqual, createProjects, DepGraphNode, trim } from '../TestHelpers.spec';
import * as fsExtra from 'fs-extra';
import { InstallCommand } from '../commands/InstallCommand';

const hostDir = path.join(process.cwd(), '.tmp', 'hostApp');

describe('ModuleManager', () => {
    let manager: ModuleManager;
    let noprefix: string[];

    beforeEach(() => {
        manager = new ModuleManager();
        noprefix = [];
    });

    async function process() {
        manager.hostDependencies = await util.getModuleDependencies(hostDir);
        manager.noprefix = noprefix;
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
                dominantVersion: '1',
                version: '1.0.0',
                ropmModuleName: 'promise'
            }]);
        });

        it('ignores the alias for non-host module dependencies', async () => {
            await createDependencies([{
                name: 'logger',
                dependencies: [{
                    alias: 'p',
                    name: 'promise'
                }]
            }]);
            await process();
            expect(manager.getReducedDependencies().filter(x => x.npmModuleName === 'promise')).to.eql([{
                npmModuleName: 'promise',
                dominantVersion: '1',
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
            expect(manager.getReducedDependencies().filter(x => x.npmModuleName !== 'logger').sort((a, b) => a.dominantVersion.localeCompare(b.dominantVersion))).to.eql([{
                npmModuleName: 'promise',
                dominantVersion: '1',
                version: '1.0.0',
                ropmModuleName: 'promise_v1'
            }, {
                npmModuleName: 'promise',
                dominantVersion: '2',
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
            expect(manager.getReducedDependencies().sort((a, b) => a.dominantVersion.localeCompare(b.dominantVersion))).to.eql([{
                npmModuleName: 'promise',
                dominantVersion: '1',
                version: '1.2.3',
                ropmModuleName: 'q'
            }, {
                npmModuleName: 'promise',
                dominantVersion: '2',
                version: '2.0.0',
                ropmModuleName: 'promise'
            }]);
        });

        it('retains preversion versions', async () => {
            await createDependencies([{
                name: 'cool-package',
                version: '4.0.0-b4'
            }]);
            expect(manager.getReducedDependencies().sort((a, b) => a.dominantVersion.localeCompare(b.dominantVersion))).to.eql([{
                npmModuleName: 'cool-package',
                dominantVersion: '4.0.0-b4',
                version: '4.0.0-b4',
                ropmModuleName: 'coolpackage_v4_0_0_b4'
            }]);
        });

        it('does not de-dupe prerelease versions', async () => {
            await createDependencies([{
                name: 'cool-package',
                version: '1.0.0-b1',
                dependencies: [{
                    name: 'cool-package',
                    version: '1.0.0-b2'
                }]
            }]);
            expect(manager.getReducedDependencies().sort((a, b) => a.dominantVersion.localeCompare(b.dominantVersion))).to.eql([{
                npmModuleName: 'cool-package',
                dominantVersion: '1.0.0-b1',
                version: '1.0.0-b1',
                ropmModuleName: 'coolpackage_v1_0_0_b1'
            }, {
                npmModuleName: 'cool-package',
                dominantVersion: '1.0.0-b2',
                version: '1.0.0-b2',
                ropmModuleName: 'coolpackage_v1_0_0_b2'
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
            await createDependencies([{
                alias: 'logger',
                name: 'simple-logger',
                dependencies: [{
                    alias: 'logger',
                    name: 'complex-logger'
                }]
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
            const [logger] = await createDependencies([{
                name: 'logger'
            }]);

            file(`${logger.packageRootDir}/source/main.brs`, `
                sub main()
                    SanitizeText("123")
                end sub
                sub SanitizeText(text as string)
                    PrintMessage("Sanitizing text: " + text)
                end sub
            `);
            file(`${logger.packageRootDir}/source/lib.brs`, `
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
            const [logger] = await createDependencies([{
                name: 'logger'
            }]);

            file(`${logger.packageRootDir}/components/Component1.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="Component1" extends="Component2" >
                </component>
            `);
            file(`${logger.packageRootDir}/components/Component2.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="Component2" extends="Task" >
                    <children>
                        <Component1 />
                        <Component2>
                        </Component2>
                    </children>
                </component>
            `);
            file(`${logger.packageRootDir}/source/main.brs`, `
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
            const [logger] = await createDependencies([{
                alias: 'logger',
                name: '@alpha/logger',
                dependencies: [{
                    alias: 'logger',
                    name: '@bravo/printer'
                }]
            }]);

            file(`${logger.packageRootDir}/source/main.brs`, `
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

        it('rewrites script paths for own package', async () => {
            const [logger] = await createDependencies([{
                name: 'logger'
            }]);

            file(`${logger.packageRootDir}/source/common.brs`, `
                sub echo(message)
                    print message
                end sub
            `);

            file(`${logger.packageRootDir}/components/common.brs`, `
                sub echo(message)
                    print message
                end sub
            `);

            file(`${logger.packageRootDir}/components/Component1.xml`, trim`
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

        it('skips roku_modules folders found in module folders', async () => {
            const promise = (await createDependencies([{
                name: 'logger',
                dependencies: [{
                    name: 'promise'
                }]
            }]))[1];

            // the jsonlib package forgot to exclude its roku_modules folder
            file(`${promise.packageRootDir}/source/roku_modules/jsonlib/json.brs`, ``);

            await process();

            //ropm should have IGNORED the roku_modules folder from the promise package
            expect(fsExtra.pathExistsSync(`${hostDir}/source/roku_modules/promise_v1/roku_modules/jsonlib/json.brs`)).to.be.false;
        });

        it('rewrites script references to dependency files', async () => {
            const [logger, promise] = await createDependencies([{
                name: 'logger',
                dependencies: [{
                    name: 'promise'
                }]
            }]);

            file(`${promise.packageRootDir}/source/promise.brs`, ``);

            file(`${logger.packageRootDir}/components/Component1.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="Component1">
                    <script uri="pkg:/source/roku_modules/promise/promise.brs" />
                    <script uri="../source/roku_modules/promise/promise.brs" />
                </component>
            `);

            await process();

            fsEqual(`${hostDir}/components/roku_modules/logger/Component1.xml`, `
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="logger_Component1">
                    <script uri="pkg:/source/roku_modules/promise_v1/promise.brs" />
                    <script uri="pkg:/source/roku_modules/promise_v1/promise.brs" />
                </component>
            `);
        });

        it('rewrites <Poster> file paths', async () => {
            const [logger, photolib] = await createDependencies([{
                name: 'logger',
                dependencies: [{
                    name: 'photolib'
                }]
            }]);

            file(`${photolib.packageRootDir}/images/picture.jpg`, ``);

            file(`${logger.packageRootDir}/components/Component1.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="Component1">
                    <children>
                        <Poster uri="pkg:/images/photo.jpg" />
                        <!--dependency paths-->
                        <Poster uri="pkg:/images/roku_modules/photolib/photo.jpg" />
                    </children>
                </component>
            `);

            await process();

            fsEqual(`${hostDir}/components/roku_modules/logger/Component1.xml`, `
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="logger_Component1">
                    <children>
                        <Poster uri="pkg:/images/roku_modules/logger/photo.jpg" />
                        <!--dependency paths-->
                        <Poster uri="pkg:/images/roku_modules/photolib_v1/photo.jpg" />
                    </children>
                </component>
            `);
        });

        it('does not rewrite simple "pkg:/" paths with nothing else in it', async () => {
            const [logger] = await createDependencies([{
                name: 'logger'
            }]);
            file(`${logger.packageRootDir}/source/common.brs`, `
                sub GetImagePath(imageName)
                    
                    'will be rewritten because we have content after 'pkg:/'
                    image1 = "pkg:/images/" + imageName
                    
                    'will not be rewritten because the 'pkg:/' is isolated
                    image2 = "pkg:/" + "images/" + imageName

                end sub
            `);

            await process();

            fsEqual(`${hostDir}/source/roku_modules/logger/common.brs`, `
                sub logger_GetImagePath(imageName)
                    
                    'will be rewritten because we have content after 'pkg:/'
                    image1 = "pkg:/images/roku_modules/logger/" + imageName
                    
                    'will not be rewritten because the 'pkg:/' is isolated
                    image2 = "pkg:/" + "images/" + imageName

                end sub
            `);
        });

        it('supports a package using both rootDir and packageRootDir', async () => {
            const [logger, photolib] = await createDependencies([{
                name: 'logger',
                ropm: {
                    rootDir: 'src',
                    packageRootDir: 'dist'
                },
                dependencies: [{
                    name: 'photolib'
                }]
            }]);

            file(`${logger.moduleDir}/dist/source/logger_dist.brs`, ``);
            file(`${photolib.packageRootDir}/source/photolib.brs`, '');

            //run install on the logger module, which should put logger's dependencies into logger's rootDir
            let command = new InstallCommand({
                cwd: logger.moduleDir
            });
            await command.run();
            expect(fsExtra.pathExistsSync(`${logger.moduleDir}/src/source/roku_modules/photolib/photolib.brs`)).to.be.true;

            //now run npm install on the host app, which should read logger's packageRootDir path and use those files
            command = new InstallCommand({
                cwd: hostDir
            });
            await command.run();
            expect(fsExtra.pathExistsSync(`${hostDir}/source/roku_modules/logger/logger_dist.brs`)).to.be.true;

        });

        it('supports a package using both rootDir and packageRootDir', async () => {
            noprefix = ['logger'];
            manager.modules = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    _files: {
                        'source/loggerlib.brs': `
                            sub logInfo(message)
                                print message
                            end sub
                        `,
                        'components/loggercomp.xml': trim`
                            <?xml version="1.0" encoding="utf-8" ?>
                            <component name="loggercomp"></component>
                        `
                    }
                }, {
                    name: 'json',
                    _files: {
                        'source/jsonlib.brs': `
                            sub parseJson(text)
                                return {}
                            end sub
                        `,
                        'components/jsoncomp.xml': trim`
                            <?xml version="1.0" encoding="utf-8" ?>
                            <component name="jsoncomp">
                            </component>
                        `
                    }
                }]
            });

            await process();

            //the logger module should have no prefixes applied to its functions or components
            fsEqual(`${hostDir}/source/roku_modules/logger/loggerlib.brs`, `
                sub logInfo(message)
                    print message
                end sub
            `);
            fsEqual(`${hostDir}/components/roku_modules/logger/loggercomp.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="loggercomp"></component>
            `);

            //the json module should be prefixed
            fsEqual(`${hostDir}/source/roku_modules/json/jsonlib.brs`, `
                sub json_parseJson(text)
                    return {}
                end sub
            `);
            fsEqual(`${hostDir}/components/roku_modules/json/jsoncomp.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="json_jsoncomp">
                </component>
            `);
        });

        it('supports a package using both rootDir and packageRootDir', async () => {
            noprefix = ['logger'];
            manager.modules = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    _files: {
                        'source/loggerlib.brs': `
                            sub logInfo(message)
                                print message
                            end sub
                        `,
                        'components/loggercomp1.xml': trim`
                            <?xml version="1.0" encoding="utf-8" ?>
                            <component name="loggercomp1"></component>
                        `,
                        'components/loggercomp2.xml': trim`
                            <?xml version="1.0" encoding="utf-8" ?>
                            <component name="loggercomp2">
                                <children>
                                    <!--reference component1 in component2 -->
                                    <loggercomp1></loggercomp1>
                                </children>
                            </component>
                        `
                    }
                }, {
                    name: 'json',
                    _files: {
                        'source/jsonlib.brs': `
                            sub parseJson(text)
                                return {}
                            end sub
                        `,
                        'components/jsoncomp.xml': trim`
                            <?xml version="1.0" encoding="utf-8" ?>
                            <component name="jsoncomp">
                            </component>
                        `
                    }
                }]
            });

            await process();

            //the logger module should have no prefixes applied to its functions or components
            fsEqual(`${hostDir}/source/roku_modules/logger/loggerlib.brs`, `
                sub logInfo(message)
                    print message
                end sub
            `);
            fsEqual(`${hostDir}/components/roku_modules/logger/loggercomp1.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="loggercomp1"></component>
            `);

            fsEqual(`${hostDir}/components/roku_modules/logger/loggercomp2.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="loggercomp2">
                    <children>
                        <!--reference component1 in component2 -->
                        <loggercomp1></loggercomp1>
                    </children>
                </component>
            `);

            //the json module should be prefixed
            fsEqual(`${hostDir}/source/roku_modules/json/jsonlib.brs`, `
                sub json_parseJson(text)
                    return {}
                end sub
            `);
            fsEqual(`${hostDir}/components/roku_modules/json/jsoncomp.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="json_jsoncomp">
                </component>
            `);
        });

        it('rejects ropm module using `noprefix` when installed as a dependency', async () => {
            manager.modules = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    ropm: {
                        noprefix: ['smartlist']
                    },
                    dependencies: [{
                        name: 'smartlist'
                    }]
                }]
            });
            await process();
            expect(manager.modules.map(x => x.npmModuleName)).to.eql(['smartlist']);
        });

        it('rewrites referenced components in module', async () => {
            manager.modules = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    _files: {
                        'components/loggercomp.xml': trim`
                            <?xml version="1.0" encoding="utf-8" ?>
                            <component name="loggercomp">
                                <children>
                                    <l_SimpleList></l_SimpleList>
                                </children>
                            </component>
                        `
                    },
                    dependencies: [{
                        name: 'smartlist',
                        alias: 'l'
                    }]
                }]
            });

            await process();

            fsEqual(`${hostDir}/components/roku_modules/logger/loggercomp.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="logger_loggercomp">
                    <children>
                        <smartlist_v1_SimpleList></smartlist_v1_SimpleList>
                    </children>
                </component>
            `);
        });
    });
});

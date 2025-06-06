/* eslint-disable no-multi-assign */
import { ModuleManager } from './ModuleManager';
import { expect } from 'chai';
import * as path from 'path';
import { util } from '../util';
import type { DepGraphNode } from '../TestHelpers.spec';
import { testProcess, file, fsEqual, createProjects, trim } from '../TestHelpers.spec';
import * as fsExtra from 'fs-extra';
import { InstallCommand } from '../commands/InstallCommand';
const cwd = process.cwd();
const hostDir = path.join(cwd, '.tmp', 'hostApp');

describe('ModuleManager', () => {
    let manager: ModuleManager;
    let noprefixNpmAliases: string[];

    beforeEach(() => {
        manager = new ModuleManager();
        noprefixNpmAliases = [];
    });

    async function managerProcess() {
        manager.hostDependencies = await util.getModuleDependencies(hostDir);
        manager.noprefixNpmAliases = noprefixNpmAliases;
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
            await managerProcess();
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
            await managerProcess();
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
            await managerProcess();
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
            await managerProcess();
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
            await managerProcess();

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
            await managerProcess();
            await manager.reduceModulesAndCreatePrefixMaps();
            expect(manager.modules.map(x => [x.npmModuleName, x.version])).to.eql([
                ['promise', '1.2.0'],
                ['promise', '2.0.0']
            ]);
        });
    });

    describe('process', () => {

        it('replaces ROPM_PREFIX source literal', async () => {
            const [logger] = await createDependencies([{
                name: 'logger'
            }]);

            //don't rewrite parameters or variables on lhs of assignments
            //DO rewrite variables used elsewhere
            file(`${logger.packageRootDir}/source/lib.brs`, `
                sub log(ROPM_PREFIX = "")
                    ROPM_PREFIX = ""
                    print ROPM_PREFIX + "ROPM_PREFIX"
                end sub
            `);
            await managerProcess();

            fsEqual(`${hostDir}/source/roku_modules/logger/lib.brs`, `
                sub logger_log(ROPM_PREFIX = "")
                    ROPM_PREFIX = ""
                    print "logger_" + "ROPM_PREFIX"
                end sub
            `);
        });

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
            await managerProcess();

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
            await managerProcess();

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

        it('does not prefix special functions', async () => {
            const [logger] = await createDependencies([{
                name: 'logger'
            }]);

            file(`${logger.packageRootDir}/source/main.brs`, `
                sub runuserinterface()
                end sub

                sub main()
                end sub

                sub runscreensaver()
                end sub

                sub init()
                end sub

                function onkeyevent()
                end function

                sub NonSpecialFunction()
                end sub
            `);
            await managerProcess();

            fsEqual(`${hostDir}/source/roku_modules/logger/main.brs`, `
                sub runuserinterface()
                end sub

                sub main()
                end sub

                sub runscreensaver()
                end sub

                sub init()
                end sub

                function onkeyevent()
                end function

                sub logger_NonSpecialFunction()
                end sub
            `);
        });

        it('applies function prefixes after leading underscores', async () => {
            const [logger] = await createDependencies([{
                name: 'logger'
            }]);

            file(`${logger.packageRootDir}/source/main.brs`, `
                sub main()
                    _sub1()
                end sub
                sub _sub1()
                    __Sub2()
                end sub
                sub __Sub2()
                end sub
            `);
            await managerProcess();

            fsEqual(`${hostDir}/source/roku_modules/logger/main.brs`, `
                sub main()
                    _logger_sub1()
                end sub
                sub _logger_sub1()
                    __logger_Sub2()
                end sub
                sub __logger_Sub2()
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
            await managerProcess();

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

            await managerProcess();

            fsEqual(`${hostDir}/source/roku_modules/logger/main.brs`, `
                sub logger_PrintValue(value)
                    print bravo_printer_v1_writeLine(value)
                end sub
            `);
        });

        it('does not prefix object function calls with same name as scope function', async () => {
            await createDependencies([{
                name: 'logger',
                _files: {
                    'source/lib.brs': `
                        sub getPerson()
                            person = {
                                speak: sub(message)
                                    print message
                                end sub,
                                sayHello: sub()
                                    m.speak("Hello")
                                    speak("Person said hello")
                                end sub
                            }
                            person.speak("I'm a person")
                            person["speak"]("I'm a person")
                            speak("Made person speak")
                        end sub
                        sub speak(message)
                            print message
                        end sub
                    `
                }
            }]);

            await managerProcess();
            fsEqual(`${hostDir}/source/roku_modules/logger/lib.brs`, `
                sub logger_getPerson()
                    person = {
                        speak: sub(message)
                            print message
                        end sub,
                        sayHello: sub()
                            m.speak("Hello")
                            logger_speak("Person said hello")
                        end sub
                    }
                    person.speak("I'm a person")
                    person["speak"]("I'm a person")
                    logger_speak("Made person speak")
                end sub
                sub logger_speak(message)
                    print message
                end sub
            `);
        });

        it('applies prefix when in expanded mode', async () => {
            await createDependencies([{
                name: 'logger',
                _files: {
                    'source/lib.brs': `
                        sub writeToLog(message)
                            logFunc = logWarning
                            logFunc(message)
                        end sub
                        sub logWarning(message)
                            print message
                        end sub
                    `
                }
            }]);
            await managerProcess();
            fsEqual(`${hostDir}/source/roku_modules/logger/lib.brs`, `
                sub logger_writeToLog(message)
                    logFunc = logger_logWarning
                    logFunc(message)
                end sub
                sub logger_logWarning(message)
                    print message
                end sub
            `);
        });

        it('only prefixes calls to known own functions', async () => {
            await createDependencies([{
                name: 'logger',
                _files: {
                    'source/lib.brs': `
                        sub logWarning(message)
                            log(message, "warning")
                            'should not get prefixed
                            notMyModuleFunction()
                        end sub
                        sub log(message, errorLevel)
                            print errorLevel + ": " + message
                        end sub
                    `
                }
            }]);

            await managerProcess();
            fsEqual(`${hostDir}/source/roku_modules/logger/lib.brs`, `
                sub logger_logWarning(message)
                    logger_log(message, "warning")
                    'should not get prefixed
                    notMyModuleFunction()
                end sub
                sub logger_log(message, errorLevel)
                    print errorLevel + ": " + message
                end sub
            `);
        });

        describe('prefixing observeField and observeFieldScoped', () => {
            async function testObserveField(testLine: string, expectedLine = testLine) {
                const fileContents = trim`
                    sub init()
                        ${testLine}
                    end sub
                    sub logInfo()
                    end sub
                `;
                await createDependencies([{
                    name: 'logger',
                    _files: {
                        'source/lib.brs': fileContents
                    }
                }]);
                await managerProcess();
                fsEqual(`${hostDir}/source/roku_modules/logger/lib.brs`, trim`
                    sub init()
                        ${expectedLine}
                    end sub
                    sub logger_logInfo()
                    end sub
                `);
            }

            it('does not prefix because not an object call', async () => {
                //no change because it's not on an object
                await testObserveField(`observeField("field", "logInfo")`);
                await testObserveField(`observeFieldScoped("field", "logInfo")`);
            });

            it('does not prefix because not a string literal', async () => {
                //no change because the second parameter is not a string
                await testObserveField(`m.top.observeField("field", callbackName)`);
                await testObserveField(`m.top.observeFieldScoped("field", callbackName)`);
            });

            it('does not prefix because references unknown function name', async () => {
                //no change because the second parameter is not a string
                await testObserveField(`m.top.observeField("field", "unknownFunctionName")`);
                await testObserveField(`m.top.observeFieldScoped("field", "unknownFunctionName")`);
            });

            it('does not prefix multi-line first param', async () => {
                //no change because the second parameter is not a string
                await testObserveField(`m.top.observeField(getField({
                    name: "something"
                }, "unknownFunctionName")`);
                await testObserveField(`m.top.observeFieldScoped(getField({
                    name: "something"
                }, "unknownFunctionName")`);
            });

            it('does not prefix multi-line with function call at end of first line', async () => {
                await testObserveField(`m.top.observeField({name: getName("bob")
                        age: 12
                    }, "logInfo")
                `);
                await testObserveField(`m.top.observeFieldScoped({name: getName("bob")
                        age: 12
                    }, "logInfo")
                `);
            });

            it('prefixes object call with string literal', async () => {
                await testObserveField(`m.top.observeField("field", "logInfo")`, `m.top.observeField("field", "logger_logInfo")`);
                await testObserveField(`m.top.observeFieldScoped("field", "logInfo")`, `m.top.observeFieldScoped("field", "logger_logInfo")`);
            });

            it('prefixes even with complex ', async () => {
                await testObserveField(`m.top.observeField("field", "logInfo")`, `m.top.observeField("field", "logger_logInfo")`);
                await testObserveField(`m.top.observeFieldScoped("field", "logInfo")`, `m.top.observeFieldScoped("field", "logger_logInfo")`);
            });

            it('prefixes with trailing comment', async () => {
                await testObserveField(`m.top.observeField("field", "logInfo") 'comment`, `m.top.observeField("field", "logger_logInfo") 'comment`);
                await testObserveField(`m.top.observeFieldScoped("field", "logInfo") 'comment`, `m.top.observeFieldScoped("field", "logger_logInfo") 'comment`);
            });
        });

        it('does not prefix inner-function function calls', async () => {
            await createDependencies([{
                name: 'logger',
                _files: {
                    'source/lib.brs': `
                        sub logWarning(message)
                            doSomething = sub()
                            end sub

                            doSomething()
                        end sub
                    `
                }
            }]);

            await managerProcess();
            fsEqual(`${hostDir}/source/roku_modules/logger/lib.brs`, `
                sub logger_logWarning(message)
                    doSomething = sub()
                    end sub

                    doSomething()
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

            await managerProcess();

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

            await managerProcess();

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

            await managerProcess();

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

            await managerProcess();

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

            await managerProcess();

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

        it('keeps custom prefix for one module when using noprefix for another', async () => {
            noprefixNpmAliases = ['json-lib'];
            manager.modules = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    alias: 'l',
                    _files: {
                        'source/loggerlib.brs': `
                            sub logInfo(message)
                                print message
                            end sub
                        `
                    }
                }, {
                    name: 'json-lib',
                    _files: {
                        'source/jsonlib.brs': `
                            sub parseJson(text)
                                return {}
                            end sub

                            sub anotherFunction()
                                test = parseJson
                            end sub
                        `
                    }
                }]
            });

            await managerProcess();

            //the logger module should use the "l" prefix
            fsEqual(`${hostDir}/source/roku_modules/l/loggerlib.brs`, `
                sub l_logInfo(message)
                    print message
                end sub
            `);
            //the json lib should NOT be prefixed
            fsEqual(`${hostDir}/source/roku_modules/jsonlib/jsonlib.brs`, `
                sub parseJson(text)
                    return {}
                end sub

                sub anotherFunction()
                    test = parseJson
                end sub
            `);
        });

        it('supports a package using both rootDir and packageRootDir', async () => {
            noprefixNpmAliases = ['logger'];
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

            await managerProcess();

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
            noprefixNpmAliases = ['logger'];
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

            await managerProcess();

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
            await testProcess({
                noprefixNpmAliases: ['logger'],
                'logger:source/loggerlib.brs': [
                    trim`
                        sub logInfo(message)
                            print message
                        end sub
                    `,
                    //the logger module should have no prefixes applied to its functions or components
                    trim`
                        sub logInfo(message)
                            print message
                        end sub
                    `
                ],
                'logger:components/loggercomp1.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="loggercomp1"></component>
                    `,
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="loggercomp1"></component>
                    `
                ],
                'logger:components/loggercomp2.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="loggercomp2">
                            <children>
                                <!--reference component1 in component2 -->
                                <loggercomp1></loggercomp1>
                            </children>
                        </component>
                    `,
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="loggercomp2">
                            <children>
                                <!--reference component1 in component2 -->
                                <loggercomp1></loggercomp1>
                            </children>
                        </component>
                    `
                ],
                'json:source/jsonlib.brs': [
                    trim`
                        sub parseJson(text)
                            return {}
                        end sub
                    `, trim`
                        sub json_parseJson(text)
                            return {}
                        end sub
                    `
                ],
                'json:components/jsoncomp.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="jsoncomp">
                        </component>
                    `,
                    //the json module should be prefixed
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="json_jsoncomp">
                        </component>
                    `
                ]
            });
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
            await managerProcess();
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

            await managerProcess();

            fsEqual(`${hostDir}/components/roku_modules/logger/loggercomp.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="logger_loggercomp">
                    <children>
                        <smartlist_v1_SimpleList></smartlist_v1_SimpleList>
                    </children>
                </component>
            `);
        });

        it('does not prefix functions referenced by component interface', async () => {
            await testProcess({
                'logger:components/LoggerComponent.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="LoggerComponent">
                            <script uri="LoggerComponent.brs" />
                            <interface>
                                <function name="doSomething"/>
                                <!--finds function with name on next line -->
                                <function
                                    name="doSomethingElse" />
                            </interface>
                        </component>
                    `,
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="logger_LoggerComponent">
                            <script uri="pkg:/components/roku_modules/logger/LoggerComponent.brs" />
                            <interface>
                                <function name="doSomething"/>
                                <!--finds function with name on next line -->
                                <function
                                    name="doSomethingElse" />
                            </interface>
                        </component>
                    `
                ],
                'logger:components/LoggerComponent.brs': [
                    trim`
                        sub doSomething()
                        end sub
                        sub doSomethingElse()
                        end sub
                        sub writeToLog()
                        end sub
                    `, trim`
                        sub doSomething()
                        end sub
                        sub doSomethingElse()
                        end sub
                        sub logger_writeToLog()
                        end sub
                    `
                ]
            });
        });

        it('adds prefix to field onchange attributes', async () => {
            await testProcess({
                'logger:components/LoggerComponent.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="LoggerComponent">
                            <script uri="LoggerComponent.brs" />
                            <interface>
                                <field id="logMessage" onchange="logMessageChanged"/>
                            </interface>
                        </component>
                    `,
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="logger_LoggerComponent">
                            <script uri="pkg:/components/roku_modules/logger/LoggerComponent.brs" />
                            <interface>
                                <field id="logMessage" onchange="logger_logMessageChanged"/>
                            </interface>
                        </component>
                    `
                ],
                'logger:components/LoggerComponent.brs': [
                    trim`
                        sub logMessageChanged()
                        end sub
                    `,
                    trim`
                        sub logger_logMessageChanged()
                        end sub
                    `
                ]
            });
        });

        it('does not prefix function calls to interface-referenced functions', async () => {
            await testProcess({
                'logger:components/LoggerComponent.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="LoggerComponent">
                            <script uri="LoggerComponent.brs" />
                            <interface>
                                <function name="doSomething" />
                                <function name="notDefinedDoSomething" />
                            </interface>
                        </component>
                    `,
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="logger_LoggerComponent">
                            <script uri="pkg:/components/roku_modules/logger/LoggerComponent.brs" />
                            <interface>
                                <function name="doSomething" />
                                <function name="notDefinedDoSomething" />
                            </interface>
                        </component>
                    `
                ],
                'logger:components/LoggerComponent.brs': [
                    trim`
                        sub init()
                            doSomething()
                            isFunction(doSomething)
                            isFunction(notDefinedDoSomething)
                        end sub
                        sub doSomething()
                        end sub
                    `,
                    trim`
                        sub init()
                            doSomething()
                            isFunction(doSomething)
                            isFunction(notDefinedDoSomething)
                        end sub
                        sub doSomething()
                        end sub
                    `
                ]
            });
        });

        it('resolves import statements', async () => {
            await testProcess({
                'logger:source/lib.brs': [''],

                'logger:components/LoggerComponent.d.bs': [
                    trim`
                        import "../source/lib.brs"
                        import "pkg:/source/lib.brs"
                    `,
                    trim`
                        import "pkg:/source/roku_modules/logger/lib.brs"
                        import "pkg:/source/roku_modules/logger/lib.brs"
                    `
                ]
            });
        });

        it('prefixes classes used in parameters', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        namespace animals
                            class Dog
                                sub new(brother as Dog, sister as animals.Dog, owner as Human)
                                end sub
                            end class
                        end namespace

                        class Human
                        end class
                    `,
                    trim`
                        namespace logger.animals
                            class Dog
                                sub new(brother as logger.animals.Dog, sister as logger.animals.Dog, owner as logger.Human)
                                end sub
                            end class
                        end namespace

                        namespace logger
                        class Human
                        end class
                        end namespace
                    `
                ]
            });
        });

        it('prefixes classes used in extends', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        namespace animals
                            class Animal
                            end class
                            class Dog extends Animal
                            end class
                            class Cat extends animals.Animal
                            end class
                            class Warewolf extends Human
                            end class
                        end namespace
                        class Human
                        end class
                        class Warecat extends animals.Cat
                        end class
                    `,
                    trim`
                        namespace logger.animals
                            class Animal
                            end class
                            class Dog extends logger.animals.Animal
                            end class
                            class Cat extends logger.animals.Animal
                            end class
                            class Warewolf extends logger.Human
                            end class
                        end namespace
                        namespace logger
                        class Human
                        end class
                        end namespace
                        namespace logger
                        class Warecat extends logger.animals.Cat
                        end class
                        end namespace
                    `
                ]
            });
        });

        it('prefixes classes used as return type', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        namespace animals
                            class Dog
                            end class
                            function GetDog1() as Dog
                            end function
                            function GetDog2() as animals.Dog
                            end function
                            function GetHuman() as Human
                            end function
                        end namespace

                        function GetDog3() as animals.Dog
                        end function

                        class Human
                        end class
                    `,
                    trim`
                        namespace logger.animals
                            class Dog
                            end class
                            function GetDog1() as logger.animals.Dog
                            end function
                            function GetDog2() as logger.animals.Dog
                            end function
                            function GetHuman() as logger.Human
                            end function
                        end namespace

                        namespace logger
                        function GetDog3() as logger.animals.Dog
                        end function
                        end namespace

                        namespace logger
                        class Human
                        end class
                        end namespace
                    `
                ]
            });
        });

        it('does not prefix other module namespaced class names', async () => {
            manager.modules = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    _files: {
                        'source/lib.d.bs': trim`
                            class Person
                                sub new(pet as a.Duck)
                                end sub
                                sub watchPetForFriend(friendPet as dogs.Poodle)
                                end sub
                            end class
                        `
                    },
                    dependencies: [{
                        name: 'animals',
                        alias: 'a'
                    }, {
                        name: 'dogs'
                    }]
                }]
            });

            await managerProcess();

            fsEqual(`${hostDir}/source/roku_modules/logger/lib.d.bs`, `
                namespace logger
                class Person
                    sub new(pet as animals_v1.Duck)
                    end sub
                    sub watchPetForFriend(friendPet as dogs_v1.Poodle)
                    end sub
                end class
                end namespace
            `);
        });

        it('properly handles annotations', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        @NameSpaceAnnotation
                        namespace NameSpace
                            @Sub1Annotation
                            sub Sub1()
                            end sub
                        end namespace

                        @Sub2Annotation
                        sub Sub2()
                        end sub

                        @ClassAnnotation
                        class Person
                        end class
                    `,
                    trim`
                        @NameSpaceAnnotation
                        namespace logger.NameSpace
                            @Sub1Annotation
                            sub Sub1()
                            end sub
                        end namespace

                        namespace logger
                        @Sub2Annotation
                        sub Sub2()
                        end sub
                        end namespace

                        namespace logger
                        @ClassAnnotation
                        class Person
                        end class
                        end namespace
                    `
                ]
            });
        });

        it('prefixes m.top.functionName for files NOT imported by a Task', async () => {
            await testProcess({
                'logger:source/lib.brs': [
                    trim`
                        sub a()
                            m.top.functionName = "doSomething"
                        end sub
                    `,
                    trim`
                        sub logger_a()
                            m.top.functionName = "logger_doSomething"
                        end sub
                    `]
            });
        });

        it('prefixes direct task reference from component in same module', async () => {
            await testProcess({
                'logger:components/SimpleTask.brs': [
                    trim`
                        sub init()
                            m.top.functionName = "doSomething"
                        end sub
                    `, trim`
                        sub init()
                            m.top.functionName = "logger_doSomething"
                        end sub
                    `
                ],
                //directly extends task
                'logger:components/SimpleTask.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="SimpleTask" extends="Task">
                            <script uri="SimpleTask.brs" />
                        </component>
                    `
                ]
            });
        });

        it('prefixes indirect task reference from component in same module', async () => {
            await testProcess({
                'logger:components/HardTask.brs': [
                    trim`
                        sub init()
                            m.top.functionName = "doSomething"
                        end sub
                    `, trim`
                        sub init()
                            m.top.functionName = "logger_doSomething"
                        end sub
                    `
                ],
                'logger:components/SimpleTask.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="SimpleTask" extends="Task">
                        </component>
                    `
                ],
                'logger:components/HardTask.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="HardTask" extends="SimpleTask">
                            <script uri="HardTask.brs" />
                        </component>
                    `
                ]
            });
        });

        it('handles d.bs default param values properly', async () => {
            await createDependencies([{
                name: 'alpha',
                dependencies: [{
                    name: 'beta',
                    _files: {
                        'source/betaLib.d.bs': trim`
                            sub doSomething(callback = noop)
                            end sub
                            sub noop()
                            end sub
                        `
                    }
                }]
            }]);

            await managerProcess();

            fsEqual(`${hostDir}/source/roku_modules/beta_v1/betaLib.d.bs`, `
                namespace beta.v1
                sub doSomething(callback = beta.v1.noop)
                end sub
                end namespace
                namespace beta.v1
                sub noop()
                end sub
                end namespace
            `);
        });

        //TODO eventually we need to fix this test
        it.skip('handles d.bs default param namespaced values properly', async () => {
            await createDependencies([{
                name: 'alpha',
                dependencies: [{
                    name: 'beta',
                    _files: {
                        'source/betaLib.d.bs': trim`
                            sub doSomething(callback = internal.noop)
                            end sub
                            namespace internal
                                sub noop()
                                end sub
                            end namespace
                        `
                    }
                }]
            }]);

            await managerProcess();

            fsEqual(`${hostDir}/source/roku_modules/beta_v1/betaLib.d.bs`, `
                namespace beta.v1
                sub doSomething(callback = beta.v1.internal.noop)
                end sub
                end namespace
                namespace beta.v1.internal
                    sub noop()
                    end sub
                end namespace
            `);
        });

        it('prefixes default parameter values in d.bs files', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        namespace util
                            function doSomething()
                            end function
                            class Person
                            end class
                        end namespace
                    `, trim`
                        namespace logger.util
                            function doSomething()
                            end function
                            class Person
                            end class
                        end namespace
                    `
                ]
            });
        });

        it('prefixes namespaces and not their child functions or classes', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        namespace util
                            function doSomething()
                            end function
                            class Person
                            end class
                        end namespace
                    `, trim`
                        namespace logger.util
                            function doSomething()
                            end function
                            class Person
                            end class
                        end namespace
                    `
                ]
            });
        });

        it('ensures .brs files are parsed when d.bs files are present', async () => {
            await testProcess({
                'l@logger:source/lib.d.bs': [
                    trim`
                        sub logWarning()
                        end sub
                        namespace util
                            sub logError()
                            end sub
                        end namespace
                    `
                ],

                'l@logger:source/lib.brs': [
                    trim`
                        sub logWarning()
                        end sub
                        sub util_logError()
                        end sub
                    `, trim`
                        sub l_logWarning()
                        end sub
                        sub l_util_logError()
                        end sub
                    `
                ]
            });
        });

        it('wraps top-level declarations with a namespace', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        function doSomething()
                        end function
                        class Person
                        end class
                        enum Direction
                            up = "up"
                        end enum
                        const PI = 3.14
                        interface Movie
                            uri as string
                        end interface
                    `,
                    trim`
                        namespace logger
                        function doSomething()
                        end function
                        end namespace
                        namespace logger
                        class Person
                        end class
                        end namespace
                        namespace logger
                        enum Direction
                            up = "up"
                        end enum
                        end namespace
                        namespace logger
                        const PI = 3.14
                        end namespace
                        namespace logger
                        interface Movie
                            uri as string
                        end interface
                        end namespace
                    `
                ]
            });
        });

        it('prefixes enums, classes, and interfaces in function param types', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        function move(direction as Direction, vid as Video, mov as Movie)
                        end function
                        enum Direction
                            up
                        end enum
                        interface Video
                            uri as string
                        end interface
                        class Movie
                            uri as string
                        end class
                    `,
                    trim`
                        namespace logger
                        function move(direction as logger.Direction, vid as logger.Video, mov as logger.Movie)
                        end function
                        end namespace
                        namespace logger
                        enum Direction
                            up
                        end enum
                        end namespace
                        namespace logger
                        interface Video
                            uri as string
                        end interface
                        end namespace
                        namespace logger
                        class Movie
                            uri as string
                        end class
                        end namespace
                    `
                ]
            });
        });

        it('prefixes enums, classes, and interfaces in interface members', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        interface Video
                            whichWay as Direction
                            thingToPlay as Video
                            parent as Movie
                        end interface
                        enum Direction
                            up
                        end enum
                        class Movie
                            uri as string
                        end class
                    `,
                    trim`
                        namespace logger
                        interface Video
                            whichWay as logger.Direction
                            thingToPlay as logger.Video
                            parent as logger.Movie
                        end interface
                        end namespace
                        namespace logger
                        enum Direction
                            up
                        end enum
                        end namespace
                        namespace logger
                        class Movie
                            uri as string
                        end class
                        end namespace
                    `
                ]
            });
        });

        it('prefixes enums, classes, and interfaces in class members', async () => {
            await testProcess({
                'logger:source/lib.d.bs': [
                    trim`
                        class Movie
                            whichWay as Direction
                            thingToPlay as Video
                            parent as Movie
                        end class
                        enum Direction
                            up
                        end enum
                        interface Video
                            uri as string
                        end interface
                    `,
                    trim`
                        namespace logger
                        class Movie
                            whichWay as logger.Direction
                            thingToPlay as logger.Video
                            parent as logger.Movie
                        end class
                        end namespace
                        namespace logger
                        enum Direction
                            up
                        end enum
                        end namespace
                        namespace logger
                        interface Video
                            uri as string
                        end interface
                        end namespace
                    `
                ]
            });
        });

        it('prefixes functions found inside IIFEs', async () => {
            await testProcess({
                'logger:source/main.brs': [
                    `
                        sub getResult()
                            return (sub()
                                print getName()
                            end sub)()
                        end sub
                        function getName()
                            return "name"
                        end function
                    `,
                    `
                        sub logger_getResult()
                            return (sub()
                                print logger_getName()
                            end sub)()
                        end sub
                        function logger_getName()
                            return "name"
                        end function
                    `
                ]
            });
        });

        it('rewrites import statements in d.bs files for noprefix-enabled module', async () => {
            noprefixNpmAliases.push('maestro');
            manager.modules = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'maestro',
                    _files: {
                        'source/core/Array.d.bs': trim`
                            import "pkg:/source/core/Collections.brs"
                            import "Source.brs"
                        `
                    }
                }]
            });

            await managerProcess();

            fsEqual(`${hostDir}/source/roku_modules/maestro/core/Array.d.bs`, trim`
                import "pkg:/source/roku_modules/maestro/core/Collections.brs"
                import "pkg:/source/roku_modules/maestro/core/Source.brs"
            `);
        });

        it('does not wrap top-level non-namespaced functions that are referenced by component interface', async () => {
            await testProcess({
                'logger:components/comp.xml': [
                    trim`
                        <?xml version="1.0" encoding="utf-8" ?>
                        <component name="LoggerComponent">
                            <script uri="pkg:/source/lib.brs" />
                            <interface>
                                <function name="logWarning" />
                            </interface>
                        </component>
                    `
                ],
                'logger:source/lib.d.bs': [
                    trim`
                        function logWarning()
                        end function
                        function logError()
                        end function
                    `,
                    trim`
                        function logWarning()
                        end function
                        namespace logger
                        function logError()
                        end function
                        end namespace
                    `
                ],

                'logger:source/lib.brs': [
                    trim`
                        function logWarning()
                        end function
                        function logError()
                        end function
                    `,
                    trim`
                        function logWarning()
                        end function
                        function logger_logError()
                        end function
                    `
                ]
            });
        });

        it('prevents loading and running bsc plugins during ropm install', async () => {
            manager.modules = createProjects(hostDir, hostDir, {
                name: 'host',
                dependencies: [{
                    name: 'logger',
                    _files: {
                        'source/loggerlib.brs': `
                            sub logInfo(message)
                                print message
                            end sub
                        `
                    }
                }]
            });

            //create a bsc plugin for the lib
            fsExtra.outputFileSync(`${hostDir}/node_modules/logger/plugin.js`, `
                throw new Error('plugin loaded');
                `);

            fsExtra.outputFileSync(`${hostDir}/node_modules/logger/bsconfig.json`, JSON.stringify({
                plugins: [
                    './plugin.js'
                ]
            }));

            //create a bsc plugin for the host
            fsExtra.outputFileSync(`${hostDir}/plugin.js`, `
                throw new Error('plugin loaded');
            `);

            fsExtra.outputFileSync(`${hostDir}/bsconfig.json`, JSON.stringify({
                plugins: [
                    './plugin.js'
                ]
            }));

            try {
                //change directory into hostDir to reproduce this issue
                process.chdir(hostDir);
                await managerProcess();
            } finally {
                //restore cwd regardless of the test
                process.chdir(cwd);
            }
            //loading the plugin causes an exception, so if no errors are thrown, this test was successful
        });
    });
});

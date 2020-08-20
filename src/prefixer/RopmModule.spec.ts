import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { RopmModule } from "./RopmModule";
import { expect } from "chai";
import { Dependency } from './ModuleManager';
import * as semver from 'semver';
import { mergePackageJson, tempDir, file, fsEqual } from '../TestHelpers.spec';

const hostRootDir = path.join(tempDir, 'hostRootDir');
const hostNodeModulesDir = path.join(hostRootDir, 'node_modules');

describe('RopmModule', () => {
    let programDependencies: Dependency[];
    beforeEach(() => {
        programDependencies = [];
    });

    async function createModule(alias: string, packageJson?: any) {
        const moduleRootDir = path.join(hostNodeModulesDir, alias);
        mergePackageJson(moduleRootDir, {
            name: alias,
            keywords: ['ropm'],
            version: '1.0.0',
            ...packageJson
        });
        const module = new RopmModule(hostRootDir, moduleRootDir);
        await module.init();
        return module;
    }

    function addDependency(dir: string, name: string, alias = name, version = '1.0.0') {
        const deps = {};
        deps[name] = `npm:${name}@${version}`;
        if (dir === hostRootDir) {
            programDependencies.push({
                version: version,
                majorVersion: semver.major(version),
                npmModuleName: name,
                ropmModuleName: alias
            });
        }
        mergePackageJson(dir, {
            dependencies: deps
        });
    }


    async function process(module: RopmModule) {
        await module.createPrefixMap(programDependencies);
        await module.copyFiles();
        await module.transform();
    }

    describe('process', () => {
        it('applies a prefix to all functions of a program', async () => {
            const module = await createModule('logger');
            addDependency(hostRootDir, 'logger');

            file(`${module.rootDir}/source/main.brs`, `
                sub main()
                    SanitizeText("123")
                end sub
                sub SanitizeText(text as string)
                    PrintMessage("Sanitizing text: " + text)
                end sub
            `);
            file(`${module.rootDir}/source/lib.brs`, `
                sub PrintMessage(message)
                    print message
                end sub
            `);
            await process(module);

            fsEqual(`${hostRootDir}/source/roku_modules/logger/main.brs`, `
                sub main()
                    logger_SanitizeText("123")
                end sub
                sub logger_SanitizeText(text as string)
                    logger_PrintMessage("Sanitizing text: " + text)
                end sub
            `);

            fsEqual(`${hostRootDir}/source/roku_modules/logger/lib.brs`, `
                sub logger_PrintMessage(message)
                    print message
                end sub
            `);
        });

        it('applies a prefix to components and their usage', async () => {
            const module = await createModule('logger');
            addDependency(hostRootDir, 'logger');

            file(`${module.rootDir}/components/Component1.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="Component1" extends="Component2" >
                </component>
            `);
            file(`${module.rootDir}/components/Component2.xml`, trim`
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="Component2" extends="Task" >
                    <children>
                        <Component1 />
                        <Component2>
                        </Component2>
                    </children>
                </component>
            `);
            file(`${module.rootDir}/source/main.brs`, `
                sub main()
                    comp = CreateObject("rosgnode", "Component1")
                    comp.CreateChild("Component2")
                end sub
            `);
            await process(module);

            fsEqual(`${hostRootDir}/components/roku_modules/logger/Component1.xml`, `
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="logger_Component1" extends="logger_Component2" >
                </component>
            `);
            fsEqual(`${hostRootDir}/components/roku_modules/logger/Component2.xml`, `
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="logger_Component2" extends="Task" >
                    <children>
                        <logger_Component1 />
                        <logger_Component2>
                        </logger_Component2>
                    </children>
                </component>
            `);

            fsEqual(`${hostRootDir}/source/roku_modules/logger/main.brs`, `
                sub main()
                    comp = CreateObject("rosgnode", "logger_Component1")
                    comp.CreateChild("logger_Component2")
                end sub
            `);
        });

        it('renames dependency prefixes', async () => {
            const logger = await createModule('logger', {
                name: '@alpha/logger'
            });
            await createModule('printer', {
                name: '@bravo/printer'
            });

            //host depends on logger
            addDependency(hostRootDir, '@alpha/logger', 'logger');
            //logger depends on printer
            mergePackageJson(logger.rootDir, {
                dependencies: {
                    'printer': 'npm:@bravo/printer@1.0.0'
                }
            });

            file(`${logger.rootDir}/source/main.brs`, `
                sub PrintValue(value)
                    print printer_writeLine(value)
                end sub
            `);
            programDependencies.push({
                version: '1.0.0',
                majorVersion: 1,
                npmModuleName: '@bravo/printer',
                ropmModuleName: 'console'
            });
            await process(logger);

            fsEqual(`${hostRootDir}/source/roku_modules/logger/main.brs`, `
                sub logger_PrintValue(value)
                    print console_writeLine(value)
                end sub
            `);
        });

        /**
         * This test converts the dependency name "module1" to "module2", and names this package "module1"
         */
        it('handles module prefix swapping', async () => {
            const module1 = await createModule('module1');
            const module2 = await createModule('module2');
            addDependency(hostRootDir, 'module1');
            addDependency(hostRootDir, 'module2');
            file(`${module1.rootDir}/source/main.brs`, `
                sub GetPromise()
                    return module1_createTaskPromise("TaskName", {})
                end sub
            `);
            const module = new RopmModule([
                'source/main.brs'
            ], 'module1', {
                'module1': 'module2'
            });
            await module.process();

            fsEqual('source/main.brs', `
                sub module1_GetPromise()
                    return module2_createTaskPromise("TaskName", {})
                end sub
            `);
        });

        /**
         * Converts dependency prefix "module1" to "module2", and "module2" to "module1"
         */
        it('swaps dependency module prefixes', async () => {
            vfs = {
                'source/main.brs': `
                    sub PrintValues()
                        print module1_GetValue()
                        print module2_GetValue()
                    end sub
                `
            };
            const module = new RopmModule([
                'source/main.brs'
            ], 'textlib', {
                'module1': 'module2',
                'module2': 'module1'
            });
            await module.process();

            fsEqual('source/main.brs', `
                sub ${moduleName}_PrintValues()
                    print module2_GetValue()
                    print module1_GetValue()
                end sub
            `);
        });
    });

});

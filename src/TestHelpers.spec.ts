import * as path from 'path';
import * as fsExtra from 'fs-extra';
import { createSandbox } from 'sinon';
import { expect } from 'chai';
import { RopmModule } from './prefixer/RopmModule';
import type { RopmOptions } from './util';
import * as rokuDeploy from 'roku-deploy';
import { ModuleManager } from './prefixer/ModuleManager';
import { util } from './util';
export const sinon = createSandbox();

export const tempDir = path.join(process.cwd(), '.tmp');

beforeEach(() => {
    fsExtra.ensureDirSync(tempDir);
    fsExtra.emptyDirSync(tempDir);
});

afterEach(() => {
    fsExtra.ensureDirSync(tempDir);
    fsExtra.emptyDirSync(tempDir);
    fsExtra.removeSync(tempDir);
    sinon.restore();
});

export function file(filePath: string, contents: string) {
    fsExtra.ensureDirSync(path.dirname(filePath));
    fsExtra.writeFileSync(filePath, contents);
}

export function mergePackageJson(dir: string, data: any) {
    const filePath = path.join(dir, 'package.json');
    let packageJson = JSON.parse(
        fsExtra.pathExistsSync(filePath) ? fsExtra.readFileSync(filePath).toString() : '{}'
    );
    packageJson = {
        ...packageJson,
        ...data,
        //deep merge dependencies
        dependencies: {
            ...(packageJson?.dependencies ?? {}),
            ...(data?.dependencies ?? {})
        }
    };
    fsExtra.ensureDirSync(dir);
    fsExtra.writeFileSync(filePath, JSON.stringify(packageJson));
}

export function fsEqual(path: string, expectedText: string) {
    expect(
        trimLeading(
            fsExtra.readFileSync(path).toString()
        )
    ).to.exist.and.to.equal(
        trimLeading(expectedText)
    );
}

export function trim(strings: TemplateStringsArray, ...args) {
    let text = '';
    for (let i = 0; i < strings.length; i++) {
        text += strings[i];
        if (args[i]) {
            text += args[i];
        }
    }
    return trimLeading(text);
}

/**
 * Helper function to scaffold a project with nested dependencies
 */
export function createProjects(hostDir: string, moduleDir: string, node: DepGraphNode) {
    const result = [] as RopmModule[];
    //write the package.json for this node
    const packageJson = {
        ...node,
        name: node.name,
        version: node.version ?? '1.0.0',
        keywords: ['ropm'],
        dependencies: {}
    };
    delete packageJson._files;
    for (const relativePath in node._files ?? {}) {
        const absolutePath = path.join(moduleDir, relativePath);
        fsExtra.ensureDirSync(path.dirname(absolutePath));
        fsExtra.writeFileSync(absolutePath, node._files?.[relativePath] ?? '');
    }
    const innerProjects = [] as RopmModule[];
    for (const dependency of node?.dependencies ?? []) {
        const alias = dependency.alias ?? dependency.name;
        packageJson.dependencies[alias] = dependency.version ?? '1.0.0';
        innerProjects.push(
            ...createProjects(hostDir, path.join(moduleDir, 'node_modules', alias), dependency)
        );
    }
    mergePackageJson(moduleDir, packageJson);
    if (hostDir !== moduleDir) {
        result.push(
            new RopmModule(hostDir, moduleDir)
        );
    }
    result.push(...innerProjects);
    return result;
}

export interface DepGraphNode {
    alias?: string;
    name: string;
    version?: string;
    dependencies?: Array<DepGraphNode>;
    _files?: Record<string, string>;
    ropm?: RopmOptions;
}


/**
 * Trim leading whitespace for every line (to make test writing cleaner)
 */
function trimLeading(text: string) {
    if (!text) {
        return text;
    }
    const lines = text.split(/\r?\n/);
    let minIndent = Number.MAX_SAFE_INTEGER;

    //skip leading empty lines
    while (lines[0]?.trim().length === 0) {
        lines.splice(0, 1);
    }

    for (const line of lines) {
        const trimmedLine = line.trimLeft();
        //skip empty lines
        if (trimmedLine.length === 0) {
            continue;
        }
        const leadingSpaceCount = line.length - trimmedLine.length;
        if (leadingSpaceCount < minIndent) {
            minIndent = leadingSpaceCount;
        }
    }

    //apply the trim to each line
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].substring(minIndent);
    }
    return lines.join('\n');
}

export async function expectThrowsAsync(func, startingText?: string) {
    let ex!: Error;
    try {
        await Promise.resolve(
            func()
        );
    } catch (e: any) {
        ex = e;
    }
    if (!ex) {
        throw new Error('Expected exception to be thrown');
    }
    //if starting text was provided, then the lower error message must start with that text, or this test will fail
    if (startingText && !ex.message.toLowerCase().startsWith(startingText.toLowerCase())) {
        throw new Error(`Expected error message '${ex.message}' to start with '${startingText}'`);
    }
}

/**
 * A tagged template literal function for standardizing the path.
 */
export function standardizePath(stringParts, ...expressions: any[]) {
    const result = [] as string[];
    for (let i = 0; i < stringParts.length; i++) {
        result.push(stringParts[i], expressions[i]);
    }
    return rokuDeploy.standardizePath(
        result.join('')
    );
}

export function pick(objects: any[], ...properties: string[]) {
    const results = [] as any[];
    for (const obj of objects) {
        const result = {};
        for (const property of properties) {
            result[property] = obj[property];
        }
        results.push(result);
    }
    return results;
}

/**
 * Streamlined way to test the ModuleManager.process functionality
 * The key is in the format `moduleName:path/to/file.ext`. You can specify an alias by doing `alias@moduleName:path/to/file.ext`
 */
export async function testProcess(args: Record<string, [source: string, expected?: string]>) {
    const manager = new ModuleManager();
    const hostDir = path.join(process.cwd(), '.tmp', 'hostApp');
    const noprefixNpmAliases = (args['noprefixNpmAliases'] ?? []) as string[];
    delete args['noprefixNpmAliases'];

    const dependencies = [] as DepGraphNode[];
    const expectedFileMap = new Map<string, any>();

    for (const fileKey in args) {
        const [source, expected] = args[fileKey];
        const parts = fileKey.split(':');
        let [dependencyName, filePath] = parts;
        let alias = dependencyName;

        //you can specify an alias by typing alias@originalName
        const nameParts = dependencyName.split('@');
        if (nameParts.length > 1) {
            dependencyName = nameParts[1];
            alias = nameParts[0];
        }

        let dep = dependencies.find(x => x.name === dependencyName);
        if (!dep) {
            dep = {
                name: dependencyName,
                alias: dependencyName !== alias ? alias : undefined,
                _files: {}
            };
            dependencies.push(dep);
        }
        dep._files![filePath] = source;
        //only set if we have an expected value (undefined means "don't test this one")
        if (expected) {
            expectedFileMap.set(filePath, expected);
        }
    }

    manager.modules = createProjects(hostDir, hostDir, {
        name: 'host',
        dependencies: dependencies
    });

    manager.hostDependencies = await util.getModuleDependencies(hostDir);
    manager.noprefixNpmAliases = noprefixNpmAliases;
    await manager.process();

    //compare each output file to the expected
    for (const dep of dependencies) {
        for (const filePath in dep._files) {
            const parts = filePath.split('/');
            const baseFolder = parts.shift();
            const remainingPath = parts.join('/');
            const destinationPath = `${hostDir}/${baseFolder}/roku_modules/${dep.alias ?? dep.name}/${remainingPath}`;
            //only test if we have an expected value
            if (expectedFileMap.has(filePath)) {
                fsEqual(destinationPath, expectedFileMap.get(filePath));
            }
        }
    }
}

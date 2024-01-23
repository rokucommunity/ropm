import * as childProcess from 'child_process';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import * as globAll from 'glob-all';
import * as latinize from 'latinize';
import * as semver from 'semver';
import type { IOptions } from 'glob';
import { Program } from 'brighterscript';
import * as readline from 'readline';

export class Util {

    /**
     * Determine if the current OS is running a version of windows
     */
    private isWindowsPlatform() {
        return process.platform.startsWith('win');
    }

    /**
     * Executes an exec command and returns a promise that completes when it's finished
     */
    spawnAsync(command: string, args?: string[], options?: childProcess.SpawnOptions) {
        return new Promise((resolve, reject) => {
            const child = childProcess.spawn(command, args ?? [], {
                ...(options ?? {}),
                stdio: 'inherit'
            });
            child.addListener('error', reject);
            child.addListener('exit', resolve);
        });
    }

    /**
     * Spawn an npm command and return a promise.
     * This is necessary because spawn requires the file extension (.cmd) on windows.
     * @param args - the list of args to pass to npm. Any undefined args will be removed from the list, so feel free to use ternary outside to simplify things
     */
    spawnNpmAsync(args: Array<string | undefined>, options?: childProcess.SpawnOptions) {
        //filter out undefined args
        args = args.filter(arg => arg !== undefined);
        return this.spawnAsync(
            this.isWindowsPlatform() ? 'npm.cmd' : 'npm',
            args as string[],
            options
        );
    }

    public getUserInput(question: string) {
        return new Promise<string>((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            //prompt the user for a rootDir
            rl.question(`What is the rootDir for your project (./):`, (answer) => {
                resolve(answer);
                rl.close();
            });
        });
    }

    /**
     * Given a full path to a node module, calculate the module's name.
     */
    getModuleName(modulePath: string) {
        if (typeof modulePath !== 'string') {
            return undefined;
        }
        const parts = modulePath.split(/\\|\//);
        //get folder name
        const moduleName = parts.pop();
        if (!moduleName) {
            return undefined;
        }
        //get the next folder name
        const maybeNamespaceFolderName = parts.pop();
        if (maybeNamespaceFolderName?.startsWith('@')) {
            return maybeNamespaceFolderName + '/' + moduleName;
        } else {
            return moduleName;
        }
    }

    /**
     * Given the name of a node module (`module`, `some-module`, `some_module`, `@namespace/some-module`, etc...),
     * return the ropm-safe version of that module.
     * This will remove dashes, @ symbols, and many other invalid characters, convert slashes into underscores.
     * If a name starts with a number, prefix with underscore
     */
    getRopmNameFromModuleName(moduleName: string) {
        //replace slashes with underscores
        moduleName = moduleName.replace(/\\|\//g, '_');
        //replace non-normal word characters with their standard latin equivalent
        moduleName = latinize(moduleName);
        //replace every invalid character
        moduleName = moduleName.replace(/[^a-zA-Z_0-9]/g, '');
        //prefix underscore to packages starting with a number
        moduleName = moduleName.replace(/^([0-9])/, (i, match) => {
            return '_' + match;
        });
        //force characters to lower case
        moduleName = moduleName.toLowerCase();
        return moduleName;
    }

    /**
     * Get the package.json as an object
     */
    async getPackageJson(modulePath: string) {
        const packageJsonPath = path.join(modulePath, 'package.json');

        const text = await fsExtra.readFile(packageJsonPath);

        const packageJson = JSON.parse(text.toString()) as RopmPackageJson;
        return packageJson;
    }

    /**
     * Determine if the directory is empty or not
     */
    async isEmptyDir(dirPath: string) {
        //TODO this lists all files in the directory. Perhaps we should optimize this by using a directory reader? Might not matter...
        const files = await fsExtra.readdir(dirPath);
        return files.length === 0;
    }

    /**
     * A promise wrapper around glob-all
     */
    public async globAll(patterns, options?: IOptions) {
        return new Promise<string[]>((resolve, reject) => {
            globAll(patterns, options, (error, matches) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(matches);
                }
            });
        });
    }

    /**
     * Copy a set of files
     */
    public async copyFiles(files: Array<{ src: string; dest: string }>) {
        await Promise.all(files.map(async file => {
            //try each copy several times, just in case there was an issue
            for (let i = 0; i <= 4; i++) {
                try {
                    //make sure the target directory exists, or create it if not
                    await fsExtra.ensureDir(
                        path.dirname(file.dest)
                    );
                    //copy the file
                    await fsExtra.copyFile(file.src, file.dest);
                } catch (e) {
                    //if we hit our max, throw the underlying error
                    if (i === 4) {
                        throw e;
                    }
                }
            }
        }));
    }

    /**
     * Given a path to a module within node_modules, return its list of direct dependencies
     */
    public async getModuleDependencies(moduleDir: string) {
        const packageJson = await util.getPackageJson(moduleDir);
        const npmAliases = Object.keys(packageJson.dependencies ?? {});

        //look up the original package name of each alias
        const result = [] as ModuleDependency[];

        await Promise.all(
            npmAliases.map(async (npmAlias) => {

                const dependencyDir = await this.findDependencyDir(moduleDir, npmAlias);
                if (!dependencyDir) {
                    throw new Error(`Could not resolve dependency "${npmAlias}" for "${moduleDir}"`);
                }
                const packageJson = await util.getPackageJson(dependencyDir);
                if ((packageJson.keywords ?? []).includes('ropm')) {
                    result.push({
                        npmAlias: npmAlias,
                        ropmModuleName: util.getRopmNameFromModuleName(npmAlias),
                        npmModuleName: packageJson.name,
                        version: packageJson.version
                    });
                }
            })
        );

        return result;
    }

    /**
     * Given a full verison string that ends with a prerelease text,
     * convert that into a valid roku identifier. This is unique in that we want
     * the identifier to still be version number-ish.
     */
    public prereleaseToRokuIdentifier(preversion: string) {
        let identifier = this.getRopmNameFromModuleName(
            //replace all periods or dashes with underscores
            preversion.replace(/\.|-/g, '_')
        );
        //strip the leading identifier
        if (identifier.startsWith('_')) {
            identifier = identifier.substring(1);
        }
        return identifier;
    }

    /**
     * Given the path to a folder containing a node_modules folder, find the path to the specified package
     * First look in ${startingDir}/node_modules. Then, walk up the directory tree,
     * looking in node_modules for that folder the whole way up to root.
     */
    public async findDependencyDir(startingDir: string, packageName: string) {
        let dir = startingDir;
        while (path.dirname(dir) !== dir) {
            const modulePathCandidate = path.join(dir, 'node_modules', packageName);
            if (await fsExtra.pathExists(modulePathCandidate)) {
                return modulePathCandidate;
            }
            dir = path.dirname(dir);
        }
    }

    /**
     * Replace the first case-insensitive occurance of {search} in {subject} with {replace}
     */
    public replaceCaseInsensitive(search: string, subject: string, replace: string) {
        const idx = subject.toLowerCase().indexOf(search.toLowerCase());
        if (idx > -1) {
            return subject.substring(0, idx) + replace + subject.substring(idx + search.length);
        } else {
            return subject;
        }
    }

    /**
     * If the text starts with a slash, remove it
     */
    public removeLeadingSlash(text: string) {
        if (text.startsWith('/') || text.startsWith('\\')) {
            return text.substring(1);
        } else {
            return text;
        }
    }

    /**
     * Get the dominant version for a given version. This is the major number for normal versions,
     * or the entire version string for prerelease versions
     */
    public getDominantVersion(version: string) {
        return semver.prerelease(version) ? version : semver.major(version).toString();
    }

    /**
     * Determine if a string has the same number of open parens as it does close parens
     */
    public hasMatchingParenCount(text: string) {
        let count = 0;
        for (const char of text) {
            if (char === '(') {
                count++;
            } else if (char === ')') {
                count--;
            }
        }
        return count === 0;
    }

    /**
     * Replaces the Program.validate call with an empty function.
     * This allows us to bypass BrighterScript's validation cycle, which speeds up performace
     */
    public mockProgramValidate() {
        if (Program.prototype.validate !== mockProgramValidate) {
            Program.prototype.validate = mockProgramValidate;
        }
    }

    /**
     * Get the base namespace from a namespace statement, or undefined if there are no dots
     */
    public getBaseNamespace(text: string) {
        const parts = text.split('.');
        if (parts.length > 1) {
            return parts[0];
        }
    }

}

function mockProgramValidate() {
    return Promise.resolve();
}
export const util = new Util();

export interface RopmPackageJson {
    name: string;
    dependencies?: Record<string, string>;
    files?: string[];
    keywords?: string[];
    version: string;
    workspaces?: string[];
    ropm?: RopmOptions;
}
export interface RopmOptions {
    /**
     * The path to the rootDir of the project where `ropm` should install all ropm modules
     */
    rootDir?: string;
    /**
     * The path to the rootDir of the a ropm module's package files. Use this if your module stores files in a subdirectory.
     * NOTE: This should only be used by ropm package AUTHORS
     */
    packageRootDir?: string;
    /**
     * An array of module aliases that should not be prefixed when installed into `rootDir`. Use this with caution.
     */
    noprefix?: string[];
}

export interface ModuleDependency {
    npmAlias: string;
    ropmModuleName: string;
    npmModuleName: string;
    version: string;
}

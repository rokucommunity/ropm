import * as childProcess from 'child_process';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import * as globAll from 'glob-all';
import * as latinize from 'latinize';
import { IOptions } from 'glob';

export class Util {
    /**
     * Executes an exec command and returns a promise that completes when it's finished
     */
    spawnAsync(command: string, args: string[], options?: childProcess.SpawnOptions) {
        return new Promise((resolve, reject) => {
            const child = childProcess.spawn(command, args, {
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
            process.platform.startsWith('win') ? 'npm.cmd' : 'npm',
            args as string[],
            options
        );
    }

    /**
     * Given a full path to a node module, calculate the module's name.
     */
    getModuleName(modulePath: string) {
        if (typeof modulePath !== 'string') {
            return undefined;
        }
        let parts = modulePath.split(/\\|\//);
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

        let text = await fsExtra.readFile(packageJsonPath);

        let packageJson = JSON.parse(text.toString()) as RopmPackageJson;
        return packageJson;
    }

    /**
     * Determine if the directory is empty or not
     */
    async isEmptyDir(dirPath: string) {
        //TODO this lists all files in the directory. Perhaps we should optimize this by using a directory reader? Might not matter...
        let files = await fsExtra.readdir(dirPath);
        return files.length === 0;
    }

    /**
     * A promise wrapper around glob-all
     */
    public async globAll(patterns, options: IOptions) {
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
     * Given the path to the host module, return its list of dependencies
     */
    public async getModuleDependencies(hostModulePath: string) {
        const packageJson = await util.getPackageJson(hostModulePath);
        const aliases = Object
            .keys(packageJson.dependencies ?? {})
            .map(x => util.getRopmNameFromModuleName(x));

        //look up the original package name of each alias
        let result = [] as {
            alias: string;
            npmPackageName: string;
            version: string;
        }[];

        await Promise.all(
            aliases.map(async (alias) => {
                let packageJson = await util.getPackageJson(`${hostModulePath}/node_modules/${alias}`);
                result.push({
                    alias: alias,
                    npmPackageName: packageJson.name,
                    version: packageJson.version
                });
            })
        );

        return result;
    }

}
export const util = new Util();

export interface RopmPackageJson {
    name: string;
    dependencies?: { [key: string]: string };
    files?: string[];
    keywords?: string[];
    version: string;
    ropm?: {
        /**
         * The path to the rootDir where all of the files for the roku module reside.
         */
        rootDir?: string;
    };
}

import * as childProcess from 'child_process';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import * as globAll from 'glob-all';
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
     * This is necessary because spawn requires the file extension (.cmd) on windows
     */
    spawnNpmAsync(args: string[], options?: childProcess.SpawnOptions) {
        return this.spawnAsync(
            process.platform.startsWith('win') ? 'npm.cmd' : 'npm',
            args,
            options
        );
    }

    /**
     * Given a full path to a node module, compute the roku-safe module name that will be used
     * to name the folder
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
     * Get the package.json as an object
     */
    async getPackageJson(modulePath: string) {
        let text = await fsExtra.readFile(
            path.join(modulePath, 'package.json')
        );
        let packageJson = JSON.parse(text.toString());
        return packageJson;
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
}
export const util = new Util();

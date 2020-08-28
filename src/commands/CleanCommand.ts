import * as path from 'path';
import * as fsExtra from 'fs-extra';
import { util, RopmPackageJson } from '../util';
import { InitCommand } from './InitCommand';
import * as del from 'del';

export class CleanCommand {
    constructor(
        public args: CleanCommandArgs
    ) {
    }

    private hostPackageJson?: RopmPackageJson;

    private get hostRootDir() {
        if (this.args.rootDir) {
            return path.resolve(this.cwd, this.args.rootDir);
        } else {
            const packageJsonRootDir = this.hostPackageJson?.ropm?.rootDir;
            if (packageJsonRootDir) {
                return path.resolve(this.cwd, packageJsonRootDir);
            } else {
                return this.cwd;
            }
        }
    }

    /**
     * Determine if we should load the host package.json from disk or not
     */
    private get skipLoadHostPackageJson() {
        return !!this.args.rootDir;
    }

    /**
     * A "host" is the project we are currently operating upon. This method
     * finds the package.json file for the current host
     */
    private async loadHostPackageJson() {
        if (this.skipLoadHostPackageJson === false) {
            //if the host doesn't currently have a package.json
            if (await fsExtra.pathExists(path.resolve(this.cwd, 'package.json')) === false) {
                console.log('Creating package.json');
                //init package.json for the host
                await new InitCommand({ cwd: this.cwd, force: true }).run();
            }
            this.hostPackageJson = await util.getPackageJson(this.cwd);
        }
    }

    public async run() {
        await this.loadHostPackageJson();
        await this.deleteAllRokuModulesFolders();
    }

    private async deleteAllRokuModulesFolders() {
        const rokuModulesFolders = await util.globAll([
            '*/roku_modules',
            '!node_modules/**/*'
        ], {
            cwd: this.hostRootDir,
            absolute: true
        });

        //delete the roku_modules folders
        await Promise.all(
            rokuModulesFolders.map(async (rokuModulesDir) => {
                console.log(`ropm: deleting ${rokuModulesDir}`);
                await del(rokuModulesDir);

                //if the parent dir is now empty, delete that folder too
                const parentDir = path.dirname(rokuModulesDir);
                if (await util.isEmptyDir(parentDir)) {
                    console.log(`ropm: deleting empty ${parentDir}`);
                    await del(parentDir);
                }
            })
        );
    }

    private get cwd() {
        if (this.args?.cwd) {
            return path.resolve(process.cwd(), this.args?.cwd);
        } else {
            return process.cwd();
        }
    }
}

export interface CleanCommandArgs {
    /**
     * The current working directory for the command.
     */
    cwd?: string;
    /**
     * The path to the root directory for the project that should be cleaned
     */
    rootDir?: string;
}

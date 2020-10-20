import * as path from 'path';
import { RopmPackageJson, util } from '../util';
import * as fsExtra from 'fs-extra';

export class InitCommand {
    constructor(
        public args: InitCommandArgs
    ) {

    }

    public async run() {
        if (await fsExtra.pathExists(this.cwd) === false) {
            throw new Error(`"${this.cwd}" does not exist`);
        }
        await this.getRootDirFromUser();
        await util.spawnNpmAsync([
            'init',
            this.force ? '--force' : undefined
        ], {
            cwd: this.cwd,
            stdio: 'inherit'
        });
    }

    private get cwd() {
        if (this.args?.cwd) {
            return path.resolve(process.cwd(), this.args?.cwd);
        } else {
            return process.cwd();
        }
    }

    private get force() {
        return this.args.force === true;
    }

    private get promptForRootDir() {
        //explicitly check for "true", because undefined is valid and means "default to value of force"
        return this.args.promptForRootDir === true || this.force === false;
    }

    /**
     * If the package.json is missing `ropm.rootDir`, prompt user for that info
     */
    private async getRootDirFromUser() {

        const packagePath = path.join(this.cwd, 'package.json');
        let packageJson = {} as RopmPackageJson;
        if (fsExtra.pathExistsSync(packagePath)) {
            packageJson = await util.getPackageJson(this.cwd);
        }
        if (!packageJson.ropm) {
            packageJson.ropm = {};
        }
        //if there is no rootDir present
        if (!packageJson.ropm.rootDir) {
            if (this.promptForRootDir) {
                const answer = await util.getUserInput(`What is the rootDir for your project (./):`);
                packageJson.ropm.rootDir = answer.trim() || './';
            } else {
                //default to current directory
                packageJson.ropm.rootDir = './';
            }
        }
        fsExtra.writeJsonSync(packagePath, packageJson, {
            spaces: 4
        });
    }
}

export interface InitCommandArgs {
    /**
     * The current working directory for the command.
     */
    cwd?: string;
    /**
     * If true, then generate without any questions
     */
    force?: boolean;
    /**
     * This overrides `force` for rootDir, but only if present
     */
    promptForRootDir?: boolean;
}

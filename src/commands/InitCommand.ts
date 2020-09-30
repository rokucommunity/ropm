import * as path from 'path';
import { util } from '../util';
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
        await util.spawnNpmAsync([
            'init',
            this.args.force === true ? '--force' : undefined
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
}

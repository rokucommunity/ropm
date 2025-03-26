import type { CommandArgs } from '../util';
import { util } from '../util';
import * as path from 'path';
import { InstallCommand } from './InstallCommand';

export class UninstallCommand {
    constructor(
        public args: UninstallCommandArgs
    ) {

    }

    private get cwd() {
        if (this.args?.cwd) {
            return path.resolve(process.cwd(), this.args?.cwd);
        } else {
            return process.cwd();
        }
    }

    public async run(): Promise<void> {
        await this.npmUninstall();
        //after uninstalling the specified packages, we need to run an install again. it's easier than tracking down what files to remove directly
        await this.npmInstall();
    }

    private async npmUninstall() {
        await util.spawnNpmAsync([
            'uninstall',
            ...(this.args.packages ?? [])
        ], {
            cwd: this.cwd
        });
    }

    /**
     * Should be run after an uninstall
     */
    private async npmInstall() {
        const installCommand = new InstallCommand({
            cwd: this.cwd,
            packages: [],
            logLevel: this.args.logLevel
        });
        await installCommand.run();
    }
}

export interface UninstallCommandArgs extends CommandArgs {
    /**
     * The list of packages that should be uninstalled
     */
    packages: string[];
}

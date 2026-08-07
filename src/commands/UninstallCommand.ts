import type { CommandArgs } from '../util';
import { util } from '../util';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import { InstallCommand } from './InstallCommand';
import { getPackageManager } from '../packageManagers';

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

    /**
     * Resolve the package manager from the `--package-manager` arg, then `ropm.packageManager`
     * in the host package.json, defaulting to npm.
     */
    private async resolvePackageManager() {
        let configuredName = this.args.packageManager;
        if (!configuredName) {
            const packageJsonPath = path.join(this.cwd, 'package.json');
            if (await fsExtra.pathExists(packageJsonPath)) {
                const packageJson = await util.getPackageJson(this.cwd);
                configuredName = packageJson.ropm?.packageManager;
            }
        }
        return getPackageManager(configuredName);
    }

    private async npmUninstall() {
        const packageManager = await this.resolvePackageManager();
        await packageManager.uninstall(this.args.packages ?? [], {
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
            logLevel: this.args.logLevel,
            packageManager: this.args.packageManager
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

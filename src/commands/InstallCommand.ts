import type { CommandArgs, RopmPackageJson } from '../util';
import { util } from '../util';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import { InitCommand } from './InitCommand';
import { CleanCommand } from './CleanCommand';
import { ModuleManager } from '../prefixer/ModuleManager';
import type { PackageManager } from '../packageManagers';
import { getPackageManager } from '../packageManagers';

export class InstallCommand {
    constructor(
        public args: InstallCommandArgs
    ) {

    }

    private hostPackageJson?: RopmPackageJson;

    public logger = util.createLogger();

    private moduleManager = new ModuleManager({ logger: this.logger });

    private _packageManager?: PackageManager;

    /**
     * The package manager used to install and resolve dependencies. Resolved from the
     * `--package-manager` arg, then `ropm.packageManager` in the host package.json, defaulting to npm.
     */
    private get packageManager(): PackageManager {
        if (!this._packageManager) {
            this._packageManager = getPackageManager(
                this.args.packageManager ?? this.hostPackageJson?.ropm?.packageManager
            );
        }
        return this._packageManager;
    }

    private get hostRootDir() {
        const packageJsonRootDir = this.args.rootDir ?? this.hostPackageJson?.ropm?.rootDir;
        if (packageJsonRootDir) {
            return path.resolve(this.cwd, packageJsonRootDir);
        } else {
            return this.cwd;
        }
    }

    private get cwd() {
        if (this.args?.cwd) {
            return path.resolve(process.cwd(), this.args?.cwd);
        } else {
            return process.cwd();
        }
    }

    public async run(runNpmInstall = true): Promise<void> {
        await this.loadHostPackageJson();
        this.updateLogLevel();
        await this.deleteAllRokuModulesFolders();
        if (runNpmInstall) {
            await this.npmInstall();
        }
        await this.processModules();
    }

    /**
     * Deletes every roku_modules folder found in the hostRootDir
     */
    private async deleteAllRokuModulesFolders() {
        const cleanCommand = new CleanCommand({
            cwd: this.cwd,
            logLevel: this.args.logLevel,
            rootDir: this.args.rootDir
        });
        await cleanCommand.run();
    }

    /**
     * A "host" is the project we are currently operating upon. This method
     * finds the package.json file for the current host
     */
    private async loadHostPackageJson() {
        //if the host doesn't currently have a package.json
        if (await fsExtra.pathExists(path.resolve(this.cwd, 'package.json')) === false) {
            this.logger.log('Creating package.json');
            //init package.json for the host
            await new InitCommand({ cwd: this.cwd, force: true, promptForRootDir: true, logLevel: this.args.logLevel }).run();
        }
        this.hostPackageJson = await util.getPackageJson(this.cwd);
    }

    private updateLogLevel() {
        //set the logLevel provided by the RopmOptions
        this.logger.logLevel = this.args.logLevel ?? this.hostPackageJson?.ropm?.logLevel ?? 'log';
    }

    private async npmInstall() {
        if (await fsExtra.pathExists(this.cwd) === false) {
            throw new Error(`"${this.cwd}" does not exist`);
        }
        await this.packageManager.install(this.args.packages ?? [], {
            cwd: this.cwd
        });
    }

    /**
     * Copy all modules to roku_modules
     */
    private async processModules() {
        const modulePaths = this.getProdDependencies();

        //remove the host module from the list (it should always be the first entry)
        const hostModulePath = modulePaths.splice(0, 1)[0];
        this.moduleManager.hostDependencies = await util.getModuleDependencies(hostModulePath, this.logger);

        this.moduleManager.hostRootDir = this.hostRootDir;
        this.moduleManager.noprefixNpmAliases = this.hostPackageJson?.ropm?.noprefix ?? [];

        //copy all of them at once, wait for them all to complete
        for (const modulePath of modulePaths) {
            this.moduleManager.addModule(modulePath);
        }

        await this.moduleManager.process();
    }

    /**
     * Get the list of prod dependency directories from the active package manager.
     * This is run sync because it should run as fast as possible
     * and won't be run in ~parallel.
     */
    public getProdDependencies() {
        if (fsExtra.pathExistsSync(this.cwd) === false) {
            throw new Error(`"${this.cwd}" does not exist`);
        }
        return this.packageManager.getProductionDependencies({
            cwd: this.cwd,
            packageName: this.hostPackageJson?.name,
            logger: this.logger
        });
    }
}

export interface InstallCommandArgs extends CommandArgs {
    /**
     * The list of packages that should be installed
     */
    packages?: string[];
    /**
     * Dependencies installation location.
     * By default the setting from package.json is imported out-of-the-box, but if rootDir is passed here,
     * it will override the value from package.json.
     */
    rootDir?: string;
}

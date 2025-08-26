import type { CommandArgs, RopmPackageJson } from '../util';
import { util } from '../util';
import * as path from 'path';
import * as childProcess from 'child_process';
import * as fsExtra from 'fs-extra';
import { InitCommand } from './InitCommand';
import { CleanCommand } from './CleanCommand';
import { ModuleManager } from '../prefixer/ModuleManager';

export class InstallCommand {
    constructor(
        public args: InstallCommandArgs
    ) {

    }

    private hostPackageJson?: RopmPackageJson;

    public logger = util.createLogger();

    private moduleManager = new ModuleManager({ logger: this.logger });


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
            logLevel: this.args.logLevel
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
        await util.spawnNpmAsync([
            'i',
            ...(this.args.packages ?? [])
        ], {
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
     * Get the list of prod dependencies from npm.
     * This is run sync because it should run as fast as possible
     * and won't be run in ~parallel.
     */
    public getProdDependencies() {
        if (fsExtra.pathExistsSync(this.cwd) === false) {
            throw new Error(`"${this.cwd}" does not exist`);
        }
        let stdout: string;
        try {
            const npmLs = `npm ls --parseable --omit=dev --omit=optional --depth=Infinity`;
            this.logger.debug(`executing command: ${npmLs}`);

            stdout = childProcess.execSync(npmLs, {
                cwd: this.cwd
            }).toString();

        } catch (e) {
            stdout = (e as any).stdout.toString();

            // do not throw error, just log a warning
            // there are a lot of edge cases where npm ls errors don't pose any actual roadblock for ropm packages

            this.logger.warn([
                'Encountered an error while retrieving the prod dependencies from npm-ls. Attempting to proceed anyways. You can review the error below:\n',
                (e as any).message
            ].join('\n'));
        }

        return stdout.trim().split(/\r?\n/);
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

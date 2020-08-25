import { util, RopmPackageJson } from '../util';
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

    private moduleManager = new ModuleManager();

    private get hostRootDir() {
        const packageJsonRootDir = this.hostPackageJson?.ropm?.rootDir;
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

    public async run(): Promise<void> {
        await this.loadHostPackageJson();
        await this.deleteAllRokuModulesFolders();
        await this.npmInstall();
        await this.processModules();
    }

    /**
     * Deletes every roku_modules folder found in the hostRootDir
     */
    private async deleteAllRokuModulesFolders() {
        const cleanCommand = new CleanCommand({
            cwd: this.cwd
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
            console.log('Creating package.json');
            //init package.json for the host
            await new InitCommand({ cwd: this.cwd, force: true }).run();
        }
        this.hostPackageJson = await util.getPackageJson(this.cwd);
    }

    private async npmInstall() {
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
        this.moduleManager.hostDependencies = await util.getModuleDependencies(hostModulePath);

        this.moduleManager.hostRootDir = this.hostRootDir;

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
    getProdDependencies() {
        try {
            const stdout = childProcess.execSync('npm ls --parseable --prod', {
                cwd: this.cwd
            }).toString();
            return stdout.trim().split(/\r?\n/);
        } catch (e) {
            throw new Error('Failed to compute prod dependencies: ' + e.message);
        }
    }
}

export interface InstallCommandArgs {
    /**
     * The current working directory for the command.
     */
    cwd?: string;
    /**
     * The list of packages that should be installed
     */
    packages: string[];
}

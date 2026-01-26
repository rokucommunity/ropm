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
            const npmLs = `npm ls --json --long --omit=dev --omit=optional --depth=Infinity`;
            this.logger.debug(`executing command: ${npmLs}`);

            stdout = childProcess.execSync(npmLs, {
                cwd: this.cwd,
                maxBuffer: 500 * 1024 * 1024 // 500MB buffer to handle large dependency trees (this is ridiculously large, but better than crashing...)
            }).toString();
        } catch (e: any) {
            stdout = (e as any).stdout.toString();

            // do not throw error, just log a warning
            // there are a lot of edge cases where npm ls errors don't pose any actual roadblock for ropm packages

            this.logger.warn([
                'Encountered an error while retrieving the prod dependencies from npm-ls. Attempting to proceed anyways. You can review the error below:\n',
                (e as any).message
            ].join('\n'));
        }

        const dependencyJson = JSON.parse(stdout);
        const thisPackage = this.findDependencyByName(dependencyJson, this.hostPackageJson?.name);
        const dependencies = this.flattenPackage(thisPackage).filter(x => !!x);
        return dependencies;
    }

    /**
     * Flatten dependencies from `npm ls --json --long` to match the parseable output
     * @param packageJson the result from `npm ls --json --long`
     * @returns list of dependency paths
     */
    private flattenPackage(packageJson: any): string[] {
        const dependencies: string[] = [];
        if (packageJson) {
            dependencies.push(packageJson.path);
            for (const dep of Object.values(packageJson.dependencies ?? {})) {
                dependencies.push(...this.flattenPackage(dep));
            }
        }
        return dependencies;
    }

    /**
     * Finds the current package in the dependency tree
     *
     * Important for workspace projects, where the root project
     * is included in the dependency tree and needs to be removed
     * @param packageJson root depenendency json
     * @param name cwd project name
     * @returns package entry in dependency json
     */
    private findDependencyByName(packageJson: any, name: string | undefined) {
        if (packageJson.name === name || !name) {
            return packageJson;
        }
        let foundPackage = Object.values(packageJson.dependencies ?? {}).find((d: any) => d.name === name);
        if (!foundPackage) {
            for (const key in (packageJson.dependencies ?? {})) {
                foundPackage = this.findDependencyByName(packageJson.dependencies[key], name);
                if (foundPackage) {
                    return foundPackage;
                }
            }
        }
        return foundPackage;
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

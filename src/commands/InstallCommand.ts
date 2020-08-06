import { util, RopmPackageJson } from '../util';
import * as path from 'path';
import * as childProcess from 'child_process';
import * as packlist from 'npm-packlist';
import * as rokuDeploy from 'roku-deploy';
import * as fsExtra from 'fs-extra';
import { InitCommand } from './InitCommand';
import { CleanCommand } from './CleanCommand';

export class InstallCommand {
    constructor(
        public args: InstallCommandArgs
    ) {

    }

    private hostPackageJson?: RopmPackageJson;

    private get hostRootDir() {
        let packageJsonRootDir = this.hostPackageJson?.ropm?.rootDir;
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

    /**
     * A list of globs that will always be ignored during copy from node_modules to roku_modules
     */
    static readonly fileIgnorePatterns = [
        '!**/package.json',
        '!./README',
        '!./CHANGES',
        '!./CHANGELOG',
        '!./HISTORY',
        '!./LICENSE',
        '!./LICENCE',
        '!./NOTICE',
        '!**/.git',
        '!**/.svn',
        '!**/.hg',
        '!**/.lock-wscript',
        '!**/.*.swp',
        '!**/.DS_Store',
        '!**/npm-debug.log',
        '!**/.npmrc',
        '!**/node_modules',
        '!**/config.gypi',
        '!**/*.orig',
        '!**/package-lock.json'
    ];

    public async run(): Promise<void> {
        await this.loadHostPackageJson();
        await this.deleteAllRokuModulesFolders();
        await this.npmInstall();
        await this.copyAllModulesToRokuModules();
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
    private async copyAllModulesToRokuModules() {
        let modulePaths = this.getProdDependencies();

        //remove the host module from the list (it should always be the first entry)
        modulePaths.splice(0, 1);

        //copy all of them at once, wait for them all to complete
        return Promise.all(
            modulePaths.map((modulePath) => this.copyModuleToRokuModules(modulePath))
        );
    }

    /**
     * Copy a specific module to roku_modules
     */
    private async copyModuleToRokuModules(modulePath: string) {
        const npmModuleName = util.getModuleName(modulePath) as string;

        //skip modules that we can't derive a name from
        if (!npmModuleName) {
            return;
        }

        //compute the ropm name for this module. This name has all invalid chars removed, and can be used as a brightscript variable/namespace
        const ropmModuleName = util.getRopmNameFromModuleName(npmModuleName);


        console.log(`Copying ${npmModuleName} as (${ropmModuleName})`);

        let modulePackageJson = await util.getPackageJson(modulePath);

        // every ropm module MUST have the `ropm` keyword. If not, then this is not a ropm module
        if (!modulePackageJson.keywords?.includes('ropm')) {
            return;
        }

        //use the rootDir from packageJson, or default to the current module path
        const moduleRootDir = modulePackageJson.ropm?.rootDir ? path.resolve(modulePath, modulePackageJson.ropm.rootDir) : modulePath;

        //use the npm-packlist project to get the list of all files for the entire package...use this as the whitelist
        let allFiles = await packlist({
            path: moduleRootDir
        });

        //standardize each path
        allFiles = allFiles.map((f) => rokuDeploy.util.standardizePath(f));

        //get the list of all file paths within the rootDir
        let rootDirFiles = await util.globAll([
            '**/*',
            ...InstallCommand.fileIgnorePatterns
        ], {
            cwd: moduleRootDir,
            dot: true,
            //skip matching folders (we'll handle file copying ourselves)
            nodir: true
        });

        //standardize each path
        rootDirFiles = rootDirFiles.map((f) => rokuDeploy.util.standardizePath(f));

        //only keep files that are both in the packlist AND the rootDir list
        const files = rootDirFiles.filter((rootDirFile) => {
            return allFiles.includes(
                rootDirFile
            );
        });

        //create a map of every source file and where it should be copied to
        const fileMappings = files.map(filePath => {
            const filePathParts = filePath.split(/\/|\\/);
            const topLevelDir = filePathParts.splice(0, 1)[0];
            let targetPath = path.join(this.hostRootDir, topLevelDir, 'roku_modules', ropmModuleName, ...filePathParts);
            return {
                src: path.resolve(moduleRootDir, filePath),
                dest: targetPath
            };
        });

        //copy the files for this module to their destinations in the host root dir
        await util.copyFiles(fileMappings);
    }

    /**
     * Get the list of prod dependencies from npm.
     * This is run sync because it should run as fast as possible
     * and won't be run in ~parallel.
     */
    getProdDependencies() {
        try {
            let stdout = childProcess.execSync('npm ls --parseable --prod', {
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

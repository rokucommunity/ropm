import * as childProcess from 'child_process';
import { util } from '../util';
import type { GetProductionDependenciesOptions, InitOptions, InstallOptions, PackageManager, PackageManagerName, UninstallOptions } from './types';

export class NpmPackageManager implements PackageManager {
    public readonly name: PackageManagerName = 'npm';

    /**
     * Spawn npm and return a promise that completes when it's finished.
     * Handles the file extension (`.cmd`) required on windows.
     * @param args - the list of args to pass to npm. Any undefined args will be removed from the list, so feel free to use ternary outside to simplify things
     */
    private spawn(args: Array<string | undefined>, options?: childProcess.SpawnOptions) {
        const filteredArgs = args.filter(arg => arg !== undefined) as string[];
        return util.spawnAsync(
            util.isWindowsPlatform() ? 'npm.cmd' : 'npm',
            filteredArgs,
            options
        );
    }

    public async init(options: InitOptions) {
        await this.spawn([
            'init',
            options.force ? '--force' : undefined
        ], {
            cwd: options.cwd,
            stdio: 'inherit'
        });
    }

    public async install(packages: string[], options: InstallOptions) {
        await this.spawn([
            'i',
            ...packages
        ], {
            cwd: options.cwd
        });
    }

    public async uninstall(packages: string[], options: UninstallOptions) {
        await this.spawn([
            'uninstall',
            ...packages
        ], {
            cwd: options.cwd
        });
    }

    /**
     * Get the list of prod dependencies from npm.
     * This is run sync because it should run as fast as possible
     * and won't be run in ~parallel.
     */
    public getProductionDependencies(options: GetProductionDependenciesOptions): string[] {
        let stdout: string;
        try {
            const npmLs = `npm ls --json --long --omit=dev --omit=optional --depth=Infinity`;
            options.logger.debug(`executing command: ${npmLs}`);

            stdout = childProcess.execSync(npmLs, {
                cwd: options.cwd,
                maxBuffer: 500 * 1024 * 1024 // 500MB buffer to handle large dependency trees (this is ridiculously large, but better than crashing...)
            }).toString();
        } catch (e: any) {
            stdout = (e as any).stdout.toString();

            // do not throw error, just log a warning
            // there are a lot of edge cases where npm ls errors don't pose any actual roadblock for ropm packages

            options.logger.warn([
                'Encountered an error while retrieving the prod dependencies from npm-ls. Attempting to proceed anyways. You can review the error below:\n',
                (e as any).message
            ].join('\n'));
        }

        const dependencyJson = JSON.parse(stdout);
        const thisPackage = this.findDependencyByName(dependencyJson, options.packageName);
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

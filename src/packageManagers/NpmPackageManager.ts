import * as childProcess from 'child_process';
import type { GetProductionDependenciesOptions, InitOptions, PackageManagerName } from './PackageManager';
import { BasePackageManager } from './PackageManager';

export class NpmPackageManager extends BasePackageManager {
    public readonly name: PackageManagerName = 'npm';

    protected readonly binaryName = 'npm';

    public async init(options: InitOptions) {
        await this.spawn([
            'init',
            options.force ? '--force' : undefined
        ], {
            cwd: options.cwd,
            stdio: 'inherit'
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
        const dependencies = this.flattenDependencyTree(thisPackage).filter(x => !!x);
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

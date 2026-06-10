import * as childProcess from 'child_process';
import { util } from '../util';
import type { GetProductionDependenciesOptions, InitOptions, InstallOptions, PackageManager, PackageManagerName, UninstallOptions } from './types';

export class PnpmPackageManager implements PackageManager {
    public readonly name: PackageManagerName = 'pnpm';

    /**
     * Spawn pnpm and return a promise that completes when it's finished.
     * Handles the file extension (`.cmd`) required on windows.
     * @param args - the list of args to pass to pnpm. Any undefined args will be removed from the list, so feel free to use ternary outside to simplify things
     */
    private spawn(args: Array<string | undefined>, options?: childProcess.SpawnOptions) {
        const filteredArgs = args.filter(arg => arg !== undefined) as string[];
        return util.spawnAsync(
            util.isWindowsPlatform() ? 'pnpm.cmd' : 'pnpm',
            filteredArgs,
            options
        );
    }

    public async init(options: InitOptions) {
        //`pnpm init` is non-interactive and does not support a `--force` flag, so we ignore `options.force`
        await this.spawn([
            'init'
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
     * Get the list of prod dependencies from pnpm.
     * This is run sync because it should run as fast as possible
     * and won't be run in ~parallel.
     */
    public getProductionDependencies(options: GetProductionDependenciesOptions): string[] {
        let stdout: string;
        try {
            //`--prod --no-optional` mirrors npm's `--omit=dev --omit=optional`. `--depth Infinity` walks the entire tree.
            const pnpmLs = `pnpm ls --json --prod --no-optional --depth Infinity`;
            options.logger.debug(`executing command: ${pnpmLs}`);

            stdout = childProcess.execSync(pnpmLs, {
                cwd: options.cwd,
                maxBuffer: 500 * 1024 * 1024 // 500MB buffer to handle large dependency trees (this is ridiculously large, but better than crashing...)
            }).toString();
        } catch (e: any) {
            stdout = (e as any).stdout?.toString() ?? '';

            // do not throw error, just log a warning
            // there are a lot of edge cases where pnpm ls errors don't pose any actual roadblock for ropm packages

            options.logger.warn([
                'Encountered an error while retrieving the prod dependencies from pnpm-ls. Attempting to proceed anyways. You can review the error below:\n',
                (e as any).message
            ].join('\n'));
        }

        //pnpm outputs an array of projects (to support workspaces). Find the host project, falling back to the first entry.
        const projects = JSON.parse(stdout) as any[];
        const thisProject = (options.packageName ? projects.find(project => project.name === options.packageName) : undefined) ?? projects[0];
        const dependencies = this.flattenDependencyTree(thisProject).filter(x => !!x);
        return dependencies;
    }

    /**
     * Flatten dependencies from `pnpm ls --json` into a list of dependency paths. The host
     * package is included as the first entry.
     * @param node a project/dependency node from `pnpm ls --json` (has `path` + nested `dependencies`)
     * @returns list of dependency paths
     */
    private flattenDependencyTree(node: any): string[] {
        const dependencies: string[] = [];
        if (node) {
            dependencies.push(node.path);
            for (const dep of Object.values(node.dependencies ?? {})) {
                dependencies.push(...this.flattenDependencyTree(dep));
            }
        }
        return dependencies;
    }
}

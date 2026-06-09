import * as childProcess from 'child_process';
import type { GetProductionDependenciesOptions, InitOptions, PackageManagerName } from './PackageManager';
import { BasePackageManager } from './PackageManager';

export class PnpmPackageManager extends BasePackageManager {
    public readonly name: PackageManagerName = 'pnpm';

    protected readonly binaryName = 'pnpm';

    public async init(options: InitOptions) {
        //`pnpm init` is non-interactive and does not support a `--force` flag, so we ignore `options.force`
        await this.spawn([
            'init'
        ], {
            cwd: options.cwd,
            stdio: 'inherit'
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
}

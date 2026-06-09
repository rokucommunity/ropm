import type * as childProcess from 'child_process';
import type { Logger } from '@rokucommunity/logger';
import { util } from '../util';

/**
 * The set of package managers that ropm knows how to drive.
 */
export type PackageManagerName = 'npm' | 'pnpm';

export interface InitOptions {
    /**
     * The directory in which to run the command
     */
    cwd: string;
    /**
     * Skip all questions (where supported by the underlying package manager)
     */
    force?: boolean;
}

export interface InstallOptions {
    /**
     * The directory in which to run the command
     */
    cwd: string;
}

export interface UninstallOptions {
    /**
     * The directory in which to run the command
     */
    cwd: string;
}

export interface GetProductionDependenciesOptions {
    /**
     * The directory in which to run the command
     */
    cwd: string;
    /**
     * The name of the host package. Used to locate the host within the dependency
     * tree (important for workspace projects where the root may appear in the tree).
     */
    packageName?: string;
    /**
     * Logger used to surface warnings/debug info while resolving dependencies
     */
    logger: Logger;
}

/**
 * A consistent interface for talking to a node package manager (npm, pnpm, ...).
 * Implementations isolate all of the manager-specific binary names, command flags,
 * and `ls` output shapes so the rest of ropm can stay manager-agnostic.
 */
export interface PackageManager {
    /**
     * The name of this package manager
     */
    readonly name: PackageManagerName;
    /**
     * Initialize a new package.json file
     */
    init(options: InitOptions): Promise<void>;
    /**
     * Install the given packages (or all dependencies when no packages are given)
     */
    install(packages: string[], options: InstallOptions): Promise<void>;
    /**
     * Uninstall the given packages
     */
    uninstall(packages: string[], options: UninstallOptions): Promise<void>;
    /**
     * Get the flattened list of production dependency directories.
     * The host package is always the first entry in the list.
     */
    getProductionDependencies(options: GetProductionDependenciesOptions): string[];
}

/**
 * Shared functionality for package manager implementations. Owns the cross-platform
 * binary spawning (the windows `.cmd` quirk) and the dependency-tree flattening that
 * npm and pnpm have in common (both expose `path` + a nested `dependencies` map).
 */
export abstract class BasePackageManager implements PackageManager {
    public abstract readonly name: PackageManagerName;

    /**
     * The base CLI binary name (e.g. `npm`, `pnpm`). On windows, `.cmd` is appended.
     */
    protected abstract readonly binaryName: string;

    /**
     * Spawn the package manager binary and return a promise that completes when it's finished.
     * This handles the file extension (`.cmd`) required on windows.
     * @param args - the list of args to pass to the binary. Any undefined args will be removed from the list, so feel free to use ternary outside to simplify things
     */
    protected spawn(args: Array<string | undefined>, options?: childProcess.SpawnOptions) {
        //filter out undefined args
        const filteredArgs = args.filter(arg => arg !== undefined) as string[];
        return util.spawnAsync(
            util.isWindowsPlatform() ? `${this.binaryName}.cmd` : this.binaryName,
            filteredArgs,
            options
        );
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

    public abstract init(options: InitOptions): Promise<void>;

    public abstract getProductionDependencies(options: GetProductionDependenciesOptions): string[];

    /**
     * Flatten a dependency-tree node into a list of dependency paths. The node is expected
     * to have a `path` and an optional `dependencies` map (`{ [name]: node }`), which is the
     * shape produced by both `npm ls --json` and `pnpm ls --json`. The host node is included
     * as the first entry.
     */
    protected flattenDependencyTree(node: any): string[] {
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

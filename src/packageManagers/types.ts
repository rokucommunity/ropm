import type { Logger } from '@rokucommunity/logger';

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

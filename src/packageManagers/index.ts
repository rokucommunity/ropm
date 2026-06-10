import type { PackageManager, PackageManagerName } from './types';
import { NpmPackageManager } from './NpmPackageManager';
import { PnpmPackageManager } from './PnpmPackageManager';

/**
 * Get the package manager implementation for the given name.
 * Defaults to npm when no name is provided.
 * @param name the name of the package manager (from `ropm.packageManager` or the `--package-manager` flag)
 */
export function getPackageManager(name?: PackageManagerName): PackageManager {
    switch (name ?? 'npm') {
        case 'npm':
            return new NpmPackageManager();
        case 'pnpm':
            return new PnpmPackageManager();
        default:
            throw new Error(`Unsupported package manager "${name as string}". Supported values are: "npm", "pnpm"`);
    }
}

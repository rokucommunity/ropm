/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { RopmModule } from './RopmModule';
import * as semver from 'semver';
import type { ModuleDependency } from '../util';
import { util } from '../util';

export class ModuleManager {
    public modules = [] as RopmModule[];

    /**
     * A list of all direct dependencies of the host application.
     * This is used to pick which version prettier prefixes whenever there's multiple versions required
     */
    public hostDependencies = [] as ModuleDependency[];

    /**
     * The absolute path to the rootDir of the host application
     */
    public hostRootDir!: string;

    /**
     * A list of npm aliases of modules that should not have their source code prefixed during ropm install.
     * This is the npm alias name.
     */
    public noprefixNpmAliases = [] as string[];

    /**
     * A list of ropm aliases of modules that should not have their source code prefixed during ropm install.
     * This is the ropm alias name, and is only resolved later in the process so don't use this unless you know for sure it is populated
     */
    private noprefixRopmAliases = [] as string[];

    /**
     * Add a new project to the prefixer
     * @param modulePath the path to the module
     */
    public addModule(modulePath: string) {
        this.modules.push(
            new RopmModule(this.hostRootDir, modulePath)
        );
    }

    /**
     * Initialize all modules
     */
    public async process() {
        //init all modules
        await Promise.all(
            this.modules.map(x => x.init())
        );

        //remove duplicate/unnecessary modules
        await this.reduceModulesAndCreatePrefixMaps();

        //copy every file from every module to its target location
        await Promise.all(
            this.modules.map(x => x.copyFiles())
        );

        //have each module apply transforms (rename functions, components, file paths, etc...)
        await Promise.all(
            this.modules.map(x => x.transform(this.noprefixRopmAliases))
        );
    }

    /**
     * Reduce the number of dependencies to only one version for each major.
     * Then, remove unnecessary dependencies
     */
    public async reduceModulesAndCreatePrefixMaps() {
        //remove non-valid dependencies
        this.modules = this.modules.filter(x => x.isValid);

        const reducedDependencies = this.getReducedDependencies();

        //discard any modules that are not in the list
        for (let i = this.modules.length - 1; i >= 0; i--) {
            const module = this.modules[i];

            const dep = reducedDependencies.find((dep) => {
                return dep.version === module.version && dep.npmModuleName === module.npmModuleName;
            });

            //remove if not an approved module
            if (!dep) {
                this.modules.splice(i, 1);
            }
        }

        this.noprefixRopmAliases = this.modules.filter(x => this.noprefixNpmAliases.includes(x.npmAliasName)).map(x => x.ropmModuleName);

        //give each module the approved list of dependencies
        await Promise.all(
            this.modules.map(x => x.createPrefixMap(reducedDependencies))
        );
    }

    /**
     * Gather the entire list of dependencies, and then reduce them all to the highest minor/patch version within each major.
     * Also derive the optimal ropm alias for each dependency based on the host app aliases and the aliases from all dependencies
     */
    public getReducedDependencies() {
        //versions[moduleName][dominantVersion] = highestVersionNumber
        const moduleVersions = {} as {
            [moduleName: string]: {
                //the dominantVersion is a single int, or the full version number for pre-release versions
                [dominantVersion: string]: {
                    highestVersion: string;
                    aliases: string[];
                };
            };
        };

        //for each package of the same name, compute the highest version within each major version range
        for (const module of this.modules) {
            const npmModuleNameLower = module.npmModuleName.toLowerCase();
            //make the bucket if not exist
            if (!moduleVersions[npmModuleNameLower]) {
                moduleVersions[npmModuleNameLower] = {};
            }
            const dominantVersion = util.getDominantVersion(module.version);

            if (!moduleVersions[npmModuleNameLower][dominantVersion]) {
                moduleVersions[npmModuleNameLower][dominantVersion] = {
                    highestVersion: module.version,
                    aliases: []
                };
            }
            const previousVersion = moduleVersions[npmModuleNameLower][dominantVersion].highestVersion ?? module.version;
            //if this new version is higher, keep it
            if (semver.compare(module.version, previousVersion) > 0) {
                moduleVersions[npmModuleNameLower][dominantVersion].highestVersion = module.version;
            }
            moduleVersions[npmModuleNameLower][dominantVersion].aliases.push(module.ropmModuleName);
        }

        const result = [] as Dependency[];

        //compute the list of unique aliases
        for (const moduleName in moduleVersions) {
            const dominantVersions = Object.keys(moduleVersions[moduleName]).sort();
            for (const dominantVersion of dominantVersions) {

                const hostDependency = this.hostDependencies.find(
                    dep => dep.npmModuleName === moduleName && util.getDominantVersion(dep.version) === dominantVersion
                );

                const obj = moduleVersions[moduleName][dominantVersion];
                //convert the version number into a valid roku identifier
                const dominantVersionIdentifier = util.prereleaseToRokuIdentifier(dominantVersion);

                let version: string;
                if (semver.prerelease(dominantVersion)) {
                    //use exactly this prerelease version
                    version = dominantVersion;
                } else {
                    //use the highest version within this major range
                    version = semver.maxSatisfying([obj.highestVersion, hostDependency?.version ?? '0.0.0'], '*')! as string;
                }

                result.push({
                    dominantVersion: dominantVersion.toString(),
                    npmModuleName: moduleName,
                    //use the hosts's alias, or default to the module name
                    ropmModuleName: hostDependency?.npmAlias
                        ? util.getRopmNameFromModuleName(hostDependency.npmAlias)
                        : `${util.getRopmNameFromModuleName(moduleName)}_v${dominantVersionIdentifier}`,
                    version: version
                });
            }
        }

        return result;
    }
}

export interface Dependency {
    npmModuleName: string;
    /**
     * The dominant version of the dependency. This will be the major version in most cases, will be the full version string for pre-release versions
     */
    dominantVersion: string;
    version: string;
    ropmModuleName: string;
}

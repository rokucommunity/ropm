import { RopmModule } from './RopmModule';
import * as semver from 'semver';
import { util } from '../util';

export class ModuleManager {
    public modules = [] as RopmModule[];

    /**
     * A list of all direct dependencies of the host application.
     * This is used to pick which version prettier prefixes whenever there's multiple versions required
     */
    public hostDependencies = [] as Array<{
        alias: string;
        npmModuleName: string;
        version: string;
    }>;

    /**
     * The absolute path to the rootDir of the host application
     */
    public hostRootDir!: string;

    /**
     * Add a new project to the prefixer
     * @param filePaths the list of absolute file paths for this project
     * @param prefix the prefix to give all of this module's own functions and components (and their internal usage)
     * @param prefixMap if this module has its own dependencies, then this prefix map allows us to rename those prefixes
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
        await this.reduceModules();

        //copy every file from every module to its target location
        await Promise.all(
            this.modules.map(x => x.copyFiles())
        );

        //have each module apply transforms (rename functions, components, file paths, etc...)
        await Promise.all(
            this.modules.map(x => x.transform())
        )
    }

    /**
     * Reduce the number of dependencies to only one version for each major.
     * Then, remove unnecessary dependencies
     */
    public async reduceModules() {
        const reducedDependencies = this.getReducedDependencies();

        //discard any modules that are not in the list
        for (var i = this.modules.length - 1; i >= 0; i--) {
            const module = this.modules[i];
            const dep = reducedDependencies.find((dep) => {
                return dep.version === module.version && dep.npmModuleName === module.npmModuleName
            })
            //if this is not an approved module, or the module is invalid, then remove it
            if (!dep) {
                this.modules.splice(i, 1);
            }
        }

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
        //versions[moduleName][majorVersionNumber] = highestVersionNumber
        const moduleVersions = {} as {
            [moduleName: string]: {
                [majorVersioNNumber: string]: {
                    highestVersion: string;
                    aliases: string[];
                }
            }
        };

        //for each package of the same name, compute the highest version within each major version range
        for (let module of this.modules) {
            const npmModuleNameLower = module.npmModuleName.toLowerCase();
            //make the bucket if not exist
            if (!moduleVersions[npmModuleNameLower]) {
                moduleVersions[npmModuleNameLower] = {};
            }
            let majorVersion = semver.major(module.version);
            if (!moduleVersions[npmModuleNameLower][majorVersion]) {
                moduleVersions[npmModuleNameLower][majorVersion] = {
                    highestVersion: module.version,
                    aliases: []
                };
            }
            let previousVersion = moduleVersions[npmModuleNameLower][majorVersion].highestVersion ?? module.version;
            //if this new version is higher, keep it
            if (semver.compare(module.version, previousVersion) > 0) {
                moduleVersions[npmModuleNameLower][majorVersion].highestVersion = module.version;
            }
            moduleVersions[npmModuleNameLower][majorVersion].aliases.push(module.ropmModuleName);
        }

        const result = [] as Dependency[];

        //compute the list of unique aliases
        for (let moduleName in moduleVersions) {
            const majorVersions = Object.keys(moduleVersions[moduleName]).sort();
            for (let i = 0; i < majorVersions.length; i++) {
                const majorVersion = parseInt(majorVersions[i]);

                const hostDependency = this.hostDependencies.find((dep) => {
                    return dep.npmModuleName === moduleName && semver.major(dep.version) === majorVersion
                });

                const obj = moduleVersions[moduleName][majorVersion];

                result.push({
                    majorVersion: majorVersion,
                    npmModuleName: moduleName,
                    //use the hosts's alias, or default to the module name 
                    ropmModuleName: hostDependency?.alias ?? `${util.getRopmNameFromModuleName(moduleName)}_v${majorVersion}`,
                    //use the highest version within this major range
                    version: semver.maxSatisfying([obj.highestVersion, hostDependency?.version ?? '0.0.0'], '*')!
                });
            }
        }

        return result;
    }
}

export interface Dependency {
    npmModuleName: string;
    majorVersion: number;
    version: string;
    ropmModuleName: string;
};

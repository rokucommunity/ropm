import { File } from "./File";
import { util } from "../util";
import * as path from 'path';
import * as packlist from 'npm-packlist';
import * as rokuDeploy from 'roku-deploy';
import { Dependency } from "./ModuleManager";
import * as semver from 'semver';

export class RopmModule {
    constructor(
        public readonly hostRootDir: string,
        public readonly moduleDir: string
    ) {
        this.npmAliasName = util.getModuleName(this.moduleDir) as string;

        //compute the ropm name for this alias. This name has all invalid chars removed, and can be used as a brightscript variable/namespace
        this.ropmModuleName = util.getRopmNameFromModuleName(this.npmAliasName);
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

    /**
     * The name of this module. Users can rename modules on install-time, so this is the folder we must use
     */
    public npmAliasName: string;

    /**
     * The name of the module directly from the module's package.json. This is used to help resolve dependencies between packages
     * even if an alias is used
     */
    public npmModuleName!: string;

    /**
     * The version of this current module
     */
    public version!: string;

    /**
     * The ropm name of this module. ROPM module names are sanitized npm names.
     */
    public ropmModuleName: string;

    /**
     * The path to the rootDir of this module
     */
    public rootDir!: string;

    /**
     * A map from the original file location to its new destination.
     * This is set during the copy process.
     */
    public fileMaps!: Array<{ src: string; dest: string }>;

    /**
     * A map from the prefixes used when this module was published, to the prefix that should be used
     * when this module is installed in the overall project.
     * This depends on the module properly referencing every dependency.
     */
    public prefixMap = {} as { [oldPrefix: string]: string };

    /**
     * The major version of this module
     */
    public majorVersion!: number;

    public isValid = true;

    public async init() {
        //skip modules we can't derive a name from
        if (!this.npmAliasName) {
            console.error(`ropm: cannot compute npm package name for "${this.moduleDir}"`);
            return this.isValid = false;
        }

        let modulePackageJson = await util.getPackageJson(this.moduleDir);
        this.version = modulePackageJson.version;
        this.majorVersion = semver.major(modulePackageJson.version);

        if (!modulePackageJson.name) {
            console.error(`ropm: missing "name" property from "${path.join(this.moduleDir, 'package.json')}"`);
            return this.isValid = false;
        }

        this.npmModuleName = modulePackageJson.name;

        // every ropm module MUST have the `ropm` keyword. If not, then this is not a ropm module
        if ((modulePackageJson.keywords ?? []).includes('ropm') === false) {
            console.error(`ropm: skipping prod dependency "${this.moduleDir}" because it does not have the "ropm" keyword`);
            return this.isValid = false;
        }

        //use the rootDir from packageJson, or default to the current module path
        this.rootDir = modulePackageJson.ropm?.rootDir ? path.resolve(this.moduleDir, modulePackageJson.ropm.rootDir) : this.moduleDir;
    }

    public async copyFiles() {
        const packageLogText = `'${this.npmAliasName}'${this.npmAliasName !== this.npmModuleName ? `('${this.npmModuleName}')` : ''}`;

        console.log(`ropm: copying ${packageLogText}@${this.version} as '${this.ropmModuleName}'`);
        //use the npm-packlist project to get the list of all files for the entire package...use this as the whitelist
        let allFiles = await packlist({
            path: this.rootDir
        });

        //standardize each path
        allFiles = allFiles.map((f) => rokuDeploy.util.standardizePath(f));

        //get the list of all file paths within the rootDir
        let rootDirFiles = await util.globAll([
            '**/*',
            ...RopmModule.fileIgnorePatterns
        ], {
            cwd: this.rootDir,
            //follow symlinks
            follow: true,
            dot: true,
            //skip matching folders (we'll handle file copying ourselves)
            nodir: true
        });

        //standardize each path
        rootDirFiles = rootDirFiles.map((f) => rokuDeploy.util.standardizePath(f));

        const files = rootDirFiles

            //only keep files that are both in the packlist AND the rootDir list
            .filter((rootDirFile) => {
                return allFiles.includes(
                    rootDirFile
                );
            })

            .filter((rootDirFile) => {
                //filter top-level files (all files should be contained within a subfolder)
                const fileIsLocatedInAFolder = !!/\\|\//.exec(rootDirFile);
                return fileIsLocatedInAFolder;
            });

        //create a map of every source file and where it should be copied to
        this.fileMaps = files.map(filePath => {
            const filePathParts = filePath.split(/\/|\\/);
            const topLevelDir = filePathParts.splice(0, 1)[0];
            let targetPath = path.join(this.hostRootDir, topLevelDir, 'roku_modules', this.ropmModuleName, ...filePathParts);
            return {
                src: path.resolve(this.rootDir, filePath),
                dest: targetPath
            };
        });

        //copy the files for this module to their destinations in the host root dir
        await util.copyFiles(this.fileMaps);
    }

    public async transform() {
        //load all files
        for (let obj of this.fileMaps) {
            this.files.push(
                new File(obj.src, obj.dest)
            );

        }
        //let all files discover all functions/components
        await Promise.all(
            this.files.map((file) => file.discover())
        );

        //create the edits for every file
        this.createEdits();

        //apply all of the edits
        for (let file of this.files) {
            file.applyEdits();
        }

        //write the files back to disk with their changes applied
        await Promise.all(
            this.files.map((file) => file.write())
        );
    }

    private readonly nonPrefixedFunctions = [
        'runuserinterface',
        'main',
        'runscreensaver',
        'init'
    ];

    /**
     * Create the prefix map for this module
     * @param programDependencies - the full list of resolved dependencies from the program. This is created by ModuleManager based on all modules in the program.
     */
    public async createPrefixMap(programDependencies: Dependency[]) {
        //reassign own module name based on program dependencies
        const ownDependency = programDependencies.find(
            x => x.npmModuleName === this.npmModuleName && x.majorVersion === this.majorVersion
        );
        if (!ownDependency) {
            throw new Error(`Cannot find ${this.npmModuleName}@${this.majorVersion} in programDependencies`)
        }
        this.ropmModuleName = ownDependency.ropmModuleName;

        //compute all of the names of the dependencies within this module, and what prefixes we currently used for them.
        const deps = await util.getModuleDependencies(this.moduleDir);
        this.prefixMap = {};
        for (const dep of deps) {
            const depMajorVersion = semver.major(dep.version);
            const programDependency = programDependencies.find(x => x.npmModuleName === dep.npmModuleName && x.majorVersion === depMajorVersion);
            if (programDependency) {
                this.prefixMap[dep.alias] = programDependency.ropmModuleName;
            } else {
                if (this.prefixMap[dep.alias]) {
                    throw new Error(`Alias "${dep.alias}" already exists for ${this.moduleDir}`);
                } else {
                    this.prefixMap[dep.alias] = dep.alias;
                }
            }
        }
    }

    private createEdits() {
        const prefix = this.ropmModuleName + '_';
        const ownFunctionNames = this.getDistinctFunctionDeclarationNames();
        const ownComponentNames = this.getDistinctComponentDeclarationNames();
        const prefixMapKeys = Object.keys(this.prefixMap);
        const prefixMapKeysLower = prefixMapKeys.map(x => x.toLowerCase());

        for (let file of this.files) {
            //create an edit for each function definition
            for (let func of file.functionDefinitions) {
                //skip edits for special functions
                if (this.nonPrefixedFunctions.includes(func.name.toLowerCase())) {
                    continue;
                }
                file.addEdit(func.offset, func.offset, prefix);
            }

            //prefix all function calls to our own function names
            for (let call of file.functionCalls) {
                const lowerName = call.name.toLowerCase();
                //if this function is owned by our project, rename it
                if (ownFunctionNames.includes(lowerName)) {
                    file.addEdit(call.offset, call.offset, prefix);
                    continue;
                }

                //rename all function calls for dependencies
                const possiblePrefix = lowerName.split('_')[0];
                const idx = prefixMapKeysLower.indexOf(possiblePrefix);
                //if we have a prefix match, then convert the old previx to the new prefix
                if (idx > -1) {
                    const newPrefix = this.prefixMap[prefixMapKeys[idx]];
                    //begin position + the length of the original prefix + 1 for the underscore
                    const offsetEnd = call.offset + possiblePrefix.length + 1
                    file.addEdit(call.offset, offsetEnd, newPrefix + '_');
                }
            }

            //rename all component definitions
            for (let comp of file.componentDeclarations) {
                file.addEdit(comp.offset, comp.offset, prefix);
            }

            //rename all component usage
            for (let comp of file.componentReferences) {
                //if this component is owned by our module, rename it
                if (ownComponentNames.includes(comp.name.toLowerCase())) {
                    file.addEdit(comp.offset, comp.offset, prefix);
                }
            }

            //rewrite file references
            for (let fileReference of file.fileReferences) {

            }
        }
    }

    /**
     * Scan every file and compute the list of function declaration names.
     */
    public getDistinctFunctionDeclarationNames() {
        const result = {};
        for (let file of this.files) {
            for (let func of file.functionDefinitions) {
                //skip the special function names
                if (this.nonPrefixedFunctions.includes(func.name.toLowerCase())) {
                    continue;
                }
                result[func.name.toLowerCase()] = true;
            }
        }
        return Object.keys(result);
    }

    /**
     * Get the distinct names of function calls
     */
    public getDistinctFunctionCallNames() {
        const result = {};
        for (let file of this.files) {
            for (let call of file.functionCalls) {
                result[call.name.toLowerCase()] = true;
            }
        }
        return Object.keys(result);
    }

    /**
     * Get the distinct names of component declarations
     */
    public getDistinctComponentDeclarationNames() {
        const result = {};
        for (let file of this.files) {
            for (let comp of file.componentDeclarations) {
                result[comp.name.toLowerCase()] = true;
            }
        }
        return Object.keys(result);
    }

    /**
     * Get the distinct names of components used
     */
    public getDistinctComponentReferenceNames() {
        const result = {};
        for (let file of this.files) {
            for (let comp of file.componentReferences) {
                result[comp.name.toLowerCase()] = true;
            }
        }
        return Object.keys(result);
    }


    public files = [] as File[];
}

import { File } from './File';
import { RopmPackageJson, util } from '../util';
import * as path from 'path';
import * as packlist from 'npm-packlist';
import * as rokuDeploy from 'roku-deploy';
import { Dependency } from './ModuleManager';
import { Program, ProgramBuilder } from 'brighterscript';

export class RopmModule {
    constructor(
        public readonly hostRootDir: string,
        /**
         * The directory at the root of the module. This is the folder where the package.json resides
         */
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
        '!**/package-lock.json',
        //package authors should exclude `roku_modules` during publishing, but things might slip through the cracks, so exclude those during ropm install
        '!**/roku_modules/**/*'
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
     * The path where this module's package code resides.
     */
    public packageRootDir!: string;

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
     * The contents of the package.json
     */
    public packageJson!: RopmPackageJson;

    /**
     * The dominant version of the dependency. This will be the major version in most cases, will be the full version string for pre-release versions
     */
    public dominantVersion!: string;

    public isValid = true;

    public async init() {
        //skip modules we can't derive a name from
        if (!this.npmAliasName) {
            console.error(`ropm: cannot compute npm package name for "${this.moduleDir}"`);
            this.isValid = false;
            return;
        }

        this.packageJson = await util.getPackageJson(this.moduleDir);
        this.version = this.packageJson.version;
        this.dominantVersion = util.getDominantVersion(this.packageJson.version);

        if (!this.packageJson.name) {
            console.error(`ropm: missing "name" property from "${path.join(this.moduleDir, 'package.json')}"`);
            this.isValid = false;
            return;
        }

        this.npmModuleName = this.packageJson.name;

        // every ropm module MUST have the `ropm` keyword. If not, then this is not a ropm module
        if ((this.packageJson.keywords ?? []).includes('ropm') === false) {
            console.error(`ropm: skipping prod dependency "${this.moduleDir}" because it does not have the "ropm" keyword`);
            this.isValid = false;
            return;
        }

        //disallow using `noprefix` within dependencies
        if (this.packageJson.ropm?.noprefix) {
            console.error(`ropm: using "ropm.noprefix" in a ropm module is forbidden: "${path.join(this.moduleDir, 'package.json')}`);
            this.isValid = false;
            return;
        }

        //use the rootDir from packageJson, or default to the current module path
        this.packageRootDir = this.packageJson.ropm?.packageRootDir ? path.resolve(this.moduleDir, this.packageJson.ropm.packageRootDir) : this.moduleDir;
    }

    public async copyFiles() {
        const packageLogText = `${this.npmAliasName}${this.npmAliasName !== this.npmModuleName ? `(${this.npmModuleName})` : ''}`;

        console.log(`ropm: copying ${packageLogText}@${this.version} as ${this.ropmModuleName}`);
        //use the npm-packlist project to get the list of all files for the entire package...use this as the whitelist
        let allFiles = await packlist({
            path: this.packageRootDir
        });

        //standardize each path
        allFiles = allFiles.map((f) => rokuDeploy.util.standardizePath(f));

        //get the list of all file paths within the rootDir
        let rootDirFiles = await util.globAll([
            '**/*',
            ...RopmModule.fileIgnorePatterns
        ], {
            cwd: this.packageRootDir,
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
            const targetPath = path.join(this.hostRootDir, topLevelDir, 'roku_modules', this.ropmModuleName, ...filePathParts);
            return {
                src: path.resolve(this.packageRootDir, filePath),
                dest: targetPath
            };
        });

        //copy the files for this module to their destinations in the host root dir
        await util.copyFiles(this.fileMaps);
    }

    private program!: Program;

    /**
     * @param noprefix a list of npm aliases of modules that should NOT be prefixed
     */
    public async transform(noprefixRopmAliases: string[]) {
        const builder = new ProgramBuilder();

        //disable the Program.validate function to improve performance (we don't care about the validity of the code...that should be handled by the package publisher)
        util.mockProgramValidate();

        await builder.run({
            copyToStaging: false,
            createPackage: false,
            rootDir: this.packageRootDir,
            //hide all diagnostics, the package author should be responsible for ensuring their package is valid
            diagnosticFilters: ['**/*']
        });
        this.program = builder.program;

        //load all files
        for (const obj of this.fileMaps) {
            //only load source code files
            if (['.xml', '.brs', '.bs'].includes(path.extname(obj.dest).toLowerCase())) {
                this.files.push(
                    new File(obj.src, obj.dest, this.packageRootDir, this.packageJson.ropm)
                );
            }
        }

        //let all files discover all functions/components
        for (const file of this.files) {
            file.discover(this.program);
        }

        //create the edits for every file
        this.createEdits(noprefixRopmAliases);

        //apply all of the edits
        for (const file of this.files) {
            file.applyEdits();
        }

        //write the files back to disk with their changes applied
        await Promise.all(
            this.files.map((file) => file.write())
        );
    }

    private readonly nonPrefixedFunctionMap = {
        'runuserinterface': true,
        'main': true,
        'runscreensaver': true,
        'init': true,
        'onkeyevent': true
    };

    /**
     * Create the prefix map for this module
     * @param programDependencies - the full list of resolved dependencies from the program. This is created by ModuleManager based on all modules in the program.
     */
    public async createPrefixMap(programDependencies: Dependency[]) {
        //reassign own module name based on program dependencies
        const ownDependency = programDependencies.find(
            x => x.npmModuleName === this.npmModuleName && x.dominantVersion === this.dominantVersion
        );
        if (!ownDependency) {
            throw new Error(`Cannot find ${this.npmModuleName}@${this.dominantVersion} in programDependencies`);
        }
        //rename the ropm module name based on the program dependency. (this could be postfixed with a _v1, _v2, etc. if there is dependency resolution in play)
        this.ropmModuleName = ownDependency.ropmModuleName;

        //compute all of the names of the dependencies within this module, and what prefixes we currently used for them.
        const deps = await util.getModuleDependencies(this.moduleDir);
        this.prefixMap = {};
        for (const dep of deps) {
            const depDominantVersion = util.getDominantVersion(dep.version);
            const programDependency = programDependencies.find(
                (x) => x.npmModuleName === dep.npmModuleName && x.dominantVersion === depDominantVersion
            );

            if (programDependency) {
                this.prefixMap[dep.ropmModuleName] = programDependency.ropmModuleName;
            } else {
                const dependencyText = dep.npmAlias === dep.npmModuleName ? dep.npmAlias : `${dep.npmAlias}(${dep.npmModuleName})`;
                throw new Error(`Cannot find suitable program dependency for ${dependencyText}@${dep.version}`);
            }
        }
    }

    private getInterfaceFunctions() {
        const names = {} as { [name: string]: boolean };
        for (const file of this.files) {
            for (const func of file.componentInterfaceFunctions) {
                names[func.name.toLowerCase()] = true;
            }
        }
        return names;
    }

    private createEdits(noprefixRopmAliases: string[]) {
        const prefix = this.ropmModuleName + '_';
        const applyOwnPrefix = !noprefixRopmAliases.includes(this.ropmModuleName);
        const ownFunctionMap = this.getDistinctFunctionDeclarationMap();
        const ownComponentNames = this.getDistinctComponentDeclarationNames();
        const prefixMapKeys = Object.keys(this.prefixMap);
        const prefixMapKeysLower = prefixMapKeys.map(x => x.toLowerCase());
        const nonPrefixedFunctionMap = {
            ...this.nonPrefixedFunctionMap,
            ...this.getInterfaceFunctions()
        };

        for (const file of this.files) {
            //only apply prefixes if configured to do so
            if (applyOwnPrefix) {
                //create an edit for each this-module-owned function
                for (const func of file.functionDefinitions) {
                    //skip edits for special functions
                    if (nonPrefixedFunctionMap[func.name.toLowerCase()]) {
                        continue;
                    }
                    file.addEdit(func.offset, func.offset, prefix);
                }
            }

            //prefix all function calls to our own function names
            for (const call of file.functionReferences) {
                const lowerName = call.name.toLowerCase();
                //only apply prefixes if configured to do so
                if (applyOwnPrefix) {
                    //skip edits for special functions
                    if (nonPrefixedFunctionMap[lowerName]) {
                        continue;
                    }
                    //if this function is owned by our project, rename it
                    if (ownFunctionMap[lowerName]) {
                        file.addEdit(call.offset, call.offset, prefix);
                        continue;
                    }
                }

                //rename dependency function calls
                const possiblePrefix = lowerName.split('_')[0];
                const idx = prefixMapKeysLower.indexOf(possiblePrefix);
                //if we have a prefix match, then convert the old prefix to the new prefix
                if (idx > -1) {
                    const newPrefix = this.prefixMap[prefixMapKeys[idx]];
                    //begin position + the length of the original prefix + 1 for the underscore
                    const offsetEnd = call.offset + possiblePrefix.length + 1;
                    file.addEdit(call.offset, offsetEnd, newPrefix + '_');
                }
            }

            //prefix all identifiers that have the same name as a function
            for (const identifier of file.identifiers) {
                const lowerName = identifier.name.toLowerCase();
                //skip edits for special functions
                if (nonPrefixedFunctionMap[lowerName]) {
                    continue;
                }
                //if this identifier has the same name as a function, then prefix the identifier
                if (ownFunctionMap[lowerName]) {
                    file.addEdit(identifier.offset, identifier.offset, prefix);
                }
            }

            //only apply prefixes if configured to do so
            if (applyOwnPrefix) {
                //rename all this-file-defined component definitions
                for (const comp of file.componentDeclarations) {
                    file.addEdit(comp.offset, comp.offset, prefix);
                }
            }

            //rename all component usage
            for (const comp of file.componentReferences) {
                //if this component is owned by our module, rename it
                if (ownComponentNames.includes(comp.name.toLowerCase())) {
                    //only apply the prefix if configured to do so
                    if (applyOwnPrefix) {
                        file.addEdit(comp.offset, comp.offset, prefix);
                    }

                    //rename dependency component usage
                } else {
                    const possiblePrefix = comp.name.toLowerCase().split('_')[0];
                    const idx = prefixMapKeysLower.indexOf(possiblePrefix);
                    //if we have a prefix match, then convert the old prefix to the new prefix
                    if (idx > -1) {
                        const newPrefix = this.prefixMap[prefixMapKeys[idx]];
                        //begin position + the length of the original prefix + 1 for the underscore
                        const offsetEnd = comp.offset + possiblePrefix.length + 1;
                        file.addEdit(comp.offset, offsetEnd, newPrefix + '_');
                    }
                }
            }

            //rewrite file references
            for (const fileReference of file.fileReferences) {
                this.createFileReferenceEdit(file, fileReference);
            }
        }
    }

    private createFileReferenceEdit(file: File, fileReference: { path: string; offset: number }) {
        let pkgPathAbsolute: string;
        if (fileReference.path.startsWith('pkg:')) {
            pkgPathAbsolute = fileReference.path;

            //relative path. resolve to absolute path
        } else {
            pkgPathAbsolute = `pkg:/` + path.posix.normalize(path.dirname(file.pkgPath) + '/' + fileReference.path);
        }

        const parts = pkgPathAbsolute.split('/');
        //discard the first part (pkg:)
        parts.splice(0, 1);
        const baseFolder = parts[0];
        //remove the base folder part
        parts.splice(0, 1);

        let newPath: string;

        //if the second folder is `roku_modules`
        if (parts[0] === 'roku_modules') {
            //remove the roku_modules bit
            parts.splice(0, 1);
            //this is a reference to a dependency's file
            const dependencyName = parts[0];
            //remove the dependency name bit
            parts.splice(0, 1);
            const newDependencyName = this.prefixMap[dependencyName.toLowerCase()];
            newPath = `pkg:/${baseFolder}/roku_modules/${newDependencyName}/${parts.join('/')}`;
        } else {
            //this is a reference to this module's own file
            newPath = `pkg:/${baseFolder}/roku_modules/${this.ropmModuleName}/${parts.join('/')}`;
        }
        file.addEdit(fileReference.offset, fileReference.offset + fileReference.path.length, newPath);
    }

    /**
     * Scan every file and compute the list of function declaration names.
     */
    public getDistinctFunctionDeclarationMap() {
        const result = {} as { [functionName: string]: boolean };
        for (const file of this.files) {
            for (const func of file.functionDefinitions) {
                //skip the special function names
                if (this.nonPrefixedFunctionMap[func.name.toLowerCase()]) {
                    continue;
                }
                result[func.name.toLowerCase()] = true;
            }
        }
        return result;
    }

    /**
     * Get the distinct names of function calls
     */
    public getDistinctFunctionCallNames() {
        const result = {};
        for (const file of this.files) {
            for (const call of file.functionReferences) {
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
        for (const file of this.files) {
            for (const comp of file.componentDeclarations) {
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
        for (const file of this.files) {
            for (const comp of file.componentReferences) {
                result[comp.name.toLowerCase()] = true;
            }
        }
        return Object.keys(result);
    }


    public files = [] as File[];
}

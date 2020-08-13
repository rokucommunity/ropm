import { File } from "./File";
import { util } from "../util";
import * as path from 'path';
import * as packlist from 'npm-packlist';
import * as rokuDeploy from 'roku-deploy';

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
    public moduleRootDir!: string;

    /**
     * A map from the original file location to its new destination.
     * This is set during the copy process.
     */
    public fileMaps!: Array<{ src: string; dest: string }>;

    public isValid = true;

    public async init() {
        //skip modules we can't derive a name from
        if (!this.npmAliasName) {
            this.isValid = false;
            return;
        }

        const packageLogText = `'${this.npmAliasName}'${this.npmAliasName !== this.npmModuleName ? `('${this.npmModuleName}')` : ''}`;

        let modulePackageJson = await util.getPackageJson(this.moduleDir);

        this.npmModuleName = modulePackageJson.name;

        // every ropm module MUST have the `ropm` keyword. If not, then this is not a ropm module
        if ((modulePackageJson.keywords ?? []).includes('ropm') === false) {
            console.warn(`ropm: skipping prod dependency ${packageLogText} because it does not have the "ropm" keyword`);
            this.isValid = false;
            return;
        }

        //use the rootDir from packageJson, or default to the current module path
        this.moduleRootDir = modulePackageJson.ropm?.rootDir ? path.resolve(this.moduleDir, modulePackageJson.ropm.rootDir) : this.moduleDir;
    }

    public async copyFiles() {
        const packageLogText = `'${this.npmAliasName}'${this.npmAliasName !== this.npmModuleName ? `('${this.npmModuleName}')` : ''}`;

        console.log(`ropm: copying ${packageLogText} as '${this.ropmModuleName}'`);
        //use the npm-packlist project to get the list of all files for the entire package...use this as the whitelist
        let allFiles = await packlist({
            path: this.moduleRootDir
        });

        //standardize each path
        allFiles = allFiles.map((f) => rokuDeploy.util.standardizePath(f));

        //get the list of all file paths within the rootDir
        let rootDirFiles = await util.globAll([
            '**/*',
            ...RopmModule.fileIgnorePatterns
        ], {
            cwd: this.moduleRootDir,
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
                src: path.resolve(this.moduleRootDir, filePath),
                dest: targetPath
            };
        });

        //copy the files for this module to their destinations in the host root dir
        await util.copyFiles(this.fileMaps);
    }

    public async process() {
        //let all files discover all functions/components
        await Promise.all(
            this.files.map((file) => file.discover())
        );

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

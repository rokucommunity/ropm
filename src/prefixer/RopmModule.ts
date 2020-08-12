import { File } from "./File";

export class RopmModule {
    constructor(
        filePaths: string[],
        private readonly prefix: string,
        private readonly prefixMap: { [currentPrefix: string]: string }
    ) {
        for (let filePath of filePaths) {
            this.files.push(
                new File(filePath)
            );
        }
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
        const prefix = this.prefix + '_';
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

/* eslint-disable no-cond-assign */
import * as fsExtra from 'fs-extra';
import * as xmlParser from '@xml-tools/parser';
import { buildAst, XMLDocument, XMLElement } from '@xml-tools/ast';
import { RopmOptions, util } from '../util';
import * as path from 'path';
import { BrsFile, createVisitor, isCallExpression, isDottedGetExpression, isDottedSetStatement, isIndexedGetExpression, isIndexedSetStatement, Position, Program, WalkMode, XmlFile } from 'brighterscript';

export class File {
    constructor(
        /**
         * The path to the file's original location
         */
        public srcPath: string,
        /**
         * The path to the file's new location
         */
        public destPath: string,
        /**
         * The absolute path to the rootDir for this file
         */
        public rootDir: string,
        public options: RopmOptions = {}
    ) {
        this.pkgPath = path.posix.normalize(
            util.removeLeadingSlash(
                util.replaceCaseInsensitive(rootDir, srcPath, '').replace(/\\/g, '/')
            )
        );
    }

    /**
     * Is this file a `.brs` file?
     */
    public get isBrsFile() {
        return this.srcPath.toLowerCase().endsWith('.brs');
    }

    /**
     * Is this a .bs file? (NOT a .d.bs file)
     */
    public get isBsFile() {
        const lowerSrcPath = this.srcPath.toLowerCase();
        return lowerSrcPath.endsWith('.bs') && !lowerSrcPath.endsWith('.d.bs');
    }

    /**
     * Is this a .d.bs file?
     */
    public get isTypdefFile() {
        return this.srcPath.toLowerCase().endsWith('.d.bs');
    }

    /**
     * Is this a .xml file
     */
    public get isXmlFile() {
        return this.srcPath.toLowerCase().endsWith('.xml');
    }

    /**
     * The full pkg path to the file (minus the `pkg:/` protocol since we never actually need that part
     */
    public pkgPath: string;

    public functionDefinitions = [] as Array<{
        name: string;
        nameOffset: number;
        hasNamespace: boolean;
        /**
         * The starting offset of `function` or `sub`
         */
        startOffset: number;
        /**
         * The end offset of `end function` or `end sub`
         */
        endOffset: number;
    }>;

    public classDeclarations = [] as Array<{
        name: string;
        nameOffset: number;
        hasNamespace: boolean;
        /**
         * The starting offset of `class`
         */
        startOffset: number;
        /**
         * The end offset of `end class`
         */
        endOffset: number;
    }>;

    public functionReferences = [] as Array<{
        name: string;
        offset: number;
    }>;

    /**
     * A list of locations in this file that DECLARE a component (i.e. <component name="<component_name"
     */
    public componentDeclarations = [] as Array<{
        name: string;
        offset: number;
    }>;

    /**
     * A list of locations in this file that USE component names (in brs functions as well as xml)
     */
    public componentReferences = [] as Array<{
        name: string;
        offset: number;
    }>;

    /**
     * List of functions referenced by a component's <interface> element
     */
    public componentInterfaceFunctions = [] as Array<{
        name: string;
        offset: number;
    }>;

    /**
     * A list of file paths found in this file.
     * The offset points to the first character of the path itself (i.e. NOT the quotemark when found
     */
    public fileReferences = [] as Array<{
        path: string;
        offset: number;
    }>;

    /**
     * Identifiers found in this file. We use this list to replace known function names, so it's ok to be a little greedy in our matching.
     */
    public identifiers = [] as Array<{
        name: string;
        offset: number;
    }>;

    /**
     * Namespaces found in this file (only applies to typedefs)
     */
    public namespaces = [] as Array<{
        name: string;
        offset: number;
    }>;

    private edits = [] as Edit[];

    /**
     * A concrete syntax tree for any parsed xml
     */
    private xmlAst!: XMLDocument;

    private loadFile() {
        if (!this.xmlAst && this.destPath.toLowerCase().endsWith('.xml')) {
            const { cst, lexErrors, parseErrors, tokenVector } = xmlParser.parse(this.bscFile.fileContents);
            //print every lex and parse error to the console
            for (const lexError of lexErrors) {
                console.error(`XML parse error "${lexError.message}" at ${this.destPath}:${lexError.line}:${lexError.column}`);
            }
            for (const parseError of parseErrors) {
                console.error(`XML parse error "${parseError.message}" at ${this.destPath}:${parseError.token[0]?.startLine}:${parseError.token[0]?.startColumn}`);
            }
            this.xmlAst = buildAst(cst as any, tokenVector);
        }
    }

    private lineOffsetMap!: { [lineNumber: number]: number };

    /**
     * Convert a position into an offset from the start of the file
     */
    private positionToOffset(position: Position) {
        //create the line/offset map if not yet created
        if (!this.lineOffsetMap) {
            this.lineOffsetMap = {};
            this.lineOffsetMap[0] = 0;
            const regexp = /(\r?\n)/g;
            let lineIndex = 1;
            let match: RegExpExecArray | null;
            while (match = regexp.exec(this.bscFile.fileContents)) {
                this.lineOffsetMap[lineIndex++] = match.index + match[1].length;
            }
        }
        return this.lineOffsetMap[position.line] + position.character;
    }

    public bscFile!: BrsFile | XmlFile;

    /**
     * Scan the file for all important information
     */
    public discover(program: Program) {
        this.bscFile = program.getFileByPathAbsolute(this.srcPath);
        this.loadFile();
        this.functionDefinitions = [];
        this.functionReferences = [];
        this.componentDeclarations = [];
        this.componentReferences = [];
        this.fileReferences = [];


        if (this.isBrsFile || this.isBsFile || this.isTypdefFile) {
            this.findFilePathStrings();
            this.findCreateObjectComponentReferences();
            this.findCreateChildComponentReferences();
            this.findObserveFieldFunctionCalls();
            this.walkAst();
        } else if (this.isXmlFile) {
            this.findFilePathStrings();
            this.findXmlChildrenComponentReferences();
            this.findFilePathsFromXmlScriptElements();
            this.findComponentDefinitions();
            this.findExtendsComponentReferences();
            this.findComponentInterfaceFunctions();
            this.findComponentFieldOnChangeFunctions();
        }
    }

    /**
     * find various items from this file.
     */
    public walkAst() {
        /* eslint-disable @typescript-eslint/naming-convention */
        (this.bscFile as BrsFile).parser.ast.walk(createVisitor({
            ImportStatement: (stmt) => {
                //skip pkg paths, those are collected elsewhere
                if (!stmt.filePath.startsWith('pkg:/')) {
                    this.fileReferences.push({
                        offset: this.positionToOffset(stmt.filePathToken.range.start),
                        path: stmt.filePath
                    });
                }
            },
            VariableExpression: (variable, parent) => {
                //skip objects to left of dotted/indexed expressions
                if ((
                    isDottedSetStatement(parent) ||
                    isDottedGetExpression(parent) ||
                    isIndexedSetStatement(parent) ||
                    isIndexedGetExpression(parent)
                ) && parent.obj === variable) {
                    return;
                }

                //track function calls
                if (isCallExpression(parent) && variable === parent.callee) {
                    this.functionReferences.push({
                        name: variable.name.text,
                        offset: this.positionToOffset(variable.name.range.start)
                    });
                } else {
                    //track identifiers
                    this.identifiers.push({
                        name: variable.name.text,
                        offset: this.positionToOffset(variable.name.range.start)
                    });
                }
            },
            //track class declarations (.bs and .d.bs only)
            ClassStatement: (cls) => {
                this.classDeclarations.push({
                    name: cls.name.text,
                    nameOffset: this.positionToOffset(cls.name.range.start),
                    hasNamespace: !!cls.namespaceName,
                    //Use annotation start position if available, otherwise use class keyword
                    startOffset: this.positionToOffset(
                        (cls.annotations?.length > 0 ? cls.annotations[0] : cls.classKeyword).range.start
                    ),
                    endOffset: this.positionToOffset(cls.end.range.end)
                });
            },
            FunctionStatement: (func) => {
                this.functionDefinitions.push({
                    name: func.name.text,
                    nameOffset: this.positionToOffset(func.name.range.start),
                    hasNamespace: !!func.namespaceName,
                    //Use annotation start position if available, otherwise use keyword
                    startOffset: this.positionToOffset(
                        (func.annotations?.length > 0 ? func.annotations[0] : func.func.functionType)!.range.start
                    ),
                    endOffset: this.positionToOffset(func.func.end.range.end)
                });
            },
            NamespaceStatement: (namespace) => {
                this.namespaces.push({
                    name: namespace.name,
                    offset: this.positionToOffset(namespace.nameExpression.range.start)
                });
            }
        }), {
            walkMode: WalkMode.visitAllRecursive
        });
        /* eslint-enable @typescript-eslint/naming-convention */
    }

    /**
     * Add a new edit that should be applied to the file at a later time
     */
    public addEdit(offsetBegin: number, offsetEnd: number, newText: string) {
        this.edits.push({
            offsetBegin: offsetBegin,
            offsetEnd: offsetEnd,
            newText: newText
        });
    }

    /**
     * apply all of the current edits
     */
    public applyEdits() {
        //noting to do if there are no edits
        if (this.edits.length === 0) {
            return;
        }

        //sort the edits in DESCENDING order of offset, so we can simply walk backwards in the file and apply all edits
        const edits = this.edits.sort((e1, e2) => {
            if (e1.offsetBegin > e2.offsetBegin) {
                return -1;
            } else if (e1.offsetBegin < e2.offsetBegin) {
                return 1;
            } else {
                return 0;
            }
        });
        let contents = this.bscFile.fileContents;
        const chunks = [] as string[];
        for (const edit of edits) {
            //store the traling part of the string
            chunks.push(
                contents.substring(edit.offsetEnd)
            );
            //store the edit text
            chunks.push(edit.newText);

            //remove everything after the start of the edit
            contents = contents.substring(0, edit.offsetBegin);
        }
        chunks.push(contents);
        this.bscFile.fileContents = chunks.reverse().join('');
    }

    /**
     * Write the new file contents back to disk
     */
    public async write() {
        await fsExtra.writeFile(this.destPath, this.bscFile.fileContents);
    }


    /**
     * Find all occurances of *.observeField and *.observeFieldScoped function calls that have a string literal as the second parameter
     */
    private findObserveFieldFunctionCalls() {
        //capture function names as a string literal in `observeField` and `observeFieldScoped` functions.
        const regexp = /(\.observeField(?:Scoped)?[ \t]*\(.*?,[ \t]*")([a-z0-9_]+)"\)[ \t]*(?:'.*)*$/gim;

        let match: RegExpExecArray | null;
        while (match = regexp.exec(this.bscFile.fileContents)) {
            //skip multi-line observeField calls (because they are way too hard to parse with regex :D )
            if (util.hasMatchingParenCount(match[0]) === false) {
                continue;
            }

            //just add this to function calls, since there's no difference in terms of how they get replaced
            this.functionReferences.push({
                name: match[2],
                offset: match.index + match[1].length
            });
        }
    }

    private findComponentDefinitions() {
        const nameAttribute = this.xmlAst?.rootElement?.attributes?.find(x => x.key?.toLowerCase() === 'name');
        if (nameAttribute?.value && nameAttribute?.syntax?.value) {
            this.componentDeclarations.push({
                name: nameAttribute.value,
                //plus one to step past the opening "
                offset: nameAttribute.syntax.value.startOffset + 1
            });
        }
    }

    /**
     * Find component names from the `extends` attribute of the `<component` element
     */
    private findExtendsComponentReferences() {
        //get any "extends" attribute from the xml
        const extendsAttribute = this.xmlAst?.rootElement?.attributes?.find(x => x.key?.toLowerCase() === 'extends');
        if (extendsAttribute?.value && extendsAttribute?.syntax?.value) {
            this.componentReferences.push({
                name: extendsAttribute.value,
                //plus one to step past the opening "
                offset: extendsAttribute.syntax.value.startOffset + 1
            });
        }
    }

    /**
     * Find all function names referenced by a component's <interface> element
     */
    private findComponentInterfaceFunctions() {
        const interfaceEntries = this.xmlAst?.rootElement?.subElements.find(x => x.name?.toLowerCase() === 'interface')?.subElements ?? [];
        for (const interfaceEntry of interfaceEntries) {
            const nameAttribute = interfaceEntry.attributes.find(x => x.key?.toLowerCase() === 'name');
            if (interfaceEntry.name?.toLowerCase() === 'function' && nameAttribute) {
                this.componentInterfaceFunctions.push({
                    name: nameAttribute.value!,
                    //plus one to step past the opening "
                    offset: nameAttribute.syntax.value!.startOffset + 1
                });
            }
        }
    }

    private findComponentFieldOnChangeFunctions() {
        const interfaceEntries = this.xmlAst?.rootElement?.subElements.find(x => x.name?.toLowerCase() === 'interface')?.subElements ?? [];
        for (const interfaceEntry of interfaceEntries) {
            const nameAttribute = interfaceEntry.attributes.find(x => x.key?.toLowerCase() === 'name');
            if (interfaceEntry.name?.toLowerCase() === 'field' && nameAttribute) {
                const onchange = interfaceEntry.attributes.find(x => x.key?.toLowerCase() === 'onchange');
                if (onchange) {
                    this.functionReferences.push({
                        name: onchange.value!,
                        //plus one to step past the opening "
                        offset: onchange.syntax.value!.startOffset + 1
                    });
                }
            }
        }
    }

    /**
     * Find component names from `CreateObject("RoSGNode", "<component_name>")` function calls
     */
    private findCreateObjectComponentReferences() {
        const regexp = /(createobject\s*\(\s*"rosgnode"\s*,\s*")(.+)"\s*\)/gi;

        let match: RegExpExecArray | null;

        //look through each line of the file
        while (match = regexp.exec(this.bscFile.fileContents)) {
            const componentName = match[2];

            const startOffset = match.index + match[1].length;

            this.componentReferences.push({
                name: componentName,
                offset: startOffset
            });
        }
    }

    /**
     * Find all calls to `.CreateChild("COMPONENT_NAME")`.
     * There is a slight chance this could catch some false positives for modules that have their own CreateChild(string) method,
     * but it's unlikely to matter since we would only replace these calls that actually contain known component names
     */
    private findCreateChildComponentReferences() {
        const regexp = /(\.\s*CreateChild\s*\((?:\r?\n|\s)*")(.*)"/gi;
        let match: RegExpExecArray | null;

        //look through each line of the file
        while (match = regexp.exec(this.bscFile.fileContents)) {
            const componentName = match[2];

            const startOffset = match.index + match[1].length;

            this.componentReferences.push({
                name: componentName,
                offset: startOffset
            });
        }
    }

    /**
     * Find all components used as XML elements
     */
    private findXmlChildrenComponentReferences() {
        //all components must be added as chlidren of the `<children>` element in a `<component>`

        const childrenElement = this.xmlAst?.rootElement?.subElements?.find(x => x.name?.toLowerCase() === 'children');
        const children = [] as XMLElement[];
        if (childrenElement) {
            children.push(...childrenElement.subElements);
        }
        while (children.length > 0) {
            const child = children.pop();
            if (child?.syntax?.openName) {
                children.push(...child?.subElements ?? []);
                const offsetBegin = child.syntax.openName.startOffset;
                //save the opening tag
                this.componentReferences.push({
                    name: child?.name as string,
                    offset: offsetBegin
                });
            }
            //if there's a closing tag, save that
            if (child?.syntax.closeName) {
                const offsetBegin = child.syntax.closeName.startOffset;
                this.componentReferences.push({
                    name: child.syntax.closeName.image,
                    offset: offsetBegin
                });
            }
        }
    }

    /**
     * Look for every string containing a 'pkg:/' path
     */
    private findFilePathStrings() {
        //look for any string containing `pkg:/`
        const regexp = /"(pkg:\/[^"]+)"/gi;
        let match: RegExpExecArray | null;
        while (match = regexp.exec(this.bscFile.fileContents)) {
            this.fileReferences.push({
                //+1 to step past opening quote
                offset: match.index + 1,
                path: match[1]
            });
        }
    }

    /**
     * Look for every `<script` element in XML files and extract their file paths
     */
    private findFilePathsFromXmlScriptElements() {
        //skip non-xml files
        if (!this.xmlAst) {
            return;
        }

        //script elements must be direct-children of the `<component` element
        const elements = this.xmlAst.rootElement?.subElements ?? [];
        for (const element of elements) {
            //if this is a script element
            if (element.name?.toLowerCase() === 'script') {
                const uriAttribute = element.attributes.find((x) => x.key?.toLowerCase() === 'uri');
                //if we have a `uri` attribute
                if (uriAttribute?.value && uriAttribute?.syntax?.value) {
                    //+1 to step past the opening double-quote
                    const offset = uriAttribute.syntax.value.startOffset + 1;
                    //add this reference only if we don't already have it (the previous regex can sometimes match these)
                    if (!this.fileReferences.find(x => x.offset === offset)) {
                        this.fileReferences.push({
                            path: uriAttribute.value,
                            offset: offset
                        });
                    }
                }
            }
        }
    }
}

export interface Edit {
    offsetBegin: number;
    offsetEnd: number;
    newText: string;
}

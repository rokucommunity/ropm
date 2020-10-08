/* eslint-disable no-cond-assign */
import * as fsExtra from 'fs-extra';
import * as xmlParser from '@xml-tools/parser';
import { buildAst, XMLDocument, XMLElement } from '@xml-tools/ast';
import { RopmOptions, util } from '../util';
import * as path from 'path';
import { BrsFile, createVisitor, isCallExpression, isDottedGetExpression, isDottedSetStatement, isIndexedGetExpression, isIndexedSetStatement, isXmlFile, Program, Range, WalkMode, XmlFile } from 'brighterscript';

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
        offset: number;
    }>;

    public functionCalls = [] as Array<{
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
     * A list of file paths found in this file
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
     * Convert a range into an offset from the start of the file
     */
    private rangeToOffset(range: Range) {
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
        return this.lineOffsetMap[range.start.line] + range.start.character;
    }

    public bscFile!: BrsFile | XmlFile;

    /**
     * Scan the file for all important information
     */
    public discover(program: Program) {
        this.bscFile = program.getFileByPathAbsolute(this.srcPath);
        this.loadFile();
        this.functionDefinitions = [];
        this.functionCalls = [];
        this.componentDeclarations = [];
        this.componentReferences = [];
        this.fileReferences = [];


        if (this.isBrsFile) {
            this.findFilePathStrings();
            this.findCreateObjectComponentReferences();
            this.findCreateChildComponentReferences();
            this.findFunctionDefinitions();
            this.findIdentifiers();
            this.findObserveFieldFunctionNames();
        } else if (this.isXmlFile) {
            this.findFilePathStrings();
            this.findXmlChildrenComponentReferences();
            this.findFilePathsFromXmlScriptElements();
            this.findComponentDefinitions();
            this.findExtendsComponentReferences();
        }
    }

    /**
     * find all identifiers in this file. This will definitely find keywords and reserved words,
     * but we only use this list to replace known function names, so it's ok to be a little greedy here.
     */
    public findIdentifiers() {
        this.bscFile.parser.ast.walk(createVisitor({
            /* eslint-disable @typescript-eslint/naming-convention */
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
                    this.functionCalls.push({
                        name: variable.name.text,
                        offset: this.rangeToOffset(variable.name.range)
                    });
                } else {
                    this.identifiers.push({
                        name: variable.name.text,
                        offset: this.rangeToOffset(variable.name.range)
                    });
                }
            }
            /* eslint-enable @typescript-eslint/naming-convention */
        }), {
            walkMode: WalkMode.visitAllRecursive
        });
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
     * Find every top-level function defined in this file
     */
    private findFunctionDefinitions() {
        for (const func of this.bscFile.parser.references.functionStatements) {
            this.functionDefinitions.push({
                name: func.name.text,
                offset: this.rangeToOffset(func.name.range)
            });
        }
    }

    /**
     * Find all occurances of *.observeField function calls that have a string literal as the second parameter
     */
    private findObserveFieldFunctionNames() {
        //capture function names as a string literal in `observeField` functions.
        const regexp = /(\.observeField[ \t]*\(.*?,[ \t]*")([a-z0-9_]+)"\)[ \t]*(?:'.*)*$/gim;

        let match: RegExpExecArray | null;
        while (match = regexp.exec(this.bscFile.fileContents)) {
            //skip multi-line observeField calls (because they are way too hard to parse with regex :D )
            if (util.hasMatchingParenCount(match[0]) === false) {
                continue;
            }

            //just add this to function calls, since there's no difference in terms of how they get replaced
            this.functionCalls.push({
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

/* eslint-disable no-cond-assign */
import * as fsExtra from 'fs-extra';
import * as xmlParser from '@xml-tools/parser';
import { buildAst, XMLDocument, XMLElement } from '@xml-tools/ast';

export class File {
    constructor(
        public readonly filePath: string
    ) {
    }

    /**
     * The in-memory copy of the file contents
     */
    public fileContents!: string;

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

    private edits = [] as Edit[];

    /**
     * A concrete syntax tree for any parsed xml
     */
    private xmlAst!: XMLDocument;

    private async loadFile() {
        if (!this.fileContents) {
            this.fileContents = (await fsExtra.readFile(this.filePath)).toString();
            if (!this.xmlAst && this.filePath.toLowerCase().endsWith('.xml')) {
                const { cst, lexErrors, parseErrors, tokenVector } = xmlParser.parse(this.fileContents);
                //print every lex and parse error to the console
                for (let lexError of lexErrors) {
                    console.error(`XML parse error "${lexError.message}" at ${this.filePath}:${lexError.line}:${lexError.column}`);
                }
                for (let parseError of parseErrors) {
                    console.error(`XML parse error "${parseError.message}" at ${this.filePath}:${parseError.token[0]?.startLine}:${parseError.token[0]?.startColumn}`);
                }
                this.xmlAst = buildAst(cst as any, tokenVector);
            }
        }
    }

    /**
     * Scan the file for all functions and components
     */
    public async discover() {
        await this.loadFile();

        this.findFunctionDefinitions();
        this.findFunctionCalls();
        this.findCreateObjectComponentReferences();
        this.findCreateChildComponentReferences();
        this.findComponentDefinitions();
        this.findExtendsComponentReferences();
        this.findXmlChildrenComponentReferences();
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
            } else if (e2.offsetBegin < e2.offsetBegin) {
                return 1;
            } else {
                return 0;
            }
        });
        let contents = this.fileContents;
        let chunks = [] as string[];
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
        this.fileContents = chunks.reverse().join('');
    }

    /**
     * Write the new file contents back to disk
     */
    public async write() {
        await fsExtra.writeFile(this.filePath, this.fileContents);
    }

    private findFunctionDefinitions() {
        const regexp = /((?:function|sub)\s+)([a-z0-9_]+)\s*\(/gi;

        let match: RegExpExecArray | null;
        while (match = regexp.exec(this.fileContents)) {
            const functionName = match[2];

            const startOffset = match.index + match[1].length;

            this.functionDefinitions.push({
                name: functionName,
                offset: startOffset
            });
        }
    }

    private findFunctionCalls() {
        //using negative lookbehind, so require node >=8.1.10
        //capture every identifier NOT preceeded by sub or function, that is not the exact text "sub" or "function"
        const regexp = /(?<!(?:sub|function)\s+)(?!function|sub\b)\b([a-z0-9_]+)\s*\(/gi;

        let match: RegExpExecArray | null;
        while (match = regexp.exec(this.fileContents)) {
            const functionName = match[1];

            this.functionCalls.push({
                name: functionName,
                offset: match.index
            });
        }
    }

    private findComponentDefinitions() {
        const nameAttribute = this.xmlAst?.rootElement?.attributes?.find(x => x.key?.toLowerCase() === 'name');
        if (nameAttribute) {
            this.componentDeclarations.push({
                name: nameAttribute.value!,
                //plus one to step past the opening "
                offset: nameAttribute.syntax.value!.startOffset + 1
            });
        }
    }

    /**
     * Find component names from the `extends` attribute of the `<component` element
     */
    private findExtendsComponentReferences() {
        //get any "extends" attribute from the xml
        const extendsAttribute = this.xmlAst?.rootElement?.attributes?.find(x => x.key?.toLowerCase() === 'extends');
        if (extendsAttribute) {
            this.componentReferences.push({
                name: extendsAttribute.value!,
                //plus one to step past the opening "
                offset: extendsAttribute.syntax.value!.startOffset + 1
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
        while (match = regexp.exec(this.fileContents)) {
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
        while (match = regexp.exec(this.fileContents)) {
            const componentName = match[2];

            const startOffset = match.index + match[1].length;

            this.componentReferences.push({
                name: componentName,
                offset: startOffset
            });
        }
    }

    /**
     * Find all compoments used as XML elements
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
            children.push(...child?.subElements ?? []);
            const offsetBegin = child!.syntax.openName!.startOffset;
            //save the opening tag
            this.componentReferences.push({
                name: child?.name as string,
                offset: offsetBegin
            });
            //if there's a closing tag, save that
            if (child?.syntax.closeName) {
                const offsetBegin = child!.syntax.closeName!.startOffset;
                this.componentReferences.push({
                    name: child?.syntax.closeName.image as string,
                    offset: offsetBegin
                });
            }
        }
    }
}

export interface Edit {
    offsetBegin: number;
    offsetEnd: number;
    newText: string;
}


/* eslint-disable no-cond-assign */
import * as fsExtra from 'fs-extra';
import * as xmlParser from '@xml-tools/parser';
import { buildAst, XMLDocument } from '@xml-tools/ast';

export class File {
    constructor(
        public readonly filePath: string
    ) {
    }

    /**
     * The in-memory copy of the file contents
     */
    private fileContents!: string;

    private functionDefinitions = [] as Array<{
        name: string;
        startOffset: number;
        endOffset: number;
    }>;

    private functionCalls = [] as Array<{
        name: string;
        startOffset: number;
        endOffset: number;
    }>;

    /**
     * A list of locations in this file that DECLARE a component (i.e. <component name="<component_name"
     */
    private componentDeclarations = [] as Array<{
        name: string;
        startOffset: number;
        endOffset: number;
    }>;

    /**
     * A list of locations in this file that USE component names (in brs functions as well as xml)
     */
    private componentReferences = [] as Array<{
        name: string;
        startOffset: number;
        endOffset: number;
    }>;

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

    public async discover() {
        await this.loadFile();

        this.findFunctionDefinitions();
        this.findFunctionCalls();
        this.findCreateObjectComponentReferences();

        this.findComponentDefinitions();
        this.findExtendsComponentReferences();
        
    }

    private findFunctionDefinitions() {
        const regexp = /((?:function|sub)\s+)([a-z0-9_]+)\s*\(/gi;

        let match: RegExpExecArray | null;
        while (match = regexp.exec(this.fileContents)) {
            const functionName = match[2];

            const startOffset = match.index + match[1].length;

            this.functionDefinitions.push({
                name: functionName,
                startOffset: startOffset,
                endOffset: startOffset + functionName.length
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
                startOffset: match.index,
                endOffset: match.index + functionName.length
            });
        }
    }

    private findComponentDefinitions() {
        const nameAttribute = this.xmlAst?.rootElement?.attributes?.find(x => x.key?.toLowerCase() === 'name');
        if (nameAttribute) {
            this.componentDeclarations.push({
                name: nameAttribute.value!,
                //plus one to step past the opening "
                startOffset: nameAttribute.syntax.value!.startOffset + 1,
                endOffset: nameAttribute.syntax.value!.endOffset
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
                startOffset: extendsAttribute.syntax.value!.startOffset + 1,
                endOffset: extendsAttribute.syntax.value!.endOffset,
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
                startOffset: startOffset,
                endOffset: startOffset + componentName.length
            });
        }
    }

    private findCreateChildComponentReferences(lineIndex: number) {

    }

}

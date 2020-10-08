import { File } from './File';

import * as path from 'path';
import * as fsExtra from 'fs-extra';
import { expect } from 'chai';
import { createSandbox } from 'sinon';
import { Position, Program } from 'brighterscript';
const sinon = createSandbox();

const tmpDir = path.join(process.cwd(), '.tmp');
const rootDir = path.join(tmpDir, 'srcRootDir');
const srcPath = path.join(rootDir, 'components', 'file.brs');
const destPath = path.join(tmpDir, 'dest', 'file.brs');

describe('prefixer/File', () => {

    let file: File;
    let f: any;
    let fileContents = '';
    let program: Program;

    beforeEach(() => {
        fsExtra.ensureDirSync(tmpDir);
        fsExtra.emptyDirSync(tmpDir);
        file = new File(srcPath, destPath, rootDir);
        f = file;
        sinon.stub(fsExtra, 'readFile').callsFake(() => {
            return Promise.resolve(Buffer.from(fileContents));
        });
        initProgram();
    });

    afterEach(() => {
        sinon.restore();
    });

    function initProgram() {
        program = new Program({
            rootDir: rootDir
        });
    }

    /**
     * Set the contents of the file right before a test.
     * This also normalizes line endings to `\n` to make the tests consistent
     */
    async function setFile(value: string, extension: 'brs' | 'xml' = 'brs') {
        fileContents = value.replace(/\r\n/, '\n');
        file.srcPath = f.srcPath.replace('.brs', '.' + extension);
        file.destPath = f.destPath.replace('.brs', '.' + extension);
        const relativeSrcPath = f.srcPath
            //make path relative
            .replace(rootDir, '')
            //remove leading slashes
            .replace(/^(\/|\\)*/, '');
        await program.addOrReplaceFile(relativeSrcPath, fileContents);
    }

    /**
     * Convert the given line and column into an absolute offset from the current file contents
     */
    function getOffset(lineIndex: number, columnIndex: number) {
        let currentLineIndex = 0;
        let currentColumnIndex = 0;
        for (let offset = 0; offset < fileContents.length; offset++) {
            if (currentLineIndex === lineIndex && currentColumnIndex === columnIndex) {
                return offset;
            }
            if (fileContents[offset] === '\n') {
                currentLineIndex++;
                currentColumnIndex = 0;
            } else {
                currentColumnIndex++;
            }
        }
        return -1;
    }
    /**
     * Given an offset in the current file contents, compute the Position (line and column)
     */
    function getPositionFromOffset(targetOffset: number): { line: number; character: number } | undefined {
        let currentLineIndex = 0;
        let currentColumnIndex = 0;
        for (let offset = 0; offset < fileContents.length; offset++) {
            if (targetOffset === offset) {
                return {
                    line: currentLineIndex,
                    character: currentColumnIndex
                };
            }
            if (fileContents[offset] === '\n') {
                currentLineIndex++;
                currentColumnIndex = 0;
            } else {
                currentColumnIndex++;
            }
        }
    }

    describe('findFunctionDefinitions', () => {
        it('finds functions in multiple lines', async () => {
            await setFile(`
                function Main()
                end function
                function Main2()
                end function
            `);
            file.discover(program);
            expect(f.functionDefinitions).to.eql([{
                name: 'Main',
                offset: getOffset(1, 25)
            }, {
                name: 'Main2',
                offset: getOffset(3, 25)
            }]);
        });
    });

    describe('findFunctionCalls', () => {
        it('works for brs files', async () => {
            await setFile(`
                'should not match on "main"
                sub main()
                    doSomething()
                    'should not match on "function"
                    func = function()
                        doSomethingInner()
                    end function
                end sub
            `);
            file.discover(program);
            expect(f.functionCalls).to.eql([{
                name: 'doSomething',
                offset: getOffset(3, 20)
            }, {
                name: 'doSomethingInner',
                offset: getOffset(6, 24)
            }]);
        });

        it('does not match object function calls', async () => {
            await setFile(`
                sub getPerson()
                    person = {
                        speak: sub(message)
                            print message
                        end sub,
                        sayHello: sub()
                            m.speak("Hello")
                            speak("Person said hello")
                        end sub
                    }
                    person.speak("I'm a person")
                    speak("Made person speak")
                end sub
                sub speak(message)
                    print message
                end sub
            `, 'brs');
            file.discover(program);
            expect(f.functionCalls).to.eql([{
                name: 'speak',
                offset: getOffset(8, 28)
            }, {
                name: 'speak',
                offset: getOffset(12, 20)
            }]);
        });
    });

    describe('findIdentifiers', () => {
        async function verifyIdentifier(text: string, ...expectedIdentifiers: [string, number, number][]) {
            file = new File(srcPath, destPath, rootDir);
            f = file;
            initProgram();
            await setFile(`
                sub main()\n${text}
                end sub`
            );
            file.discover(program);

            const identifiers = [] as { name: string; line: number; character: number }[];
            for (const identifier of expectedIdentifiers) {
                identifiers.push({
                    name: identifier[0],
                    line: identifier[1],
                    character: identifier[2]
                });
            }
            expect(file.identifiers.map(x => {
                const position = getPositionFromOffset(x.offset) as Position;
                //subtract 2 lines from the position since we inject the text into an existing function
                position.line -= 2;
                return {
                    name: x.name,
                    ...position
                };
            })).to.eql(identifiers);
        }

        it('finds simple assignment', async () => {
            await verifyIdentifier(`someVar = logInfo`, ['logInfo', 0, 10]);
        });

        it('finds dotted set', async () => {
            await verifyIdentifier(`object.var = logInfo`, ['logInfo', 0, 13]);
        });

        it('finds indexed set', async () => {
            await verifyIdentifier(`object["1"] = logInfo`, ['logInfo', 0, 14]);
        });

        it('finds key for indexed set', async () => {
            await verifyIdentifier(`object[logInfo] = "1"`, ['logInfo', 0, 7]);
        });

        it('function argument', async () => {
            await verifyIdentifier(`callAFunction(logInfo)`, ['logInfo', 0, 14]);
        });

        it('does not match function call name', async () => {
            await verifyIdentifier(`doSomething()`);
        });

        it('matches first of two function arguments', async () => {
            await verifyIdentifier(`callAFunction(logInfo, "asdf")`, ['logInfo', 0, 14]);
        });

        it('matches second of two function arguments', async () => {
            await verifyIdentifier(`callAFunction("asdf", logInfo)`, ['logInfo', 0, 22]);
        });

        it('does not match parameter name ', async () => {
            await verifyIdentifier(`
                innerSub = sub (logInfo)
                end sub
            `);
        });

        it('matches quirky AA multi-item-same-line syntax', async () => {
            await verifyIdentifier(`
                person = {
                    log: logInfo1 : log2: logInfo2
                }
            `, ['logInfo1', 2, 25], ['logInfo2', 2, 42]);
        });

        it('matches within array', async () => {
            await verifyIdentifier(`
                arr = [
                    logInfo
                ]
            `, ['logInfo', 2, 20]);
        });

        it('matches multi-line function argument', async () => {
            await verifyIdentifier(`
                someFunction(
                    logInfo
                )
            `, ['logInfo', 2, 20]);
        });

        it('matches multiple statements on same line', async () => {
            await verifyIdentifier(
                `print logInfo1 : print logInfo2`,
                ['logInfo1', 0, 6],
                ['logInfo2', 0, 23]
            );
        });

        it('matches standard AA member value', async () => {
            await verifyIdentifier(`
                person = {
                    name: logInfo
                }
            `, ['logInfo', 2, 26]);
        });

        //any expression where the function name is wrapped in parens
        it('matches wrapped in parens', async () => {
            await verifyIdentifier(`print "1" + (logInfo)`, ['logInfo', 0, 13]);
        });

        it('skips identifiers in strings and keyword identifiers', async () => {
            await verifyIdentifier(`
                function main()
                    print "main function"
                end function
            `);
        });
    });

    describe('findComponentDefinitions', () => {
        it('finds component name', async () => {
            await setFile(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent">
                </component>
            `, 'xml');
            file.discover(program);
            expect(f.componentDeclarations).to.eql([{
                name: 'CustomComponent',
                offset: getOffset(1, 33)
            }]);
        });

        it('finds component name on separate line', async () => {
            await setFile(`<?xml version="1.0" encoding="utf-8" ?>
                <component 
                    name="CustomComponent">
                </component>
            `, 'xml');
            file.discover(program);
            expect(f.componentDeclarations).to.eql([{
                name: 'CustomComponent',
                offset: getOffset(2, 26)
            }]);
        });
    });

    describe('findComponentReferences', () => {
        it('finds component name from `extends` attribute', async () => {
            await setFile(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent" extends="ParentComponent" >
                </component>
            `, 'xml');
            file.discover(program);
            expect(f.componentReferences).to.eql([{
                name: 'ParentComponent',
                offset: getOffset(1, 59)
            }]);
        });

        it('finds component name from `extends` attribute on different line', async () => {
            await setFile(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent" 
                    extends="ParentComponent" >
                </component>
            `, 'xml');
            file.discover(program);
            expect(f.componentReferences).to.eql([{
                name: 'ParentComponent',
                offset: getOffset(2, 29)
            }]);
        });

        it('finds component name in `createObject`', async () => {
            await setFile(`
                sub main()
                    'normal
                    createObject("RoSGNode", "Component1")
                    'extra spaces
                    createObject ( "RoSGNode" , "Component2" )
                    'lower rosgnode
                    createObject("rosgnode","Component3")
                end sub
            `);
            file.discover(program);
            expect(f.componentReferences).to.eql([{
                name: 'Component1',
                offset: getOffset(3, 46)
            }, {
                name: 'Component2',
                offset: getOffset(5, 49)
            }, {
                name: 'Component3',
                offset: getOffset(7, 45)
            }]);
        });

        it('finds component name in `node.createChild`', async () => {
            await setFile(`
                sub main()
                    'normal
                    node.CreateChild("Component1")

                    'lots of spaces
                    node . CreateChild ( "Component2" )

                    'multi-line
                    node . CreateChild (
                        "Component3"
                    )

                    'function call to get node
                    getNode().CreateChild("Component4")

                    'function call to get value (this one should be ignored)
                    node.CreateChild(getNodeName())
                end sub
            `);
            file.discover(program);
            expect(f.componentReferences).to.eql([{
                name: 'Component1',
                offset: getOffset(3, 38)
            }, {
                name: 'Component2',
                offset: getOffset(6, 42)
            }, {
                name: 'Component3',
                offset: getOffset(10, 25)
            }, {
                name: 'Component4',
                offset: getOffset(14, 43)
            }]);
        });

        it('finds component name in xml usage', async () => {
            await setFile(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent">
                    <children>
                        <CustomComponent2></CustomComponent2>
                        <MarkupList />
                        <SomeCustomComponent />
                    </children>
                </component>
            `, 'xml');
            file.discover(program);
            expect(
                file.componentReferences.sort((a, b) => {
                    if (a.offset > b.offset) {
                        return 1;
                    } else if (a.offset < b.offset) {
                        return -1;
                    }
                    return 0;
                })
            ).to.eql([{
                name: 'CustomComponent2',
                offset: getOffset(3, 25)
            }, {
                name: 'CustomComponent2',
                offset: getOffset(3, 44)
            }, {
                name: 'MarkupList',
                offset: getOffset(4, 25)
            }, {
                name: 'SomeCustomComponent',
                offset: getOffset(5, 25)
            }]);
        });
    });

    describe('findFileReferences', () => {
        it('finds absolute script paths in xml tags', async () => {
            await setFile(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent">
                    <script uri="pkg:/source/lib.brs" />
                    <script uri="pkg:/components/folder1/somelib.brs" />
                    <Poster uri="pkg:/images/CoolPhoto.png" />
                </component>
            `, 'xml');
            file.discover(program);
            expect(file.fileReferences).to.eql([{
                path: 'pkg:/source/lib.brs',
                offset: getOffset(2, 33)
            }, {
                path: 'pkg:/components/folder1/somelib.brs',
                offset: getOffset(3, 33)
            }, {
                path: 'pkg:/images/CoolPhoto.png',
                offset: getOffset(4, 33)
            }]);
        });

        it('finds relative file paths in xml script tags', async () => {
            await setFile(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent">
                    <script uri="../lib.brs" />
                    <script uri="comp.brs" />
                </component>
            `, 'xml');
            file.discover(program);
            expect(file.fileReferences).to.eql([{
                path: '../lib.brs',
                offset: getOffset(2, 33)
            }, {
                path: 'comp.brs',
                offset: getOffset(3, 33)
            }]);
        });

        it('finds pkg paths in brs files', async () => {
            await setFile(`
                sub main()
                    filePath = "pkg:/images/CoolPhoto.brs"
                end sub
            `);
            file.discover(program);
            expect(file.fileReferences).to.eql([{
                path: 'pkg:/images/CoolPhoto.brs',
                offset: getOffset(2, 32)
            }]);
        });
    });
    describe('applyEdits', () => {
        it('leaves file intact with no edits', async () => {
            await setFile('hello world', 'brs');
            file.discover(program);
            file.applyEdits();
            expect(file.bscFile.fileContents).to.equal('hello world');
        });

        it('applies zero-length edit as an insert', async () => {
            await setFile('hello world', 'brs');
            file.discover(program);
            file.addEdit(5, 5, ' my');
            file.applyEdits();
            expect(file.bscFile.fileContents).to.equal('hello my world');
        });

        it('removes text with zero-length edit', async () => {
            await setFile('hello world', 'brs');
            file.discover(program);
            file.addEdit(5, 11, '');
            file.applyEdits();
            expect(file.bscFile.fileContents).to.equal('hello');
        });

        it('replaces text', async () => {
            await setFile('hello Jim, how are you', 'brs');
            file.discover(program);
            file.addEdit(6, 9, 'Michael');
            file.applyEdits();
            expect(file.bscFile.fileContents).to.equal('hello Michael, how are you');
        });

        it('works at beginning of string', async () => {
            await setFile('hello world', 'brs');
            file.discover(program);
            file.addEdit(0, 5, 'goodbye');
            file.applyEdits();
            expect(file.bscFile.fileContents).to.equal('goodbye world');
        });

        it('works with out-of-order edits', async () => {
            await setFile('one two three', 'brs');
            file.discover(program);
            //middle
            file.addEdit(4, 7, 'twelve');
            //last
            file.addEdit(8, 13, 'thirteen');
            //first
            file.addEdit(0, 3, 'eleven');

            file.applyEdits();
            expect(file.bscFile.fileContents).to.equal('eleven twelve thirteen');
        });

        it('finds component interface function names', async () => {
            await setFile(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="LoggerComponent">
                    <interface>
                        <function name="doSomething"/>
                        <function 
                            name="doSomethingElse" />
                    </interface>
                </component>
            `, 'xml');
            file.discover(program);

            expect(file.componentInterfaceFunctions).to.eql([{
                name: 'doSomething',
                offset: getOffset(3, 40)
            }, {
                name: 'doSomethingElse',
                offset: getOffset(5, 34)
            }]);
        });
    });
});

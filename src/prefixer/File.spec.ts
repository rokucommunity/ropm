import { File } from './File';

import * as path from 'path';
import * as fsExtra from 'fs-extra';
import { expect } from 'chai';
import { createSandbox } from 'sinon';
import { Program } from 'brighterscript';
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
        program = new Program({
            rootDir: rootDir
        });
    });

    afterEach(() => {
        sinon.restore();
    });


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

    describe('findStrings', () => {
        it('finds all strings in the file', async () => {
            await setFile(`
                sub main()
                    name = "bob"
                    print "hello" + " world " + name
                end sub
            `, 'brs');
            file.discover(program);
            expect(file.strings).to.eql([{
                startOffset: getOffset(2, 27),
                endOffset: getOffset(2, 32)
            }, {
                startOffset: getOffset(3, 26),
                endOffset: getOffset(3, 33)
            }, {
                startOffset: getOffset(3, 36),
                endOffset: getOffset(3, 45)
            }]);
        });

        it('only scans brightscript files', async () => {
            await setFile(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent">
                </component>
            `, 'xml');
            file.discover(program);
            expect(file.strings).to.be.empty;
        });
    });

    describe('findIdentifiers', () => {
        it('works for regex test case', async () => {
            async function verifyIdentifier(text: string, ...expectedIdentifiers: [string, number, number][]) {
                await setFile(text);
                file = new File(srcPath, destPath, rootDir);
                file.discover(program);

                const identifiers = [] as { name: string; line: number; character: number }[];
                for (const identifier of expectedIdentifiers) {
                    identifiers.push({
                        name: identifier[0],
                        line: identifier[1],
                        character: identifier[2]
                    });
                }
                expect(file.identifiers.map(x => ({
                    name: x.name,
                    ...getPositionFromOffset(x.offset)
                }))).to.eql(identifiers);
            }
            //regex test: https://regex101.com/r/LUuU8X/1
            await verifyIdentifier(`someVar = logInfo1`, ['logInfo1', 0, 10]);
            await verifyIdentifier(`object.var = logInfo2`, ['logInfo2', 0, 13]);
            await verifyIdentifier(`object["1"] = logInfo3`, ['logInfo3', 0, 14]);
            await verifyIdentifier(`object[logInfo4] = "1"`, ['logInfo4', 0, 7]);
            await verifyIdentifier(`callAFunction(logInfo5)`, ['logInfo5', 0, 14]);
            // await verifyIdentifier(`doSomething()`, 'logInfo1', 0, 13);
            await verifyIdentifier(`callAFunction(logInfo6, "asdf")`, ['logInfo6', 0, 14]);
            await verifyIdentifier(`callAFunction("asdf", logInfo7)`, ['logInfo7', 0, 22]);
            await verifyIdentifier(`someObject[logInfo8]`, ['logInfo8', 0, 11]);
            await verifyIdentifier(`someObject[logInfo9 ]`, ['logInfo9', 0, 11]);
            await verifyIdentifier(`someObject[ logInfo10 ]`, ['logInfo10', 0, 12]);

            await verifyIdentifier(`
                someObject[
                    logInfo11
                ]
            `, ['logInfo11', 2, 20]);

            await verifyIdentifier(`
                someFunction(
                    logInfo12
                )
            `, ['logInfo12', 2, 20]);

            await verifyIdentifier(`print logInfo13 : print logInfo14`, ['logInfo13', 0, 6], ['logInfo14', 0, 24]);

            await verifyIdentifier(`
                person = {
                    name: logInfo15
                }
            `, ['logInfo15', 2, 26]);

            //any expression where the function name is wrapped in parens
            await verifyIdentifier(`print "1" + (logInfo16)`, ['logInfo16', 0, 13]);

            await verifyIdentifier(`
                function firstName(logInfo17, logInfo18, logInfo19)
                end function
            `, ['logInfo17', 1, 35], ['logInfo18', 1, 46], ['logInfo19', 1, 57]);

            await verifyIdentifier(`
                (function (logInfo20, logInfo21, logInfo22)
                end function)()
            `, ['logInfo20', 1, 27], ['logInfo21', 1, 38], ['logInfo22', 1, 49]);
        });

        it('finds various identifiers', async () => {
            await setFile(`
                function main()
                    logVar = log
                    logVar("logVar")
                    log("log")
                end function
                sub log(message)
                end sub
            `, 'brs');
            file.discover(program);
            expect(file.identifiers).to.eql([{
                name: 'log',
                offset: getOffset(2, 29)
            }, {
                name: 'message',
                offset: getOffset(6, 24)
            }]);
        });

        it('skips identifiers in strings and keyword identifiers', async () => {
            await setFile(`
                function main()
                    print "main function"
                end function
            `, 'brs');

            file.discover(program);
            expect(file.identifiers).to.be.empty;
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
    });
});

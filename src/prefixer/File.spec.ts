import { File } from './File';

import * as path from 'path';
import * as fsExtra from 'fs-extra';
import { expect } from 'chai';
import { createSandbox } from 'sinon';
const sinon = createSandbox();

const tmpDir = path.join(process.cwd(), '.tmp');
const filePath = path.join(tmpDir, 'file.brs');

describe('prefixer/File', () => {

    let file: File;
    let f: any;
    let fileContents = '';

    /**
     * Set the contents of the file right before a test.
     * This also normalizes line endings to `\n` to make the tests consistent
     */
    function setFileContents(value: string) {
        fileContents = value.replace(/\r\n/, '\n');
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
    }

    beforeEach(() => {
        fsExtra.ensureDirSync(tmpDir);
        fsExtra.emptyDirSync(tmpDir);
        file = new File(filePath);
        f = file;
        sinon.stub(fsExtra, 'readFile').callsFake(() => {
            return Promise.resolve(Buffer.from(fileContents));
        });
    });
    afterEach(() => {
        sinon.restore();
    });

    it('loads file from disk', async () => {
        sinon.restore();
        fsExtra.writeFileSync(filePath, 'asdf');
        await file.discover();
        expect((f.fileContents)).to.eql('asdf');
    });

    describe('findFunctionDefinitions', () => {
        it('finds functions in multiple lines', async () => {
            setFileContents(`
                function Main()
                function Main2()
            `);
            await file.discover();
            expect(f.functionDefinitions).to.eql([{
                name: 'Main',
                offset: getOffset(1, 25)
            }, {
                name: 'Main2',
                offset: getOffset(2, 25)
            }]);
        });

        it('finds multiple functions on a line (probably not possible, but why not...)', async () => {
            setFileContents(`
                function Main() function Main2()
            `);
            await file.discover();
            expect(f.functionDefinitions).to.eql([{
                name: 'Main',
                offset: getOffset(1, 25)
            }, {
                name: 'Main2',
                offset: getOffset(1, 41)
            }]);
        });

        it('works for xml files', async () => {
            f.filePath = filePath.replace('.brs', '.xml');
            setFileContents(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent" extends="Task" >
                <script type="text/brightscript">
                    <![CDATA[
                        sub DoSomething()
                        
                        end sub
                    ]]>
                </script>
                </component>
            `);
            await file.discover();
            expect(f.functionDefinitions).to.eql([{
                name: 'DoSomething',
                offset: getOffset(4, 28)
            }]);
        });
    });

    describe('findFunctionCalls', () => {
        it('works for brs files', async () => {
            setFileContents(`
                'should not match on "main"
                sub main()
                    doSomething()
                    'should not match on "function"
                    func = function()
                        doSomethingInner()
                    end function
                end sub
            `);
            await file.discover();
            expect(f.functionCalls).to.eql([{
                name: 'doSomething',
                offset: getOffset(3, 20)
            }, {
                name: 'doSomethingInner',
                offset: getOffset(6, 24)
            }]);
        });

        it('finds function calls in xml files', async () => {
            f.filePath = filePath.replace('.brs', '.xml');
            setFileContents(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent" extends="Task" >
                <script type="text/brightscript">
                    <![CDATA[
                        sub init()
                            DoSomething()
                        end sub
                    ]]>
                </script>
                </component>
            `);
            await file.discover();
            expect(f.functionCalls).to.eql([{
                name: 'DoSomething',
                offset: getOffset(5, 28)
            }]);
        });
    });

    describe('findComponentDefinitions', () => {
        it('finds component name', async () => {
            f.filePath = filePath.replace('.brs', '.xml');
            setFileContents(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent">
                </component>
            `);
            await file.discover();
            expect(f.componentDeclarations).to.eql([{
                name: 'CustomComponent',
                offset: getOffset(1, 33)
            }]);
        });
    });

    describe('findComponentReferences', () => {
        it('finds component name from `extends` attribute', async () => {
            f.filePath = filePath.replace('.brs', '.xml');
            setFileContents(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent" extends="ParentComponent" >
                </component>
            `);
            await file.discover();
            expect(f.componentReferences).to.eql([{
                name: 'ParentComponent',
                offset: getOffset(1, 59)
            }]);
        });

        it('finds component name in `createObject`', async () => {
            setFileContents(`
                sub main()
                    'normal
                    createObject("RoSGNode", "Component1")
                    'extra spaces
                    createObject ( "RoSGNode" , "Component2" )
                    'lower rosgnode
                    createObject("rosgnode","Component3")
                end sub
            `);
            await file.discover();
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
            setFileContents(`
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
            await file.discover();
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
            f.filePath = filePath.replace('.brs', '.xml');
            setFileContents(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent">
                    <children>
                        <CustomComponent2></CustomComponent2>
                        <MarkupList />
                        <SomeCustomComponent />
                    </children>
                </component>
            `);
            await file.discover();
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
            f.filePath = filePath.replace('.brs', '.xml');
            setFileContents(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent">
                    <script uri="pkg:/source/lib.brs" />
                    <script uri="pkg:/components/folder1/somelib.brs" />
                    <Poster uri="pkg:/images/CoolPhoto.png" />
                </component>
            `);
            await file.discover();
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
            f.filePath = filePath.replace('.brs', '.xml');
            setFileContents(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent">
                    <script uri="../lib.brs" />
                    <script uri="comp.brs" />
                </component>
            `);
            await file.discover();
            expect(file.fileReferences).to.eql([{
                path: '../lib.brs',
                offset: getOffset(2, 33)
            }, {
                path: 'comp.brs',
                offset: getOffset(3, 33)
            }]);
        });

        it('finds absolute file paths in CDATA xml block', async () => {
            f.filePath = filePath.replace('.brs', '.xml');
            setFileContents(`<?xml version="1.0" encoding="utf-8" ?>
                <component name="CustomComponent"> 
                    <script type="text/brightscript">
                        <![CDATA[
                            sub DoSomething()
                                thePath = "pkg:/source/lib.brs"
                            end sub
                        ]]>
                    </script>
                </component>
            `);
            await file.discover();
            expect(file.fileReferences).to.eql([{
                path: 'pkg:/source/lib.brs',
                offset: getOffset(5, 43)
            }]);
        });

        it('finds pkg paths in brs files', async () => {
            setFileContents(`
                sub main()
                    filePath = "pkg:/images/CoolPhoto.brs"
                end sub
            `);
            await file.discover();
            expect(file.fileReferences).to.eql([{
                path: 'pkg:/images/CoolPhoto.brs',
                offset: getOffset(2, 32)
            }]);
        });
    });
    describe('applyEdits', () => {
        it('leaves file intact with no edits', async () => {
            file.fileContents = 'hello world';
            file.applyEdits();
            expect(file.fileContents).to.equal('hello world');
        });

        it('applies zero-length edit as an insert', async () => {
            file.fileContents = 'hello world';
            file.addEdit(5, 5, ' my');
            file.applyEdits();
            expect(file.fileContents).to.equal('hello my world');
        });

        it('removes text with zero-length edit', async () => {
            file.fileContents = 'hello world';
            file.addEdit(5, 11, '');
            file.applyEdits();
            expect(file.fileContents).to.equal('hello');
        });

        it('replaces text', async () => {
            file.fileContents = 'hello Jim, how are you';
            file.addEdit(6, 9, 'Michael');
            file.applyEdits();
            expect(file.fileContents).to.equal('hello Michael, how are you');
        });

        it('works at beginning of string', () => {
            file.fileContents = 'hello world';
            file.addEdit(0, 5, 'goodbye');
            file.applyEdits();
            expect(file.fileContents).to.equal('goodbye world');
        });

        it('works with out-of-order edits', () => {
            file.fileContents = 'one two three';
            //middle
            file.addEdit(4, 7, 'twelve');
            //last
            file.addEdit(8, 13, 'thirteen');
            //first
            file.addEdit(0, 3, 'eleven');

            file.applyEdits();
            expect(file.fileContents).to.equal('eleven twelve thirteen');
        });
    });
});

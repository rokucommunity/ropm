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

    function rangeToOffsets(startLineIndex: number, startColumnIndex: number, endLineIndex: number, endColumnIndex: number) {
        return {
            offsetBegin: getOffset(startLineIndex, startColumnIndex),
            offsetEnd: getOffset(endLineIndex, endColumnIndex)
        };
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
                ...rangeToOffsets(1, 25, 1, 29)
            }, {
                name: 'Main2',
                ...rangeToOffsets(2, 25, 2, 30)
            }]);
        });

        it('finds multiple functions on a line (probably not possible, but why not...)', async () => {
            setFileContents(`
                function Main() function Main2()
            `);
            await file.discover();
            expect(f.functionDefinitions).to.eql([{
                name: 'Main',
                ...rangeToOffsets(1, 25, 1, 29)
            }, {
                name: 'Main2',
                ...rangeToOffsets(1, 41, 1, 46)
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
                ...rangeToOffsets(4, 28, 4, 39)
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
                ...rangeToOffsets(3, 20, 3, 31)
            }, {
                name: 'doSomethingInner',
                ...rangeToOffsets(6, 24, 6, 40)
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
                ...rangeToOffsets(5, 28, 5, 39)
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
                ...rangeToOffsets(1, 33, 1, 48)
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
                ...rangeToOffsets(1, 59, 1, 74)
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
                ...rangeToOffsets(3, 46, 3, 56)
            }, {
                name: 'Component2',
                ...rangeToOffsets(5, 49, 5, 59)
            }, {
                name: 'Component3',
                ...rangeToOffsets(7, 45, 7, 55)
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
                ...rangeToOffsets(3, 38, 3, 48)
            }, {
                name: 'Component2',
                ...rangeToOffsets(6, 42, 6, 52)
            }, {
                name: 'Component3',
                ...rangeToOffsets(10, 25, 10, 35)
            }, {
                name: 'Component4',
                ...rangeToOffsets(14, 43, 14, 53)
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
                    if (a.offsetBegin > b.offsetBegin) {
                        return 1;
                    } else if (a.offsetBegin < b.offsetBegin) {
                        return -1;
                    }
                    return 0;
                })
            ).to.eql([{
                name: 'CustomComponent2',
                ...rangeToOffsets(3, 25, 3, 41)
            }, {
                name: 'CustomComponent2',
                ...rangeToOffsets(3, 44, 3, 60)
            }, {
                name: 'MarkupList',
                ...rangeToOffsets(4, 25, 4, 35)
            }, {
                name: 'SomeCustomComponent',
                ...rangeToOffsets(5, 25, 5, 44)
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

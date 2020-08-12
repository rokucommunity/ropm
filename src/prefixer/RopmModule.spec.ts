import * as fsExtra from 'fs-extra';
import { createSandbox } from 'sinon';
import { RopmModule } from "./RopmModule";
import { expect } from "chai";
const sinon = createSandbox();

describe('RopmModule', () => {
    let vfs = {};
    beforeEach(() => {
        vfs = {};
        sinon.stub(fsExtra, 'readFile').callsFake((filePath) => {
            return Promise.resolve(Buffer.from(vfs[filePath as string]));
        });
        sinon.stub(fsExtra, 'writeFile').callsFake((filePath, fileContents) => {
            vfs[filePath as string] = fileContents;
        });
    });
    afterEach(() => {
        sinon.restore();
    });

    describe('process', () => {
        it('applies a prefix to all functions of a program', async () => {
            vfs = {
                'source/main.brs': `
                    sub main()
                        SanitizeText("123")
                    end sub
                    sub SanitizeText(text as string)
                        PrintMessage("Sanitizing text: " + text)
                    end sub
                `,
                'source/lib.brs': `
                    sub PrintMessage(message)
                        print message
                    end sub
                `
            };
            const module = new RopmModule([
                'source/main.brs',
                'source/lib.brs'
            ], 'textlib', {});
            await module.process();

            vfsEqual('source/main.brs', `
                sub main()
                    textlib_SanitizeText("123")
                end sub
                sub textlib_SanitizeText(text as string)
                    textlib_PrintMessage("Sanitizing text: " + text)
                end sub
            `);

            vfsEqual('source/lib.brs', `
                sub textlib_PrintMessage(message)
                    print message
                end sub
            `);
        });

        it('applies a prefix to components and their usage', async () => {
            vfs = {
                'components/Component1.xml': trim`
                    <?xml version="1.0" encoding="utf-8" ?>
                    <component name="Component1" extends="Component2" >
                    </component>
                `,
                'components/Component2.xml': trim`
                    <?xml version="1.0" encoding="utf-8" ?>
                    <component name="Component2" extends="Task" >
                        <children>
                            <Component1 />
                            <Component2>
                            </Component2>
                        </children>
                    </component>
                `,
                'source/main.brs': `
                    sub main()
                        comp = CreateObject("rosgnode", "Component1")
                        comp.CreateChild("Component2")
                    end sub
                `
            };
            const module = new RopmModule([
                'components/Component1.xml',
                'components/Component2.xml',
                'source/main.brs'
            ], 'textlib', {});
            await module.process();

            vfsEqual('components/Component1.xml', `
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="textlib_Component1" extends="textlib_Component2" >
                </component>
            `);
            vfsEqual('components/Component2.xml', `
                <?xml version="1.0" encoding="utf-8" ?>
                <component name="textlib_Component2" extends="Task" >
                    <children>
                        <textlib_Component1 />
                        <textlib_Component2>
                        </textlib_Component2>
                    </children>
                </component>
            `);

            vfsEqual('source/main.brs', `
                sub main()
                    comp = CreateObject("rosgnode", "textlib_Component1")
                    comp.CreateChild("textlib_Component2")
                end sub
            `);
        });

        it('renames dependency prefixes', async () => {
            vfs = {
                'source/main.brs': `
                    sub PrintValue()
                        print module1_GetValue()
                    end sub
                `
            };
            const module = new RopmModule([
                'source/main.brs'
            ], 'textlib', {
                'module1': 'module2'
            });
            await module.process();

            vfsEqual('source/main.brs', `
                sub textlib_PrintValue()
                    print module2_GetValue()
                end sub
            `);
        });

        /**
         * This test converts the dependency name "module1" to "module2", and names this package "module1"
         */
        it('handles module prefix swapping', async () => {
            vfs = {
                'source/main.brs': `
                    sub GetPromise()
                        return module1_createTaskPromise("TaskName", {})
                    end sub
                `
            };
            const module = new RopmModule([
                'source/main.brs'
            ], 'module1', {
                'module1': 'module2'
            });
            await module.process();

            vfsEqual('source/main.brs', `
                sub module1_GetPromise()
                    return module2_createTaskPromise("TaskName", {})
                end sub
            `);
        });

        /**
         * Converts dependency prefix "module1" to "module2", and "module2" to "module1"
         */
        it('swaps dependency module prefixes', async () => {
            vfs = {
                'source/main.brs': `
                    sub PrintValues()
                        print module1_GetValue()
                        print module2_GetValue()
                    end sub
                `
            };
            const module = new RopmModule([
                'source/main.brs'
            ], 'textlib', {
                'module1': 'module2',
                'module2': 'module1'
            });
            await module.process();

            vfsEqual('source/main.brs', `
                sub textlib_PrintValues()
                    print module2_GetValue()
                    print module1_GetValue()
                end sub
            `);
        });
    });

    function vfsEqual(path: string, expectedText: string) {
        expect(
            trimLeading(
                vfs[path]
            )
        ).to.equal(
            trimLeading(expectedText)
        );
    }
});


function trim(text: TemplateStringsArray, ...args) {
    return trimLeading(text[0]);
}


/**
 * Trim leading whitespace for every line (to make test writing cleaner
 */
function trimLeading(text: string) {
    let lines = text.split(/\r?\n/);
    let minIndent = Number.MAX_SAFE_INTEGER;

    //skip leading empty lines
    while (lines[0]?.trim().length === 0) {
        lines.splice(0, 1);
    }

    for (let line of lines) {
        let trimmedLine = line.trimLeft();
        //skip empty lines
        if (trimmedLine.length === 0) {
            continue;
        }
        let leadingSpaceCount = line.length - trimmedLine.length;
        if (leadingSpaceCount < minIndent) {
            minIndent = leadingSpaceCount;
        }
    }

    //apply the trim to each line
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].substring(minIndent);
    }
    return lines.join('\n');
}


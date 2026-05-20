import { expect } from 'chai';
import * as xmlParser from '@xml-tools/parser';
import { buildAst } from './XmlAst';
import type { XMLDocument } from './XmlAst';

function parse(text: string): XMLDocument {
    const { cst, tokenVector } = xmlParser.parse(text);
    return buildAst(cst as any, tokenVector);
}

describe('prefixer/XmlAst', () => {

    describe('buildAst', () => {
        it('yields a defensive empty root element on empty input (matches @xml-tools/ast)', () => {
            const root = parse('').rootElement!;
            expect(root.name).to.be.undefined;
            expect(root.attributes).to.eql([]);
            expect(root.subElements).to.eql([]);
            expect(root.syntax.openName).to.be.undefined;
            expect(root.syntax.closeName).to.be.undefined;
        });

        it('does not throw on malformed XML', () => {
            const doc = parse('<component name="A"');
            expect(doc.rootElement?.name).to.equal('component');
            expect(doc.rootElement?.attributes[0]?.key).to.equal('name');
            expect(doc.rootElement?.attributes[0]?.value).to.equal('A');
        });

        it('tolerates a CST shape with no children', () => {
            const doc = buildAst({});
            expect(doc.rootElement).to.be.undefined;
        });

        it('ignores an XML prolog and still resolves the root element', () => {
            const doc = parse('<?xml version="1.0" encoding="utf-8"?><component name="A"/>');
            expect(doc.rootElement?.name).to.equal('component');
            expect(doc.rootElement?.attributes[0]?.key).to.equal('name');
            expect(doc.rootElement?.attributes[0]?.value).to.equal('A');
        });
    });

    describe('XMLElement', () => {
        it('captures name, attributes, and the opening token offset on a self-closing element', () => {
            const text = '<component name="A" extends="B"/>';
            const doc = parse(text);
            const root = doc.rootElement!;
            expect(root.name).to.equal('component');
            expect(root.subElements).to.eql([]);
            expect(root.syntax.openName?.image).to.equal('component');
            expect(root.syntax.openName?.startOffset).to.equal(text.indexOf('component'));
            // self-closing => no closeName
            expect(root.syntax.closeName).to.be.undefined;
        });

        it('captures both opening and closing name tokens on a paired element', () => {
            const text = '<component></component>';
            const doc = parse(text);
            const root = doc.rootElement!;
            expect(root.syntax.openName?.image).to.equal('component');
            expect(root.syntax.openName?.startOffset).to.equal(1);
            expect(root.syntax.closeName?.image).to.equal('component');
            // </component> starts at index 13, the name itself at 15
            expect(root.syntax.closeName?.startOffset).to.equal(text.lastIndexOf('component'));
        });

        it('collects child elements across multiple content blocks (text/comments interleaved)', () => {
            const text = `<component>
                text-before
                <interface></interface>
                <!-- a comment -->
                text-between
                <children></children>
                <![CDATA[ raw text ]]>
                text-after
            </component>`;
            const root = parse(text).rootElement!;
            expect(root.subElements.map(x => x.name)).to.eql(['interface', 'children']);
        });

        it('builds nested subElements recursively', () => {
            const root = parse('<a><b><c/></b><d/></a>').rootElement!;
            expect(root.name).to.equal('a');
            expect(root.subElements.map(x => x.name)).to.eql(['b', 'd']);
            expect(root.subElements[0].subElements.map(x => x.name)).to.eql(['c']);
        });

        it('preserves namespace prefixes in element names', () => {
            const root = parse('<svg:rect width="10"/>').rootElement!;
            expect(root.name).to.equal('svg:rect');
        });

        it('does not expose textContents, position, prolog, or namespace metadata', () => {
            const root = parse('<a foo="bar">some text</a>').rootElement! as any;
            // sanity: shim surface excludes these — confirming they're not present so consumers don't trip
            expect(root).to.not.have.property('textContents');
            expect(root).to.not.have.property('position');
            expect(root).to.not.have.property('namespaces');
            expect(root).to.not.have.property('ns');
            expect(root).to.not.have.property('parent');
        });
    });

    describe('XMLAttribute', () => {
        it('strips surrounding double quotes from value, keeps them in syntax.value.image', () => {
            const text = '<component name="A"/>';
            const attr = parse(text).rootElement!.attributes[0];
            expect(attr.key).to.equal('name');
            expect(attr.value).to.equal('A');
            expect(attr.syntax.value?.image).to.equal('"A"');
            //consumer adds +1 to step past the opening quote
            expect(attr.syntax.value?.startOffset).to.equal(text.indexOf('"A"'));
        });

        it('strips surrounding single quotes from value', () => {
            const attr = parse(`<component name='A'/>`).rootElement!.attributes[0];
            expect(attr.value).to.equal('A');
            expect(attr.syntax.value?.image).to.equal(`'A'`);
        });

        it('handles an empty attribute value', () => {
            const attr = parse('<component name=""/>').rootElement!.attributes[0];
            expect(attr.value).to.equal('');
            expect(attr.syntax.value?.image).to.equal('""');
        });

        it('returns an empty attributes array when the element has none', () => {
            expect(parse('<component/>').rootElement!.attributes).to.eql([]);
        });

        it('preserves attribute order and supports namespace-prefixed keys', () => {
            const attrs = parse('<a xmlns:x="urn:x" x:foo="1" bar="2"/>').rootElement!.attributes;
            expect(attrs.map(x => x.key)).to.eql(['xmlns:x', 'x:foo', 'bar']);
            expect(attrs.map(x => x.value)).to.eql(['urn:x', '1', '2']);
        });

        it('does not expose position or parent on attributes', () => {
            const attr = parse('<a foo="bar"/>').rootElement!.attributes[0] as any;
            expect(attr).to.not.have.property('position');
            expect(attr).to.not.have.property('parent');
        });
    });

    describe('round-trip against File.ts read patterns', () => {
        // These are the exact access patterns that src/prefixer/File.ts uses.
        // If any of them blow up here, File.ts will blow up at runtime.
        it('supports rootElement.attributes.find(x => x.key === ...)', () => {
            const text = '<component name="MyComponent" extends="Group"/>';
            const root = parse(text).rootElement!;
            const nameAttr = root.attributes.find(x => x.key?.toLowerCase() === 'name');
            expect(nameAttr?.value).to.equal('MyComponent');
            //File.ts: nameAttribute.syntax.value.startOffset + 1
            expect(nameAttr!.syntax.value!.startOffset + 1).to.equal(text.indexOf('MyComponent'));
        });

        it('supports finding <interface> and walking its child <function>/<field> elements', () => {
            const text = `<component name="A">
                <interface>
                    <function name="onClick"/>
                    <field id="text" onchange="onTextChange"/>
                </interface>
            </component>`;
            const root = parse(text).rootElement!;
            const iface = root.subElements.find(x => x.name?.toLowerCase() === 'interface')!;
            expect(iface).to.not.be.undefined;

            const fn = iface.subElements.find(x => x.name === 'function')!;
            const fnName = fn.attributes.find(x => x.key === 'name')!;
            expect(fnName.value).to.equal('onClick');
            expect(fnName.syntax.value!.startOffset + 1).to.equal(text.indexOf('onClick'));

            const field = iface.subElements.find(x => x.name === 'field')!;
            const onChange = field.attributes.find(x => x.key === 'onchange')!;
            expect(onChange.value).to.equal('onTextChange');
            expect(onChange.syntax.value!.startOffset + 1).to.equal(text.indexOf('onTextChange'));
        });

        it('supports walking <children> and reading openName/closeName offsets', () => {
            const text = `<component><children><MyChild></MyChild></children></component>`;
            const root = parse(text).rootElement!;
            const children = root.subElements.find(x => x.name === 'children')!;
            const myChild = children.subElements[0];
            expect(myChild.syntax.openName?.image).to.equal('MyChild');
            expect(myChild.syntax.openName?.startOffset).to.equal(text.indexOf('MyChild'));
            expect(myChild.syntax.closeName?.image).to.equal('MyChild');
            expect(myChild.syntax.closeName?.startOffset).to.equal(text.lastIndexOf('MyChild'));
        });

        it('supports walking <script uri="..."> attribute offsets', () => {
            const text = `<component><script uri="pkg:/source/main.brs"/></component>`;
            const root = parse(text).rootElement!;
            const script = root.subElements.find(x => x.name === 'script')!;
            const uri = script.attributes.find(x => x.key === 'uri')!;
            expect(uri.value).to.equal('pkg:/source/main.brs');
            expect(uri.syntax.value!.startOffset + 1).to.equal(text.indexOf('pkg:/source/main.brs'));
        });
    });
});

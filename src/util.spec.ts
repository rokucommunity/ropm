import { util } from './util';
import { expect } from 'chai';

describe('Util', () => {
    describe('getModuleName', () => {
        it('finds non-namespace names', () => {
            expect(util.getModuleName('fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('some_folder/fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('some_folder\\fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('../fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('..\\fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('C:\\projects\\some_folder\\fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('C:/projects/some_folder/fs-extra')).to.equal('fs-extra');
            expect(util.getModuleName('/usr/someone/projects/some_folder/fs-extra')).to.equal('fs-extra');
        });

        it('finds namespaced names from module names', () => {
            expect(util.getModuleName('@namespace/fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('@namespace\\fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('../@namespace/fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('..\\@namespace\\fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('C:\\projects\\@namespace\\fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('C:/projects/@namespace/fs-extra')).to.equal('@namespace/fs-extra');
            expect(util.getModuleName('/usr/someone/projects/@namespace/fs-extra')).to.equal('@namespace/fs-extra');
        });

        it('returns undefined for invalid or empty input', () => {
            expect(util.getModuleName('')).to.be.undefined;
            expect(util.getModuleName(false as any)).to.be.undefined;
            expect(util.getModuleName({} as any)).to.be.undefined;
        });
    });

    describe('getRopmNameFromModuleName', () => {
        it('does nothing with already-valid names', () => {
            expect(util.getRopmNameFromModuleName('module')).to.equal('module');
            expect(util.getRopmNameFromModuleName('module_1')).to.equal('module_1');
            expect(util.getRopmNameFromModuleName('some_module')).to.equal('some_module');
        });

        it('replaces invalid characters', () => {
            expect(util.getRopmNameFromModuleName('@company')).to.equal('company');
            expect(util.getRopmNameFromModuleName('.:module')).to.equal('module');
            expect(util.getRopmNameFromModuleName('mod-ule')).to.equal('module');
            expect(util.getRopmNameFromModuleName(' module ')).to.equal('module');
            expect(util.getRopmNameFromModuleName('\tmodule ')).to.equal('module');
        });

        it('handles scoped packages properly', () => {
            expect(util.getRopmNameFromModuleName('@company/module')).to.equal('company_module');
        });

        it('prefixes number-first names with underscore', () => {
            expect(util.getRopmNameFromModuleName('123module')).to.equal('_123module');
        });

        it('converts nonstandard alpha characters into standard onces', () => {
            expect(util.getRopmNameFromModuleName('ỆᶍǍᶆṔƚÉáéíóúýčďěňřšťžů')).to.equal('exampleaeiouycdenrstzu');
        });
    });
});

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
});

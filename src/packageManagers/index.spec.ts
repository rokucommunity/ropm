import { expect } from 'chai';
import { getPackageManager, NpmPackageManager, PnpmPackageManager } from './index';

describe('getPackageManager', () => {
    it('defaults to npm when no name is provided', () => {
        const manager = getPackageManager();
        expect(manager).to.be.instanceof(NpmPackageManager);
        expect(manager.name).to.eql('npm');
    });

    it('returns npm when "npm" is provided', () => {
        expect(getPackageManager('npm')).to.be.instanceof(NpmPackageManager);
    });

    it('returns pnpm when "pnpm" is provided', () => {
        const manager = getPackageManager('pnpm');
        expect(manager).to.be.instanceof(PnpmPackageManager);
        expect(manager.name).to.eql('pnpm');
    });

    it('throws a helpful error on unknown package manager', () => {
        expect(() => getPackageManager('yarn' as any)).to.throw(/Unsupported package manager/);
    });
});

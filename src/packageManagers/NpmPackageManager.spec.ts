import { expect } from 'chai';
import { createSandbox } from 'sinon';
import { util } from '../util';
import { NpmPackageManager } from './NpmPackageManager';

const sinon = createSandbox();

describe('NpmPackageManager', () => {
    let manager: NpmPackageManager;

    beforeEach(() => {
        manager = new NpmPackageManager();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('has the name "npm"', () => {
        expect(manager.name).to.eql('npm');
    });

    describe('binary name', () => {
        it('uses `npm.cmd` on windows', async () => {
            const stub = sinon.stub(util, 'spawnAsync').returns(Promise.resolve());
            sinon.stub(util, 'isWindowsPlatform').returns(true);
            await manager.install([], { cwd: process.cwd() });
            expect(stub.getCalls()[0].args[0]).to.eql('npm.cmd');
        });

        it('uses `npm` on non-windows', async () => {
            const stub = sinon.stub(util, 'spawnAsync').returns(Promise.resolve());
            sinon.stub(util, 'isWindowsPlatform').returns(false);
            await manager.install([], { cwd: process.cwd() });
            expect(stub.getCalls()[0].args[0]).to.eql('npm');
        });
    });

    describe('init', () => {
        it('passes `--force` when force is true', async () => {
            const stub = sinon.stub(util, 'spawnAsync').returns(Promise.resolve());
            await manager.init({ cwd: process.cwd(), force: true });
            expect(stub.getCalls()[0].args[1]).to.eql(['init', '--force']);
        });

        it('omits `--force` when force is false', async () => {
            const stub = sinon.stub(util, 'spawnAsync').returns(Promise.resolve());
            await manager.init({ cwd: process.cwd(), force: false });
            expect(stub.getCalls()[0].args[1]).to.eql(['init']);
        });
    });
});

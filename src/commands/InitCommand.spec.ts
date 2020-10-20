import { expect } from 'chai';
import { createSandbox } from 'sinon';
const sinon = createSandbox();
import { tempDir } from '../TestHelpers.spec';
import { util } from '../util';
import { InitCommand, InitCommandArgs } from './InitCommand';
import * as fsExtra from 'fs-extra';

describe('InitCommand', () => {
    let command: InitCommand;
    let args: InitCommandArgs;
    const cwd = tempDir;

    beforeEach(() => {
        args = {
            cwd: cwd
        };
        command = new InitCommand(args);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('prompts for rootDir on fresh install with no package.json present', async () => {
        const stub = sinon.stub(util, 'getUserInput').returns(Promise.resolve('abc'));
        //no-op npm for this test
        sinon.stub(util, 'spawnNpmAsync').returns(Promise.resolve());
        await command.run();
        expect(stub.callCount).to.equal(1);
        expect(fsExtra.readJsonSync(`${cwd}/package.json`)).to.eql({
            ropm: {
                rootDir: 'abc'
            }
        });
    });

    it('prompts for rootDir on fresh install package.json present, but no ropm.rootDir key', async () => {
        fsExtra.writeJsonSync(`${cwd}/package.json`, {});
        const stub = sinon.stub(util, 'getUserInput').returns(Promise.resolve('abc'));
        //no-op npm for this test
        sinon.stub(util, 'spawnNpmAsync').returns(Promise.resolve());
        await command.run();
        expect(stub.callCount).to.equal(1);
        expect(fsExtra.readJsonSync(`${cwd}/package.json`)).to.eql({
            ropm: {
                rootDir: 'abc'
            }
        });
    });

    it('does not prompt for rootDir when ropm.rootDir exists in package.json', async () => {
        fsExtra.writeJsonSync(`${cwd}/package.json`, {
            ropm: {
                rootDir: '123'
            }
        });
        const stub = sinon.stub(util, 'getUserInput').returns(Promise.resolve('abc'));
        //no-op npm for this test
        sinon.stub(util, 'spawnNpmAsync').returns(Promise.resolve());
        await command.run();
        expect(stub.callCount).to.equal(0);
        expect(fsExtra.readJsonSync(`${cwd}/package.json`)).to.eql({
            ropm: {
                rootDir: '123'
            }
        });
    });
});

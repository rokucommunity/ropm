import { tempDir, mergePackageJson } from '../TestHelpers.spec';
import * as fsExtra from 'fs-extra';
import { UninstallCommand } from './UninstallCommand';
import { expect } from 'chai';

describe('UninstallCommand', () => {
    const appDir = `${tempDir}/app`;
    it.only('removes from package.json', async () => {
        mergePackageJson(appDir, {
            dependencies: {
                promise: `file:/${tempDir}/proimse`
            }
        });
        mergePackageJson(`${tempDir}/proimse`, {
            name: 'promise',
            version: '1.0.0'
        });
        fsExtra.ensureDirSync(`${appDir}/source/roku_modules/promise`);
        fsExtra.writeFileSync(`${appDir}/source/roku_modules/promise/promise.brs`, '');
        const command = new UninstallCommand({
            cwd: appDir,
            packages: [
                'promise'
            ]
        });
        await command.run();

        expect(fsExtra.pathExistsSync(`${appDir}/source/roku_modules/promise`)).to.be.false;
    });

});

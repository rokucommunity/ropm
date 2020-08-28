import * as fsExtra from 'fs-extra';
import { tempDir, mergePackageJson } from '../TestHelpers.spec';
import { CleanCommand } from './CleanCommand';
import { expect } from 'chai';
import * as path from 'path';

describe.only('CleanCommand', () => {
    const appDir = `${tempDir}/app`;

    it('clears empty roku_modules folders', async () => {
        const folders = [
            `${appDir}/source/roku_modules`,
            `${appDir}/components/roku_modules`
        ];
        fsExtra.ensureDirSync(folders[0]);
        fsExtra.ensureDirSync(folders[1]);
        const command = new CleanCommand({
            cwd: appDir
        });
        await command.run();
        expect(fsExtra.pathExistsSync(folders[0])).to.be.false;
        expect(fsExtra.pathExistsSync(folders[1])).to.be.false;
    });

    it('clears non-empty roku_modules folders', async () => {
        const filePath = `${appDir}/source/roku_modules/promise/file.brs`;
        fsExtra.ensureDirSync(path.dirname(filePath));
        fsExtra.writeFileSync(filePath, '');
        const command = new CleanCommand({
            cwd: appDir
        });
        await command.run();
        expect(fsExtra.pathExistsSync(filePath)).to.be.false;
    });

    it('cleans with custom rootDir path', async () => {
        mergePackageJson(appDir, {
            ropm: {
                //specify custom rootDir
                rootDir: `${appDir}/src`
            }
        });
        const filePath = `${appDir}/src/source/roku_modules/promise/file.brs`;
        fsExtra.ensureDirSync(path.dirname(filePath));
        fsExtra.writeFileSync(filePath, '');
        const command = new CleanCommand({
            cwd: appDir
        });
        await command.run();
        expect(fsExtra.pathExistsSync(filePath)).to.be.false;
    });
});

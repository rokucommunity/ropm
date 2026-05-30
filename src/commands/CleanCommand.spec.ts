import * as fsExtra from 'fs-extra';
import { tempDir, mergePackageJson } from '../TestHelpers.spec';
import { CleanCommand } from './CleanCommand';
import { expect } from 'chai';
import * as path from 'path';

describe('CleanCommand', () => {
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

    it('honors rootDir arg over package.json ropm.rootDir', async () => {
        mergePackageJson(appDir, {
            ropm: {
                //specify custom rootDir that should be ignored
                rootDir: `${appDir}/src`
            }
        });
        // Create a file in the rootDir specified in package.json
        const ignoredFilePath = `${appDir}/src/source/roku_modules/promise/file.brs`;
        fsExtra.ensureDirSync(path.dirname(ignoredFilePath));
        fsExtra.writeFileSync(ignoredFilePath, '');

        // Create a file in the rootDir passed as argument
        const targetFilePath = `${appDir}/other/source/roku_modules/promise/file.brs`;
        fsExtra.ensureDirSync(path.dirname(targetFilePath));
        fsExtra.writeFileSync(targetFilePath, '');

        const command = new CleanCommand({
            cwd: appDir,
            rootDir: 'other'
        });
        await command.run();

        // The file in 'other' directory should be deleted
        expect(fsExtra.pathExistsSync(targetFilePath)).to.be.false;
        // The file in 'src' directory should NOT be deleted
        expect(fsExtra.pathExistsSync(ignoredFilePath)).to.be.true;
    });
});

import * as yargs from 'yargs';
import { InstallCommand } from './commands/InstallCommand';
import { CopyCommand } from './commands/CopyCommand';

// eslint-disable-next-line
yargs
    .command('install [packages..]', 'Download Roku dependencies into the roku_modules folder', (builder) => {
        return builder;
    }, (args: any) => {
        let install = new InstallCommand(args);
        install.run();//eslint-disable-line
    })

    .command('copy [targetDir]', 'Copy the roku_modules files overtop of a target directory', (builder) => {
        return builder;
    }, (args: any) => {
        let command = new CopyCommand(args);
        command.run();
    })

    .argv;

import * as yargs from 'yargs';
import { InstallCommand } from './commands/InstallCommand';

// eslint-disable-next-line
yargs
    .command('install [packages..]', 'Download Roku dependencies into the roku_modules folder', (builder) => {
        return builder;
    }, (args: any) => {
        let install = new InstallCommand(args);
        install.run();//eslint-disable-line
    })
    .argv;

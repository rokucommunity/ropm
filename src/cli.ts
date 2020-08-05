/* eslint-disable @typescript-eslint/no-floating-promises */
import * as yargs from 'yargs';
import { InstallCommand } from './commands/InstallCommand';
import { InitCommand } from './commands/InitCommand';

// eslint-disable-next-line
yargs
    .command('init', 'Initialize a new package.json file for ropm', (builder) => {
        return builder
            .option('cwd', { type: 'string', description: 'The current working directory that should be used to run the command' })
            .option('force', { type: 'boolean', description: 'Skip all questions', default: false })
            .alias('f', 'force')
            .alias('yes', 'force')
            .alias('y', 'force');

    }, (args: any) => {
        let command = new InitCommand(args);
        command.run();
    })
    .command('install [packages..]', 'Download Roku dependencies into the roku_modules folder', (builder) => {
        return builder
            .option('cwd', { type: 'string', description: 'The current working directory that should be used to run the command' });
    }, (args: any) => {
        let command = new InstallCommand(args);
        command.run();
    })
    .argv;

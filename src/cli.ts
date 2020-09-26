#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-floating-promises */
import * as yargs from 'yargs';
import { InstallCommand } from './commands/InstallCommand';
import { InitCommand } from './commands/InitCommand';
import { CleanCommand } from './commands/CleanCommand';
import { UninstallCommand } from './commands/UninstallCommand';
import { CopyCommand } from './commands/CopyCommand';

new Promise((resolve, reject) => {
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
            const command = new InitCommand(args);
            command.run().then(resolve, reject);
        })

        .command([
            'install [packages..]',
            'i'
        ], 'Download Roku dependencies into the roku_modules folder', (builder) => {
            return builder
                .option('cwd', { type: 'string', description: 'The current working directory that should be used to run the command' });
        }, (args: any) => {
            console.error('running');
            const command = new InstallCommand(args);
            command.run().then(resolve, reject);
        })

        .command('clean', 'Remove all roku_module files and folders from the root directory', (builder) => {
            return builder
                .option('cwd', { type: 'string', description: 'The current working directory that should be used to run the command' });
        }, (args: any) => {
            const command = new CleanCommand(args);
            command.run().then(resolve, reject);
        })

        .command('copy', 'Runs `clean` and then installs all ropm modules. Operates solely with the modules already downloaded, and will not download new modules from the registry.', (builder) => {
            return builder
                .option('cwd', { type: 'string', description: 'The current working directory that should be used to run the command' });
        }, (args: any) => {
            const command = new CopyCommand(args);
            command.run().then(resolve, reject);
        })

        .command([
            'uninstall [packages..]',
            'un', 'unlink', 'remove', 'rm', 'r'
        ], 'Uninstall the specified dependencies', (builder) => {
            return builder
                .option('cwd', { type: 'string', description: 'The current working directory that should be used to run the command' });
        }, (args: any) => {
            const command = new UninstallCommand(args);
            command.run().then(resolve, reject);
        })

        .argv;
}).catch((e) => {
    console.error(e);
    process.exit(1);
});

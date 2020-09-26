import { InstallCommand } from './InstallCommand';

export class CopyCommand {
    constructor(
        public args: InitCommandArgs
    ) {

    }

    public async run() {
        const installCommand = new InstallCommand(this.args);
        await installCommand.run(false);
    }
}

export interface InitCommandArgs {
    /**
     * The current working directory for the command.
     */
    cwd?: string;
}

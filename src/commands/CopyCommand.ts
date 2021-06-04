import { InstallCommand } from './InstallCommand';

export class CopyCommand {
    constructor(
        public args: CopyCommandArgs
    ) {

    }

    public async run() {
        const installCommand = new InstallCommand(this.args);
        await installCommand.run(false);
    }
}

export interface CopyCommandArgs {
    /**
     * The current working directory for the command.
     */
    cwd?: string;
    /**
     * Dependencies installation location
     */
    rootDir?: string;
}

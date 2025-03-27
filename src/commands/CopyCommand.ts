import type { CommandArgs } from '../util';
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

export interface CopyCommandArgs extends CommandArgs {
    /**
     * Dependencies installation location
     */
    rootDir?: string;
}

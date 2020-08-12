import { RopmModule } from './RopmModule';

export class Prefixer {
    public modules = [] as RopmModule[];

    /**
     * Add a new project to the prefixer
     * @param filePaths the list of absolute file paths for this project
     * @param prefix the prefix to give all of this module's own functions and components (and their internal usage)
     * @param prefixMap if this module has its own dependencies, then this prefix map allows us to rename those prefixes
     */
    public addModule(filePaths: string[], prefix: string, prefixMap?: { [currentName: string]: string }) {
        this.modules.push(
            new RopmModule(filePaths, prefix, prefixMap)
        );
    }

}

export interface PrexierArgs {
    prefix: string;
    /**
     * If a module uses dependencies, then it is using those module's prefixes. However, in order to properly resolve
     * dependencies, some of those prefixes may change, so this map describes the original prefix compared to the
     * new prefix that should be used
     */
    dependencyPrefixes: { [currentPrefix: string]: string };
}

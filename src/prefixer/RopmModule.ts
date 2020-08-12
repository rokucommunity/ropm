export class RopmModule {
    constructor(
        private files: string[],
        private prefix: string,
        private prefixMap?: { [currentPrefix: string]: string }
    ) {

    }
}

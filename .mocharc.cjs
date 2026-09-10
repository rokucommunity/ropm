const nodeVersion = +process.versions.node.split('.')[0];
const config = {
    spec: 'src/**/*.spec.ts',
    require: [
        'source-map-support/register',
        'ts-node/register'
    ],
    timeout: 20000,
    fullTrace: true,
    watchExtensions: ['ts']
};
if (nodeVersion >= 22) {
    config['node-option'] = ['no-experimental-strip-types'];
}
module.exports = config;

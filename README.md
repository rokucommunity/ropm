# ropm
A package manager for the Roku platform.

[![build](https://img.shields.io/github/workflow/status/rokucommunity/ropm/build.svg?logo=github)](https://github.com/rokucommunity/ropm/actions?query=workflow%3Abuild)
[![Coverage Status](https://coveralls.io/repos/github/rokucommunity/ropm/badge.svg?branch=master)](https://coveralls.io/github/rokucommunity/ropm?branch=master)
[![NPM Version](https://badge.fury.io/js/ropm.svg?style=flat)](https://npmjs.org/package/ropm)

## Installation
1. Install Node.JS from [here](https://nodejs.org/en/download/)
2. install the `ropm` node module globally
    ```bash
    npm i ropm -g
    ```

## How it works
`ropm` leverages the `npm` module system behind the scenes. This means when you create packages, they should be pushed to an `npm` registry such as [npm](https://www.npmjs.com/), [GitHub packages](https://github.com/features/packages), or even an on-premise registry. 

The Roku project structure is fairly strict. There are a few hard rules:
1. Components must be stored underneath `pkg:/components/`. 
2. Component names must be unique across the entire project
3. Components each create their own scope
4. All files found in `pkg:/source/` are compiled into a single scope.
5. All functions in a scope must have a unique name

This provides unique challenges for a Roku package manager, because file paths alone are not enough to prevent name collisions. `ropm` solves the naming collision problem by rewriting the names of all functions and components in an ropm module.

ropm will create a `roku_modules/<ropm module name>` folder into each corresponding folder of your project. For example, if a ropm module named `FancyWidget` has the following folders:
 - source/
 - components/
 - images/
 - fonts/

then `ropm install` will create the following folders in your project
 - source/roku_modules/FancyWidget
 - components/roku_modules/FancyWidget
 - images/roku_modules/FancyWidget
 - fonts/roku_modules/FancyWidget

## Don't commit roku_modules
The `roku_modules` folders that ropm creates should not be commited to your project repository. Instead, developers should follow the practice of running `ropm install` anytime they fetch code from a repository. Here's how to ignore roku_modules in your `.gitignore file:

**.gitignore**
```gitignore
roku_modules
```

## Do not change the code within roku_modules
The files and folders within the `roku_modules` folders should not be altered at all, as these changes could be erased by future `ropm install` commands. If there are issues with a ropm module you are using, consider reaching out to the module publisher to have them fix and release a new version.

## The algorithm
When running `ropm install`, `ropm` does the following operations for each package:
1. For each folder in the ropm package's `rootDir` folder, delete `${rootDir}/<folder_name>/roku_modules/<package_name>` and then copy all of the files from that corresponding folder.
2. Rewrites function names, function calls, callfunc statements, and component names to have a prefix. (this prevents naming collisions)


## rootDir
By default, ropm will assume the root of your module is where all of your files reside, and will copy every file from your package, with a few exceptions: 

These files will always be excluded (not copied):
 - `package.json`
 - README
 - CHANGES / CHANGELOG / HISTORY
 - LICENSE | LICENCE
 - NOTICE

We recommend excluding extraneous files when you create your package using npm's [files](https://docs.npmjs.com/files/package.json#files) property. In certain situations, you may want to store your files in a subdirectory. In this situation, you should use the `ropm.rootDir` property to specify the relative path to the root of your module. This pattern is useful when you want to publish documentation or other extraneous files with your package, but don't want those files to be included when published to a Roku device. 

Here's an example (**NOTE:** comments are included here for explanation purposes but are invalid within an `package.json`)

```javascript
{
    "name": "quick-list"
    //when npm creates the package, only include these files
    "files": [
        "src/**/*",
        "instructions/**/*"
    ],
    "ropm": {
        //tell ropm that the files for this module reside in the "./src" folder
        "rootDir": "src"
    }
}
```

## How to create a ropm package
The `ropm` package system leverages the [npm](https://www.npmjs.com/) package system from Node.js. Simply follow [these instructions](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages) from npm on how to create a package. Then, be sure to add `"ropm"` to the `keywords` portion of the package.json so that your roku packages are more easily discoverable during searches. A `ropm` search interface is coming in the future to help with discoverability, and adding the tag will be required in order to appear in that interface.

Here's a simple package.json showing how to add the `ropm` keyword:
```javascript
{
    "name": "pretty-list",
    "version": "0.0.1",
    "description": "",
    "keywords": ["ropm"]
    //...additional package.json properties
}
```

## Semantic versioning
It is highly recommended that ropm module authors strictly adhere to the rules of [Semantic Versioning](https://semver.org/). This will provide the most stability and consistency for consumers of your package, as well as provide the highest performance and smallest possible package size. Whenever ropm encounters a project that directly or indirectly requires multiple versions of a ropm module, ropm will attempt to minimize the number of versions of that package. For example, if a project has dependencies that require both version 1.1.0 and 1.4.0 of `promise`, ropm will opt to install 1.4.0 for both projects, since semantic versioning states that the only difference between 1.1.0 and 1.4.0 are new features and bugfixes and will not contain breaking changes.

## CLI commands
### install
Install a Roku package locally in both `node_modules` and `roku_modules`. This also updates the local `package.json` `dependencies` section. 

Examples:
```bash
ropm install roku-promise
```

```bash
ropm install module1 module2 module3
```







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

## Don't commit roku_modules
The `roku_modules` folder should not be commited to your project repository. Instead, developers should follow the practice of running `ropm install` anytime they fetch code from a repository. 

## The algorithm
1. on install, `ropm` copies all of the files from the package into `roku_modules/<package_name>`. 
2. Then `ropm` rewrites function names, function calls, callfunc statements, and component names to have a prefix. (this prevents naming collisions)
3. When you're ready to bundle your project, you can do one of the following:  
    a. run `ropm packge` to generate a full package of your project  
    b. run `ropm copy <target_folder>` to apply the `ropm` file copy logic overtop of your project folder, at any point duing your custom build process.

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
The ropm package system piggybacks on the [npm](https://www.npmjs.com/) package system from Node.js. Simply follow [these instructions](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages) from npm on how to create a package. Then, for discoverability, make sure to add `"ropm"` to the `keywords` portion of the package.json so that your roku packages are more easily discoverable. A `ropm` module search interface is coming in the future to help with discoverability, and adding the tag will be necessary.
```javascript
{
    "name": "pretty-list",
    "version": "0.0.1",
    "description": "",
    "keywords": ["ropm"]
    ...
}



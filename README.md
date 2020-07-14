# ropm
A package manager for the Roku platform.

[![build](https://img.shields.io/github/workflow/status/rokucommunity/ropm/build.svg?logo=github)](https://github.com/rokucommunity/ropm/actions?query=workflow%3Abuild)
[![Coverage Status](https://coveralls.io/repos/github/rokucommunity/ropm/badge.svg?branch=master)](https://coveralls.io/github/rokucommunity/ropm?branch=master)
[![NPM Version](https://badge.fury.io/js/ropm.svg?style=flat)](https://npmjs.org/package/ropm)

## Installation
1. Install Node.JS from [here](https://nodejs.org/en/download/)
2. install the `ropm` node module
    ```bash
    npm i ropm -g
    ```

## How it works
As you probably already know, the Roku project structure is fairly strict. There are a few hard rules:
1. All files found in `pkg:/source/` are compiled into a single scope, and all functions are global to that scope.
2. Components must be stored underneath `pkg:/components/`. 

This makes a simple package manager slightly more difficult, because file paths alone are not enough to prevent name collisions.

**ropm** solves the naming collision problem by rewriting the names of all functions and components in an ropm module.

The `roku_modules` folder should not be commited to your project repository. 

## Usage
Assume you want to use a ropm module called `PrettyList`. `PrettyList` includes a global function called 

## The algorithm
1. on install, `ropm` copies all of the files from the package into  `roku_modules/<package_name>`. 
2. Then `ropm` rewrites function and component names to have a prefix. (this prevents naming collisions)
3. When you're ready to bundle your project, you can do one of the following:  
    a. run `ropm packge` to generate a full package of your project  
    b. run `ropm copy <target_folder>` to apply the `ropm` file copy logic overtop of your project folder, at any point duing your custom build process.

## How to create a ropm package
The ropm 

## Specifying which files to copy to roku_modules
By default, ropm will copy every file from your package, with a few exceptions: 

These files will always be excluded (not copied):
 - `package.json`
 - README
 - CHANGES / CHANGELOG / HISTORY
 - LICENSE | LICENCE
 - NOTICE

As a general rule, we recommend excluding extraneous files when you create your package. However, if you want to manually specify the files to be included, you can set the `ropm.files` property in your package.json. This use case is favorable when installing a package from a git repository or a folder from the local file system.

Here's an example (**NOTE:** comments are included here for explanation but are invalid within an `package.json`)

```javascript
{
    "ropm": {
        "files": [
            //include every file
            "**/*",
            //then exclude the instructions/ folder
            "!instructions"
        ]
    }
}
```




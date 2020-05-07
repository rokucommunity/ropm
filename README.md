# ropm
A package manager for the Roku platform.

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
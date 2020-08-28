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
`ropm` leverages NodeJS's `npm` module system behind the scenes. This means when you create packages, they should be pushed to an `npm` registry such as [npm](https://www.npmjs.com/), [GitHub packages](https://github.com/features/packages), or even an on-premise registry. 

The Roku project structure is fairly strict. There are a few hard rules:
1. Components must be stored underneath `pkg:/components/`. 
2. Component names must be unique across the entire project
3. Components each create their own scope
4. All files found in `pkg:/source/` are compiled into a single scope.
5. All functions in a scope must have a unique name

This provides unique challenges for a Roku package manager, because file paths alone are not enough to prevent symbol collisions. `ropm` solves the naming collision problem by rewriting the names of all functions and components in an ropm module.

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

## Sanitizing module names
Most `npm`-style package registries allow many characters in package names that are not valid identifiers within a Roku application. As such, these names need to be sanitized. The following transformations will be applied to every module name. 
 - registry namespaces will have the `@` symbol removed and the `/` replaced with an underscore. (i.e. `@roku/sgdex` becomes `roku_sgdex`)
 - All characters except for numbers, letters, and underscore will be removed. (i.e. `cool-package` becomes `coolpackage`)

While extremely unlikely, this does have the potential for name collisions. If collisions occur, you will need to define a custom prefix for one of the dependencies in question.


## Prefixes
When module authors publish their modules, they should not include any type of prefix to their components or functions. The prefixing will be handled by `ropm` itself. 

`ropm` will scan every module for:
 - function declaractions
 - function calls
 - component declarations
 - component usage:
   - component names in XML `extends` attribute
   - use of a component as an element in XML files

Then, `ropm` will append a prefix to each of the previously-mentioned items. For example, consider the `FancyKeyboards` package:

**xml**
```xml
<component name="SimpleKeyboard" extends="Keyboard">
```
```xml
<AdvancedKeyboard />
```
becomes
```xml
<component name="FancyKeyboards_SimpleKeyboard" extends="fancyKeyboards_Keyboard">
```
```xml
<FancyKeyboards_AdvancedKeyboard />
```

**brs**
```brightscript
sub SetKeyboardLanguage(language)
    WriteToRegistry("KeyboardLanguage", language)
end sub
sub WriteToRegistry(key, value)
    '...
end sub
```
```brightscript
CreateObject("RoSGNode", "SimpleKeyboard")
node.CreateChild("AdvancedKeyboard")
```
becomes
```brightscript
sub FancyKeyboards_SetKeyboardLanguage(language)
    FancyKeyboards_WriteToRegistry("KeyboardLanguage", language)
end sub
sub FancyKeyboards_WriteToRegistry(key, value)
    '...
end sub
```

```brightscript
CreateObject("RoSGNode", "FancyKeyboards_SimpleKeyboard")
node.CreateChild("FancyKeyboards_AdvancedKeyboard")
```

**WARNING**: `ropm` does not currently support rewriting components created with `ifSGNodeChildren`'s `update()` call (see the docs [here](updatefields-as-roassociativearray-addfields-as-boolean-as-void)). If you are a ropm package author and need support for this, please raise an issue. 

### File paths
`ropm` will rewrite file paths as well. These file paths will be rewritten based on the final location. `ropm` looks for:

 - all absolute file paths found anywhere in the source code (i.e. `"pkg:/path/to/something"`)
 - relative file paths in script tags (i.e. `<script uri="../../some/file.brs" />`)

 Some packages may wish to look for files in predefined locations in the host application's folder structure (like a config file that should be placed at exactly `pkg:/config/loggerConfig.json` for example).  In these situations, you will need to trick ropm into _not_ rewriting your file path. The trick is to restrict the first part of the string to ONLY contain `"pkg:/"` and nothing else. `ropm` looks for `pkg:/` and at least one additional character, so standalone `"pkg:/"` paths will be ignored. Here are a few examples:

 ```vb
 sub GetImagePath(imageName)
    
    'will be rewritten because we have content after 'pkg:/'
    image1 = "pkg:/images/" + imageName
    
    'will not be rewritten because the 'pkg:/' is isolated
    image2 = "pkg:/" + "images/" + imageName

 end sub
```
Result:
```vb
 sub CatPhotoLib_GetImagePath(imageName)
    
    'will be rewritten because we have content after 'pkg:/'
    image1 = "pkg:/images/roku_modules/CatPhotoLib/" + imageName

    'will not be rewritten because the 'pkg:/' is isolated
    image2 = "pkg:/" + "images/" + imageName

 end sub
```

## Renaming modules
By default, `ropm` will install modules with their default names from the registry. For example, if you run `ropm install roku-promise`, then the ropm package name will be `rokupromise`. But what if you wanted to reference it as `promise` in your project? You can accomplish this by leveraging the flexibility of the package.json `dependencies` section. Here's the command to install `roku-promise` with an alternate name:

```bash
ropm install promise@npm:roku-promise
```

This will install the `roku-promise` library from the `npmjs.com` registry and call it `promise`. 

Here's the resulting package.json `dependencies` section:
```json
{
    "dependencies": {
        "promise": "npm:roku-promise@1.2.3"
    }
}
```


## Do not change the code within roku_modules
The files and folders within the `roku_modules` folders should not be altered at all, as these changes could be erased by future `ropm install` commands. If there are issues with a ropm module you are using, consider reaching out to the module publisher to have them fix and release a new version.

## The algorithm
When running `ropm install`, `ropm` does the following operations for each package:
1. For each folder in the ropm package's `rootDir` folder, delete `${rootDir}/<folder_name>/roku_modules/<package_name>` and then copy all of the files from that corresponding folder.
2. Rewrites function names, function calls, callfunc statements, and component names to have a prefix. (this prevents naming collisions)
3. Rewrites in-code file paths to point to the new file locations

## Don't commit roku_modules
The `roku_modules` folders that ropm creates should not be commited to your project repository. Instead, developers should follow the practice of running `ropm install` anytime they fetch code from a repository. Here's how to ignore roku_modules in your `.gitignore file:

**.gitignore**
```gitignore
roku_modules
```

## Configuring ropm
You can configure certain characteristics of ropm by specifying ropm options in the `package.json`. 
### rootDir
If you wish to install all ropm dependencies in a different location, then you should specify the `rootDir` ropm option in package.json. Here's an example

```javascript
{
    "name": "your-app-name",
    "ropm": {
        //tell ropm that the files for this module reside in the "./src" folder
        "rootDir": "src"
    }
    ...
}
```
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


# For Package Creators

## How to create a ropm package
The `ropm` package system leverages the [npm](https://www.npmjs.com/) package system from Node.js. Simply follow [these instructions](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages) from npm on how to create a package. 

Steps:
1. Create a new package.json in your project (you can run `ropm init` to have it help build one)
2. Add `"ropm"` to the `keywords` portion of the package.json. Without this tag, `ropm` will completely ignore your package when copying files. 
3. Ensure that all files are contained within a folder (preferably `source/`, `/components`, `images/` or `fonts/`). Files at the root of a ropm package will be ignored.

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
It is highly recommended that `ropm` package authors strictly adhere to the rules of [Semantic Versioning](https://semver.org/). This will provide the most stability and consistency for consumers of your package, as well as provide the highest performance and smallest possible package size. Whenever `ropm` encounters a project that directly or indirectly requires multiple versions of a ropm module, `ropm` will attempt to minimize the number of versions of that package. For example, if a project has dependencies that require both version `1.1.0` and `1.4.0` of `roku-promise`, `ropm` will opt to install `1.4.0` for both projects, since semantic versioning states that the only differences between `1.1.0` and `1.4.0` are new features and bugfixes, and should not contain breaking changes.

## Changing module's `rootDir`
By default, `ropm` will assume the root of your module is where all of your files reside, and will copy every file from your package, with a few exceptions: 

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

# ropm
A package manager for the Roku platform.

[![build status](https://img.shields.io/github/actions/workflow/status/rokucommunity/ropm/build.yml?logo=github&branch=master)](https://github.com/rokucommunity/ropm/actions?query=branch%3Amaster+workflow%3Abuild)
[![coverage status](https://img.shields.io/coveralls/github/rokucommunity/ropm?logo=coveralls)](https://coveralls.io/github/rokucommunity/ropm?branch=master)
[![monthly downloads](https://img.shields.io/npm/dm/ropm.svg?sanitize=true&logo=npm&logoColor=)](https://npmcharts.com/compare/ropm?minimal=true)
[![npm version](https://img.shields.io/npm/v/ropm.svg?logo=npm)](https://www.npmjs.com/package/ropm)
[![license](https://img.shields.io/github/license/rokucommunity/ropm.svg)](LICENSE)
[![Slack](https://img.shields.io/badge/Slack-RokuCommunity-4A154B?logo=slack)](https://join.slack.com/t/rokudevelopers/shared_invite/zt-4vw7rg6v-NH46oY7hTktpRIBM_zGvwA)
## Installation
1. Install Node.JS from [here](https://nodejs.org/en/download/)
2. install the `ropm` node module globally
    ```bash
    npm i ropm -g
    ```

## Discovering packages

Click [here](https://www.npmjs.com/search?q=keywords%3Aropm%20) to search npm for packages with the `ropm` keyword.

You can also search GitHub for `ropm` packages, but since GitHub doesn't support searching by keyword, you'll need to know what you're looking for.

## Creating a package
See the [Creating ropm Packages](#creating-ropm-packages) section for guidance about creating `ropm` packages.

## How it works
`ropm` leverages NodeJS's `npm` module system behind the scenes. This means when you create packages, they should be pushed to an `npm` registry such as [npm](https://www.npmjs.com/), [GitHub packages](https://github.com/features/packages), or even an on-premise registry.

The Roku project structure is fairly strict. There are a few rules:
1. Components must be stored somewhere underneath `pkg:/components/`.
2. Component names must be unique across the entire project
3. Components each create their own scope
4. All files found underneath `pkg:/source/` are compiled into a single scope.
5. All functions in a scope must have a unique name

This provides unique challenges for a Roku package manager, because file paths alone are not enough to prevent symbol collisions. `ropm` solves the naming collision problem by rewriting the names of all functions and components in an ropm module.

ropm will create a `roku_modules/<ropm module name>` folder into each corresponding folder of your project. For example, if a ropm module named `"logger"` has the following folders:
 - source/
 - components/
 - images/
 - fonts/

then `ropm install` will create the following folders in your project
 - source/roku_modules/logger
 - components/roku_modules/logger
 - images/roku_modules/logger
 - fonts/roku_modules/logger

## Sanitizing module names
Most `npm`-style package registries allow many characters in package names that are not valid [identifiers](http://developer.roku.com/docs/references/brightscript/language/expressions-variables-types.md#identifiers) within a Roku application. As such, these names need to be sanitized. The following transformations will be applied to every module name.
 - registry namespaces will have the `@` symbol removed and the `/` replaced with an underscore. (i.e. `@roku/sgdex` would become `roku_sgdex`)
 - All characters except for numbers, letters, and underscore will be removed. (i.e. `cool-package` would become `coolpackage`)

While extremely unlikely, this does have the potential for name collisions. If collisions occur, you will need to define a custom prefix for one of the dependencies in question.


## Prefixes
When module authors publish their modules, they should not include any baseline prefix or namespace in front of their component or function names. The prefixing will be handled by `ropm` itself.

`ropm` will scan every module for:
 - function declaractions (i.e. `function LogInfo(message)...end function` )
 - function calls (i.e. `LogInfo("do something")` )
 - function references (i.e. `log = LogInfo` )
 - string function name in every object's `observeField` calls
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

### Special case
#### Leading underscore
Some languages use leading underscore to represent `private` or `internal`. Ropm detects leading underscores, and starts the prefixing process at the first non-underscore character. For example:
```brightscript
sub _SecretKeyboardSub1()
end sub

sub ________SecretKeyboardSub2()
end sub
```
becomes
```brightscript
sub _FancyKeyboards_SecretKeyboardSub1()
end sub

sub ________FancyKeyboards_SecretKeyboardSub2()
end sub
```

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

### Tasks (`m.top.functionName`)
BrightScript Task objects have a special `m.top.functionName` property that specifies which function should be run during the task. ropm will find all instances of `m.top.functionName = "<anything>"` and add the prefix to the beginning of the string.

The syntax must be exactly `m.top.functionName = ` followed by a string (i.e. `m.top.functionName = "taskCallback"`). ropm will skip the statement if anything other than a string is found to the right-hand-side of the equals sign. If you dynamically generate the value for `m.top.functionName`, or assign it in some other fashion, consider using the [ROPM_PREFIX](#ropm_prefix-source-literal) source literal instead.

### Never-prefixed functions
Due to their special handling within the Roku architecture, the following functions  will never be prefixed:
 - `RunUserInterface`
 - `Main`
 - `RunScreenSaver`
 - `Init`
 - `OnKeyEvent`

### ROPM_PREFIX source literal
ropm provides a source literal called `ROPM_PREFIX` which, during ropm install, gets replaced with a string literal containing your module's prefix. This enables developers to decide the best way to construct their own function name strings. Consider the following exmaple.

Your ropm module code:
```brightscript
sub init()
    m.top.functionName = getFunctionName()
end sub
function getFunctionName()
    if isLoggedIn()
        return ROPM_PREFIX + "initLoggedIn"
    else
        return ROPM_PREFIX + "initLoggedOut"
    end if
end function
```

After ropm install (the module prefix is "logger"):
```brightscript
sub init()
    m.top.functionName = getFunctionName()
end sub
function getFunctionName()
    if isLoggedIn()
        return "logger_" + "initLoggedIn"
    else
        return "logger_" + "initLoggedOut"
    end if
end function
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

## Semantic versioning
It is highly recommended that `ropm` package authors strictly adhere to the rules of [Semantic Versioning](https://semver.org/). This will provide the most stability and consistency for consumers of your package, as well as provide the highest performance and smallest possible package size.

### Version narrowing

Whenever ropm encounters a project that directly or indirectly requires multiple versions of a ropm module, ropm will attempt to minimize the number of versions of that package.

For example, consider a project that has these dependencies:
 - roku-promise version 1.1.0
 - roku-promise version 1.4.0

 ropm will only install `1.4.0` since semantic versioning states that the only differences between `1.1.0` and `1.4.0` are new features and bugfixes, and should not contain breaking changes.

Here's another example:
 - roku-promise@`1.1.0`
 - roku-promise@`1.4.0`
 - roku-promise@`2.0.0`
 - roku-promise@`2.3.4`

ropm will only install `1.4.0` and `2.3.4` since those are the highest versions within the same major range.

### Prerelease versions
Due to their unstable nature, prerelease versions of packages have special treatment in ropm. Each prerelease version will be considered a standalone package. Example:

 - roku-promise@`1.0.0-beta.1`
 - roku-promise@`1.0.0-beta.2`

_Both_ versions will be copied to the project. We do not recommend publishing packages that depend on prerelease versions of a package.

### Version prefixing
As previously mentioned, all packages will have prefixes applied to functions and components. All direct dependencies of a project (i.e. the packages listed in your app's `package.json` `dependencies` section) will use the exact dependency name listed. However, in order to resolve version conflicts and maintain consistency, any indirect dependencies (i.e. the dependencies of your dependencies) will be prefixed using the major version.

For example, consider the following dependency graph:
 - logger@`1.0.0`
    - fileLogger@`2.0.0`
 - simple-list@`1.2.0`
    - complex-list@`3.0.0`

The prefixes will be as follows:
 - logger
 - fileLogger_v2
 - simplelist
 - complexlist_v3


### Disabling module prefixing
If you need to disable `ropm`'s module prefixing, you can do this on a per-module basis by adding the names of of the desired modules to the `ropm.noprefix` key in `package.json`. Here's an example:

```javascript
{
    "dependencies": {
        "roku-logger": "1.0.0"
    },
    "ropm": {
        "noprefix": [
            "roku-logger"
        ]
    }
}
```

Be sure you're using the [npm alias](https://github.com/npm/rfcs/blob/latest/implemented/0001-package-aliases.md) of the package, not the original package name. The alias is the string on the left-hand-side of the dependency. For example:
```javascript
{
    "dependencies": {
        "p": "npm:roku-promise@1.0.0"
    },
    "ropm": {
        "noprefix": [
            "p"
        ]
    }
}
```
In this example, the actual name of the package is `"roku-promise"`, but we are using the npm alias "p". So `"p"` is what you should add to `ropm.noprefix`.

Here's another example:

```javascript
{
    "dependencies": {
        "roku-promise": "1.0.0",
        "r": "npm:roku-requests@1.0.0"
    },
    "ropm": {
        "noprefix": [
            "roku-promise",
            "r"
        ]
    }
}
```

The npm aliases in this example is `"roku-promise"` and `"r"`.

### Do not use `ropm.prefix` in published packages
Ropm will reject installing any ropm package that has the `ropm.noprefix` key in its package.json, so package _authors_ should **NOT** use `ropm.noprefix`.


## Do not change the code within roku_modules
The files and folders within the `roku_modules` folders should not be altered at all, as these changes could be erased by future `ropm install` commands. If there are issues with a ropm module you are using, consider reaching out to the module publisher to have them fix and release a new version.

## Don't commit roku_modules
The `roku_modules` folders that ropm creates should not be commited to your project repository. Instead, developers should follow the practice of running `ropm install` anytime they fetch code from a repository. Here's how to ignore roku_modules in your `.gitignore` file:

**.gitignore**
```gitignore
roku_modules
```

## The algorithm
Running `ropm install` executes the following operations for each package:
1. For each folder in the ropm package's `rootDir` folder, delete `${rootDir}/<folder_name>/roku_modules/<package_name>` and then copy all of the files from that corresponding folder.
2. Rewrite function names, function calls, callfunc statements, and component names to have a prefix. (this prevents naming collisions)
3. Rewrite in-code file references to point to their new locations

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
Install one or more packages locally in both `node_modules` and `roku_modules`. This also updates the local `package.json` `dependencies` section.

Examples:
```bash
ropm install roku-promise
```

```bash
ropm install module1 module2 module3
```

### clean
Clean out all `ropm_modules` folders found in `rootDir`

Example:
```bash
ropm clean
```

### copy
Similar to [install](#install), but does not fetch missing dependencies from the registry. This command should be faster than [install](#install) as long as all the necessary dependencies are already downloaded.
Example:
```bash
ropm copy
```

### uninstall
Uninstall one or more packages from both `node_modules` and `roku_modules`. This also updates the local `package.json` `dependencies` section

Examples:
```bash
ropm uninstall roku-promise
```

```bash
ropm uninstall module1 module2 module3
```


# Creating ropm Packages
## Overview
Here is some overview information to help `ropm` package authors get started:
 - `ropm` modules are simply [npm](https://www.npmjs.com/) packages with the `ropm` keyword (see [How to create a ropm package](#how-to-create-a-ropm-package))
 - `ropm` uses the [BrighterScript parser](https://github.com/rokucommunity/brighterscript) to assist with prefixing. (see [Syntax parsing](#syntax-parsing-using-brighterscript))
 - Follow semantic versioning **strictly**. Make major breaking changes as infrequently as possible. (see [Semantic Versioning](#semantic-versioning))
 - `ropm` rewrites every `pkg:/` path, so use string concatenation if you need to bypass this logic. (see [File paths](#file-paths))
 - Don't give local variables the same names as functions in your package. (See [Finding function references](#finding-function-references-is-a-package-wide-operation))
 - Don't write BrightScript in XML `CDATA` blocks (See [BrightScript in XML CDATA blocks is unsupported](#brightScript-in-xml-cdata-blocks-is-unsupported))
 - Don't define a baseline namespace. On install, `ropm` will prefix your package for you. (See [Prefixes](#prefixes))
 - Don't reference dependency functions in component interfaces. (see [Component interface handling](#component-interface-handling))
 - use the `ropm` options in `package.json` to customize various settings in your package
     - `ropm.rootDir` - where you want `roku_modules` installed within your package
     - `ropm.packageRootDir` where your package's files reside (i.e. `dist`, `build`, `./`, etc...)
     - Don't use `ropm.noprefix`, as can not be used within published `ropm` packages.


## How to create a ropm package
The `ropm` package system leverages the [npm](https://www.npmjs.com/) package system from Node.js. Simply follow [these instructions](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages) from npm on how to create a package.

Steps:
1. Create a new package.json in your project (you can run `ropm init` to have it help build one)
2. Add `"ropm"` to the `keywords` portion of the package.json. Without this tag, `ropm` will completely ignore your package when installed in an application folder.
3. Ensure that all files are contained within a folder (preferably `source/`, `/components`, `images/`, and `fonts/`). Files at the root of a ropm package will be ignored.

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
4. publish your package to a registry using the instructions from your registry of choice ([npm](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages), [GitHub Packages](https://docs.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages))


## Changing where the module's files are copied from (As a package author)
By default, `ropm` will copy every file from the root of your module (the folder where `package.json` resides), with a few exceptions:

These files will always be excluded (not copied):
 - `package.json`
 - README
 - CHANGES / CHANGELOG / HISTORY
 - LICENSE | LICENCE
 - NOTICE

All folders named `roku_modules` that are found in a ropm module will be ignored. This is due to the fact that modules should not be publishing their own copies of their ropm modules. ropm will handle this for them. So as a package author, be sure to exclude all folders named `roku_modules` during your publishing process.

We recommend excluding extraneous files when you create your package using npm's [files](https://docs.npmjs.com/files/package.json#files) property. In certain situations, you may want to store your files in a subdirectory. In this situation, you should use the `ropm.packageRootDir` property to specify the relative path to the root of your module. This pattern is useful when you want to publish documentation or other extraneous files with your package, but don't want those files to be included when published to a Roku device.

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
        "packageRootDir": "src"
    }
}
```

### Syntax parsing using BrighterScript
`ropm` uses the [BrighterScript parser](https://github.com/rokucommunity/brighterscript) to find and apply the prefixes to `ropm` modules. While fairly comprehensive, there are still a BrightScript syntax bugs that `BrighterScript` does not yet support, and will therefore cause your package to fail during install. Please open an [issue](https://github.com/rokucommunity/brighterscript/issues) if you encounter any syntax issues that prevent your package from working properly.

### Finding function references is a package-wide operation
> *HINT:* do not give local variables the same name as any function in your package

Function reference replacement is package-wide and does not operate on a per-scope basis, meaning `ropm` could add prefixes to local variables that share a name with any function across your entire package. We recommend that you do not give local variables the same name as any function your package.


### Component interface handling
SceneGraph components can declare interface functions which will be callable via the `callFunc` function on a node. For example, the following LoggerComponent exposes a function called `doSomething`:
```xml
<?xml version="1.0" encoding="utf-8" ?>
<component name="LoggerComponent">
    <script uri="LoggerComponent.brs" />
    <interface>
        <function name="doSomething"/>
    </interface>
</component>
```

`ropm` will _not_ rename functions referenced by component interfaces because prefixing those functions would change the public API of declared components. This does introduce a small risk for function name collisions, but those risks can be avoided if you adhere to the following guidelines:
 - do not reference `ropm` dependency functions as component interface functions.
     - for example, if your package depends on `roku-logger`, do not add a function interface to `<function name="rokulogger_writeToLog" />`.
 - create a "codebehind" file for each component, which is only imported into that component, and keep all interface exported functions in that codebehind file
 - do not reference functions from common/shared files as component interface functions

## rootDir versus packageRootDir
 - `rootDir` - specifies where ropm_modules should be installed in your project.
 - `packageRootDir` is exclusively for package authors to specify where their package module code resides (like in `dist`, `out`, `build`, `src`, etc...).


### BrightScript in XML CDATA blocks is unsupported
It is considered bad practice to insert BrightScript code into `<![CDATA[` xml script blocks, and as such, `ropm` does not support `CDATA` blocks.

Any BrightScript code found in `CDATA` blocks will be ignored by the `ropm` prefixing logic, so use at your own risk (or peril!).

## Handling observeField
`ropm` will auto-detect most common `observeField` function calls. In order to prevent naming conflicts, please do not use the name `observeField` for custom object functions.

Here are the requirements for having `ropm` prefix your `observeField` string function names.
1. Use a single string literal for the function name. For example, `m.top.observeField(fieldName, "callbackFunction")`
2. The `observeField` call must be on a single line. For example, this call would remain unprefixed:
    ```BrightScript
    m.top.observeField(getFieldName({
        componentName: "something"
    }, "callbackFunction")
    ```

## Sponsors
[![image](https://user-images.githubusercontent.com/2544493/96571912-377af280-129a-11eb-8295-49eb12e54aeb.png)](https://www.applicaster.com/)

## Changelog
[Click here](CHANGELOG.md) to view the changelog.

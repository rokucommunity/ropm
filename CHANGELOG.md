# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [0.7.7] - 2020-01-07
### Changed
 - updated to [brighterscript@0.23.2](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0232---2020-01-06)
 - remove direct reference to vscode-languageserver-protocol



## [0.7.6] - 2021-01-04
### Fixed
 - apply prefix to `observeFieldScoped` calls ([#20](https://github.com/rokucommunity/ropm/issues/20))



## [0.7.5] - 2020-12-22
### Changed
 - updated to [brighterscript@0.23.1](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0231---2020-12-22)



## [0.7.4] - 2020-12-14
### Changed
 - updated to [brighterscript@0.22.1](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0221---2020-12-14)
### Fixed
 - bug with brighterscript->vscode-languageserver->vscode-languageserver-types dependency that had breaking change in minor version release.



## [0.7.3] - 2020-11-03
### Fixed
 - don't wrap interface-referenced functions found in `d.bs` with a namespace 



## [0.7.2] - 2020-11-02
### Changed
 - updated to [brighterscript@0.18.2](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0182---2020-11-2)
 - removed unnecessary code to force bsc files to parse (because brighterscript@0.18.2 now does that automatically)



## [0.7.1] - 2020-11-01
### Fixed
 - Fix bug with unprefixed functions whenever a typedef is present.



## [0.7.0] - 2020-20-30
### Added
 - Prefixing support for `d.bs` (typedef) files from BrighterScript
### Changed
 - updated to [brighterscript@0.18.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0180---2020-10-30)



## [0.6.6] - 2020-10-29
### Fixed
 - bug where function references do not honor prefixing whitelist



## [0.6.5] - 2020-10-25
### Fixed
 - prefixing bug that wasn't applying prefix to to xml field `onChange` events



## [0.6.4] - 2020-10-20
### Added
 - `rootDir` prompt during first install or init
### Changed
 - `ropm.noprefix` now requires the npm alias name, **NOT** the ropm alias name (how it was previously).
 - updated to [brighterscript@0.16.11](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#01611---2020-10-20)


## [0.6.3] - 2020-10-16
### Fixed
 - force delete during `ropm clean`
 - bug that was incorrectly prefixing calls to interface functions



## [0.6.2] - 2020-10-08
### Fixed
 - `ropm` now disables prefixing functions that are referenced in component interfaces. 



## [0.6.1] - 2020-10-08
### Changed
 - use the (BrighterScript)[https://github.com/rokucommunity/brighterscript] parser to simplify prefixing.



## [0.6.0] - 2020-10-07
### Fixed
 - fix missing prefixes on function references not used as a function call
 - find and prefix function names in `observeField` calls
### Known issues
 - still no support for bypassing prefixing for functions referenced in component `interface` fields. That will be coming in a future release.



## [0.5.0] - 2020-09-26
### Added
 - `ropm copy` command that speeds up local development by skipping the registry check (i.e. internal `npm install` call)
### Fixed
 - prevent prefixing calls to variable functions
 - prevent prefixing function calls found on objects (i.e. `person.doSomething()`)



## [0.4.2] - 2020-09-25
### Fixed
 - Prevent prefixing special function `onKeyEvent`



## [0.4.1] - 2020-09-25
### Fixed
 - bug that was using the unsanitized npm alias instead of the ropm package name in certain install situations for direct dependencies.



## [0.4.0] - 2020-09-24
### Added
 - `ropm.noprefix` package.json option to prevent certain modules from having a prefix applied. 
 - reject installing packages that have the `ropm.noprefix` setting present in `package.json`: this setting is only for use in client applications.
### Fixed
 - dependency component references were not being renamed according to their resolved prefix.



## [0.3.0] - 2020-09-23
### Added
 - `ropm.packageRootDir` for use by package authors to define where their package code resides. This deviates from the previous functionalith where both were handled by `rootDir`, now `rootDir` is exclusively for ropm INSTALL location.
### Changed
 - do not copy `roku_module` folders from ropm modules during `ropm install`
### Fixed
 - bug where npm would throw `npm ERR! extraneous` errors when installing file protocol packages, causing the install to bomb. Now we just ignore that error because it's not important.



## [0.2.0] - 2020-08-28
### Added
 - "uninstall" command which removes a list of packages from both `roku_modules` and `node_modules`
 - function/component prefixing and file path renaming during install.
### Fixed
 - bug in "clean" command that wasn't cleaning projects with custom `ropm.rootDir` paths.
 - bug with prerelease versions not installing properly



## [0.1.1] - 2020-08-06
### Added
 -  "clean" command which removes all ropm files from a project (but leaves the package.json intact)
### Changed
 - remove unnecessary files from published `ropm` npm package
 - the `"ropm"` keyword is now required in ropm module's package.json, and any package without it will be ignored by ropm
### Fixed
 - missing shebang at top of cli script causing problems running ropm from the terminal
 - fix running `ropm install` without any arguments



## [0.1.0] - 2020-08-05
### Added
 - cli command 'init'
 - cli command 'install' which allows you to install packages with the same syntax as [npm install](https://docs.npmjs.com/cli/install)
 - basic documentation



## 0.0.1
### Added
 - initial placeholder release


[0.1.0]:   https://github.com/rokucommunity/ropm/compare/v0.0.1...v0.1.0
[0.1.1]:   https://github.com/rokucommunity/ropm/compare/v0.1.0...v0.1.1
[0.2.0]:   https://github.com/rokucommunity/ropm/compare/v0.1.1...v0.2.0
[0.3.0]:   https://github.com/rokucommunity/ropm/compare/v0.2.0...v0.3.0
[0.4.0]:   https://github.com/rokucommunity/ropm/compare/v0.3.0...v0.4.0
[0.4.1]:   https://github.com/rokucommunity/ropm/compare/v0.4.0...v0.4.1
[0.5.0]:   https://github.com/rokucommunity/ropm/compare/v0.4.1...v0.5.0
[0.6.0]:   https://github.com/rokucommunity/ropm/compare/v0.5.0...v0.6.0
[0.6.1]:   https://github.com/rokucommunity/ropm/compare/v0.6.0...v0.6.1
[0.6.2]:   https://github.com/rokucommunity/ropm/compare/v0.6.1...v0.6.2
[0.6.3]:   https://github.com/rokucommunity/ropm/compare/v0.6.2...v0.6.3
[0.6.4]:   https://github.com/rokucommunity/ropm/compare/v0.6.3...v0.6.4
[0.6.5]:   https://github.com/rokucommunity/ropm/compare/v0.6.4...v0.6.5
[0.6.6]:   https://github.com/rokucommunity/ropm/compare/v0.6.5...v0.6.6
[0.7.0]:   https://github.com/rokucommunity/ropm/compare/v0.6.6...v0.7.0
[0.7.1]:   https://github.com/rokucommunity/ropm/compare/v0.7.0...v0.7.1
[0.7.1]:   https://github.com/rokucommunity/ropm/compare/v0.7.0...v0.7.1
[0.7.2]:   https://github.com/rokucommunity/ropm/compare/v0.7.1...v0.7.2
[0.7.3]:   https://github.com/rokucommunity/ropm/compare/v0.7.2...v0.7.3
[0.7.4]:   https://github.com/rokucommunity/ropm/compare/v0.7.3...v0.7.4
[0.7.5]:   https://github.com/rokucommunity/ropm/compare/v0.7.4...v0.7.5
[0.7.6]:   https://github.com/rokucommunity/ropm/compare/v0.7.5...v0.7.6
[0.7.7]:   https://github.com/rokucommunity/ropm/compare/v0.7.6...v0.7.7

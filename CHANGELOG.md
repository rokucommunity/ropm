# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [0.10.2](https://github.com/rokucommunity/ropm/compare/v0.10.1...v0.10.2) - 2022-01-24
### Changed
 - updated to [brighterscript@0.42.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0420---2022-01-10)
### Fixed
 - noprefix module bug that wasn't handling imports properly ([#50](https://github.com/rokucommunity/ropm/pull/50))



## [0.10.1](https://github.com/rokucommunity/ropm/compare/v0.10.0...v0.10.1) - 2021-09-09
### Fixed
 - crash when processing nonstandard dirs that have brs/xml files ([#49](https://github.com/rokucommunity/ropm/pull/49))
 - ignore prod subdependencies that don't have the `ropm` keyword ([#44](https://github.com/rokucommunity/ropm/pull/44))
 - fix prefixing function reference even if module is set to `noprefix` mode ([#43](https://github.com/rokucommunity/ropm/pull/43))



## [0.10.0] - 2021-06-21
[0.10.0]: https://github.com/rokucommunity/ropm/compare/v0.9.3...v0.10.0
### Added
 - Allow option to override `rootDir` in NodeJS api options for `InstallCommand` rather than always loading from package.json



## [0.9.3] - 2021-06-01
[0.9.3]: https://github.com/rokucommunity/ropm/compare/v0.9.2...v0.9.3
### Changed
 - upgraded to [roku-deploy@3.4.1](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#341---2021-06-01)
 - updated to [brighterscript@0.39.3](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0392---2021-05-28) which includes roku-deploy@3.4.1
### Fixed
 - crash in roku-deploy caused by missing dependency



## [0.9.2] - 2021-05-28
[0.9.2]: https://github.com/rokucommunity/ropm/compare/v0.9.1...v0.9.2
### Changed
 - upgraded to [roku-deploy@3.4.0](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#340---2021-05-28) which brings significant zip speed improvements
 - updated to [brighterscript@0.39.2](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0392---2021-05-28)
### Fixed
 - several npm audit vulnerability issues



## [0.9.1] - 2021-02-27
[0.9.1]:   https://github.com/rokucommunity/ropm/compare/v0.9.0...v0.9.1
### Changed
 - updated to [brighterscript@0.33.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0330---2021-02-27)
### Fixed
 - bug where any function containing an immediately-invoked function expression would have its contents skipped during preprocessing (fixed by [brighterscript#343](https://github.com/rokucommunity/brighterscript/pull/343))



## [0.9.0] - 2021-02-19
[0.9.0]:   https://github.com/rokucommunity/ropm/compare/v0.8.1...v0.9.0
### Added
 - `ROPM_PREFIX` source literal to assist package authors with non-standard string function name logic ([#32](https://github.com/rokucommunity/ropm/pull/32))
### Changed
 - updated to [brighterscript@0.31.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0312---2021-02-18)
### Fixed
 - bug in d.bs type definition files causing function and class annotiations to be incorrectly associated with their parent namespaces ([#31](https://github.com/rokucommunity/ropm/pull/31))
 - add missing prefix for Task `m.top.functionName = "<someFunctionName>"` ([#34](https://github.com/rokucommunity/ropm/pull/34))
 - better class name handling in d.bs type definition files ([#33](https://github.com/rokucommunity/ropm/pull/33))
 - prevent running host project brighterscript plugins during ropm install of every ropm package ([#35](https://github.com/rokucommunity/ropm/pull/35))



## [0.8.1] - 2021-02-09
[0.8.1]:   https://github.com/rokucommunity/ropm/compare/v0.8.0...v0.8.1
### Changed
 - updated to [brighterscript@0.30.6](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0306---2021-02-07)
### Fixed
 - bug with old-style bsc plugins crashing ropm install.



## [0.8.0] - 2021-01-19
[0.8.0]:   https://github.com/rokucommunity/ropm/compare/v0.7.7...v0.8.0
### Added
 - special prefixing logic for leading underscores. See [this](https://github.com/rokucommunity/ropm#leading-underscore) for more information.



## [0.7.7] - 2021-01-07
[0.7.7]:   https://github.com/rokucommunity/ropm/compare/v0.7.6...v0.7.7
### Changed
 - updated to [brighterscript@0.23.2](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0232---2020-01-06)
 - remove direct reference to vscode-languageserver-protocol



## [0.7.6] - 2021-01-04
[0.7.6]:   https://github.com/rokucommunity/ropm/compare/v0.7.5...v0.7.6
### Fixed
 - apply prefix to `observeFieldScoped` calls ([#20](https://github.com/rokucommunity/ropm/issues/20))



## [0.7.5] - 2020-12-22
[0.7.5]:   https://github.com/rokucommunity/ropm/compare/v0.7.4...v0.7.5
### Changed
 - updated to [brighterscript@0.23.1](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0231---2020-12-22)



## [0.7.4] - 2020-12-14
[0.7.4]:   https://github.com/rokucommunity/ropm/compare/v0.7.3...v0.7.4
### Changed
 - updated to [brighterscript@0.22.1](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0221---2020-12-14)
### Fixed
 - bug with brighterscript->vscode-languageserver->vscode-languageserver-types dependency that had breaking change in minor version release.



## [0.7.3] - 2020-11-03
[0.7.3]:   https://github.com/rokucommunity/ropm/compare/v0.7.2...v0.7.3
### Fixed
 - don't wrap interface-referenced functions found in `d.bs` with a namespace



## [0.7.2] - 2020-11-02
[0.7.2]:   https://github.com/rokucommunity/ropm/compare/v0.7.1...v0.7.2
### Changed
 - updated to [brighterscript@0.18.2](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0182---2020-11-2)
 - removed unnecessary code to force bsc files to parse (because brighterscript@0.18.2 now does that automatically)



## [0.7.1] - 2020-11-01
[0.7.1]:   https://github.com/rokucommunity/ropm/compare/v0.7.0...v0.7.1
### Fixed
 - Fix bug with unprefixed functions whenever a typedef is present.



## [0.7.0] - 2020-20-30
[0.7.0]:   https://github.com/rokucommunity/ropm/compare/v0.6.6...v0.7.0
### Added
 - Prefixing support for `d.bs` (typedef) files from BrighterScript
### Changed
 - updated to [brighterscript@0.18.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0180---2020-10-30)



## [0.6.6] - 2020-10-29
[0.6.6]:   https://github.com/rokucommunity/ropm/compare/v0.6.5...v0.6.6
### Fixed
 - bug where function references do not honor prefixing whitelist



## [0.6.5] - 2020-10-25
[0.6.5]:   https://github.com/rokucommunity/ropm/compare/v0.6.4...v0.6.5
### Fixed
 - prefixing bug that wasn't applying prefix to to xml field `onChange` events



## [0.6.4] - 2020-10-20
[0.6.4]:   https://github.com/rokucommunity/ropm/compare/v0.6.3...v0.6.4
### Added
 - `rootDir` prompt during first install or init
### Changed
 - `ropm.noprefix` now requires the npm alias name, **NOT** the ropm alias name (how it was previously).
 - updated to [brighterscript@0.16.11](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#01611---2020-10-20)


## [0.6.3] - 2020-10-16
[0.6.3]:   https://github.com/rokucommunity/ropm/compare/v0.6.2...v0.6.3
### Fixed
 - force delete during `ropm clean`
 - bug that was incorrectly prefixing calls to interface functions



## [0.6.2] - 2020-10-08
[0.6.2]:   https://github.com/rokucommunity/ropm/compare/v0.6.1...v0.6.2
### Fixed
 - `ropm` now disables prefixing functions that are referenced in component interfaces.



## [0.6.1] - 2020-10-08
[0.6.1]:   https://github.com/rokucommunity/ropm/compare/v0.6.0...v0.6.1
### Changed
 - use the (BrighterScript)[https://github.com/rokucommunity/brighterscript] parser to simplify prefixing.



## [0.6.0] - 2020-10-07
[0.6.0]:   https://github.com/rokucommunity/ropm/compare/v0.5.0...v0.6.0
### Fixed
 - fix missing prefixes on function references not used as a function call
 - find and prefix function names in `observeField` calls
### Known issues
 - still no support for bypassing prefixing for functions referenced in component `interface` fields. That will be coming in a future release.



## [0.5.0] - 2020-09-26
[0.5.0]:   https://github.com/rokucommunity/ropm/compare/v0.4.1...v0.5.0
### Added
 - `ropm copy` command that speeds up local development by skipping the registry check (i.e. internal `npm install` call)
### Fixed
 - prevent prefixing calls to variable functions
 - prevent prefixing function calls found on objects (i.e. `person.doSomething()`)



## [0.4.2] - 2020-09-25
[0.4.2]:   https://github.com/rokucommunity/ropm/compare/v0.4.1...v0.4.2
### Fixed
 - Prevent prefixing special function `onKeyEvent`



## [0.4.1] - 2020-09-25
[0.4.1]:   https://github.com/rokucommunity/ropm/compare/v0.4.0...v0.4.1
### Fixed
 - bug that was using the unsanitized npm alias instead of the ropm package name in certain install situations for direct dependencies.



## [0.4.0] - 2020-09-24
[0.4.0]:   https://github.com/rokucommunity/ropm/compare/v0.3.0...v0.4.0
### Added
 - `ropm.noprefix` package.json option to prevent certain modules from having a prefix applied.
 - reject installing packages that have the `ropm.noprefix` setting present in `package.json`: this setting is only for use in client applications.
### Fixed
 - dependency component references were not being renamed according to their resolved prefix.



## [0.3.0] - 2020-09-23
[0.3.0]: https://github.com/rokucommunity/ropm/compare/v0.2.0...v0.3.0
### Added
 - `ropm.packageRootDir` for use by package authors to define where their package code resides. This deviates from the previous functionalith where both were handled by `rootDir`, now `rootDir` is exclusively for ropm INSTALL location.
### Changed
 - do not copy `roku_module` folders from ropm modules during `ropm install`
### Fixed
 - bug where npm would throw `npm ERR! extraneous` errors when installing file protocol packages, causing the install to bomb. Now we just ignore that error because it's not important.



## [0.2.0] - 2020-08-28
[0.2.0]: https://github.com/rokucommunity/ropm/compare/v0.1.1...v0.2.0
### Added
 - "uninstall" command which removes a list of packages from both `roku_modules` and `node_modules`
 - function/component prefixing and file path renaming during install.
### Fixed
 - bug in "clean" command that wasn't cleaning projects with custom `ropm.rootDir` paths.
 - bug with prerelease versions not installing properly



## [0.1.1] - 2020-08-06
[0.1.1]: https://github.com/rokucommunity/ropm/compare/v0.1.0...v0.1.1
### Added
 -  "clean" command which removes all ropm files from a project (but leaves the package.json intact)
### Changed
 - remove unnecessary files from published `ropm` npm package
 - the `"ropm"` keyword is now required in ropm module's package.json, and any package without it will be ignored by ropm
### Fixed
 - missing shebang at top of cli script causing problems running ropm from the terminal
 - fix running `ropm install` without any arguments



## [0.1.0] - 2020-08-05
[0.1.0]:   https://github.com/rokucommunity/ropm/compare/v0.0.1...v0.1.0
### Added
 - cli command 'init'
 - cli command 'install' which allows you to install packages with the same syntax as [npm install](https://docs.npmjs.com/cli/install)
 - basic documentation



## 0.0.1
### Added
 - initial placeholder release

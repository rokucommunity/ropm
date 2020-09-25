# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



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

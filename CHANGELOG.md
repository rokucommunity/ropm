# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [0.10.32](https://github.com/rokucommunity/ropm/compare/v0.6.6...v0.10.32) - 2025-03-27
### Changed
 - Update dependencies version for brighterscript from 0.16.11 to 0.69.3 ([4102270](https://github.com/rokucommunity/ropm/commit/4102270))
 - Create initialize-release.yml ([89e5cc2](https://github.com/rokucommunity/ropm/commit/89e5cc2))
 - Don't prefix certain function references. ([#18](https://github.com/rokucommunity/ropm/pull/18))
 - fix changelog typo ([e0fe9c6](https://github.com/rokucommunity/ropm/commit/e0fe9c6))
 - find and prefix onchange field functions ([b9c5392](https://github.com/rokucommunity/ropm/commit/b9c5392))
 - improve code coverage ([80e0a10](https://github.com/rokucommunity/ropm/commit/80e0a10))
 - brighterscript@0.16.11 ([6ff9f94](https://github.com/rokucommunity/ropm/commit/6ff9f94))
 - Change `noprefix` to use npm alias instead of ropm alias ([907eac2](https://github.com/rokucommunity/ropm/commit/907eac2))
 - rootDir prompt during first install or init ([85c69ad](https://github.com/rokucommunity/ropm/commit/85c69ad))
 - noprefix test to prevent other module issues ([e02bce4](https://github.com/rokucommunity/ropm/commit/e02bce4))
 - bugfix: don't prefix calls to interface functions ([dc9dac3](https://github.com/rokucommunity/ropm/commit/dc9dac3))
 - Force delete during clean ([64578d9](https://github.com/rokucommunity/ropm/commit/64578d9))
 - Interface non prefixing ([#15](https://github.com/rokucommunity/ropm/pull/15))
 - update readme with brighterscript syntax parsing info ([2096aa0](https://github.com/rokucommunity/ropm/commit/2096aa0))
 - Use brighterscript parser ([#14](https://github.com/rokucommunity/ropm/pull/14))
 - Add support for prefixing function references not used in a function call ([#12](https://github.com/rokucommunity/ropm/pull/12))
 - Find and prefix function names in `observeField` calls ([#13](https://github.com/rokucommunity/ropm/pull/13))
 - update changelog with `ropm copy` info ([3dbe5f4](https://github.com/rokucommunity/ropm/commit/3dbe5f4))
 - prevent prefixing function calls found on objects ([0695140](https://github.com/rokucommunity/ropm/commit/0695140))
 - Add copy command that skips npm install ([#11](https://github.com/rokucommunity/ropm/pull/11))
 - Prevent prefixing calls to variable functions. ([3f121ec](https://github.com/rokucommunity/ropm/commit/3f121ec))
 - remove duplicate discovery blurb ([aac7bf4](https://github.com/rokucommunity/ropm/commit/aac7bf4))
 - add npm search link ([329c4bd](https://github.com/rokucommunity/ropm/commit/329c4bd))
 - Update README with never-prefixed function names ([4248775](https://github.com/rokucommunity/ropm/commit/4248775))
 - don't prefix `OnKeyEvent`. ([d49f6cc](https://github.com/rokucommunity/ropm/commit/d49f6cc))
 - bugfis: use ropm alias for host dependencies ([6a43eec](https://github.com/rokucommunity/ropm/commit/6a43eec))
 - Support for disabling prefixing for modules ([#10](https://github.com/rokucommunity/ropm/pull/10))
 - remove console logs in `getProdDependencies` ([f45309b](https://github.com/rokucommunity/ropm/commit/f45309b))
 - make `npm extraneous` error checking more strict. Disable `npm extraneous` test. ([4ccfdcd](https://github.com/rokucommunity/ropm/commit/4ccfdcd))
 - remove it.only ([28480c4](https://github.com/rokucommunity/ropm/commit/28480c4))
 - remove unused var. ([b5563c2](https://github.com/rokucommunity/ropm/commit/b5563c2))
 - Gracefully recover from `npm extraneous` errors ([5e60e18](https://github.com/rokucommunity/ropm/commit/5e60e18))
 - add packageRootDir for package authors ([6eed796](https://github.com/rokucommunity/ropm/commit/6eed796))
 - Don't copy roku_modules dir during `ropm install` ([a2d14de](https://github.com/rokucommunity/ropm/commit/a2d14de))
 - Merge pull request #9 from rokucommunity/dependabot/npm_and_yarn/bl-4.0.3 ([81c54c5](https://github.com/rokucommunity/ropm/commit/81c54c5))
 - update readme ([8da642e](https://github.com/rokucommunity/ropm/commit/8da642e))
 - Add eslint rule to fail on `.only` specs ([6c625dd](https://github.com/rokucommunity/ropm/commit/6c625dd))
 - remove exclusive .only test ([40b7b18](https://github.com/rokucommunity/ropm/commit/40b7b18))
 - Add uninstall command. ([2c02945](https://github.com/rokucommunity/ropm/commit/2c02945))
 - Merge pull request #8 from rokucommunity/prefixing ([ce526d7](https://github.com/rokucommunity/ropm/commit/ce526d7))
 - re-enable all specs ([bb8e7a4](https://github.com/rokucommunity/ropm/commit/bb8e7a4))
 - skip top-level files ([3474745](https://github.com/rokucommunity/ropm/commit/3474745))
 - Only install packages with `ropm` keyword. update readme about ropm keyword ([9249394](https://github.com/rokucommunity/ropm/commit/9249394))
 - Add "clean" command ([254caba](https://github.com/rokucommunity/ropm/commit/254caba))
 - Wrap the CLI in a promise ([3b1a355](https://github.com/rokucommunity/ropm/commit/3b1a355))
 - support calling `ropm install` with no args ([14c02ce](https://github.com/rokucommunity/ropm/commit/14c02ce))
 - Add cli header so npx knows to run it in node ([d3fc2b8](https://github.com/rokucommunity/ropm/commit/d3fc2b8))
 - add typings to package.json ([a576909](https://github.com/rokucommunity/ropm/commit/a576909))
 - specify the files list when generating npm package ([9c9917e](https://github.com/rokucommunity/ropm/commit/9c9917e))
 - ignore tgz files ([892b273](https://github.com/rokucommunity/ropm/commit/892b273))
 - add preversion script ([a7c52d1](https://github.com/rokucommunity/ropm/commit/a7c52d1))
 - Initialize package.json on install if missing ([231dc69](https://github.com/rokucommunity/ropm/commit/231dc69))
 - remove copy command code ([e5a84ba](https://github.com/rokucommunity/ropm/commit/e5a84ba))
 - Install roku_modules inside of each rootDir folder ([40c9664](https://github.com/rokucommunity/ropm/commit/40c9664))
 - Update readme with ropm command info ([f870787](https://github.com/rokucommunity/ropm/commit/f870787))
 - Use package.json `files` and `ropm.rootDir` ([69ec414](https://github.com/rokucommunity/ropm/commit/69ec414))
 - Update readme with rootDir ([ed07874](https://github.com/rokucommunity/ropm/commit/ed07874))
 - add test coverage publish task ([137eb69](https://github.com/rokucommunity/ropm/commit/137eb69))
 - remove exclusive test. ([50944c6](https://github.com/rokucommunity/ropm/commit/50944c6))
 - Add build script and badges ([826fd24](https://github.com/rokucommunity/ropm/commit/826fd24))
 - Add basic install command. ([947cdce](https://github.com/rokucommunity/ropm/commit/947cdce))
 - Add license ([6445a52](https://github.com/rokucommunity/ropm/commit/6445a52))
 - initial project add ([60beba2](https://github.com/rokucommunity/ropm/commit/60beba2))
 - upgrade to [brighterscript@0.69.3](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0693---2025-03-20). Notable changes since 0.16.11:
     - Fixed getClosestExpression bug to return undefined when position not found ([brighterscript#1433](https://github.com/rokucommunity/brighterscript/pull/1433))
     - Adds Alias statement syntax from v1 to v0 ([brighterscript#1430](https://github.com/rokucommunity/brighterscript/pull/1430))
     - Remove temporary code that was accidentally committed ([brighterscript#1432](https://github.com/rokucommunity/brighterscript/pull/1432))
     - Significantly improve the performance of standardizePath ([brighterscript#1425](https://github.com/rokucommunity/brighterscript/pull/1425))
     - Bump @babel/runtime from 7.24.5 to 7.26.10 ([brighterscript#1426](https://github.com/rokucommunity/brighterscript/pull/1426))
     - Backport v1 typecast syntax to v0 ([brighterscript#1421](https://github.com/rokucommunity/brighterscript/pull/1421))
     - Prevent running the lsp project in a worker thread ([brighterscript#1423](https://github.com/rokucommunity/brighterscript/pull/1423))
     - Language Server Rewrite ([brighterscript#993](https://github.com/rokucommunity/brighterscript/pull/993))
     - Add `validate` flag to ProgramBuilder.run() ([brighterscript#1409](https://github.com/rokucommunity/brighterscript/pull/1409))
     - Fix class transpile issue with child class constructor not inherriting parent params ([brighterscript#1390](https://github.com/rokucommunity/brighterscript/pull/1390))
     - Export more items ([brighterscript#1394](https://github.com/rokucommunity/brighterscript/pull/1394))
     - Add more convenience exports from vscode-languageserver ([brighterscript#1359](https://github.com/rokucommunity/brighterscript/pull/1359))
     - Fix bug with ternary transpile for indexed set ([brighterscript#1357](https://github.com/rokucommunity/brighterscript/pull/1357))
     - Bump cross-spawn from 7.0.3 to 7.0.6 in /benchmarks ([brighterscript#1349](https://github.com/rokucommunity/brighterscript/pull/1349))
     - Add Namespace Source Literals ([brighterscript#1353](https://github.com/rokucommunity/brighterscript/pull/1353))
     - [Proposal] Add Namespace Source Literals ([brighterscript#1354](https://github.com/rokucommunity/brighterscript/pull/1354))
     - Enhance lexer to support long numeric literals with type designators ([brighterscript#1351](https://github.com/rokucommunity/brighterscript/pull/1351))
     - Fix issues with the ast walkArray function ([brighterscript#1347](https://github.com/rokucommunity/brighterscript/pull/1347))
     - Optimize ternary transpilation for assignments ([brighterscript#1341](https://github.com/rokucommunity/brighterscript/pull/1341))
     - Fix namespace-relative transpile bug for standalone file ([brighterscript#1324](https://github.com/rokucommunity/brighterscript/pull/1324))
     - Update README.md with "help" items ([#brighterscript3abcdaf3](https://github.com/rokucommunity/brighterscript/commit/3abcdaf3))
     - Prevent crash when ProgramBuilder.run called with no options ([brighterscript#1316](https://github.com/rokucommunity/brighterscript/pull/1316))
     - Ast node clone ([brighterscript#1281](https://github.com/rokucommunity/brighterscript/pull/1281))
     - Bump micromatch from 4.0.5 to 4.0.8 in /benchmarks ([brighterscript#1295](https://github.com/rokucommunity/brighterscript/pull/1295))
     - Bump micromatch from 4.0.4 to 4.0.8 ([brighterscript#1292](https://github.com/rokucommunity/brighterscript/pull/1292))
     - Add support for resolving sourceRoot at time of config load ([brighterscript#1290](https://github.com/rokucommunity/brighterscript/pull/1290))
     - Add support for roIntrinsicDouble ([brighterscript#1291](https://github.com/rokucommunity/brighterscript/pull/1291))
     - Add plugin naming convention ([brighterscript#1284](https://github.com/rokucommunity/brighterscript/pull/1284))
     - Bump requirejs from 2.3.6 to 2.3.7 ([brighterscript#1269](https://github.com/rokucommunity/brighterscript/pull/1269))
     - Add templatestring support for annotation.getArguments() ([brighterscript#1264](https://github.com/rokucommunity/brighterscript/pull/1264))
     - Update Digitial Picture Frame url and img ([brighterscript#1237](https://github.com/rokucommunity/brighterscript/pull/1237))
     - Fix crash with missing scope ([brighterscript#1234](https://github.com/rokucommunity/brighterscript/pull/1234))
     - Bump braces from 3.0.2 to 3.0.3 in /benchmarks ([brighterscript#1229](https://github.com/rokucommunity/brighterscript/pull/1229))
     - fix: conform bsconfig.schema.json to strict types ([brighterscript#1205](https://github.com/rokucommunity/brighterscript/pull/1205))
     - Flag using devDependency in production code ([brighterscript#1222](https://github.com/rokucommunity/brighterscript/pull/1222))
     - Fix crash with optional chaining in signature help ([brighterscript#1207](https://github.com/rokucommunity/brighterscript/pull/1207))
     - Logger nocolor ([brighterscript#1189](https://github.com/rokucommunity/brighterscript/pull/1189))
     - Fix crash when diagnostic is missing range ([brighterscript#1174](https://github.com/rokucommunity/brighterscript/pull/1174))
     - Fix formatting with logger output ([brighterscript#1171](https://github.com/rokucommunity/brighterscript/pull/1171))
     - Move function calls to separate diagnostic ([brighterscript#1169](https://github.com/rokucommunity/brighterscript/pull/1169))
     - fix: resolve the stagingDir option relative to the bsconfig.json file ([brighterscript#1148](https://github.com/rokucommunity/brighterscript/pull/1148))
     - Bump tar from 6.1.13 to 6.2.1 in /benchmarks ([brighterscript#1131](https://github.com/rokucommunity/brighterscript/pull/1131))
     - Fix node14 issues ([brighterscript#1153](https://github.com/rokucommunity/brighterscript/pull/1153))
     - Upgrade to @rokucommunity/logger ([brighterscript#1137](https://github.com/rokucommunity/brighterscript/pull/1137))
     - Improve workspace/document symbol handling ([brighterscript#1120](https://github.com/rokucommunity/brighterscript/pull/1120))
     - Plugin hook provide workspace symbol ([brighterscript#1118](https://github.com/rokucommunity/brighterscript/pull/1118))
     - Upgade LSP packages ([brighterscript#1117](https://github.com/rokucommunity/brighterscript/pull/1117))
     - Add plugin hook for documentSymbol ([brighterscript#1116](https://github.com/rokucommunity/brighterscript/pull/1116))
     - Increase max param count to 63 ([brighterscript#1112](https://github.com/rokucommunity/brighterscript/pull/1112))
     - Prevent unused variable warnings on ternary and null coalescence expressions ([brighterscript#1101](https://github.com/rokucommunity/brighterscript/pull/1101))
     - Support when tokens have null ranges ([brighterscript#1072](https://github.com/rokucommunity/brighterscript/pull/1072))
     - Support whitespace in conditional compile keywords ([brighterscript#1090](https://github.com/rokucommunity/brighterscript/pull/1090))
     - Add `create-test-package` command for easier tgz testing ([brighterscript#1088](https://github.com/rokucommunity/brighterscript/pull/1088))
     - Allow negative patterns in diagnostic filters ([brighterscript#1078](https://github.com/rokucommunity/brighterscript/pull/1078))
     - Bump ip from 2.0.0 to 2.0.1 in /benchmarks ([brighterscript#1079](https://github.com/rokucommunity/brighterscript/pull/1079))
     - Reduce null safety issues in Statement and Expression subclasses ([brighterscript#1033](https://github.com/rokucommunity/brighterscript/pull/1033))
     - TBD-204: Empty interfaces break the parser ([brighterscript#1082](https://github.com/rokucommunity/brighterscript/pull/1082))
     - fix maestro link ([brighterscript#1068](https://github.com/rokucommunity/brighterscript/pull/1068))
     - Add support for `provideReferences` in plugins ([brighterscript#1066](https://github.com/rokucommunity/brighterscript/pull/1066))
     - Fix sourcemap comment and add `file` prop to map ([brighterscript#1064](https://github.com/rokucommunity/brighterscript/pull/1064))
     - Allow v1 syntax: built-in types for class member types and type declarations on lhs ([brighterscript#1059](https://github.com/rokucommunity/brighterscript/pull/1059))
     - Move `coveralls-next` to a devDependency since it's not needed at runtime ([brighterscript#1051](https://github.com/rokucommunity/brighterscript/pull/1051))
     - Fix parsing issues with multi-index IndexedSet and IndexedGet ([brighterscript#1050](https://github.com/rokucommunity/brighterscript/pull/1050))
     - Add plugin hooks for getDefinition ([brighterscript#1045](https://github.com/rokucommunity/brighterscript/pull/1045))
     - Backport v1 syntax changes ([brighterscript#1034](https://github.com/rokucommunity/brighterscript/pull/1034))
     - Refactor bsconfig documentation ([brighterscript#1024](https://github.com/rokucommunity/brighterscript/pull/1024))
     - Prevent overwriting the Program._manifest if already set on startup ([brighterscript#1027](https://github.com/rokucommunity/brighterscript/pull/1027))
     - Improving null safety: Add FinalizedBsConfig and tweak plugin events ([brighterscript#1000](https://github.com/rokucommunity/brighterscript/pull/1000))
     - adds support for libpkg prefix ([brighterscript#1017](https://github.com/rokucommunity/brighterscript/pull/1017))
     - add documentation on pruneEmptyCodeFiles to the README ([brighterscript#1012](https://github.com/rokucommunity/brighterscript/pull/1012))
     - Assign .program to the builder BEFORE calling afterProgram ([brighterscript#1011](https://github.com/rokucommunity/brighterscript/pull/1011))
     - Prevent publishing of empty files ([brighterscript#997](https://github.com/rokucommunity/brighterscript/pull/997))
     - Improve null safety ([brighterscript#996](https://github.com/rokucommunity/brighterscript/pull/996))
     - Prevent errors when using enums in a file that's not included in any scopes ([brighterscript#995](https://github.com/rokucommunity/brighterscript/pull/995))
     - Fix multi-namespace class inheritance transpile bug ([brighterscript#990](https://github.com/rokucommunity/brighterscript/pull/990))
     - Add check for onChange function ([brighterscript#941](https://github.com/rokucommunity/brighterscript/pull/941))
     - Fix broken enum transpiling ([brighterscript#985](https://github.com/rokucommunity/brighterscript/pull/985))
     - Fix out-of-date transpile blocks in docs ([brighterscript#956](https://github.com/rokucommunity/brighterscript/pull/956))
     - Add `optional` modifier for interface and class members ([brighterscript#955](https://github.com/rokucommunity/brighterscript/pull/955))
     - Use regex for faster manifest/typedef detection ([brighterscript#976](https://github.com/rokucommunity/brighterscript/pull/976))
     - fix the create-package script ([brighterscript#974](https://github.com/rokucommunity/brighterscript/pull/974))
     - Correct RANGE in template string when dealing with quotes in annotations ([brighterscript#975](https://github.com/rokucommunity/brighterscript/pull/975))
     - Add manifest loading from files ([brighterscript#942](https://github.com/rokucommunity/brighterscript/pull/942))
     - Fix for the fix ([brighterscript#953](https://github.com/rokucommunity/brighterscript/pull/953))
     - Enums as class initial values ([brighterscript#950](https://github.com/rokucommunity/brighterscript/pull/950))
     - Add create-package label build script ([brighterscript#945](https://github.com/rokucommunity/brighterscript/pull/945))
     - Fix issue with unary expression parsing ([brighterscript#938](https://github.com/rokucommunity/brighterscript/pull/938))
     - ci: Don't run `test-related-projects` on release since it already ran on build ([#brighterscript157fc2ee](https://github.com/rokucommunity/brighterscript/commit/157fc2ee))
     - Bump postcss from 8.2.15 to 8.4.31 ([brighterscript#928](https://github.com/rokucommunity/brighterscript/pull/928))
     - Add interface parameter support ([brighterscript#924](https://github.com/rokucommunity/brighterscript/pull/924))
     - Better typing for `Deferred` ([brighterscript#923](https://github.com/rokucommunity/brighterscript/pull/923))
     - fix bug in --noproject flag logic ([brighterscript#922](https://github.com/rokucommunity/brighterscript/pull/922))
     - Add some more details to the plugins docs ([brighterscript#913](https://github.com/rokucommunity/brighterscript/pull/913))
     - Fix incorrect quasi location in template string ([brighterscript#921](https://github.com/rokucommunity/brighterscript/pull/921))
     - Fix UnaryExpression transpile for ns and const ([brighterscript#914](https://github.com/rokucommunity/brighterscript/pull/914))
     - Add missing emitDefinitions to docs and fix iface ([brighterscript#893](https://github.com/rokucommunity/brighterscript/pull/893))
     - add noProject flag to bsc so BSConfig.json not expected ([brighterscript#868](https://github.com/rokucommunity/brighterscript/pull/868))
     - Task/support bs const in bsconfig ([brighterscript#887](https://github.com/rokucommunity/brighterscript/pull/887))
     - allow optionally specifying bslib destination directory ([brighterscript#871](https://github.com/rokucommunity/brighterscript/pull/871))
     - ensure consistent insertion of bslib.brs ([brighterscript#870](https://github.com/rokucommunity/brighterscript/pull/870))
     - Fix crashes in util for null ranges ([brighterscript#869](https://github.com/rokucommunity/brighterscript/pull/869))
     - Print diagnostic related information ([brighterscript#867](https://github.com/rokucommunity/brighterscript/pull/867))
     - Fix tab issue when printing diagnostics ([brighterscript#865](https://github.com/rokucommunity/brighterscript/pull/865))
     - Install `v8-profiler-next` on demand instead of being a dependency ([brighterscript#854](https://github.com/rokucommunity/brighterscript/pull/854))
     - Bump word-wrap from 1.2.3 to 1.2.4 ([brighterscript#851](https://github.com/rokucommunity/brighterscript/pull/851))
     - Show busy spinner for lsp builds ([brighterscript#852](https://github.com/rokucommunity/brighterscript/pull/852))
     - Expose event interface ([brighterscript#845](https://github.com/rokucommunity/brighterscript/pull/845))
     - Add beforeProgramDispose event ([brighterscript#844](https://github.com/rokucommunity/brighterscript/pull/844))
     - Make component ready on afterScopeCreate ([brighterscript#843](https://github.com/rokucommunity/brighterscript/pull/843))
     - Add project index to language server log entries ([brighterscript#836](https://github.com/rokucommunity/brighterscript/pull/836))
     - Bump semver from 6.3.0 to 6.3.1 in /benchmarks ([brighterscript#838](https://github.com/rokucommunity/brighterscript/pull/838))
     - Bump semver from 5.7.1 to 5.7.2 ([brighterscript#837](https://github.com/rokucommunity/brighterscript/pull/837))
     - Convert all benchmarks to typescript. ([brighterscript#835](https://github.com/rokucommunity/brighterscript/pull/835))
     - Add profiling support to the cli ([brighterscript#833](https://github.com/rokucommunity/brighterscript/pull/833))
     - Prevent crashing when diagnostic is missing range. ([brighterscript#832](https://github.com/rokucommunity/brighterscript/pull/832))
     - Prevent crash when diagnostic is missing range ([brighterscript#831](https://github.com/rokucommunity/brighterscript/pull/831))
     - Add baseline interface docs ([brighterscript#829](https://github.com/rokucommunity/brighterscript/pull/829))
     - Fix injection of duplicate super calls into classes ([brighterscript#823](https://github.com/rokucommunity/brighterscript/pull/823))
     - npm audit fixes. upgrade to coveralls-next ([#brighterscript43756d83](https://github.com/rokucommunity/brighterscript/commit/43756d83))
     - Improve findChild and findAncestor AST methods ([brighterscript#807](https://github.com/rokucommunity/brighterscript/pull/807))
     - Fix code formatting ([brighterscript#805](https://github.com/rokucommunity/brighterscript/pull/805))
     - Update README.md ([brighterscript#804](https://github.com/rokucommunity/brighterscript/pull/804))
     - Improves performance in symbol table fetching ([brighterscript#797](https://github.com/rokucommunity/brighterscript/pull/797))
     - Add cpuprofile ability to the benchmarks ([brighterscript#796](https://github.com/rokucommunity/brighterscript/pull/796))
     - Fix benchmark crashes ([brighterscript#795](https://github.com/rokucommunity/brighterscript/pull/795))
     - Fix namespace-relative enum value ([brighterscript#793](https://github.com/rokucommunity/brighterscript/pull/793))
     - Bump xml2js from 0.4.23 to 0.5.0 ([brighterscript#790](https://github.com/rokucommunity/brighterscript/pull/790))
     - Fix namespace-relative items ([brighterscript#789](https://github.com/rokucommunity/brighterscript/pull/789))
     - Wrap transpiled template strings in parens ([brighterscript#788](https://github.com/rokucommunity/brighterscript/pull/788))
     - Simplify the ast range logic ([brighterscript#784](https://github.com/rokucommunity/brighterscript/pull/784))
     - Add github icon back into build status badge ([#brighterscript30d25ae1](https://github.com/rokucommunity/brighterscript/commit/30d25ae1))
     - Another build status badge fix ([#brighterscript9250656b](https://github.com/rokucommunity/brighterscript/commit/9250656b))
     - Fix build status badge ([#brighterscript1b31d04e](https://github.com/rokucommunity/brighterscript/commit/1b31d04e))
     - Optional chaining assignment validation ([brighterscript#782](https://github.com/rokucommunity/brighterscript/pull/782))
     - Fix transpile bug with optional chaning ([brighterscript#781](https://github.com/rokucommunity/brighterscript/pull/781))
     - Add 'severityOverride' option ([brighterscript#725](https://github.com/rokucommunity/brighterscript/pull/725))
     - Fix crash when func has no block ([brighterscript#774](https://github.com/rokucommunity/brighterscript/pull/774))
     - Remove invalid annotation example ([#brighterscript8d3d74ee](https://github.com/rokucommunity/brighterscript/commit/8d3d74ee))
     - Move not-referenced check into ProgramValidator ([brighterscript#773](https://github.com/rokucommunity/brighterscript/pull/773))
     - Fixing issues before release 0.61.3 ([#brighterscriptfd841a0d](https://github.com/rokucommunity/brighterscript/commit/fd841a0d))
     - Bump luxon from 1.25.0 to 2.5.2 ([brighterscript#768](https://github.com/rokucommunity/brighterscript/pull/768))
     - Bump json5 from 2.2.0 to 2.2.3 ([brighterscript#766](https://github.com/rokucommunity/brighterscript/pull/766))
     - Add diagnostic for passing more than 5 arguments to a callFunc ([brighterscript#765](https://github.com/rokucommunity/brighterscript/pull/765))
     - Fix test-related-projects. Reenable rooibos ([brighterscript#761](https://github.com/rokucommunity/brighterscript/pull/761))
     - Bump qs from 6.5.2 to 6.5.3 ([brighterscript#758](https://github.com/rokucommunity/brighterscript/pull/758))
     - Ensure enums and interfaces persist in typedefs ([brighterscript#757](https://github.com/rokucommunity/brighterscript/pull/757))
     - Throttle transpiling to prevent crashes ([brighterscript#755](https://github.com/rokucommunity/brighterscript/pull/755))
     - Let users use or discard explicit types ([brighterscript#744](https://github.com/rokucommunity/brighterscript/pull/744))
     - Fix exception while validating continue statement ([brighterscript#752](https://github.com/rokucommunity/brighterscript/pull/752))
     - Add missing visitor params for DottedSetStatement ([brighterscript#748](https://github.com/rokucommunity/brighterscript/pull/748))
     - Flag incorrectly nested statements ([brighterscript#747](https://github.com/rokucommunity/brighterscript/pull/747))
     - Prevent a double `super` call in subclasses ([brighterscript#740](https://github.com/rokucommunity/brighterscript/pull/740))
     - Fixes issues with Roku doc scraper and adds missing components ([brighterscript#736](https://github.com/rokucommunity/brighterscript/pull/736))
     - Cache `getCallableByName` ([brighterscript#739](https://github.com/rokucommunity/brighterscript/pull/739))
     - Prevent namespaces being used as variables ([brighterscript#738](https://github.com/rokucommunity/brighterscript/pull/738))
     - Fix audit issues ([#brighterscript569fadc2](https://github.com/rokucommunity/brighterscript/commit/569fadc2))
     - Refactor SymbolTable and AST parent logic ([brighterscript#732](https://github.com/rokucommunity/brighterscript/pull/732))
     - Fix crash in `getDefinition` ([brighterscript#734](https://github.com/rokucommunity/brighterscript/pull/734))
     - Remove parentStack to prevent circular references ([brighterscript#731](https://github.com/rokucommunity/brighterscript/pull/731))
     - Copy information on files field from roku-deploy and restructure bsconfig section of README ([brighterscript#714](https://github.com/rokucommunity/brighterscript/pull/714))
     - Allow `continue` as local var ([brighterscript#730](https://github.com/rokucommunity/brighterscript/pull/730))
     - prevent duplicate gha builds ([#brighterscript361458d8](https://github.com/rokucommunity/brighterscript/commit/361458d8))
     - logo adjustments ([#brighterscript406bd9b4](https://github.com/rokucommunity/brighterscript/commit/406bd9b4))
     - Add name to symbol table ([brighterscript#728](https://github.com/rokucommunity/brighterscript/pull/728))
     - semanticToken request wait until validate finishes ([brighterscript#727](https://github.com/rokucommunity/brighterscript/pull/727))
     - Add a small code example below each docs link ([#brighterscript4f29020f](https://github.com/rokucommunity/brighterscript/commit/4f29020f))
     - better parse recover for unknown func params ([brighterscript#722](https://github.com/rokucommunity/brighterscript/pull/722))
     - fix docs about bs:disable-line comments ([#brighterscriptebd3040b](https://github.com/rokucommunity/brighterscript/commit/ebd3040b))
     - Fix if statement block var bug ([brighterscript#698](https://github.com/rokucommunity/brighterscript/pull/698))
     - Beter location for bs1042 ([brighterscript#719](https://github.com/rokucommunity/brighterscript/pull/719))
     - Add redspace logo to "who uses brighterscript" ([#brighterscript9a62a2bc](https://github.com/rokucommunity/brighterscript/commit/9a62a2bc))
     - adds goto definition for enum statements and enum members ([brighterscript#715](https://github.com/rokucommunity/brighterscript/pull/715))
     - Adds jsdoc eslint checking ([brighterscript#717](https://github.com/rokucommunity/brighterscript/pull/717))
     - fixes signature help resolution for callexpressions ([brighterscript#707](https://github.com/rokucommunity/brighterscript/pull/707))
     - Merge branch 'master' of https://github.com/rokucommunity/brighterscript ([#brighterscriptbc7367a5](https://github.com/rokucommunity/brighterscript/commit/bc7367a5))
     - Tweak logo layout design. ([#brighterscriptf0c4f7d1](https://github.com/rokucommunity/brighterscript/commit/f0c4f7d1))
     - Support `pkg:/` paths for `setFile` ([brighterscript#701](https://github.com/rokucommunity/brighterscript/pull/701))
     - Syntax and transpile support for continue statement ([brighterscript#697](https://github.com/rokucommunity/brighterscript/pull/697))
     - better logo formatting ([#brighterscript77e9f008](https://github.com/rokucommunity/brighterscript/commit/77e9f008))
     - Add a "who uses this" logo ([#brighterscript80c7de6a](https://github.com/rokucommunity/brighterscript/commit/80c7de6a))
     - Optimize logos ([#brighterscriptea9cdb1f](https://github.com/rokucommunity/brighterscript/commit/ea9cdb1f))
     - Merge branch 'master' of https://github.com/rokucommunity/brighterscript ([#brighterscriptb7eed954](https://github.com/rokucommunity/brighterscript/commit/b7eed954))
     - Add fubo logo ([#brighterscript78ed8af8](https://github.com/rokucommunity/brighterscript/commit/78ed8af8))
     - Fix brightscript.configFile workspace config bug ([brighterscript#686](https://github.com/rokucommunity/brighterscript/pull/686))
     - fix(parser): consider namespace function transpiled names ([brighterscript#685](https://github.com/rokucommunity/brighterscript/pull/685))
     - Update build.yml ([#brighterscript82620e06](https://github.com/rokucommunity/brighterscript/commit/82620e06))
     - Allow `mod` as an aa prop, aa member identifier kinds forced to Identifier ([brighterscript#684](https://github.com/rokucommunity/brighterscript/pull/684))
     - Doc Scraper Fixes ([brighterscript#585](https://github.com/rokucommunity/brighterscript/pull/585))
     - Validate too deep nested files ([brighterscript#680](https://github.com/rokucommunity/brighterscript/pull/680))
     - Add class method binding docs ([brighterscript#682](https://github.com/rokucommunity/brighterscript/pull/682))
     - Fix case sensitivity issue with bs_const values ([brighterscript#677](https://github.com/rokucommunity/brighterscript/pull/677))
     - Fix compile crash for scope-less files ([brighterscript#674](https://github.com/rokucommunity/brighterscript/pull/674))
     - Fix parse error for malformed dim statement ([brighterscript#673](https://github.com/rokucommunity/brighterscript/pull/673))
     - Add validation for dimmed variables ([brighterscript#672](https://github.com/rokucommunity/brighterscript/pull/672))
     - Allow const as variable name ([brighterscript#670](https://github.com/rokucommunity/brighterscript/pull/670))
     - add "--lsp" flag to bsc to start an LSP server ([brighterscript#668](https://github.com/rokucommunity/brighterscript/pull/668))
     - Fix crashes for clients that don't support "workspace/configuration" requests ([brighterscript#667](https://github.com/rokucommunity/brighterscript/pull/667))
     - Dedupe code completions in components ([brighterscript#664](https://github.com/rokucommunity/brighterscript/pull/664))
     - Fix scope-specific diagnostic grouping issue ([brighterscript#660](https://github.com/rokucommunity/brighterscript/pull/660))
     - Fix typescript error for ast parent setting ([brighterscript#659](https://github.com/rokucommunity/brighterscript/pull/659))
     - Fix missing constant references ([brighterscript#658](https://github.com/rokucommunity/brighterscript/pull/658))
     - Link all brs AST nodes to parent onFileValidate ([brighterscript#650](https://github.com/rokucommunity/brighterscript/pull/650))
     - Add a `toJSON` function to SymbolTable ([brighterscript#655](https://github.com/rokucommunity/brighterscript/pull/655))
     - Performance boost: better function sorting during validation ([brighterscript#651](https://github.com/rokucommunity/brighterscript/pull/651))
     - Add semantic token color for consts ([brighterscript#654](https://github.com/rokucommunity/brighterscript/pull/654))
     - Add go-to-definition support for const statements ([brighterscript#653](https://github.com/rokucommunity/brighterscript/pull/653))
     - Fix broken plugin imports with custom cwd ([brighterscript#652](https://github.com/rokucommunity/brighterscript/pull/652))
     - Fix bug in languageserver hover provider ([brighterscript#649](https://github.com/rokucommunity/brighterscript/pull/649))
     - Add hover for CONST references. ([brighterscript#648](https://github.com/rokucommunity/brighterscript/pull/648))
     - Allow plugins to contribute completions ([brighterscript#647](https://github.com/rokucommunity/brighterscript/pull/647))
     - chore: github actions use latest operating systems ([#brighterscript0b3d31a5](https://github.com/rokucommunity/brighterscript/commit/0b3d31a5))
     - Plugin support for hover ([brighterscript#393](https://github.com/rokucommunity/brighterscript/pull/393))
     - Export some vscode interfaces ([brighterscript#644](https://github.com/rokucommunity/brighterscript/pull/644))
     - Better plugin docs ([brighterscript#643](https://github.com/rokucommunity/brighterscript/pull/643))
     - Bump moment from 2.29.2 to 2.29.4 ([brighterscript#640](https://github.com/rokucommunity/brighterscript/pull/640))
     - Support codeactions at the edges of tokens. ([brighterscript#642](https://github.com/rokucommunity/brighterscript/pull/642))
     - Fix nested namespace import codeActions bug. ([brighterscript#641](https://github.com/rokucommunity/brighterscript/pull/641))
     - New Language Feature: Constants ([brighterscript#632](https://github.com/rokucommunity/brighterscript/pull/632))
     - No top level statements ([brighterscript#638](https://github.com/rokucommunity/brighterscript/pull/638))
     - Flag usage of undefined variables ([brighterscript#631](https://github.com/rokucommunity/brighterscript/pull/631))
     - Use `util.createLocation`, not `Location.create()` ([brighterscript#637](https://github.com/rokucommunity/brighterscript/pull/637))
     - Better project detection by language server ([brighterscript#633](https://github.com/rokucommunity/brighterscript/pull/633))
     - fix bug with class transpile in watch mode ([brighterscript#630](https://github.com/rokucommunity/brighterscript/pull/630))
     - Send program-triggered validate() diagnostics to language client ([brighterscript#629](https://github.com/rokucommunity/brighterscript/pull/629))
     - Emit before/after programTranspile during file transpile preview ([brighterscript#628](https://github.com/rokucommunity/brighterscript/pull/628))
     - Fix transpile crash when file was changed in beforeTranspile events ([brighterscript#627](https://github.com/rokucommunity/brighterscript/pull/627))
     - Fix transpile preview ([brighterscript#626](https://github.com/rokucommunity/brighterscript/pull/626))
     - Add another enum test ([brighterscript#625](https://github.com/rokucommunity/brighterscript/pull/625))
     - Fix missing range on interface statement ([brighterscript#623](https://github.com/rokucommunity/brighterscript/pull/623))
     - Fix bug that wasn't transpiling enums in binary expressions ([brighterscript#622](https://github.com/rokucommunity/brighterscript/pull/622))
     - Better enum/class/namespace semantic tokens ([brighterscript#621](https://github.com/rokucommunity/brighterscript/pull/621))
     - Catch class circular extends ([brighterscript#619](https://github.com/rokucommunity/brighterscript/pull/619))
     - roku-deploy@3.7.1 ([#brighterscript4f047a3b](https://github.com/rokucommunity/brighterscript/commit/4f047a3b))
     - add prerelease logic to master branch build script ([#brighterscript269a74f8](https://github.com/rokucommunity/brighterscript/commit/269a74f8))
     - Load projects based on bsconfig.json presence ([brighterscript#613](https://github.com/rokucommunity/brighterscript/pull/613))
     - Update to latest eslint and typescript ([brighterscript#614](https://github.com/rokucommunity/brighterscript/pull/614))
     - chore: clean up test debug profile ([#brighterscript857e00ec](https://github.com/rokucommunity/brighterscript/commit/857e00ec))
     - Use index accessor for lang server tests ([brighterscript#612](https://github.com/rokucommunity/brighterscript/pull/612))
     - Update fs-extra to v8.0.0 ([brighterscript#611](https://github.com/rokucommunity/brighterscript/pull/611))
     - Add `allowBrighterScriptInBrightScript` to bsconfig.schema.json ([brighterscript#610](https://github.com/rokucommunity/brighterscript/pull/610))
     - fix(hover): add hover to namespace functions ([brighterscript#606](https://github.com/rokucommunity/brighterscript/pull/606))
     - Add object and key to visitor callbacks. ([brighterscript#600](https://github.com/rokucommunity/brighterscript/pull/600))
     - fixes enums and interfaces resulting in diagnostics error when used as field types ([brighterscript#602](https://github.com/rokucommunity/brighterscript/pull/602))
     - fixes enums and interfaces resulting in diagnostics error when used as return types from a function ([brighterscript#601](https://github.com/rokucommunity/brighterscript/pull/601))
     - Support AstEditor in visitor editing pattern ([brighterscript#599](https://github.com/rokucommunity/brighterscript/pull/599))
     - Add function-based AstEditor.edit method ([brighterscript#598](https://github.com/rokucommunity/brighterscript/pull/598))
     - Allow multiple keys for getAllDependencies ([brighterscript#596](https://github.com/rokucommunity/brighterscript/pull/596))
     - update readme for `allowBrighterScriptInBrightScript` ([#brighterscript0194da27](https://github.com/rokucommunity/brighterscript/commit/0194da27))
     - Add unit tests for #573 ([#brighterscriptcf80835e](https://github.com/rokucommunity/brighterscript/commit/cf80835e))
     - roku-deploy@3.7.0 ([#brighterscript4196f87e](https://github.com/rokucommunity/brighterscript/commit/4196f87e))
     - Config for force transpile brs file ([brighterscript#573](https://github.com/rokucommunity/brighterscript/pull/573))
     - Add PhotoTV icon to the "who uses this" section. Resolves #594 ([#brighterscriptcc93e203](https://github.com/rokucommunity/brighterscript/commit/cc93e203))
     - Expose all the AstEditor methods to plugin events ([brighterscript#593](https://github.com/rokucommunity/brighterscript/pull/593))
     - Fix cwd issue with multi-root workspaces ([brighterscript#592](https://github.com/rokucommunity/brighterscript/pull/592))
     - Better super handling ([brighterscript#590](https://github.com/rokucommunity/brighterscript/pull/590))
     - Add more ast editor functions ([brighterscript#589](https://github.com/rokucommunity/brighterscript/pull/589))
     - Don't push synthetic constructor into each class ([brighterscript#586](https://github.com/rokucommunity/brighterscript/pull/586))
     - Fix semantic tokens for enums in if statements ([brighterscript#584](https://github.com/rokucommunity/brighterscript/pull/584))
     - Rename `ClassFieldStatement` and `ClassMethodStatement` ([brighterscript#582](https://github.com/rokucommunity/brighterscript/pull/582))
     - Adds tests for known bsc plugins ([brighterscript#583](https://github.com/rokucommunity/brighterscript/pull/583))
     - Src path in v0 ([brighterscript#581](https://github.com/rokucommunity/brighterscript/pull/581))
     - Allow interfaces and enums as function param types ([brighterscript#580](https://github.com/rokucommunity/brighterscript/pull/580))
     - Transpile files added after start of transpile cycle ([brighterscript#578](https://github.com/rokucommunity/brighterscript/pull/578))
     - More flexible cache typing ([brighterscript#577](https://github.com/rokucommunity/brighterscript/pull/577))
     - Add AstEditor to before/after programTranspile events ([brighterscript#576](https://github.com/rokucommunity/brighterscript/pull/576))
     - Use undent for tests to remove custom logic ([brighterscript#574](https://github.com/rokucommunity/brighterscript/pull/574))
     - Create object fixes ([brighterscript#568](https://github.com/rokucommunity/brighterscript/pull/568))
     - rename benchmarks debug target ([#brighterscriptd96110b5](https://github.com/rokucommunity/brighterscript/commit/d96110b5))
     - Create object validation ([brighterscript#435](https://github.com/rokucommunity/brighterscript/pull/435))
     - Optional chaining ([brighterscript#546](https://github.com/rokucommunity/brighterscript/pull/546))
     - feat(visitors.ts): added missing statements and expressions to `createVisitor`. ([brighterscript#567](https://github.com/rokucommunity/brighterscript/pull/567))
     - Bump moment from 2.29.1 to 2.29.2 ([brighterscript#566](https://github.com/rokucommunity/brighterscript/pull/566))
     - Fix manifest issues ([brighterscript#565](https://github.com/rokucommunity/brighterscript/pull/565))
     - Add the `require` entry to the bsconfig.schema.json ([brighterscript#560](https://github.com/rokucommunity/brighterscript/pull/560))
     - Another small plugin tweak ([#brighterscript3a3937aa](https://github.com/rokucommunity/brighterscript/commit/3a3937aa))
     - fix plugin example. ([#brighterscript76b340f5](https://github.com/rokucommunity/brighterscript/commit/76b340f5))
     - Fix enum transpile bug for binary expressions ([brighterscript#559](https://github.com/rokucommunity/brighterscript/pull/559))
     - Disable strict cli args to empower plugins ([brighterscript#557](https://github.com/rokucommunity/brighterscript/pull/557))
     - Don't add trailing commas for array and aa literals ([brighterscript#556](https://github.com/rokucommunity/brighterscript/pull/556))
     - Parser tweaks ([brighterscript#553](https://github.com/rokucommunity/brighterscript/pull/553))
     - Add spaces between Parser.primary() case conditions ([#brighterscript714a9e06](https://github.com/rokucommunity/brighterscript/commit/714a9e06))
     - Retain quote char when transpiling xml attributes ([brighterscript#552](https://github.com/rokucommunity/brighterscript/pull/552))
     - remove unused `--all` flag for tests ([#brighterscript02b7f700](https://github.com/rokucommunity/brighterscript/commit/02b7f700))
     - better plugin ts-node docs ([#brighterscriptf1ce56c3](https://github.com/rokucommunity/brighterscript/commit/f1ce56c3))
     - Add documentation about `require` flag ([#brighterscripta843ed55](https://github.com/rokucommunity/brighterscript/commit/a843ed55))
     - Allow require to be specified in bsconfig.json ([brighterscript#551](https://github.com/rokucommunity/brighterscript/pull/551))
     - Adds support for requiring external modules on startup ([brighterscript#550](https://github.com/rokucommunity/brighterscript/pull/550))
     - Merge branch 'master' of https://github.com/rokucommunity/brighterscript ([#brighterscripteb15d1a3](https://github.com/rokucommunity/brighterscript/commit/eb15d1a3))
     - hide sourcemap warning during debug ([#brighterscript5a4061ab](https://github.com/rokucommunity/brighterscript/commit/5a4061ab))
     - fix npm audit issue ([#brighterscriptc6e99112](https://github.com/rokucommunity/brighterscript/commit/c6e99112))
     - make watch task actually a watcher ([#brighterscript4c7949d8](https://github.com/rokucommunity/brighterscript/commit/4c7949d8))
     - roku-deploy@3.5.4 ([#brighterscriptd56f761f](https://github.com/rokucommunity/brighterscript/commit/d56f761f))
     - Don't depend on transpile to test plugins ([brighterscript#540](https://github.com/rokucommunity/brighterscript/pull/540))
     - Add more brand logos to "who uses this project" ([brighterscript#533](https://github.com/rokucommunity/brighterscript/pull/533))
     - fix crash when checking for enums to transpile ([brighterscript#539](https://github.com/rokucommunity/brighterscript/pull/539))
     - Transpile if statements as written ([brighterscript#537](https://github.com/rokucommunity/brighterscript/pull/537))
     - Show cli usage in plugins documentation ([#brighterscript5cdec5bf](https://github.com/rokucommunity/brighterscript/commit/5cdec5bf))
     - Keep the original type case when transpiling. ([brighterscript#536](https://github.com/rokucommunity/brighterscript/pull/536))
     - Fix typedef auto-generated class constructor funcs ([brighterscript#535](https://github.com/rokucommunity/brighterscript/pull/535))
     - Fix logger.time() not returning accurate timings ([brighterscript#532](https://github.com/rokucommunity/brighterscript/pull/532))
     - Update create-vsix.yml ([#brighterscript7c076cb6](https://github.com/rokucommunity/brighterscript/commit/7c076cb6))
     - Better plugin documentation ([#brighterscriptd10bc73d](https://github.com/rokucommunity/brighterscript/commit/d10bc73d))
     - Fix removePrint plugin ([#brighterscript7cc62c66](https://github.com/rokucommunity/brighterscript/commit/7cc62c66))
     - Make plugin example more clear ([#brighterscript764c35c9](https://github.com/rokucommunity/brighterscript/commit/764c35c9))
     - Improve readme badges ([brighterscript#531](https://github.com/rokucommunity/brighterscript/pull/531))
     - Compute ownScriptImports after invalidateReferences() ([brighterscript#529](https://github.com/rokucommunity/brighterscript/pull/529))
     - fix browserlist warning. ([#brighterscript4fb69872](https://github.com/rokucommunity/brighterscript/commit/4fb69872))
     - Use valid range for interpolatedRange ([brighterscript#528](https://github.com/rokucommunity/brighterscript/pull/528))
     - Rename getTranspiledFileContents param. ([#brighterscript2f7faf85](https://github.com/rokucommunity/brighterscript/commit/2f7faf85))
     - Fix memory leak ([brighterscript#527](https://github.com/rokucommunity/brighterscript/pull/527))
     - Bust npm cache for benchmarking local ([#brighterscriptf7de0f6c](https://github.com/rokucommunity/brighterscript/commit/f7de0f6c))
     - remove VariableExpression.isCalled ([brighterscript#525](https://github.com/rokucommunity/brighterscript/pull/525))
     - Adds default token values in creators. Simplifies class 'new' default builder ([brighterscript#520](https://github.com/rokucommunity/brighterscript/pull/520))
     - Fixes bug with transpilinig empty for loop ([brighterscript#519](https://github.com/rokucommunity/brighterscript/pull/519))
     - roku-deploy@3.5.3 ([#brighterscript8fa1c52e](https://github.com/rokucommunity/brighterscript/commit/8fa1c52e))
     - fix offset issue with diagnostic printing in cli ([brighterscript#518](https://github.com/rokucommunity/brighterscript/pull/518))
     - Add Enum functionality ([brighterscript#484](https://github.com/rokucommunity/brighterscript/pull/484))
     - Bump pathval from 1.1.0 to 1.1.1 ([brighterscript#513](https://github.com/rokucommunity/brighterscript/pull/513))
     - Add transpile override to AstEditor ([brighterscript#511](https://github.com/rokucommunity/brighterscript/pull/511))
     - Add `setFile` method, deprecate `addOrReplaceFile` ([brighterscript#510](https://github.com/rokucommunity/brighterscript/pull/510))
     - Cache extends `Map`. ([brighterscript#509](https://github.com/rokucommunity/brighterscript/pull/509))
     - program file improvements ([brighterscript#506](https://github.com/rokucommunity/brighterscript/pull/506))
     - Add `onScopeValidate` plugin event. ([brighterscript#505](https://github.com/rokucommunity/brighterscript/pull/505))
     - Rename semantic token processor plugin class ([#brighterscript01905627](https://github.com/rokucommunity/brighterscript/commit/01905627))
     - Move file validation into  program.validate() ([brighterscript#504](https://github.com/rokucommunity/brighterscript/pull/504))
     - Support generics for Cache class ([brighterscript#503](https://github.com/rokucommunity/brighterscript/pull/503))
     - Fire plugin events for getTranspiledFile. Add new event properties ([brighterscript#502](https://github.com/rokucommunity/brighterscript/pull/502))
     - Fix bug with optional parameters ([brighterscript#501](https://github.com/rokucommunity/brighterscript/pull/501))
     - Fix crash when hovering over global functions. ([brighterscript#497](https://github.com/rokucommunity/brighterscript/pull/497))
     - Adds support for function docs in hover ([brighterscript#495](https://github.com/rokucommunity/brighterscript/pull/495))
     - Move parse and validate events out to program level ([brighterscript#494](https://github.com/rokucommunity/brighterscript/pull/494))
     - Fix parser bug after interface statement. ([brighterscript#493](https://github.com/rokucommunity/brighterscript/pull/493))
     - Remove nested index files ([brighterscript#492](https://github.com/rokucommunity/brighterscript/pull/492))
     - fix npm audit issues. ([#brighterscript5c613339](https://github.com/rokucommunity/brighterscript/commit/5c613339))
     - Don't import from `..` folders ([brighterscript#491](https://github.com/rokucommunity/brighterscript/pull/491))
     - Adds plugin hooks for file validation ([brighterscript#490](https://github.com/rokucommunity/brighterscript/pull/490))
     - Parser references expressions ([brighterscript#487](https://github.com/rokucommunity/brighterscript/pull/487))
     - don't crash on null options in printDiagnostics ([#brighterscript3147202b](https://github.com/rokucommunity/brighterscript/commit/3147202b))
     - Fix comment typo ([#brighterscript11667047](https://github.com/rokucommunity/brighterscript/commit/11667047))
     - clean up XmlScope mocks between tests ([#brighterscript6f6d2581](https://github.com/rokucommunity/brighterscript/commit/6f6d2581))
     - vscode formatting setting ([#brighterscript35ab28d0](https://github.com/rokucommunity/brighterscript/commit/35ab28d0))
     - Add diagnostic test helpers ([brighterscript#482](https://github.com/rokucommunity/brighterscript/pull/482))
     - Use Map for ClassValidator class lookup ([brighterscript#481](https://github.com/rokucommunity/brighterscript/pull/481))
     - Add more missing parent class unit tests. ([#brighterscript750d8e06](https://github.com/rokucommunity/brighterscript/commit/750d8e06))
     - Set isOptional value on every global func param ([brighterscript#479](https://github.com/rokucommunity/brighterscript/pull/479))
     - AST editing ([brighterscript#478](https://github.com/rokucommunity/brighterscript/pull/478))
     - Null coalescing <uninitialized> fix ([brighterscript#474](https://github.com/rokucommunity/brighterscript/pull/474))
     - changelog for v0.41.5 ([#brighterscript059df5cb](https://github.com/rokucommunity/brighterscript/commit/059df5cb))
     - prevent js proto collision by storing namespaceLookup in Map ([brighterscript#469](https://github.com/rokucommunity/brighterscript/pull/469))
     - add "watch" vscode task. ([#brighterscriptbb37c83f](https://github.com/rokucommunity/brighterscript/commit/bb37c83f))
     - add build script. ([brighterscript#467](https://github.com/rokucommunity/brighterscript/pull/467))
     - Add transpile fix for instantresume components ([brighterscript#465](https://github.com/rokucommunity/brighterscript/pull/465))
     - Update README.md ([#brighterscript2612b195](https://github.com/rokucommunity/brighterscript/commit/2612b195))
     - inline all changelog links ([#brighterscriptd1554c7f](https://github.com/rokucommunity/brighterscript/commit/d1554c7f))
     - roku-deploy@3.5.0 ([#brighterscript6df1e9ed](https://github.com/rokucommunity/brighterscript/commit/6df1e9ed))
     - Allow diagnostic non-numeric disable code comments ([brighterscript#463](https://github.com/rokucommunity/brighterscript/pull/463))
     - Fix crash with mismatched class members ([brighterscript#461](https://github.com/rokucommunity/brighterscript/pull/461))
     - Fix bugs when parsing regex ([brighterscript#458](https://github.com/rokucommunity/brighterscript/pull/458))
     - Upgrade typescript and eslint ([brighterscript#456](https://github.com/rokucommunity/brighterscript/pull/456))
     - fix out-of-sync compliled doc code blocks ([#brighterscript8bc97443](https://github.com/rokucommunity/brighterscript/commit/8bc97443))
     - Add regex literal support ([brighterscript#452](https://github.com/rokucommunity/brighterscript/pull/452))
     - roku-deploy@3.4.2 ([#brighterscript7aa1847d](https://github.com/rokucommunity/brighterscript/commit/7aa1847d))
     - Bump jszip from 3.6.0 to 3.7.1 ([brighterscript#438](https://github.com/rokucommunity/brighterscript/pull/438))
     - Bump path-parse from 1.0.6 to 1.0.7 ([brighterscript#436](https://github.com/rokucommunity/brighterscript/pull/436))
     - fix changelog links. ([#brighterscript485a77db](https://github.com/rokucommunity/brighterscript/commit/485a77db))
     - CLI outputs the path of bsconfig.json on startup ([brighterscript#434](https://github.com/rokucommunity/brighterscript/pull/434))
     - Adds language support for Interface statements ([brighterscript#426](https://github.com/rokucommunity/brighterscript/pull/426))
     - Adds a bunch of functions from v30/bslCore library to the global callables list ([brighterscript#433](https://github.com/rokucommunity/brighterscript/pull/433))
     - Allow up to 6 arguements to CreateObject to support roRegion - fixes #430 ([brighterscript#432](https://github.com/rokucommunity/brighterscript/pull/432))
     - Extract AA comma when parsing ([brighterscript#427](https://github.com/rokucommunity/brighterscript/pull/427))
     - Fix incorrect Block range for inline if/then branch ([brighterscript#424](https://github.com/rokucommunity/brighterscript/pull/424))
     - Bump glob-parent from 5.1.1 to 5.1.2 ([brighterscript#428](https://github.com/rokucommunity/brighterscript/pull/428))
     - roku-deploy@3.4.1 ([#brighterscriptb09f844b](https://github.com/rokucommunity/brighterscript/commit/b09f844b))
     - fix interface issues from roku-deploy ([#brighterscripte2cef4df](https://github.com/rokucommunity/brighterscript/commit/e2cef4df))
     - roku-deploy@3.4.0 ([#brighterscripta90c484f](https://github.com/rokucommunity/brighterscript/commit/a90c484f))
     - Add unit tests for Logger and Stopwatch ([brighterscript#420](https://github.com/rokucommunity/brighterscript/pull/420))
     - Fix code actions construction for "replace" tasks ([brighterscript#421](https://github.com/rokucommunity/brighterscript/pull/421))
     - Plugin semantic highlighting ([brighterscript#396](https://github.com/rokucommunity/brighterscript/pull/396))
     - Update CHANGELOG.md ([#brighterscript8e687fc7](https://github.com/rokucommunity/brighterscript/commit/8e687fc7))
     - lint fixes ([#brighterscript37852377](https://github.com/rokucommunity/brighterscript/commit/37852377))
     - Unit tests for #419 ([#brighterscript904ddcbf](https://github.com/rokucommunity/brighterscript/commit/904ddcbf))
     - Incomplete statement in namespace can crash the server ([brighterscript#419](https://github.com/rokucommunity/brighterscript/pull/419))
     - ParseJson allows two parameters as of Roku OS 9.4 ([brighterscript#418](https://github.com/rokucommunity/brighterscript/pull/418))
     - concatanates source literal file paths so that the transpiled output does not cause issues with roku's static analysis tool ([brighterscript#415](https://github.com/rokucommunity/brighterscript/pull/415))
     - Fix/bs config schema allows string diagnostic codes ([brighterscript#416](https://github.com/rokucommunity/brighterscript/pull/416))
     - Bump postcss from 8.2.8 to 8.2.15 ([brighterscript#413](https://github.com/rokucommunity/brighterscript/pull/413))
     - Bump lodash from 4.17.20 to 4.17.21 ([brighterscript#410](https://github.com/rokucommunity/brighterscript/pull/410))
     - Bump hosted-git-info from 2.8.8 to 2.8.9 ([brighterscript#411](https://github.com/rokucommunity/brighterscript/pull/411))
     - Merge pull request #386 from rokucommunity/upgrade-chokidar ([#brighterscriptc7f86cc5](https://github.com/rokucommunity/brighterscript/commit/c7f86cc5))
     - Allow field overrides, disallow type changes ([brighterscript#394](https://github.com/rokucommunity/brighterscript/pull/394))
     - adds warning for mismatched class member accessibility ([brighterscript#402](https://github.com/rokucommunity/brighterscript/pull/402))
     - validate transpile code ([brighterscript#392](https://github.com/rokucommunity/brighterscript/pull/392))
     - Find namespaced callabales when checking for unknown callables ([brighterscript#390](https://github.com/rokucommunity/brighterscript/pull/390))
     - Fix irrecoverable compiler state on duplicate components ([brighterscript#353](https://github.com/rokucommunity/brighterscript/pull/353))
     - Fix needsTranspiled xml issue. ([brighterscript#384](https://github.com/rokucommunity/brighterscript/pull/384))
     - Fix template string concatenation issue ([brighterscript#383](https://github.com/rokucommunity/brighterscript/pull/383))
     - Add profiling option to the benchmarks ([brighterscript#378](https://github.com/rokucommunity/brighterscript/pull/378))
     - Prevent circular import crash ([brighterscript#381](https://github.com/rokucommunity/brighterscript/pull/381))
     - Unify TranspileState for xml and brs files ([brighterscript#375](https://github.com/rokucommunity/brighterscript/pull/375))
     - Fixing npm audit issues. ([#brighterscript8397792a](https://github.com/rokucommunity/brighterscript/commit/8397792a))
     - Retain print separators during transpile ([brighterscript#373](https://github.com/rokucommunity/brighterscript/pull/373))
     - Move `getTestTranspile` into test helpers ([brighterscript#372](https://github.com/rokucommunity/brighterscript/pull/372))
     - Add support for bs:disable comments in xml files ([brighterscript#363](https://github.com/rokucommunity/brighterscript/pull/363))
     - Add class import code actions. ([brighterscript#365](https://github.com/rokucommunity/brighterscript/pull/365))
     - Safer completion handling for callfuncs. ([brighterscript#360](https://github.com/rokucommunity/brighterscript/pull/360))
     - Support when previousToken is missing. ([brighterscript#358](https://github.com/rokucommunity/brighterscript/pull/358))
     - Fix template string transpile bug. ([brighterscript#361](https://github.com/rokucommunity/brighterscript/pull/361))
     - Append stack trace to every language server error ([brighterscript#354](https://github.com/rokucommunity/brighterscript/pull/354))
     - Add codeAction for bs imports ([brighterscript#347](https://github.com/rokucommunity/brighterscript/pull/347))
     - adds some additional hardening callees and values, which migh have been indexed ([brighterscript#328](https://github.com/rokucommunity/brighterscript/pull/328))
     - Fixes #348 - Use 'toTypeString' method on transpilation of function return types ([brighterscript#351](https://github.com/rokucommunity/brighterscript/pull/351))
     - Bslib fixes ([brighterscript#346](https://github.com/rokucommunity/brighterscript/pull/346))
     - Fix - print statement parsing ([brighterscript#345](https://github.com/rokucommunity/brighterscript/pull/345))
     - Completion for pkg path inside strings ([brighterscript#340](https://github.com/rokucommunity/brighterscript/pull/340))
     - bslib ropm support ([brighterscript#334](https://github.com/rokucommunity/brighterscript/pull/334))
     - Iife parse ([brighterscript#343](https://github.com/rokucommunity/brighterscript/pull/343))
     - Set BrsFile.parseMode in constructor, remove getter ([brighterscript#341](https://github.com/rokucommunity/brighterscript/pull/341))
     - Prevent completion error for first token in file ([brighterscript#342](https://github.com/rokucommunity/brighterscript/pull/342))
     - tweaks to the logging system. ([brighterscript#338](https://github.com/rokucommunity/brighterscript/pull/338))
     - Don't crash on null relativePath ([brighterscript#339](https://github.com/rokucommunity/brighterscript/pull/339))
     - ensures that fields are present in symbols ([brighterscript#336](https://github.com/rokucommunity/brighterscript/pull/336))
     - Fix performance bug in DiagnosticFilterer ([brighterscript#337](https://github.com/rokucommunity/brighterscript/pull/337))
     - Fix broken link to documentation ([brighterscript#331](https://github.com/rokucommunity/brighterscript/pull/331))
     - fixes template strings introducing errant plus when there are no items ([brighterscript#327](https://github.com/rokucommunity/brighterscript/pull/327))
     - undo newline enforcement. ([#brighterscript7db62ed6](https://github.com/rokucommunity/brighterscript/commit/7db62ed6))
     - fix line endings ([#brighterscript0fb4f3dc](https://github.com/rokucommunity/brighterscript/commit/0fb4f3dc))
     - enforce \n newlines ([#brighterscript80f510cd](https://github.com/rokucommunity/brighterscript/commit/80f510cd))
     - changelog v0.31.2 ([#brighterscript8c322028](https://github.com/rokucommunity/brighterscript/commit/8c322028))
     - include namespace for class extends in typedef ([brighterscript#324](https://github.com/rokucommunity/brighterscript/pull/324))
     - codeaction don't fail on missing file ([brighterscript#323](https://github.com/rokucommunity/brighterscript/pull/323))
     - update docs for code action events ([#brighterscriptd95e8fe1](https://github.com/rokucommunity/brighterscript/commit/d95e8fe1))
     - Add codeAction support ([brighterscript#298](https://github.com/rokucommunity/brighterscript/pull/298))
     - Standardize sourcenode ([brighterscript#317](https://github.com/rokucommunity/brighterscript/pull/317))
     - include annotations in type files ([brighterscript#319](https://github.com/rokucommunity/brighterscript/pull/319))
     - Improve benchmark precision and standardize names ([brighterscript#316](https://github.com/rokucommunity/brighterscript/pull/316))
     - Add `Roku_Ads()` to global callables for now ([brighterscript#312](https://github.com/rokucommunity/brighterscript/pull/312))
     - do not revalidate on changes that are outside of any workspace ([brighterscript#315](https://github.com/rokucommunity/brighterscript/pull/315))
     - catch errors when getting signatures ([brighterscript#285](https://github.com/rokucommunity/brighterscript/pull/285))
     - Add log entry in Program.removeFile ([#brighterscript38bd8a71](https://github.com/rokucommunity/brighterscript/commit/38bd8a71))
     - Fix watcher bug on windows devices. ([brighterscript#310](https://github.com/rokucommunity/brighterscript/pull/310))
     - Don't mangle xml scripts during transpile ([brighterscript#311](https://github.com/rokucommunity/brighterscript/pull/311))
     - ignore void call lint errors in specs ([#brighterscriptaa8d71f3](https://github.com/rokucommunity/brighterscript/commit/aa8d71f3))
     - Fix link to language spec. ([#brighterscriptde99ec86](https://github.com/rokucommunity/brighterscript/commit/de99ec86))
     - Update "coming soon" in docs. Fixes #309 ([#brighterscript231b3c01](https://github.com/rokucommunity/brighterscript/commit/231b3c01))
     - Fix signature bug ([brighterscript#308](https://github.com/rokucommunity/brighterscript/pull/308))
     - fixes super.methodCall() not transpiling in all cases ([brighterscript#304](https://github.com/rokucommunity/brighterscript/pull/304))
     - fixes attributes being wrongly removed ([brighterscript#305](https://github.com/rokucommunity/brighterscript/pull/305))
     - dim statement support ([brighterscript#289](https://github.com/rokucommunity/brighterscript/pull/289))
     - Completion and code navigation for labels ([brighterscript#301](https://github.com/rokucommunity/brighterscript/pull/301))
     - Fix exception related to signature help when writing comments ([brighterscript#302](https://github.com/rokucommunity/brighterscript/pull/302))
     - Fix validate crash ([brighterscript#297](https://github.com/rokucommunity/brighterscript/pull/297))
     - Improve transpilation performance by indexing fileEntries beforehand ([brighterscript#295](https://github.com/rokucommunity/brighterscript/pull/295))
     - Fix xml parse error ([brighterscript#294](https://github.com/rokucommunity/brighterscript/pull/294))
     - Better handling for `createStringLiteral` ([brighterscript#292](https://github.com/rokucommunity/brighterscript/pull/292))
     - Fix xml missing script type ([brighterscript#280](https://github.com/rokucommunity/brighterscript/pull/280))
     - Fix infinite loop when parsing empty @ symbol for annotation ([brighterscript#291](https://github.com/rokucommunity/brighterscript/pull/291))
     - Null coalescence ([brighterscript#105](https://github.com/rokucommunity/brighterscript/pull/105))
     - adds support for negative numbers in annotation args ([brighterscript#288](https://github.com/rokucommunity/brighterscript/pull/288))
     - Support for ternary operator ([brighterscript#103](https://github.com/rokucommunity/brighterscript/pull/103))
     - Load bsconfig sync cuz async yields little benefit ([brighterscript#282](https://github.com/rokucommunity/brighterscript/pull/282))
     - add `for each`  variable to completions ([brighterscript#284](https://github.com/rokucommunity/brighterscript/pull/284))
     - Fix sourceMap property in bsconfig ([brighterscript#283](https://github.com/rokucommunity/brighterscript/pull/283))
     - Rename docs index.md to readme.md so it renders on github ([#brighterscript6aec490c](https://github.com/rokucommunity/brighterscript/commit/6aec490c))
     - Make `expectZeroDiagnostics` more flexible ([#brighterscript3485a67c](https://github.com/rokucommunity/brighterscript/commit/3485a67c))
     - Misc updates ([brighterscript#281](https://github.com/rokucommunity/brighterscript/pull/281))
     - Fix global superclass index ([brighterscript#279](https://github.com/rokucommunity/brighterscript/pull/279))
     - Remove async file adding from program ([brighterscript#278](https://github.com/rokucommunity/brighterscript/pull/278))
     - increase the debug mocha timeout ([#brighterscript75446435](https://github.com/rokucommunity/brighterscript/commit/75446435))
     - Annotations should be block-restricted: ([brighterscript#274](https://github.com/rokucommunity/brighterscript/pull/274))
     - Class annotation support ([brighterscript#270](https://github.com/rokucommunity/brighterscript/pull/270))
     - Function signature and intellisense improvements ([brighterscript#263](https://github.com/rokucommunity/brighterscript/pull/263))
     - Improve plugin warning message ([#brighterscripte1bce99e](https://github.com/rokucommunity/brighterscript/commit/e1bce99e))
     - Plugins as factory ([brighterscript#272](https://github.com/rokucommunity/brighterscript/pull/272))
     - update changelog ([#brighterscript5bdc8efb](https://github.com/rokucommunity/brighterscript/commit/5bdc8efb))
     - Better support of plugins diagnostics ([brighterscript#271](https://github.com/rokucommunity/brighterscript/pull/271))
     - Include xml files in `Program.pkgMap` ([#brighterscriptf2672264](https://github.com/rokucommunity/brighterscript/commit/f2672264))
     - XML AST ([brighterscript#235](https://github.com/rokucommunity/brighterscript/pull/235))
     - disable Array.forEach via eslint ([brighterscript#269](https://github.com/rokucommunity/brighterscript/pull/269))
     - Allows "as <CustomType>" in parameter and return type declarations ([brighterscript#262](https://github.com/rokucommunity/brighterscript/pull/262))
     - Fix grandchild class super index bug. ([brighterscript#268](https://github.com/rokucommunity/brighterscript/pull/268))
     - roku-deploy@3.2.4 ([#brighterscripta03db36f](https://github.com/rokucommunity/brighterscript/commit/a03db36f))
     - Sourcemaps off by default, add config to enable ([brighterscript#265](https://github.com/rokucommunity/brighterscript/pull/265))
     - Fix "invalid" literal reflection ([brighterscript#264](https://github.com/rokucommunity/brighterscript/pull/264))
     - CreateObject can take 4 parameters (roScreen) ([brighterscript#260](https://github.com/rokucommunity/brighterscript/pull/260))
     - Xml typedef inheritance fix ([brighterscript#252](https://github.com/rokucommunity/brighterscript/pull/252))
     - add missing changelog diff link. ([#brighterscript4e6d8abf](https://github.com/rokucommunity/brighterscript/commit/4e6d8abf))
     - Fix file extension detection logic. ([brighterscript#257](https://github.com/rokucommunity/brighterscript/pull/257))
     - Catch .only specs in eslint ([#brighterscriptca6514a7](https://github.com/rokucommunity/brighterscript/commit/ca6514a7))
     - Removed exclusive tests ([#brighterscript30922327](https://github.com/rokucommunity/brighterscript/commit/30922327))
     - AST parser refactoring ([brighterscript#244](https://github.com/rokucommunity/brighterscript/pull/244))
     - Support int type declaration char ([brighterscript#254](https://github.com/rokucommunity/brighterscript/pull/254))
     - Support long floats with exponents. ([brighterscript#255](https://github.com/rokucommunity/brighterscript/pull/255))
     - Fix Range.create rte due to bad vscode semver bump ([brighterscript#251](https://github.com/rokucommunity/brighterscript/pull/251))
     - Remove sponsor badge (supposed to be on ropm project) ([#brighterscript0e3a380a](https://github.com/rokucommunity/brighterscript/commit/0e3a380a))
     - Merge pull request #248 from rokucommunity/try-catch-support ([#brighterscriptac24b01a](https://github.com/rokucommunity/brighterscript/commit/ac24b01a))
     - Merge pull request #246 from rokucommunity/class-name-collision ([#brighterscriptd76a7d3c](https://github.com/rokucommunity/brighterscript/commit/d76a7d3c))
     - Merge pull request #247 from rokucommunity/function-declaration-name-validation ([#brighterscript956162c3](https://github.com/rokucommunity/brighterscript/commit/956162c3))
     - Merge pull request #199 from rokucommunity/type-enhancements ([#brighterscript8d29542e](https://github.com/rokucommunity/brighterscript/commit/8d29542e))
     - Merge branch 'master' of https://github.com/rokucommunity/brighterscript ([#brighterscript7b5c1ecc](https://github.com/rokucommunity/brighterscript/commit/7b5c1ecc))
     - Make utils compatible with TS strict null check (in plugins) ([brighterscript#243](https://github.com/rokucommunity/brighterscript/pull/243))
     - Implement onWorkspaceSymbol, onSignatureHelp, onDocumentSymbol, onReferences, improve onDefinition ([brighterscript#191](https://github.com/rokucommunity/brighterscript/pull/191))
     - emitDefinition fixes ([brighterscript#241](https://github.com/rokucommunity/brighterscript/pull/241))
     - fixed lint issue. ([#brighterscript1360a2f4](https://github.com/rokucommunity/brighterscript/commit/1360a2f4))
     - Remove unnecessary test that fails on node 15 ([#brighterscripta2a4652e](https://github.com/rokucommunity/brighterscript/commit/a2a4652e))
     - fix changelog ([#brighterscripte9db99c8](https://github.com/rokucommunity/brighterscript/commit/e9db99c8))
     - support on-demand parse for typedef-shadowed files ([brighterscript#237](https://github.com/rokucommunity/brighterscript/pull/237))
     - Typedef fixes ([brighterscript#236](https://github.com/rokucommunity/brighterscript/pull/236))
     - update changelog v0.18.0 ([#brighterscriptbe9052a0](https://github.com/rokucommunity/brighterscript/commit/be9052a0))
     - Support for type definition files ([brighterscript#188](https://github.com/rokucommunity/brighterscript/pull/188))
     - Feature: AST annotations ([brighterscript#234](https://github.com/rokucommunity/brighterscript/pull/234))
     - fix #229 ([brighterscript#230](https://github.com/rokucommunity/brighterscript/pull/230))
     - make benchmarks work with older versions of node. ([#brighterscript6ce250e9](https://github.com/rokucommunity/brighterscript/commit/6ce250e9))
     - add date to changelog ([#brighterscript03cdc582](https://github.com/rokucommunity/brighterscript/commit/03cdc582))
 - upgrade to [roku-deploy@3.12.4](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3124---2025-01-22). Notable changes since 3.2.2:
     - fixed an issue with 577 error codes ([roku-deploy#182](https://github.com/rokucommunity/roku-deploy/pull/182))
     - Fix issues with detecting "check for updates required" ([roku-deploy#181](https://github.com/rokucommunity/roku-deploy/pull/181))
     - Identify when a 577 error is thrown, send a new developer friendly message ([roku-deploy#180](https://github.com/rokucommunity/roku-deploy/pull/180))
     - Bump dependencies to remove audit issues ([roku-deploy#178](https://github.com/rokucommunity/roku-deploy/pull/178))
     - fixes #175 - updated regex to find a signed package on `/plugin_package` page ([roku-deploy#176](https://github.com/rokucommunity/roku-deploy/pull/176))
     - Fix bug with absolute paths and getDestPath ([roku-deploy#171](https://github.com/rokucommunity/roku-deploy/pull/171))
     - fix-node14 ([roku-deploy#165](https://github.com/rokucommunity/roku-deploy/pull/165))
     - Support overriding various package upload form data ([roku-deploy#136](https://github.com/rokucommunity/roku-deploy/pull/136))
     - Retry the convertToSquahsfs request given the HPE_INVALID_CONSTANT error ([roku-deploy#145](https://github.com/rokucommunity/roku-deploy/pull/145))
     - Update wrong host password error message ([roku-deploy#134](https://github.com/rokucommunity/roku-deploy/pull/134))
     - Wait for file stream to close before resolving promise ([roku-deploy#133](https://github.com/rokucommunity/roku-deploy/pull/133))
     - Add public function to normalize device-info field values ([roku-deploy#129](https://github.com/rokucommunity/roku-deploy/pull/129))
     - Add better device-info docs ([roku-deploy#128](https://github.com/rokucommunity/roku-deploy/pull/128))
     - Added some more message grabbing logic ([roku-deploy#127](https://github.com/rokucommunity/roku-deploy/pull/127))
     - Enhance getDeviceInfo() method ([roku-deploy#120](https://github.com/rokucommunity/roku-deploy/pull/120))
     - Bump word-wrap from 1.2.3 to 1.2.4 ([roku-deploy#117](https://github.com/rokucommunity/roku-deploy/pull/117))
     - Fix audit issues ([roku-deploy#116](https://github.com/rokucommunity/roku-deploy/pull/116))
     - Fix bug that overwrites signing pkg during tests ([roku-deploy#114](https://github.com/rokucommunity/roku-deploy/pull/114))
     - TBD-67: roku-deploy: fix nodejs 19 bug ([roku-deploy#115](https://github.com/rokucommunity/roku-deploy/pull/115))
     - Fix broken device tests ([#roku-deployfefe375](https://github.com/rokucommunity/roku-deploy/commit/fefe375))
     - Bump xml2js from 0.4.23 to 0.5.0 ([roku-deploy#112](https://github.com/rokucommunity/roku-deploy/pull/112))
     - Fix build status badge ([#roku-deployad2c9ec](https://github.com/rokucommunity/roku-deploy/commit/ad2c9ec))
     - Use micromatch instead of picomatch ([roku-deploy#109](https://github.com/rokucommunity/roku-deploy/pull/109))
     - Bump qs from 6.5.2 to 6.5.3 ([roku-deploy#105](https://github.com/rokucommunity/roku-deploy/pull/105))
     - Bump jszip from 3.7.1 to 3.8.0 ([roku-deploy#108](https://github.com/rokucommunity/roku-deploy/pull/108))
     - Bump minimatch from 3.0.4 to 3.1.2 ([roku-deploy#107](https://github.com/rokucommunity/roku-deploy/pull/107))
     - Bump json5 from 2.2.0 to 2.2.3 ([roku-deploy#106](https://github.com/rokucommunity/roku-deploy/pull/106))
     - Replace minimatch with picomatch ([roku-deploy#101](https://github.com/rokucommunity/roku-deploy/pull/101))
     - Sync retainStagingFolder, stagingFolderPath with options. ([roku-deploy#100](https://github.com/rokucommunity/roku-deploy/pull/100))
     - Add stagingDir and retainStagingDir. ([roku-deploy#99](https://github.com/rokucommunity/roku-deploy/pull/99))
     - Update build.yml ([#roku-deploy45ce605](https://github.com/rokucommunity/roku-deploy/commit/45ce605))
     - Bump moment from 2.29.2 to 2.29.4 ([roku-deploy#98](https://github.com/rokucommunity/roku-deploy/pull/98))
     - Remotedebug connect early ([roku-deploy#97](https://github.com/rokucommunity/roku-deploy/pull/97))
     - Better compile error handling ([roku-deploy#96](https://github.com/rokucommunity/roku-deploy/pull/96))
     - Add missing changelog entry for 3.7.0 ([#roku-deploy51b68f2](https://github.com/rokucommunity/roku-deploy/commit/51b68f2))
     - Make the json reader less sensitive ([roku-deploy#95](https://github.com/rokucommunity/roku-deploy/pull/95))
     - update docs with more usage examples ([#roku-deploy5a340d1](https://github.com/rokucommunity/roku-deploy/commit/5a340d1))
     - export `rokuDeploy` as its own variable to get better docs ([#roku-deploy3c3deb4](https://github.com/rokucommunity/roku-deploy/commit/3c3deb4))
     - Add files array to `zipFolder` ([roku-deploy#94](https://github.com/rokucommunity/roku-deploy/pull/94))
     - First pass at screenshot support ([roku-deploy#92](https://github.com/rokucommunity/roku-deploy/pull/92))
     - Add deleteInstalledChannel option ([roku-deploy#91](https://github.com/rokucommunity/roku-deploy/pull/91))
     - Bump moment from 2.29.1 to 2.29.2 ([roku-deploy#89](https://github.com/rokucommunity/roku-deploy/pull/89))
     - Fix npm audit issues ([#roku-deployefa829f](https://github.com/rokucommunity/roku-deploy/commit/efa829f))
     - Merge branch 'master' of https://github.com/rokucommunity/roku-deploy ([#roku-deployf92e086](https://github.com/rokucommunity/roku-deploy/commit/f92e086))
     - add watch task ([#roku-deployf66e47d](https://github.com/rokucommunity/roku-deploy/commit/f66e47d))
     - Performance improvements ([roku-deploy#86](https://github.com/rokucommunity/roku-deploy/pull/86))
     - remove unused vars ([#roku-deploydcfd92b](https://github.com/rokucommunity/roku-deploy/commit/dcfd92b))
     - Remove some unused dependencies ([#roku-deploy5180f3c](https://github.com/rokucommunity/roku-deploy/commit/5180f3c))
     - test tweaks. ([#roku-deployf53c72a](https://github.com/rokucommunity/roku-deploy/commit/f53c72a))
     - Better messaging for expectPathExists failure ([#roku-deployd698994](https://github.com/rokucommunity/roku-deploy/commit/d698994))
     - better util.stringReplaceInsensitive param names ([#roku-deployde67096](https://github.com/rokucommunity/roku-deploy/commit/de67096))
     - fix npm audit issues. ([#roku-deploy9c45593](https://github.com/rokucommunity/roku-deploy/commit/9c45593))
     - Update create-vsix.yml ([#roku-deploy590a7e8](https://github.com/rokucommunity/roku-deploy/commit/590a7e8))
     - update badges ([#roku-deploy1e10e81](https://github.com/rokucommunity/roku-deploy/commit/1e10e81))
     - Fix license ([#roku-deployae080bb](https://github.com/rokucommunity/roku-deploy/commit/ae080bb))
     - Remove `request` prop from `RokuDeploy` class ([roku-deploy#84](https://github.com/rokucommunity/roku-deploy/pull/84))
     - Add create-vsix workflow ([roku-deploy#83](https://github.com/rokucommunity/roku-deploy/pull/83))
     - Fix race condition in `retrieveSignedPackage` ([roku-deploy#82](https://github.com/rokucommunity/roku-deploy/pull/82))
     - fix order-of-ops issue with rekeyDevice call ([roku-deploy#81](https://github.com/rokucommunity/roku-deploy/pull/81))
     - run replace first, then fallback to replace. ([roku-deploy#79](https://github.com/rokucommunity/roku-deploy/pull/79))
     - Allow negated non-root-dir top-level patterns in files array ([roku-deploy#78](https://github.com/rokucommunity/roku-deploy/pull/78))
     - ts target es2017 ([#roku-deploy1486b40](https://github.com/rokucommunity/roku-deploy/commit/1486b40))
     - Format and increase debug test timeout ([#roku-deployf75b419](https://github.com/rokucommunity/roku-deploy/commit/f75b419))
     - Unit test cleanup ([roku-deploy#75](https://github.com/rokucommunity/roku-deploy/pull/75))
     - Upgrade typescript and test packages. ([roku-deploy#73](https://github.com/rokucommunity/roku-deploy/pull/73))
     - Add troubleshooting steps for ESOCKETTIMEDOUT ([#roku-deploy5d48b42](https://github.com/rokucommunity/roku-deploy/commit/5d48b42))
     - Clarify `remoteDebug` flag ([#roku-deploy78cbc0b](https://github.com/rokucommunity/roku-deploy/commit/78cbc0b))
     - Move changelog links inline with version headers ([#roku-deployc4c1811](https://github.com/rokucommunity/roku-deploy/commit/c4c1811))
     - wraps call to delete installed cahnnel in try catch, so that deployments continue ([roku-deploy#65](https://github.com/rokucommunity/roku-deploy/pull/65))
     - Bump jszip from 3.6.0 to 3.7.0 ([roku-deploy#66](https://github.com/rokucommunity/roku-deploy/pull/66))
     - Bump path-parse from 1.0.6 to 1.0.7 ([roku-deploy#67](https://github.com/rokucommunity/roku-deploy/pull/67))
     - ignore .tgz files when publishing to npm ([#roku-deployd6d7c57](https://github.com/rokucommunity/roku-deploy/commit/d6d7c57))
     - Bump glob-parent from 5.1.1 to 5.1.2 ([roku-deploy#57](https://github.com/rokucommunity/roku-deploy/pull/57))
     - Fix critical issues ([roku-deploy#56](https://github.com/rokucommunity/roku-deploy/pull/56))
     - fix npm audit issues ([#roku-deploy2d75add](https://github.com/rokucommunity/roku-deploy/commit/2d75add))
     - Switch to using jszip for zip compression ([roku-deploy#55](https://github.com/rokucommunity/roku-deploy/pull/55))
     - Added some better logic to search the response bodies for Roku messages ([roku-deploy#50](https://github.com/rokucommunity/roku-deploy/pull/50))
     - Bump lodash from 4.17.19 to 4.17.21 ([roku-deploy#51](https://github.com/rokucommunity/roku-deploy/pull/51))
     - Bump y18n from 4.0.0 to 4.0.1 ([roku-deploy#49](https://github.com/rokucommunity/roku-deploy/pull/49))
     - Added support for request timeouts when communicating with device ([roku-deploy#48](https://github.com/rokucommunity/roku-deploy/pull/48))
     - Ignore 202 response codes on home key presses since this should be a fire and forget call anyways and causes issues that really aren't issues when we receive a 202 response code. ([roku-deploy#47](https://github.com/rokucommunity/roku-deploy/pull/47))
     - update ci script ([#roku-deploy62312a3](https://github.com/rokucommunity/roku-deploy/commit/62312a3))
     - Bump bl from 4.0.2 to 4.0.3 ([roku-deploy#42](https://github.com/rokucommunity/roku-deploy/pull/42))
     - Throw error during zip when missing manifest ([#roku-deploy01496d7](https://github.com/rokucommunity/roku-deploy/commit/01496d7))
     - reverse order of changelog compare links. ([#roku-deploya59ff5e](https://github.com/rokucommunity/roku-deploy/commit/a59ff5e))
     - Throw exception when rootDir does not exist. ([#roku-deploy5b5d2c4](https://github.com/rokucommunity/roku-deploy/commit/5b5d2c4))
     - chore: bump lodash from 4.17.15 to 4.17.19 ([#roku-deploy4b8758e](https://github.com/rokucommunity/roku-deploy/commit/4b8758e))



## [0.10.31](https://github.com/rokucommunity/ropm/compare/v0.10.30...v0.10.31) - 2025-01-31
### Changed
 - upgrade to [brighterscript@0.68.4](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0684---2025-01-22). Notable changes since 0.68.3:
 - upgrade to [roku-deploy@3.12.4](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3124---2025-01-22). Notable changes since 3.12.3:
     - fixed an issue with 577 error codes ([roku-deploy#182](https://github.com/rokucommunity/roku-deploy/pull/182))



## [0.10.30](https://github.com/rokucommunity/ropm/compare/v0.10.29...v0.10.30) - 2025-01-13
### Changed
 - upgrade to [brighterscript@0.68.3](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0683---2025-01-13). Notable changes since 0.68.2:
     - Fix class transpile issue with child class constructor not inherriting parent params ([brighterscript#1390](https://github.com/rokucommunity/brighterscript/pull/1390))
     - Export more items ([brighterscript#1394](https://github.com/rokucommunity/brighterscript/pull/1394))



## [0.10.29](https://github.com/rokucommunity/ropm/compare/v0.10.28...v0.10.29) - 2024-12-23
### Fixed
 - Fix EINVAL crash ([#82](https://github.com/rokucommunity/ropm/pull/82))



## [0.10.28](https://github.com/rokucommunity/ropm/compare/v0.10.27...v0.10.28) - 2024-12-20
### Changed
 - Add create-package script ([#81](https://github.com/rokucommunity/ropm/pull/81))
 - upgrade to [brighterscript@0.68.2](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0682---2024-12-06). Notable changes since 0.67.8:
     - Add more convenience exports from vscode-languageserver ([brighterscript#1359](https://github.com/rokucommunity/brighterscript/pull/1359))
     - Enhance lexer to support long numeric literals with type designators ([brighterscript#1351](https://github.com/rokucommunity/brighterscript/pull/1351))
     - Fix issues with the ast walkArray function ([brighterscript#1347](https://github.com/rokucommunity/brighterscript/pull/1347))
 - upgrade to [roku-deploy@3.12.3](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3123---2024-12-06)
### Fixed
 - missing prefixes in `.bs` and `d.bs` files for interfaces, enums, and constants ([#80](https://github.com/rokucommunity/ropm/pull/80))



## [0.10.27](https://github.com/rokucommunity/ropm/compare/v0.10.26...v0.10.27) - 2024-10-18
### Changed
 - upgrade to [brighterscript@0.67.8](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0678---2024-10-18). Notable changes since 0.67.7:
     - Fix namespace-relative transpile bug for standalone file ([brighterscript#1324](https://github.com/rokucommunity/brighterscript/pull/1324))
     - Prevent crash when ProgramBuilder.run called with no options ([brighterscript#1316](https://github.com/rokucommunity/brighterscript/pull/1316))
 - upgrade to [roku-deploy@3.12.2](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3122---2024-10-18). Notable changes since 3.12.1:
     - fixes #175 - updated regex to find a signed package on `/plugin_package` page ([roku-deploy#176](https://github.com/rokucommunity/roku-deploy/pull/176))



## [0.10.26](https://github.com/rokucommunity/ropm/compare/v0.10.25...v0.10.26) - 2024-09-27
### Changed
 - upgrade to [brighterscript@0.67.7](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0677---2024-09-25). Notable changes since 0.67.5:
     - Ast node clone ([brighterscript#1281](https://github.com/rokucommunity/brighterscript/pull/1281))
     - Add support for resolving sourceRoot at time of config load ([brighterscript#1290](https://github.com/rokucommunity/brighterscript/pull/1290))
     - Add support for roIntrinsicDouble ([brighterscript#1291](https://github.com/rokucommunity/brighterscript/pull/1291))
     - Add plugin naming convention ([brighterscript#1284](https://github.com/rokucommunity/brighterscript/pull/1284))



## [0.10.25](https://github.com/rokucommunity/ropm/compare/v0.10.24...v0.10.25) - 2024-08-01
### Changed
 - Maintenance (lint fixes, bsc upgrades, npm audit fixes) ([#75](https://github.com/rokucommunity/ropm/pull/75))
 - upgrade to [brighterscript@0.67.5](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0675---2024-07-31). Notable changes since 0.67.1:
     - Add templatestring support for annotation.getArguments() ([brighterscript#1264](https://github.com/rokucommunity/brighterscript/pull/1264))
     - Update Digitial Picture Frame url and img ([brighterscript#1237](https://github.com/rokucommunity/brighterscript/pull/1237))
     - Fix crash with missing scope ([brighterscript#1234](https://github.com/rokucommunity/brighterscript/pull/1234))
     - Bump braces from 3.0.2 to 3.0.3 in /benchmarks ([brighterscript#1229](https://github.com/rokucommunity/brighterscript/pull/1229))
     - fix: conform bsconfig.schema.json to strict types ([brighterscript#1205](https://github.com/rokucommunity/brighterscript/pull/1205))
     - Flag using devDependency in production code ([brighterscript#1222](https://github.com/rokucommunity/brighterscript/pull/1222))
     - Fix crash with optional chaining in signature help ([brighterscript#1207](https://github.com/rokucommunity/brighterscript/pull/1207))
 - upgrade to [roku-deploy@3.12.1](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3121---2024-07-19). Notable changes since 3.12.0:
     - Fix bug with absolute paths and getDestPath ([roku-deploy#171](https://github.com/rokucommunity/roku-deploy/pull/171))
     - fix-node14 ([roku-deploy#165](https://github.com/rokucommunity/roku-deploy/pull/165))



## [0.10.24](https://github.com/rokucommunity/ropm/compare/v0.10.23...0.10.24) - 2024-05-17
### Changed
 - fix node14 ([#74](https://github.com/rokucommunity/ropm/pull/74))
 - Fix some spelling mistakes in readme ([362fb83](https://github.com/rokucommunity/ropm/commit/362fb83))
 - upgrade to [brighterscript@0.67.1](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0671---2024-05-16). Notable changes since 0.65.25:
     - Fix crash when diagnostic is missing range ([brighterscript#1174](https://github.com/rokucommunity/brighterscript/pull/1174))
     - Move function calls to separate diagnostic ([brighterscript#1169](https://github.com/rokucommunity/brighterscript/pull/1169))
     - fix: resolve the stagingDir option relative to the bsconfig.json file ([brighterscript#1148](https://github.com/rokucommunity/brighterscript/pull/1148))
     - Increase max param count to 63 ([brighterscript#1112](https://github.com/rokucommunity/brighterscript/pull/1112))
     - Prevent unused variable warnings on ternary and null coalescence expressions ([brighterscript#1101](https://github.com/rokucommunity/brighterscript/pull/1101))



## [0.10.23](https://github.com/rokucommunity/ropm/compare/v0.10.22...v0.10.23) - 2024-03-07
### Changed
 - upgrade to [brighterscript@0.65.25](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#06525---2024-03-07). Notable changes since 0.65.23:
     - Support when tokens have null ranges ([brighterscript#1072](https://github.com/rokucommunity/brighterscript/pull/1072))
     - Support whitespace in conditional compile keywords ([brighterscript#1090](https://github.com/rokucommunity/brighterscript/pull/1090))
     - Allow negative patterns in diagnostic filters ([brighterscript#1078](https://github.com/rokucommunity/brighterscript/pull/1078))
 - upgrade to [roku-deploy@3.12.0](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3120---2024-03-01). Notable changes since 3.11.3:
     - Support overriding various package upload form data ([roku-deploy#136](https://github.com/rokucommunity/roku-deploy/pull/136))



## [0.10.22](https://github.com/rokucommunity/ropm/compare/v0.10.21...v0.10.22) - 2024-02-29
### Changed
 - upgrade to [brighterscript@0.65.23](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#06523---2024-02-29). Notable changes since 0.65.12:
     - empty interfaces break the parser ([brighterscript#1082](https://github.com/rokucommunity/brighterscript/pull/1082))
     - Allow v1 syntax: built-in types for class member types and type declarations on lhs ([brighterscript#1059](https://github.com/rokucommunity/brighterscript/pull/1059))
     - Move `coveralls-next` to a devDependency since it's not needed at runtime ([brighterscript#1051](https://github.com/rokucommunity/brighterscript/pull/1051))
     - Fix parsing issues with multi-index IndexedSet and IndexedGet ([brighterscript#1050](https://github.com/rokucommunity/brighterscript/pull/1050))
     - Backport v1 syntax changes ([brighterscript#1034](https://github.com/rokucommunity/brighterscript/pull/1034))
     - Prevent overwriting the Program._manifest if already set on startup ([brighterscript#1027](https://github.com/rokucommunity/brighterscript/pull/1027))
     - adds support for libpkg prefix ([brighterscript#1017](https://github.com/rokucommunity/brighterscript/pull/1017))
     - Assign .program to the builder BEFORE calling afterProgram ([brighterscript#1011](https://github.com/rokucommunity/brighterscript/pull/1011))
     - Prevent errors when using enums in a file that's not included in any scopes ([brighterscript#995](https://github.com/rokucommunity/brighterscript/pull/995))
 - upgrade to [roku-deploy@3.11.3](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3113---2024-02-29). Notable changes since 3.11.1:
     - Retry the convertToSquahsfs request given the HPE_INVALID_CONSTANT error ([roku-deploy#145](https://github.com/rokucommunity/roku-deploy/pull/145))
     - Update wrong host password error message ([roku-deploy#134](https://github.com/rokucommunity/roku-deploy/pull/134))



## [0.10.21](https://github.com/rokucommunity/ropm/compare/v0.10.20...v0.10.21) - 2023-12-07
### Changed
 - upgrade to [brighterscript@0.65.12](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#06512---2023-12-07). Notable changes since 0.65.10:
     - Add `optional` modifier for interface and class members ([brighterscript#955](https://github.com/rokucommunity/brighterscript/pull/955))
     - Use regex for faster manifest/typedef detection ([brighterscript#976](https://github.com/rokucommunity/brighterscript/pull/976))
     - Correct RANGE in template string when dealing with quotes in annotations ([brighterscript#975](https://github.com/rokucommunity/brighterscript/pull/975))
     - Add manifest loading from files ([brighterscript#942](https://github.com/rokucommunity/brighterscript/pull/942))
     - Enums as class initial values ([brighterscript#950](https://github.com/rokucommunity/brighterscript/pull/950))
 - upgrade to [roku-deploy@3.11.1](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3111---2023-11-30). Notable changes since 3.10.5:
     - Wait for file stream to close before resolving promise ([roku-deploy#133](https://github.com/rokucommunity/roku-deploy/pull/133))



## [0.10.20](https://github.com/rokucommunity/ropm/compare/v0.10.19...v0.10.20) - 2023-11-14
### Changed
 - upgrade to [brighterscript@0.65.10](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#06510---2023-11-14). Notable changes since 0.65.9:
 - upgrade to [roku-deploy@3.10.5](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3105---2023-11-14). Notable changes since 3.10.4:
     - Add better device-info docs ([roku-deploy#128](https://github.com/rokucommunity/roku-deploy/pull/128))
     - Added some more message grabbing logic ([roku-deploy#127](https://github.com/rokucommunity/roku-deploy/pull/127))



## [0.10.19](https://github.com/rokucommunity/ropm/compare/v0.10.18...v0.10.19) - 2023-11-08
### Changed
 - upgrade to [brighterscript@0.65.9](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0659---2023-11-06). Notable changes since 0.65.8:
     - Fix issue with unary expression parsing ([brighterscript#938](https://github.com/rokucommunity/brighterscript/pull/938))
 - upgrade to [roku-deploy@3.10.4](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3104---2023-11-03). Notable changes since 3.10.3:
     - Enhance getDeviceInfo() method ([roku-deploy#120](https://github.com/rokucommunity/roku-deploy/pull/120))



## [0.10.18](https://github.com/rokucommunity/ropm/compare/v0.10.17...v0.10.18) - 2023-10-08
### Changed
 - upgrade to [brighterscript@0.65.8](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0658---2023-10-06). Notable changes since 0.65.5:
     - Bump postcss from 8.2.15 to 8.4.31 ([brighterscript#928](https://github.com/rokucommunity/brighterscript/pull/928))
     - Add interface parameter support ([brighterscript#924](https://github.com/rokucommunity/brighterscript/pull/924))
     - Better typing for `Deferred` ([brighterscript#923](https://github.com/rokucommunity/brighterscript/pull/923))
     - fix bug in --noproject flag logic ([brighterscript#922](https://github.com/rokucommunity/brighterscript/pull/922))
     - Add some more details to the plugins docs ([brighterscript#913](https://github.com/rokucommunity/brighterscript/pull/913))
     - Fix incorrect quasi location in template string ([brighterscript#921](https://github.com/rokucommunity/brighterscript/pull/921))
     - Fix UnaryExpression transpile for ns and const ([brighterscript#914](https://github.com/rokucommunity/brighterscript/pull/914))
     - Add missing emitDefinitions to docs and fix iface ([brighterscript#893](https://github.com/rokucommunity/brighterscript/pull/893))
     - add noProject flag to bsc so BSConfig.json not expected ([brighterscript#868](https://github.com/rokucommunity/brighterscript/pull/868))



## [0.10.17](https://github.com/rokucommunity/ropm/compare/v0.10.16...v0.10.17) - 2023-09-11
### Changed
 - upgrade to [brighterscript@0.65.5](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0655---2023-09-06). Notable changes since 0.65.4:
     - Fix crashes in util for null ranges ([brighterscript#869](https://github.com/rokucommunity/brighterscript/pull/869))
     - Print diagnostic related information ([brighterscript#867](https://github.com/rokucommunity/brighterscript/pull/867))
     - Fix tab issue when printing diagnostics ([brighterscript#865](https://github.com/rokucommunity/brighterscript/pull/865))



## [0.10.16](https://github.com/rokucommunity/ropm/compare/v0.10.15...v0.10.16) - 2023-07-24
### Changed
 - Bump word-wrap from 1.2.3 to 1.2.4 ([#71](https://github.com/rokucommunity/ropm/pull/71))
 - upgrade to [brighterscript@0.65.4](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0654---2023-07-24). Notable changes since 0.65.0:
     - Bump word-wrap from 1.2.3 to 1.2.4 ([brighterscript#851](https://github.com/rokucommunity/brighterscript/pull/851))
     - Bump semver from 5.7.1 to 5.7.2 ([brighterscript#837](https://github.com/rokucommunity/brighterscript/pull/837))
     - Prevent crashing when diagnostic is missing range. ([brighterscript#832](https://github.com/rokucommunity/brighterscript/pull/832))
     - Prevent crash when diagnostic is missing range ([brighterscript#831](https://github.com/rokucommunity/brighterscript/pull/831))
     - Fix injection of duplicate super calls into classes ([brighterscript#823](https://github.com/rokucommunity/brighterscript/pull/823))
 - upgrade to [roku-deploy@3.10.3](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3103---2023-07-22). Notable changes since 3.10.2:
     - Bump word-wrap from 1.2.3 to 1.2.4 ([roku-deploy#117](https://github.com/rokucommunity/roku-deploy/pull/117))



## [0.10.15](https://github.com/rokucommunity/ropm/compare/v0.10.14...v0.10.15) - 2023-05-17
### Changed
 - upgrade to [brighterscript@0.65.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0650---2023-05-17)
 - upgrade to [roku-deploy@3.10.2](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3102---2023-05-10)
     - TBD-67: roku-deploy: fix nodejs 19 bug ([roku-deploy#115](https://github.com/rokucommunity/roku-deploy/pull/115))



## [0.10.14](https://github.com/rokucommunity/ropm/compare/v0.10.13...v0.10.14) - 2023-04-28
### Changed
 - upgrade to [brighterscript@0.64.3](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0643---2023-04-28). Notable changes since 0.64.2:
     - Improves performance in symbol table fetching ([brighterscript#797](https://github.com/rokucommunity/brighterscript/pull/797))



## [0.10.13](https://github.com/rokucommunity/ropm/compare/v0.10.12...v0.10.13) - 2023-04-18
### Changed
 - upgrade to [brighterscript@0.64.2](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0642---2023-04-18). Notable changes since 0.62.0:
     - Fix namespace-relative enum value ([brighterscript#793](https://github.com/rokucommunity/brighterscript/pull/793))
     - Fix namespace-relative items ([brighterscript#789](https://github.com/rokucommunity/brighterscript/pull/789))
     - Wrap transpiled template strings in parens ([brighterscript#788](https://github.com/rokucommunity/brighterscript/pull/788))
     - Simplify the ast range logic ([brighterscript#784](https://github.com/rokucommunity/brighterscript/pull/784))
 - upgrade to [roku-deploy@3.10.1](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3101---2023-04-14). Notable changes since 3.10.0:
     - Bump xml2js from 0.4.23 to 0.5.0 ([roku-deploy#112](https://github.com/rokucommunity/roku-deploy/pull/112))



## [0.10.12](https://github.com/rokucommunity/ropm/compare/v0.10.11...v0.10.12) - 2023-03-17
### Changed
 - fix build status badge ([fc087d8](https://github.com/rokucommunity/ropm/commit/fc087d8))
 - Bump jszip from 3.7.1 to 3.10.1 ([#68](https://github.com/rokucommunity/ropm/pull/68))
 - upgrade to [brighterscript@0.62.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0620---2023-03-17). Notable changes since 0.61.3:
     - Fix crash when func has no block ([brighterscript#774](https://github.com/rokucommunity/brighterscript/pull/774))
     - Move not-referenced check into ProgramValidator ([brighterscript#773](https://github.com/rokucommunity/brighterscript/pull/773))
 - upgrade to [roku-deploy@3.10.0](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#3100---2023-03-16). Notable changes since 3.9.3:
     - Use micromatch instead of picomatch ([roku-deploy#109](https://github.com/rokucommunity/roku-deploy/pull/109))



## [0.10.11](https://github.com/rokucommunity/ropm/compare/v0.10.10...0.10.11) - 2023-01-12
### Changed
 - upgrade to [brighterscript@0.61.3](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0613---2023-01-12). Notable changes since 0.57.2:
     - Ensure enums and interfaces persist in typedefs ([brighterscript#757](https://github.com/rokucommunity/brighterscript/pull/757))
     - Fix exception while validating continue statement ([brighterscript#752](https://github.com/rokucommunity/brighterscript/pull/752))
     - Add missing visitor params for DottedSetStatement ([brighterscript#748](https://github.com/rokucommunity/brighterscript/pull/748))
     - Fixes issues with Roku doc scraper and adds missing components ([brighterscript#736](https://github.com/rokucommunity/brighterscript/pull/736))
     - Cache `getCallableByName` ([brighterscript#739](https://github.com/rokucommunity/brighterscript/pull/739))
     - Fix crash in `getDefinition` ([brighterscript#734](https://github.com/rokucommunity/brighterscript/pull/734))
     - Remove parentStack to prevent circular references ([brighterscript#731](https://github.com/rokucommunity/brighterscript/pull/731))
     - Allow `continue` as local var ([brighterscript#730](https://github.com/rokucommunity/brighterscript/pull/730))
     - better parse recover for unknown func params ([brighterscript#722](https://github.com/rokucommunity/brighterscript/pull/722))
     - Fix if statement block var bug ([brighterscript#698](https://github.com/rokucommunity/brighterscript/pull/698))
     - Allow nested namespaces ([brighterscript#708](https://github.com/rokucommunity/brighterscript/pull/708))
     - Migrate to `stagingDir` away from `stagingFolder` ([brighterscript#706](https://github.com/rokucommunity/brighterscript/pull/706))
     - Fix enum error for negative values ([brighterscript#703](https://github.com/rokucommunity/brighterscript/pull/703))
     - Support `pkg:/` paths for `setFile` ([brighterscript#701](https://github.com/rokucommunity/brighterscript/pull/701))
     - Syntax and transpile support for continue statement ([brighterscript#697](https://github.com/rokucommunity/brighterscript/pull/697))
     - Finds and includes more deeply embedded expressions ([brighterscript#696](https://github.com/rokucommunity/brighterscript/pull/696))
     - Scope validation performance boost ([brighterscript#656](https://github.com/rokucommunity/brighterscript/pull/656))
 - upgrade to [roku-deploy@3.9.3](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#393---2023-01-12). Notable changes since 3.8.1:



## [0.10.10](https://github.com/rokucommunity/ropm/compare/v0.10.9...0.10.10) - 2022-09-12
### Changed
 - upgrade to [brighterscript@0.57.2](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0572---2022-09-08). Notable changes since 0.57.0:
     - fix(parser): consider namespace function transpiled names ([brighterscript#685](https://github.com/rokucommunity/brighterscript/pull/685))
### Fixed
 - Fix typedef default param value and prefix ([#59](https://github.com/rokucommunity/ropm/pull/59))



## [0.10.9](https://github.com/rokucommunity/ropm/compare/v0.10.8...0.10.9) - 2022-09-02
### Changed
 - upgrade to [brighterscript@0.57.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0570---2022-09-02). Notable changes since 0.56.0:
     - Allow `mod` as an aa prop, aa member identifier kinds forced to Identifier ([brighterscript#684](https://github.com/rokucommunity/brighterscript/pull/684))
     - Fix case sensitivity issue with bs_const values ([brighterscript#677](https://github.com/rokucommunity/brighterscript/pull/677))
 - upgrade to [roku-deploy@3.8.1](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#381---2022-09-02). Notable changes since 3.7.1:
     - Bump moment from 2.29.2 to 2.29.4 ([roku-deploy#98](https://github.com/rokucommunity/roku-deploy/pull/98))



## [0.10.8](https://github.com/rokucommunity/ropm/compare/v0.10.7...0.10.8) - 2022-08-24
### Changed
 - upgrade to [brighterscript@0.56.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0560---2022-08-23). Notable changes since 0.55.1:
     - Fix compile crash for scope-less files ([brighterscript#674](https://github.com/rokucommunity/brighterscript/pull/674))
     - Fix parse error for malformed dim statement ([brighterscript#673](https://github.com/rokucommunity/brighterscript/pull/673))
     - Add validation for dimmed variables ([brighterscript#672](https://github.com/rokucommunity/brighterscript/pull/672))
     - Allow const as variable name ([brighterscript#670](https://github.com/rokucommunity/brighterscript/pull/670))



## [0.10.7](https://github.com/rokucommunity/ropm/compare/v0.10.6...0.10.7) - 2022-08-12
### Changed
 - Bump moment from 2.29.2 to 2.29.4 ([#54](https://github.com/rokucommunity/ropm/pull/54))
 - upgrade to [brighterscript@0.55.1](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0551---2022-08-07). Notable changes since 0.53.1:
     - Fix scope-specific diagnostic grouping issue ([brighterscript#660](https://github.com/rokucommunity/brighterscript/pull/660))
     - Fix typescript error for ast parent setting ([brighterscript#659](https://github.com/rokucommunity/brighterscript/pull/659))
     - Fix missing constant references ([brighterscript#658](https://github.com/rokucommunity/brighterscript/pull/658))
     - Link all brs AST nodes to parent onFileValidate ([brighterscript#650](https://github.com/rokucommunity/brighterscript/pull/650))
     - Add a `toJSON` function to SymbolTable ([brighterscript#655](https://github.com/rokucommunity/brighterscript/pull/655))
     - Performance boost: better function sorting during validation ([brighterscript#651](https://github.com/rokucommunity/brighterscript/pull/651))
     - Fix broken plugin imports with custom cwd ([brighterscript#652](https://github.com/rokucommunity/brighterscript/pull/652))
     - Export some vscode interfaces ([brighterscript#644](https://github.com/rokucommunity/brighterscript/pull/644))



## [0.10.6](https://github.com/rokucommunity/ropm/compare/v0.10.5...0.10.6) - 2022-07-18
### Changed
 - upgrade to [brighterscript@0.53.1](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0531---2022-07-15). Notable changes since 0.48.0:
     - New Language Feature: Constants ([brighterscript#632](https://github.com/rokucommunity/brighterscript/pull/632))
     - Fix missing range on interface statement ([brighterscript#623](https://github.com/rokucommunity/brighterscript/pull/623))
     - Catch class circular extends ([brighterscript#619](https://github.com/rokucommunity/brighterscript/pull/619))
     - Add object and key to visitor callbacks. ([brighterscript#600](https://github.com/rokucommunity/brighterscript/pull/600))
     - fixes enums and interfaces resulting in diagnostics error when used as field types ([brighterscript#602](https://github.com/rokucommunity/brighterscript/pull/602))
     - fixes enums and interfaces resulting in diagnostics error when used as return types from a function ([brighterscript#601](https://github.com/rokucommunity/brighterscript/pull/601))
     - Better super handling ([brighterscript#590](https://github.com/rokucommunity/brighterscript/pull/590))
     - Allow interfaces and enums as function param types ([brighterscript#580](https://github.com/rokucommunity/brighterscript/pull/580))
 - upgrade to [roku-deploy@3.7.1](https://github.com/rokucommunity/roku-deploy/blob/master/CHANGELOG.md#371---2022-06-08). Notable changes since 3.4.1:
     - export `rokuDeploy` as its own variable to get better docs ([#roku-deploy3c3deb4](https://github.com/rokucommunity/roku-deploy/commit/3c3deb4))
     - Performance improvements ([roku-deploy#86](https://github.com/rokucommunity/roku-deploy/pull/86))
     - Allow negated non-root-dir top-level patterns in files array ([roku-deploy#78](https://github.com/rokucommunity/roku-deploy/pull/78))



## [0.10.5](https://github.com/rokucommunity/ropm/compare/v0.10.4...v0.10.5) - 2022-04-13
### Changed
 - updated to [brighterscript@0.48.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0480---2022-04-13)



## [0.10.4](https://github.com/rokucommunity/ropm/compare/v0.10.3...v0.10.4) - 2022-02-24
### Changed
 - updated to [brighterscript@0.45.2](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0452---2022-02-24)



## [0.10.3](https://github.com/rokucommunity/ropm/compare/v0.10.2...v0.10.3) - 2022-01-28
### Changed
 - updated to [brighterscript@0.43.0](https://github.com/rokucommunity/brighterscript/blob/master/CHANGELOG.md#0430---2022-01-28)



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
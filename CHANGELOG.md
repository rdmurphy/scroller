# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Tests via [`@playwright/test`](https://playwright.dev)!
- Full TypeScript types, including recognition of the type of `Element` being observered if provided within any event handlers provided via `Scroller#on()`.

### Removed

- Support for tracking `container` has been removed.

### Changed

- Moved to `bundt` from `microbundle` to greatly cut out the complexity of preparing this library.
- Because now a list of elements (or `scenes`) can be observed, the call signature of `Scroller` has changed. The first parameter of `Scroller` is now the list of `scenes` to watch. The second parameter is an options object, which currently only accepts a single parameter - `offset`.
- Because there's no longer the act of "observing" a container, the event names used with `on` have been simplified. `container:enter` and `container:exit` no longer do anything, and `scene:enter` and `scene:exit` are now just `enter` and `exit`.

## [0.1.0] - 2019-01-18

### Added

- Initial release!

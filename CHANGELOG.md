# Changelog

## [Unreleased]

- Unit tests
- ETag, Content-Length and other headers
- Default one-liners for open and close connections



## [0.7.1] 2026-03-16

### Added
- Prevent file caching

### Fixed
- Fix self containing cli argument


## [0.7.0.x]

### Added
- Build and publish with github actions
- Trigger action using version tag


## [0.7.0] 2026-02-01

### Changed
- Descriptions in stop script
- Remove excessive dependencies


## [0.6.1] 2024-10-23

### Added
- Describe browser behaviour on protocols and certificates

### Fixed
- Fixed displayed url when protocol is http2


## [0.6.0] 2024-10-22

### Added
- A close command for CLI
- Smother missing favicon.ico errors
- Start demos through shell scripts


## [0.5.1] 2024-05-14

### Added
- Opens index files when opening a directory

### Fixed
- Fixed typings for portnumbers
- Mention startServer is async in README


## [0.5.0] - 2024-01-28

### Changed
- Better typing
- Concise messages
- Require the configured (web)root folder to be explicitly relative to project folder, using the '/' character
- Require the configured port to be 0 < number < 65536 and not to be occupied
- Main function startServer became async

### Added
- Check functions for configuration input in cli and in startServer
- Unit tests for configuration


## [0.4.0] - 2024-01-20

### Changed
- Write certificate in the folder where stream-statics resides, instead of the current working directory

### Added
- Brief commandline arguments; numeric for port, http | http2 | https for protocol and relative path for root folder


## [0.3.0] - 2023-06-13

### Changed
- Silently generate https certificate when certificate is absent or expired
- Nicer demo, smaller package size


## [0.2.0] - 2023-06-08

### Added
- Opt-in to use mime-types package
- HTTPS and HTTP/2 support

### Changed
- Replace type variables with descriptions

### Fixed
- Fixed typings


## [0.1.0] - 2023-05-28

First release, serving HTTP/1.1

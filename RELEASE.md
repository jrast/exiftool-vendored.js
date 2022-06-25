# Releasing new versions of `exiftool-vendored`

1. `git clone` this repo, and either
   [exiftool-vendored.pl](https://github.com/photostructure/exiftool-vendored.pl)
   or
   [exiftool-vendored.exe](https://github.com/photostructure/exiftool-vendored.exe)
   into a single directory (like `~/src`)
2. On POSIX, in `../exiftool-vendored.pl`:

   1. `npx ncu -u && yarn install && ./update.sh && yarn test`
   1. Verify diffs are in order, and commit
   1. `npx release-it`

3. On Windows, in `../exiftool-vendored.exe`:

   1. `npx ncu -u && yarn install && ./update.sh && yarn test`
   1. Verify diffs are in order, and commit
   1. `npx release-it`

4. In `exiftool-vendored.pl`:

   1. `npx ncu -u`
   1. `yarn install`
   1. `yarn mktags ../test-images` # < assumes ``../test-images`` has the full ExifTool sample image suite
   1. `yarn prettier`
   1. `yarn lint`
   1. `yarn docs`
   1. Verify docs were rebuilt successfully at <http://localhost:3000/index.html>
   1. `yarn test`
   1. Verify diffs are reasonable, and `git commit`
   1. Verify [![Node.js CI](https://github.com/photostructure/exiftool-vendored.js/actions/workflows/node.js.yml/badge.svg)](https://github.com/photostructure/exiftool-vendored.js/actions/workflows/node.js.yml)
   1. Update the [CHANGELOG.md](https://github.com/photostructure/exiftool-vendored.js/blob/main/CHANGELOG.md)
   1. `npx release-it`
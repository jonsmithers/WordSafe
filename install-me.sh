#! /bin/bash
set -ex
npm install       # installs deps (including the new `oclif` package)
npx tsc -b        # compiles TypeScript → lib/
npm link          # symlinks the package globally so `wordsafe` is on your PATH

# npm link doesn't run prepack automatically (that only fires for npm pack/npm publish), so you need the explicit tsc -b first. After that, wordsafe should work anywhere in your
# shell.

# To unlink later: npm unlink -g wordsafe

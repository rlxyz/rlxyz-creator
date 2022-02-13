#!/usr/bin/env bash

# cd to the root of the repo
cd "$(git rev-parse --show-toplevel)"

cp README.md contracts/
mkdir contracts/build contracts/build/contracts
cp -r build/contracts/*.json contracts/build/contracts

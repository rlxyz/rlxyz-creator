#!/usr/bin/env bash

set -euo pipefail
# shopt -s globstar

# cross platform `mkdir -p`
node -e 'fs.mkdirSync("build/contracts", { recursive: true })'

echo 'Copying over to build/contracts'

cp artifacts/contracts/**/*.json build/contracts
rm build/contracts/*.dbg.json

node scripts/remove-ignored-artifacts.js
#!/usr/bin/env bash
# Restore demo/fixture to its pristine (buggy) state so the demo is rerunnable.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf fixture
cp -R fixture-template fixture
echo "fixture reset: $(ls fixture | tr '\n' ' ')"

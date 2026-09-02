#!/usr/bin/env bash
# Regenerates data/pipeline-example.json from realizations' real,
# already-tested pipeline functions. Run this after any realizations
# change that could affect the showcase fixture's output.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
python3 -c "
import sys
sys.path.insert(0, '/work/realizations')
from scripts.export_showcase_data import export
export('data/pipeline-example.json')
"
echo "Regenerated data/pipeline-example.json"

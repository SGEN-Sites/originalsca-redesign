#!/usr/bin/env bash
# prove.sh: rebuild dist/ and re-run every site-reforge proof stage against it, in order, so no report can
# predate the build it describes. Usage: bash tools/prove.sh   (the live-menu check is separate: node tools/verify-menus.mjs)
set -uo pipefail
cd "$(dirname "$0")/.."
SR="$HOME/.claude/skills/site-reforge/scripts"
step() { printf '\n== %s\n' "$1"; }
PAGES=/,/retail,/deals,/brands,/blog,/faqs,/contact,/jobs,/los-angeles,/los-angeles-store,/san-diego-store,/bussin-merch,/rewards-program-and-opt-in,/privacy-policy,/originals-gelato-strain-profile,/originals-hall-of-flowers-palm-springs-recap

step "build";                node src/build.mjs
step "seo (emit + repair)";  node "$SR/sr-seo.mjs" --project . --dir dist --site-url https://originalsca.com --apply | tail -6
step "responsive sweep";     node tools/sweep-rebuild.mjs | tail -1
                             rm -rf audit/sweeps
                             for f in audit/sweeps-raw/baseline/*.json; do node "$SR/sr-sweep.mjs" --project . --merge "$f" --side baseline >/dev/null 2>&1; done
                             for f in audit/sweeps-raw/rebuild/*.json; do node "$SR/sr-sweep.mjs" --project . --merge "$f" >/dev/null 2>&1; done
                             node "$SR/sr-sweep.mjs" --project . --collect | tail -1
step "pixel diff";           rm -rf audit/screens/rebuild audit/screens/diff
                             node tools/shoot.mjs --dir dist --paths "$PAGES" --widths 390,768,1024,1440 --pixeldiff | tail -1
                             node "$SR/sr-pixeldiff.mjs" --project . | tail -3
step "parity";               node "$SR/sr-parity.mjs" --project . | tail -8
step "fabrication";          node "$SR/sr-fabrication.mjs" --project . --strict | tail -4
step "decontaminate";        node "$SR/sr-decontaminate.mjs" --project . --strict | tail -5
step "images";               node "$SR/sr-images.mjs" --project . --dir dist | tail -4
step "rebase (check)";       node "$SR/sr-rebase.mjs" --project . --dir dist --check | tail -2
step "docs";                 node tools/docs-changelog.mjs
step "ui";                   node tools/test-ui.mjs | tail -1
step "gate";                 node "$SR/sr-gate.mjs" --project . | tail -40
step "report";               node "$SR/sr-report.mjs" --project . | tail -3

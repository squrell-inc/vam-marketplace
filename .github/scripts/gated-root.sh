#!/usr/bin/env bash
# Copies a marketplace root to a new directory without the listings named in
# EXCLUDED_LISTINGS (space-separated ids): their directories are left out and the
# index stops naming them. CI validates and tests that copy, so an excluded listing
# is visibly out of the gate (each run prints it) while every other listing gates.
#
# Usage: gated-root.sh <source root> <destination>
set -euo pipefail
src="$1"; dst="$2"
rm -rf "$dst"; mkdir -p "$dst"
(cd "$src" && tar --exclude=.git -cf - .) | (cd "$dst" && tar -xf -)
for id in ${EXCLUDED_LISTINGS:-}; do
  echo "::warning title=Listing excluded from the gate::$id is excluded (see EXCLUDED_LISTINGS in validate.yml)"
  rm -rf "$dst/listings/$id"
  jq --arg id "$id" '.listings |= map(select(.id != $id))' "$dst/marketplace.json" > "$dst/marketplace.json.tmp"
  mv "$dst/marketplace.json.tmp" "$dst/marketplace.json"
done

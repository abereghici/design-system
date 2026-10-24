#!/bin/sh
# Runs the story screenshot projects (`pnpm test:screenshots`) inside the pinned Playwright
# image, the same image CI uses, and copies the baselines and the report back.
#
#   pnpm test:screenshots:docker              compare against the committed baselines (as CI)
#   pnpm test:screenshots:docker --update     rewrite them (CI's update workflow owns the real ones)
#
# Extra arguments go to Vitest. Needs Docker. Sources:
# - "Visual regression tests are most reliable when run in a standardized and tightly controlled
#   environment" (https://vitest.dev/guide/browser/visual-regression-testing).
# - Image `mcr.microsoft.com/playwright:v<version>-noble`; "The Playwright package/dependency is
#   not included in the image"; "--init" and "--ipc=host is recommended when using Chromium"
#   (https://playwright.dev/docs/docker).
# - `CI` truthy makes Vitest's update mode `none`: it "does not write snapshots and fails on
#   snapshot mismatches, missing snapshots" (https://vitest.dev/config/update).
set -eu

ui=$(cd "$(dirname "$0")/.." && pwd)
repo=$(cd "$ui/../.." && pwd)

# The image tag follows the catalog's `playwright` version, so the browsers in the image are the
# ones the lockfile's Playwright expects.
version=$(sed -n 's/^  playwright: //p' "$repo/pnpm-workspace.yaml")
image="mcr.microsoft.com/playwright:v$version-noble"

# The repo goes in as a copy of the files Git would see (tracked and untracked, minus ignored),
# because the host's node_modules hold host-platform binaries. Results come back through a
# mount of packages/ui.
list=$(mktemp)
trap 'rm -f "$list"' EXIT
(cd "$repo" && git ls-files --cached --others --exclude-standard) | while IFS= read -r file; do
  if [ -e "$repo/$file" ]; then printf '%s\n' "$file"; fi
done >"$list"

# macOS's bsdtar archives extended attributes "in AppleDouble format" by default, which arrive as
# `._*` files that Vite then scans as stories; `--no-mac-metadata` turns that off (bsdtar(1)).
tar_flags=""
if tar --version | grep -q bsdtar; then tar_flags="--no-mac-metadata"; fi
# GitHub's ubuntu-24.04 runners are x64, so the local run uses the same architecture (emulated on
# Apple silicon, so slower). SCREENSHOTS_PLATFORM=linux/arm64 runs natively there; the Button and
# probe stories matched the amd64 baselines pixel for pixel (observed), but CI's x64 is the
# reference.
# shellcheck disable=SC2086
(cd "$repo" && tar $tar_flags -cf - -T "$list") | docker run --rm -i --init --ipc=host \
  --platform "${SCREENSHOTS_PLATFORM:-linux/amd64}" \
  -e CI=true \
  -e pnpm_config_store_dir=/pnpm-store \
  -v platform-screenshots-pnpm-store:/pnpm-store \
  -v "$ui:/out" \
  "$image" sh -euc '
    mkdir /work && tar -xf - -C /work && cd /work
    npm install --global --silent "pnpm@$(node -p "require(\"./package.json\").devEngines.packageManager.version")"
    pnpm install --frozen-lockfile
    pnpm --filter @platform/tokens build
    status=0
    pnpm --filter @platform/ui run test:screenshots "$@" || status=$?
    cd packages/ui
    rm -rf /out/.vitest && cp -R .vitest /out/.vitest 2>/dev/null || true
    find src -type d -name __screenshots__ | while IFS= read -r dir; do
      rm -rf "/out/$dir" && mkdir -p "/out/$(dirname "$dir")" && cp -R "$dir" "/out/$dir"
    done
    exit "$status"
  ' sh "$@"

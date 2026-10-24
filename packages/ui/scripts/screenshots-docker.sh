#!/bin/sh
set -eu
ui=$(cd "$(dirname "$0")/.." && pwd)
cd "$ui/../.."
version=$(sed -n 's/^  playwright: //p' pnpm-workspace.yaml)
git ls-files --cached --others --exclude-standard | tar -cf - -T - | docker run --rm -i --init --ipc=host \
  -e CI=true -e pnpm_config_store_dir=/pnpm-store -v platform-screenshots-pnpm-store:/pnpm-store -v "$ui:/out" \
  "mcr.microsoft.com/playwright:v$version-noble" sh -euc '
    mkdir /work && tar -xf - -C /work --exclude="._*" && cd /work
    npm install --global --silent "pnpm@$(node -p "require(\"./package.json\").devEngines.packageManager.version")"
    pnpm install --frozen-lockfile && pnpm --filter @platform/tokens build
    status=0 && pnpm --filter @platform/ui run test:screenshots "$@" || status=$?
    rm -rf /out/.vitest /out/__screenshots__ && cp -R packages/ui/.vitest packages/ui/__screenshots__ /out/ || true
    exit "$status"
  ' sh "$@"

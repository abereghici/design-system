#!/bin/sh
set -eu
ui=$(cd "$(dirname "$0")/.." && pwd)
cd "$ui/../.."
version=$(sed -n 's/^  playwright: //p' pnpm-workspace.yaml)
git ls-files --cached --others --exclude-standard | tar -cf - -T - | docker run --rm -i --init --ipc=host --platform linux/amd64 \
  -e CI=true -e pnpm_config_store_dir=/pnpm-store -v platform-screenshots-pnpm-store:/pnpm-store -v "$ui:/out" \
  "mcr.microsoft.com/playwright:v$version-noble" sh -euc '
    mkdir /work && tar -xf - -C /work --exclude="._*" && cd /work
    npm install --global --silent "pnpm@$(node -p "require(\"./package.json\").devEngines.packageManager.version")"
    pnpm install --frozen-lockfile
    status=0 && pnpm turbo run test:screenshots --filter=@platform/ui -- "$@" || status=$?
    rm -rf /out/.vitest && cp -R packages/ui/.vitest /out/ || true
    find /out/src -name __screenshots__ -prune -exec rm -rf {} +
    cd packages/ui && find src -name __screenshots__ -prune | tar -cf - -T - | tar -xf - -C /out
    exit "$status"
  ' sh "$@"

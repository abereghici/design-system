#!/bin/sh
set -eu
ui=$(cd "$(dirname "$0")/.." && pwd)
cd "$ui/../.."
fixture="$PWD/apps/ui-next-fixture/test"
version=$(sed -n 's/^  playwright: //p' pnpm-workspace.yaml)
git ls-files --cached --others --exclude-standard | tar -cf - -T - | docker run --rm -i --init --ipc=host --platform linux/amd64 \
  -e CI=true -e pnpm_config_store_dir=/pnpm-store -v design-system-screenshots-pnpm-store:/pnpm-store -v "$ui:/out" -v "$fixture:/fixture" \
  "mcr.microsoft.com/playwright:v$version-noble" sh -euc '
    mkdir /work && tar -xf - -C /work --exclude="._*" && cd /work
    npm install --global --silent "pnpm@$(node -p "require(\"./package.json\").devEngines.packageManager.version")"
    pnpm install --frozen-lockfile
    status=0 && pnpm turbo run test:screenshots --filter=@abereghici/ui --filter=@repo/ui-next-fixture -- "$@" || status=$?
    rm -rf /out/.vitest && cp -R packages/ui/.vitest /out/ || true
    rm -rf /fixture/__screenshots__ && cp -R apps/ui-next-fixture/test/__screenshots__ /fixture/ || true
    find /out/src -name __screenshots__ -prune -exec rm -rf {} +
    cd packages/ui && find src -name __screenshots__ -prune | tar -cf - -T - | tar -xf - -C /out
    exit "$status"
  ' sh "$@"

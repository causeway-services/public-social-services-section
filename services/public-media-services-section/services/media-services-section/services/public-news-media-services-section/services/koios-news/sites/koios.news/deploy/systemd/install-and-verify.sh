#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' 'refusing retired Koios aggregate systemd installation; use package-local successor deployments' >&2
exit 2

# Historical installer body retained below as migration evidence. It is
# unreachable by construction and remains recoverable in Git history.

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
site_root=$(cd -- "$script_dir/../.." && pwd -P)
koios_root=$(cd -- "$site_root/../.." && pwd -P)
repo_root=$(git -C "$site_root" rev-parse --show-toplevel)
unit_dir=${XDG_CONFIG_HOME:-"$HOME/.config"}/systemd/user
runtime_root="$repo_root/lib/emsenn/services/561-group/services/561-group-services-section/services/561-group-engineering-services-section/services/561-group-computer-engineering-services-section/services/computer-machine-services-section/services/persistent-computer-machine-services-section/services/bare-cedar-fog-services-section/data/runtime/share/emsenn/activitypub"

failures=0
check_file() {
  local label=$1 path=$2
  if [[ -e "$path" ]]; then printf 'ok      %s: %s\n' "$label" "$path"
  else printf 'missing %s: %s\n' "$label" "$path" >&2; failures=$((failures + 1)); fi
}

check_command() {
  local command_name=$1
  if command -v "$command_name" >/dev/null 2>&1; then printf 'ok      command: %s\n' "$command_name"
  else printf 'missing command: %s\n' "$command_name" >&2; failures=$((failures + 1)); fi
}

check_command node
node_major=$(node -p 'Number(process.versions.node.split(".")[0])')
if (( node_major < 22 )); then
  printf 'invalid Node major version: %s (need >=22)\n' "$node_major" >&2
  failures=$((failures + 1))
fi

check_file 'ActivityPub actor keys' "$runtime_root/koios-news.json"
check_file 'ActivityPub inbox token' "$runtime_root/koios-inbox.token"
check_file 'settler build artifact' "$site_root/dist/operate-activitypub-inbox.mjs"
if grep -q 'KoiosNewsAggregateTombstone' "$site_root/src/tombstone.mjs"; then
  printf 'blocked active aggregate tombstone: %s\n' "$site_root/src/tombstone.mjs" >&2
  failures=$((failures + 1))
fi

for provider in independent-editorial-assessment newswire-editorial-production newscable-source-broker web-source-acquisition; do
  check_file "$provider dependency closure" "$koios_root/services/$provider/node_modules"
done

if (( failures > 0 )); then
  printf 'Koios carrier preflight refused with %d unresolved requirement(s).\n' "$failures" >&2
  exit 1
fi

systemd-analyze --user verify \
  "$script_dir/koios-activitypub-settle-next.service" \
  "$script_dir/koios-activitypub-settle-next.timer"

if [[ ${1:-} == --install ]]; then
  install -d -m 0755 "$unit_dir"
  install -m 0644 \
    "$script_dir/koios-activitypub-settle-next.service" \
    "$script_dir/koios-activitypub-settle-next.timer" \
    "$unit_dir/"
  systemctl --user daemon-reload
  printf 'Installed Koios user units without enabling or starting them.\n'
elif [[ $# -ne 0 ]]; then
  printf 'usage: %s [--install]\n' "$0" >&2
  exit 64
else
  printf 'Koios carrier preflight passed; rerun with --install to install disabled units.\n'
fi

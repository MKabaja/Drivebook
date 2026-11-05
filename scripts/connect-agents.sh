#!/usr/bin/env bash
# Podłącza RoomBook do claude-config na nowym komputerze.
# Claude Code: skille/agenci/komendy globalnie przez install.sh claude-config, pamięć przez connect-project.sh.
# Inni agenci (Codex): symlinki .ai/shared, .ai/memory i .agents/skills (gitignorowane).
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_DIR="$(cd "${1:-${PROJECT_DIR}/../claude-config}" && pwd)"

bash "${CONFIG_DIR}/connect-project.sh" "${PROJECT_DIR}" roombook

link() {
  local target="$1" link_path="$2"
  mkdir -p "$(dirname "${link_path}")"
  if [ -L "${link_path}" ] || [ ! -e "${link_path}" ]; then
    ln -sfn "${target}" "${link_path}"
    echo "linked   ${link_path#"${PROJECT_DIR}/"} -> ${target}"
  else
    echo "skip     ${link_path} istnieje i nie jest symlinkiem" >&2
  fi
}

link "${CONFIG_DIR}" "${PROJECT_DIR}/.ai/shared"
link "${CONFIG_DIR}/memory/roombook" "${PROJECT_DIR}/.ai/memory"
link "${CONFIG_DIR}/skills" "${PROJECT_DIR}/.agents/skills"

echo 'Gotowe. Uruchom nową sesję agenta.'

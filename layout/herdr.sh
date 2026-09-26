#!/usr/bin/env bash
# Waypoints demo layout in herdr (https://herdr.dev).
#
#   ┌──────────────────────┬──────────────────────┐
#   │ hermes               │                      │
#   │ (bun run demo:hermes │  watch               │
#   │  pre-typed, no Enter)│  (bun run watch,     │
#   ├──────────────────────┤   running)           │
#   │ langgraph            │                      │
#   │ (demo:langgraph      │                      │
#   │  pre-typed)          │                      │
#   └──────────────────────┴──────────────────────┘
#
# Agents are NOT started: their commands are typed into the shell without Enter,
# so the presenter controls timing. Only the watch pane runs immediately.
#
# Usage: bun run demo:layout            (session "waypoints"; attaches when done)
#        WAYPOINTS_HERDR_SESSION=x NO_ATTACH=1 bash layout/herdr.sh
set -euo pipefail

SESSION="${WAYPOINTS_HERDR_SESSION:-waypoints}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HERMES_CMD="${HERMES_CMD:-bun run demo:hermes}"
LANGGRAPH_CMD="${LANGGRAPH_CMD:-bun run demo:langgraph}"
WATCH_CMD="${WATCH_CMD:-bun run watch}"

command -v herdr >/dev/null || { echo "herdr not installed: brew install herdr (or use: bun run demo:layout:tmux)"; exit 1; }
command -v jq >/dev/null || { echo "jq not installed: brew install jq"; exit 1; }

h() { herdr --session "$SESSION" "$@"; }

# Start the session's server headless if it isn't running yet.
if ! herdr session list 2>/dev/null | awk -v s="$SESSION" '$1==s && $2=="running"{f=1} END{exit !f}'; then
  nohup herdr --session "$SESSION" server >/dev/null 2>&1 &
  for _ in $(seq 1 50); do
    h workspace list >/dev/null 2>&1 && break
    sleep 0.1
  done
fi

ws=$(h workspace create --cwd "$ROOT_DIR" --label waypoints-demo --focus)
hermes=$(jq -r .result.root_pane.pane_id <<<"$ws")
watch=$(h pane split "$hermes" --direction right --ratio 0.45 --cwd "$ROOT_DIR" | jq -r .result.pane.pane_id)
langgraph=$(h pane split "$hermes" --direction down --cwd "$ROOT_DIR" | jq -r .result.pane.pane_id)

h pane rename "$hermes" hermes >/dev/null
h pane rename "$langgraph" langgraph >/dev/null
h pane rename "$watch" "watch (Atlas change stream)" >/dev/null

sleep 0.8 # let the shells reach their prompts
h pane send-text "$hermes" "$HERMES_CMD" >/dev/null
h pane send-text "$langgraph" "$LANGGRAPH_CMD" >/dev/null
h pane run "$watch" "$WATCH_CMD" >/dev/null

echo "herdr session '$SESSION': hermes=$hermes langgraph=$langgraph watch=$watch"
if [[ -z "${NO_ATTACH:-}" ]]; then
  exec herdr --session "$SESSION"
fi

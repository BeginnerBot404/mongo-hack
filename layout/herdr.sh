#!/usr/bin/env bash
# Waypoints "glass box" demo layout in herdr (https://herdr.dev).
#
#   ┌────────────────────────────┬──────────────────────────┐
#   │                            │ view:prompt  (system     │
#   │  harness                   │   prompt + settings diff)│
#   │  (command pre-typed,       ├──────────────────────────┤
#   │   NOT executed)            │ view:drafts  (latest      │
#   │                            │   draft + QA verdict)    │
#   │                            ├──────────────────────────┤
#   │                            │ view:atlas   (raw change │
#   │                            │   stream, all colls)     │
#   └────────────────────────────┴──────────────────────────┘
#   + tab "sentinel" (not focused): bun run sentinel, running.
#
# Re-running stops the previous herdr session first, so it doubles as the reset.
# Usage: bun run demo:layout            (session "waypoints"; attaches when done)
#        WAYPOINTS_HERDR_SESSION=x NO_ATTACH=1 VIEW_DB=waypoints_smoke bash layout/herdr.sh
set -euo pipefail

SESSION="${WAYPOINTS_HERDR_SESSION:-waypoints}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIEW_DB="${VIEW_DB:-waypoints}"
DBARG=" --db $VIEW_DB"
HARNESS_CMD="${HARNESS_CMD:-bun run harness --fresh}"
PROMPT_CMD="${PROMPT_CMD:-bun run view:prompt$DBARG}"
DRAFTS_CMD="${DRAFTS_CMD:-bun run view:drafts$DBARG}"
ATLAS_CMD="${ATLAS_CMD:-bun run view:atlas$DBARG}"
SENTINEL_CMD="${SENTINEL_CMD:-bun run sentinel}"

command -v herdr >/dev/null || { echo "herdr not installed: brew install herdr (or use: bun run demo:layout:tmux)"; exit 1; }
command -v jq >/dev/null || { echo "jq not installed: brew install jq"; exit 1; }

h() { herdr --session "$SESSION" "$@"; }
running() { herdr session list 2>/dev/null | awk -v s="$SESSION" '$1==s && $2=="running"{f=1} END{exit !f}'; }

# Reset: stop the previous session (kills its views, sentinel and any harness still running).
if running; then
  echo "stopping previous herdr session '$SESSION'…"
  herdr session stop "$SESSION" >/dev/null 2>&1 || true
  for _ in $(seq 1 50); do running || break; sleep 0.1; done
fi
# Drop persisted workspaces so the restart doesn't restore the old layout next to the new one.
herdr session delete "$SESSION" >/dev/null 2>&1 || true

nohup herdr --session "$SESSION" server >/dev/null 2>&1 &
for _ in $(seq 1 50); do
  h workspace list >/dev/null 2>&1 && break
  sleep 0.1
done

# Belt and braces: close any workspace that survived.
for old in $(h workspace list 2>/dev/null | jq -r '.result.workspaces[].workspace_id' 2>/dev/null); do
  h workspace close "$old" >/dev/null 2>&1 || true
done

ws=$(h workspace create --cwd "$ROOT_DIR" --label waypoints --focus)
wsid=$(jq -r '.result.workspace.workspace_id // .result.workspace_id // empty' <<<"$ws")
harness=$(jq -r .result.root_pane.pane_id <<<"$ws")
prompt=$(h pane split "$harness" --direction right --ratio 0.5 --cwd "$ROOT_DIR" | jq -r .result.pane.pane_id)
rubric=$(h pane split "$prompt" --direction down --ratio 0.4 --cwd "$ROOT_DIR" | jq -r .result.pane.pane_id)
atlas=$(h pane split "$rubric" --direction down --ratio 0.55 --cwd "$ROOT_DIR" | jq -r .result.pane.pane_id)

h pane rename "$harness" "harness" >/dev/null
h pane rename "$prompt" "system prompt (harness_config)" >/dev/null
h pane rename "$rubric" "drafts (QA gate)" >/dev/null
h pane rename "$atlas" "Atlas change stream" >/dev/null

# Sentinel: its own unfocused tab, running in the background.
sentinel=""
tab=$(h tab create ${wsid:+--workspace "$wsid"} --cwd "$ROOT_DIR" --label sentinel --no-focus 2>/dev/null || true)
sentinel=$(jq -r '.result.root_pane.pane_id // .result.pane.pane_id // empty' <<<"$tab" 2>/dev/null || true)

sleep 0.8 # let the shells reach their prompts
h pane send-text "$harness" "$HARNESS_CMD" >/dev/null
h pane run "$prompt" "$PROMPT_CMD" >/dev/null
h pane run "$rubric" "$DRAFTS_CMD" >/dev/null
h pane run "$atlas" "$ATLAS_CMD" >/dev/null
if [[ -n "$sentinel" ]]; then
  h pane rename "$sentinel" sentinel >/dev/null || true
  h pane run "$sentinel" "$SENTINEL_CMD" >/dev/null
else
  echo "WARN: could not create sentinel tab; run '$SENTINEL_CMD' yourself"
fi
h pane focus "$harness" >/dev/null 2>&1 || true

echo "herdr session '$SESSION': harness=$harness prompt=$prompt rubric=$rubric atlas=$atlas sentinel=${sentinel:-none}"
if [[ -z "${NO_ATTACH:-}" ]]; then
  exec herdr --session "$SESSION"
fi

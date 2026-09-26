#!/usr/bin/env bash
# Fallback for layout/herdr.sh: same glass-box layout in tmux.
# Left: harness (pre-typed). Right column: view:prompt / view:drafts / view:atlas (running).
# Window 2 "sentinel": bun run sentinel (running, not focused). Re-running kills the previous session first.
set -euo pipefail

SESSION="${WAYPOINTS_TMUX_SESSION:-waypoints}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIEW_DB="${VIEW_DB:-waypoints}"
DBARG=" --db $VIEW_DB"

command -v tmux >/dev/null || { echo "tmux not installed: brew install tmux"; exit 1; }
tmux kill-session -t "$SESSION" 2>/dev/null || true

tmux new-session -d -s "$SESSION" -n demo -c "$ROOT_DIR" -x "$(tput cols)" -y "$(tput lines)"
tmux set -t "$SESSION" pane-border-status top
harness=$(tmux display -p -t "$SESSION" '#{pane_id}')
prompt=$(tmux split-window -h -p 50 -t "$harness" -c "$ROOT_DIR" -P -F '#{pane_id}')
rubric=$(tmux split-window -v -p 55 -t "$prompt" -c "$ROOT_DIR" -P -F '#{pane_id}')
atlas=$(tmux split-window -v -p 45 -t "$rubric" -c "$ROOT_DIR" -P -F '#{pane_id}')
tmux select-pane -t "$harness" -T harness
tmux select-pane -t "$prompt" -T "system prompt (harness_config)"
tmux select-pane -t "$rubric" -T "drafts (QA gate)"
tmux select-pane -t "$atlas" -T "Atlas change stream"
sentinel=$(tmux new-window -d -t "$SESSION" -n sentinel -c "$ROOT_DIR" -P -F '#{pane_id}')

sleep 0.5
tmux send-keys -t "$harness" "${HARNESS_CMD:-bun run harness --fresh}"
tmux send-keys -t "$prompt" "${PROMPT_CMD:-bun run view:prompt$DBARG}" Enter
tmux send-keys -t "$rubric" "${DRAFTS_CMD:-bun run view:drafts$DBARG}" Enter
tmux send-keys -t "$atlas" "${ATLAS_CMD:-bun run view:atlas$DBARG}" Enter
tmux send-keys -t "$sentinel" "${SENTINEL_CMD:-bun run sentinel}" Enter
tmux select-window -t "$SESSION:demo"
tmux select-pane -t "$harness"

[[ -n "${NO_ATTACH:-}" ]] || exec tmux attach -t "$SESSION"

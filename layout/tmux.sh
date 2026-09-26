#!/usr/bin/env bash
# Fallback for layout/herdr.sh: same 3-pane layout in tmux.
# Left-top hermes (pre-typed), left-bottom langgraph (pre-typed), right watch (running).
set -euo pipefail

SESSION="${WAYPOINTS_TMUX_SESSION:-waypoints}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

command -v tmux >/dev/null || { echo "tmux not installed: brew install tmux"; exit 1; }
tmux kill-session -t "$SESSION" 2>/dev/null || true

tmux new-session -d -s "$SESSION" -c "$ROOT_DIR" -x "$(tput cols)" -y "$(tput lines)"
tmux set -t "$SESSION" pane-border-status top
hermes=$(tmux display -p -t "$SESSION" '#{pane_id}')
watch=$(tmux split-window -h -p 55 -t "$hermes" -c "$ROOT_DIR" -P -F '#{pane_id}')
langgraph=$(tmux split-window -v -t "$hermes" -c "$ROOT_DIR" -P -F '#{pane_id}')
tmux select-pane -t "$hermes" -T hermes
tmux select-pane -t "$langgraph" -T langgraph
tmux select-pane -t "$watch" -T "watch (Atlas change stream)"

sleep 0.5
tmux send-keys -t "$hermes" "${HERMES_CMD:-bun run demo:hermes}"
tmux send-keys -t "$langgraph" "${LANGGRAPH_CMD:-bun run demo:langgraph}"
tmux send-keys -t "$watch" "${WATCH_CMD:-bun run watch}" Enter
tmux select-pane -t "$hermes"

[[ -n "${NO_ATTACH:-}" ]] || exec tmux attach -t "$SESSION"

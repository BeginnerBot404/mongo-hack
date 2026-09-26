#!/usr/bin/env bash
# Waypoints demo harness #1: Hermes Agent (Nous Research) works the fixture through the Waypoints MCP server.
# Kill it mid-task with `kill -9` (pid is printed), then run `bun run demo:langgraph` to resume.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
export WAYPOINTS_REPO="$REPO"
export HERMES_HOME="$REPO/demo/hermes/.home"
mkdir -p "$HERMES_HOME"
cp "$REPO/demo/hermes/config.yaml" "$HERMES_HOME/config.yaml"

# Hermes reads OPENROUTER_API_KEY from the env; take it from the repo .env via bun without echoing it.
if [[ -z "${OPENROUTER_API_KEY:-}" ]]; then
  OPENROUTER_API_KEY="$(cd "$REPO" && bun -e 'process.stdout.write(process.env.OPENROUTER_API_KEY ?? "")')"
  export OPENROUTER_API_KEY
fi
[[ -n "$OPENROUTER_API_KEY" ]] || { echo "OPENROUTER_API_KEY not set (repo .env)"; exit 1; }

MODEL="${HERMES_MODEL:-anthropic/claude-sonnet-5}"
PROMPT="You are the \"hermes\" coding agent. Pass agent=\"hermes\" to every waypoints tool that accepts it.
The waypoints tools are exposed to you as mcp__waypoints__<tool>. Your cwd is demo/fixture.
Run tests with: bun test (in the cwd). Edit only invoice.ts.
HARD RULE: the tool call right after every bun test is mcp__waypoints__checkpoint with bearings_current
(tests_passing = the pass count). No other action in between. You may be killed at any moment; the last
checkpoint is all the next agent will see.
File tool paths are absolute: $REPO/demo/fixture/invoice.ts and $REPO/demo/fixture/invoice.test.ts.
SPEED (you have ~60s before a possible kill): be terse, no narration. Waypoints (MCP) tools go ONE per turn, never
batched with anything. Turn 1 = resume only. Turn 2 = read both files in parallel. Then set_objective (if resume found
none), then bun test. log_failure/adapt one per turn. Skip recall unless resume returned prior failures.
Edit with ONE terminal call: perl -pi -e 's/<old>/<new>/' invoice.ts (the patch tool is slow). One bug per edit.

$(cat "$REPO/demo/task.md")"

echo "▶ hermes · model=$MODEL · pid=$$ · HERMES_HOME=$HERMES_HOME"
echo "  (kill -9 $$ to simulate a crash; then: bun run demo:langgraph)"
exec "${HERMES_BIN:-$HOME/.local/bin/hermes}" chat -q "$PROMPT" --oneshot --yolo \
  --provider openrouter -m "$MODEL" \
  -t terminal,file,waypoints --max-turns 60 --source tool \
  --in "$REPO/demo/fixture"

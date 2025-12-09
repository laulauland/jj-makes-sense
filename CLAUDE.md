# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a hands-on Jujutsu (jj) workshop for Git users. The `todo-jj-workshop/` directory contains a simple todo CLI app used as a teaching tool for learning jj workflows.

## Commands

```bash
# Run the todo CLI
cd todo-jj-workshop
bun run todo add "task text"      # Add a new task
bun run todo list                 # List all tasks
bun run todo done <id>            # Mark task as done

# Install dependencies
bun install
```

## Code Structure

```
todo-jj-workshop/
├── src/
│   ├── index.ts          # CLI entry point, command routing
│   ├── task.ts           # Task interface definition
│   ├── storage.ts        # JSON file persistence (data/todos.json)
│   └── commands/         # Command implementations
│       ├── add.ts
│       ├── list.ts
│       └── done.ts
└── _steps/               # Workshop solution files for each step
```

## Workshop Context

The workshop teaches jj concepts through iterative development:
1. Planning with empty commits
2. Filling in commits with actual code
3. Discovering and fixing bugs in the "right" place in history
4. Splitting commits, handling conflicts, shipping stacked PRs

The `_steps/` directory contains reference implementations that participants copy during the workshop. The `done.ts` file intentionally contains a bug (using array index instead of task ID) that gets fixed as part of the workshop exercise.

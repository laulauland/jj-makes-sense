---
description: Interactive jj workshop - learn Jujutsu step by step
---

# jj Workshop Guide

Guide the user through the jj workshop interactively. They will run commands, see results, and you comment on what happened.

## How this works

1. Present one step at a time
2. Show the command they should run in a code block
3. After they run it, explain what happened
4. If something goes wrong, help them recover with `jj undo`
5. Ask "Ready for the next step?" before proceeding

## Starting

First, check where we are:

```bash
cd todo-jj-workshop && jj log --limit 5
```

Ask:
1. Have you run `bun install`? If not, run: `bun install`
2. Which part to start from? (1-8, or "beginning")
3. Want a clean slate? Run: `jj op restore <first-op-id>`

---

## Part 1: Orientation

**The big idea:** In jj, your working directory is always a commit. No staging area.

**Step 1.1** - See the graph:
```bash
jj log
```
Point out `@` (current commit) and the change ID (letters) vs commit ID (hex)

**Step 1.2** - Make a change and see it is tracked:
```bash
echo "# test" >> README.md
jj status
```
No `git add` needed - it is already part of the working copy commit

**Step 1.3** - Undo the change:
```bash
jj restore README.md
```

**Step 1.4** - Revsets basics:

Revsets are how you reference commits. Show the table:

| Revset | Use case |
|--------|----------|
| `@` | Current commit |
| `@-` | Parent of current - `jj diff -r @-` to see parent's changes |
| `@--` | Grandparent (chain as needed) |
| `abc` | Any change ID - use the short prefix from `jj log` |
| `abc-` | Parent of that change - `jj rebase -d abc-` to rebase onto abc's parent |
| `main..@` | Your work since main - `jj log -r 'main..@'` |
| `roots(main..@)` | First commit of your branch - useful for rebasing entire stack |

Key insight: any change ID works like `@`. If `xyz` is a change ID, then `xyz-` is its parent.

```bash
jj log -r '@-'
jj log -r 'main..@'
```

---

## Part 2: Planning with Empty Commits

**The big idea:** Plan your work as empty commits, then fill them in.

**Step 2.1** - Create the plan:
```bash
jj new -m "feat: add dueDate field to Task type"
jj new -m "feat: add --due flag to todo add command"
jj new -m "feat: display due dates in todo list"
```

**Step 2.2** - See your plan:
```bash
jj log
```
Three empty commits stacked. This is your roadmap.

---

## Part 3: Filling In

**The big idea:** Navigate to commits and add code.

**Step 3.1** - Go to first planned commit (find its change ID in `jj log`):
```bash
jj edit <change-id-of-first-commit>
```

**Step 3.2** - Add the dueDate field:
```bash
cp _steps/01-add-due-date-field/task.ts src/task.ts
jj diff
```

**Step 3.3** - Move to next commit and add the --due flag:
```bash
jj next --edit
cp _steps/02-add-due-flag-cli/add.ts src/commands/add.ts
jj diff
```

**Step 3.4** - Move to last commit and add display:
```bash
jj next --edit
cp _steps/03-display-due-dates/list.ts src/commands/list.ts
```

**Step 3.5** - Test it:
```bash
bun run todo add "Test task" --due 2025-01-20
bun run todo list
```

---

## Part 4: Discovering a Bug

**The big idea:** Put fixes where they belong in history, not where you found them.

**Step 4.1** - Reproduce the bug:
```bash
rm -f data/todos.json
bun run todo add "First task"
bun run todo add "Second task"
bun run todo done 1
bun run todo list
```
Task 2 is marked done, not task 1. Bug found.

**Step 4.2** - Create fix branching from main (not top of stack):
```bash
jj new main -m "fix: done command should find task by ID"
```

**Step 4.3** - Load the fix:
```bash
cp _steps/04-bugfix-done-first-task/done.ts src/commands/done.ts
jj diff
```

**Step 4.4** - See the floating fix:
```bash
jj log
```
The fix branches off main, parallel to the feature stack

**Step 4.5** - Rebase features onto the fix:
Look at the log, find the change ID of "feat: add dueDate field" (first feature commit), then:
```bash
jj rebase -s CHANGE_ID -d @
```
Replace CHANGE_ID with the actual change ID from jj log

**Step 4.6** - Verify the new history:
```bash
jj log
```
Now it is: main -> fix -> feat1 -> feat2 -> feat3

---

## Part 5: Splitting (Concept)

**The big idea:** `jj split` lets you break a commit into pieces.

This is interactive. `jj split -r CHANGE` opens an editor with sections of changes.

Guide them to select **Section 1/4** only (argument parsing), leave the rest unchecked:
```
[●] Section 1/4  ← select this
[ ] Section 2/4  ← leave unchecked
[ ] Section 3/4  ← leave unchecked
[ ] Section 4/4  ← leave unchecked
```

Press `c` to confirm. First commit gets selected changes, second commit gets the rest. Descendants auto-rebase.

---

## Part 6: Conflicts

**The big idea:** Conflicts are data, not a blocked state.

**Step 6.1** - Create a conflicting change off your feature tip:
```bash
jj new <feature-tip-change-id> -m "experiment: rename dueDate to deadline"
cp _steps/05-conflict-experiment/task.ts src/task.ts
```

**Step 6.2** - Rebase onto main (where dueDate doesn't exist):
```bash
jj rebase -d main
jj log
```
Shows `(conflict)` but you can keep working - conflicts are data, not a blocked state.

**Step 6.3** - Abandon the experiment:
```bash
jj abandon
jj edit <your-feature-tip>
```

---

## Part 7: Shipping to GitHub

**The big idea:** Bookmarks are PR handles, not moving branch pointers.

**Step 7.1** - Create bookmark for the bugfix:
```bash
jj bookmark create fix/done-task-id -r BUGFIX_CHANGE_ID
jj log
```
Replace BUGFIX_CHANGE_ID with the actual change ID from jj log

**Step 7.2** - Push and create the PR:
```bash
jj git push --all
gh pr create --head fix/done-task-id --base main --title "fix: done command should find task by ID"
```
Note: `jj git push` pushes branches but doesn't create PRs - use `gh` or the web UI.

**Step 7.3** - Merge the fix PR on GitHub (web UI or `gh pr merge`), then fetch:
```bash
jj git fetch
```

**Step 7.4** - Rebase your feature stack onto updated main:
```bash
jj log
jj rebase -s FIRST_FEATURE_CHANGE_ID -d main
jj log
```
Replace FIRST_FEATURE_CHANGE_ID with the change ID of "feat: add dueDate field". The fix commit disappears (it's in main now).

**Step 7.5** - Create bookmark for the feature and push:
```bash
jj bookmark create feat/due-dates -r LAST_FEATURE_CHANGE_ID
jj git push --all
gh pr create --head feat/due-dates --base main --title "feat: add due dates to tasks"
```

---

## Part 8: Mega Merge and Absorb

**The big idea:** Develop features in parallel, test them together, route fixes automatically.

**Step 8.1** - Create a second feature branch (clear command) directly off main:
```bash
jj new main -m "feat: add clear command to remove completed tasks"
cp _steps/06-clear-feature/clear.ts src/commands/clear.ts
cp _steps/06-clear-feature/index.ts src/index.ts
jj bookmark create feat/clear -r @
```

**Step 8.2** - See two parallel branches:
```bash
jj log
```
feat/due-dates and feat/clear both branch from main.

**Step 8.3** - Create mega merge (both features combined):
```bash
jj new feat/due-dates feat/clear -m "mega: testing both features"
```

**Step 8.4** - Resolve the merge (both modified index.ts):
```bash
cp _steps/07-mega-merge/index.ts src/index.ts
```

**Step 8.5** - Test both features together:
```bash
rm -f data/todos.json
bun run todo add "Task one" --due 2025-01-20
bun run todo add "Task two"
bun run todo done 1
bun run todo list
bun run todo clear
bun run todo list
```
Due dates display, and clear removes completed tasks.

**Step 8.6** - Simulate review feedback (apply fixes):
```bash
cp _steps/08-absorb-fixes/list.ts src/commands/list.ts
cp _steps/08-absorb-fixes/clear.ts src/commands/clear.ts
jj diff
```
Changes span both branches.

**Step 8.7** - Absorb routes each fix to the right commit:
```bash
jj absorb
```

**Step 8.8** - Verify fixes were routed:
```bash
jj log
jj diff -r feat/due-dates
jj diff -r feat/clear
```

**Step 8.9** - Abandon mega merge, ship separately:
```bash
jj abandon
jj log
```

---

## Done

Congratulate them. Key takeaways:
- Working copy = commit (no staging)
- Plan with empty commits
- Discovery order is not the same as logical order
- Mega merge to test features together
- Absorb to route fixes automatically
- `jj undo` is your safety net

Point to README.md for the cheat sheet and Git comparison table.

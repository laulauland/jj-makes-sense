---
description: Interactive jj workshop - learn Jujutsu step by step
---

# jj Workshop Guide

Guide the user through the jj workshop interactively. They will run commands, see results, and you comment on what happened.

## How this works

1. Present one step at a time
2. Show the command they should run in a code block
3. After they run it, explain what happened
4. If something goes wrong, help them recover with `jj op undo`
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

**Step 3.1** - Go to first planned commit:
```bash
jj prev
jj prev
```

**Step 3.2** - Add the dueDate field:
```bash
cp _steps/01-add-due-date-field/task.ts src/task.ts
jj diff
```

**Step 3.3** - Move to next commit and add the --due flag:
```bash
jj next
cp _steps/02-add-due-flag-cli/add.ts src/commands/add.ts
jj diff
```

**Step 3.4** - Move to last commit and add display:
```bash
jj next
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

This is interactive and may not work in all terminals. Explain:
- `jj split -r CHANGE` opens an editor
- You select which changes go in the first commit
- The rest become a second commit
- Descendants auto-rebase

---

## Part 6: Conflicts

**The big idea:** Conflicts are data, not a blocked state.

**Step 6.1** - Create a conflicting experiment:
```bash
jj new main -m "experiment: rename dueDate to deadline"
```

**Step 6.2** - Make a conflicting change (edit task.ts manually to change dueDate to deadline)

**Step 6.3** - Try to rebase onto feature:
```bash
jj rebase -d feat/due-dates
```
Shows conflict, but you can keep working.

**Step 6.4** - Abandon the experiment:
```bash
jj abandon
```

---

## Part 7: Shipping to GitHub

**The big idea:** Bookmarks are PR handles, not moving branch pointers.

**Step 7.1** - Find your change IDs:
```bash
jj log
```

**Step 7.2** - Create bookmarks:
```bash
jj bookmark create fix/done-task-id -r BUGFIX_CHANGE_ID
jj bookmark create feat/due-dates -r LAST_FEATURE_CHANGE_ID
```
Replace the CHANGE_ID placeholders with actual change IDs from jj log

**Step 7.3** - See bookmarks in log:
```bash
jj log
```
Bookmarks appear next to commits

**Step 7.4** - (Do not actually push unless you want to)
Explain: `jj git push --all` would create stacked PRs

**Step 7.5** - Simulate the fix PR getting merged to main:

In real life, the fix PR would be merged on GitHub. We will simulate this by moving main forward:
```bash
jj new main fix/done-task-id -m "Merge fix/done-task-id into main"
jj bookmark set main -r @
jj new
```

**Step 7.6** - Rebase the feature branch onto updated main:
```bash
jj rebase -s feat/due-dates -d main
jj log
```
Now feat/due-dates is based directly on main (which includes the fix)

---

## Part 8: Mega Merge and Absorb

**The big idea:** Test multiple features together, route fixes automatically.

**Step 8.1** - Create a parallel priority feature (branching from main):
```bash
jj new main -m "feat: add priority field to Task type"
cp _steps/06-priority-feature/task.ts src/task.ts
cp _steps/06-priority-feature/add.ts src/commands/add.ts
cp _steps/06-priority-feature/list.ts src/commands/list.ts
jj bookmark create feat/priority -r @
```

**Step 8.2** - See the two parallel branches (both off main now):
```bash
jj log
```
feat/due-dates and feat/priority both branch from main

**Step 8.3** - Create mega merge (both features combined):
```bash
jj new feat/due-dates feat/priority -m "mega: testing both features"
```

**Step 8.4** - Resolve the merge:
```bash
cp _steps/07-mega-merge/task.ts src/task.ts
cp _steps/07-mega-merge/add.ts src/commands/add.ts
cp _steps/07-mega-merge/list.ts src/commands/list.ts
```

**Step 8.5** - Test both features together:
```bash
rm -f data/todos.json
bun run todo add "Important" --due 2025-01-20 --priority high
bun run todo list
```
Both due date and priority show.

**Step 8.6** - Simulate review feedback (apply fixes):
```bash
cp _steps/08-absorb-fixes/task.ts src/task.ts
cp _steps/08-absorb-fixes/add.ts src/commands/add.ts
cp _steps/08-absorb-fixes/list.ts src/commands/list.ts
jj diff
```
Changes span both branches

**Step 8.7** - Absorb routes each fix to the right commit:
```bash
jj absorb
```

**Step 8.8** - Verify fixes were routed:
```bash
jj log
jj diff -r feat/due-dates
jj diff -r feat/priority
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
- `jj op undo` is your safety net

Point to README.md for the cheat sheet and Git comparison table.

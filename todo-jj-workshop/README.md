# jj Workshop: Git Evolved

A hands-on workshop for Git users learning Jujutsu (jj).

**What we'll build:** Add due dates to a todo CLI, discover a bug mid-way, and ship the fix *before* the feature—cleanly.

**What you'll learn:**
- The working copy is always a commit (no staging area)
- Planning with empty commits
- Reordering commits when discovery order ≠ logical order
- Splitting commits that grew too big
- Conflicts as data, not a blocked state
- Shipping stacked PRs to GitHub

---

## Setup

1. Install jj: https://martinvonz.github.io/jj/latest/install/
2. Install Bun: https://bun.sh
3. Clone this repo
   ```bash
   jj git clone https://github.com/laulauland/jj-makes-sense
   cd todo-jj-workshop
   bun install
   ```

4. Verify the CLI works:
   ```bash
   bun run todo add "test task"
   bun run todo list
   bun run todo done 1
   ```

5. Clear the test data:
   ```bash
   rm -f data/todos.json
   ```

---

## Part 1: Orientation

### The working copy is a commit

In jj, your working directory is always a commit. There's no staging area.

```bash
jj log
```

You'll see `@` — that's your current commit. Make a change:

```bash
echo "# test" >> README.md
jj status
jj log
```

The change is already tracked. No `git add` needed.

Undo that:

```bash
jj restore README.md
```

### No branches (by default)

Notice there are no branch names in `jj log`. jj uses **anonymous branches**. You only create named "bookmarks" when you need to push to GitHub.

### Change IDs vs Commit IDs

Look at `jj log` output:

```
@  kpqxywon user@example.com 2025-01-15 10:30:00 a1b2c3d4
│  (empty) (no description set)
◉  zzzzzzzz root() 00000000
```

- Letters like `kpqxywon` = **change ID** (stable, survives rebases)
- Hex like `a1b2c3d4` = **commit ID** (changes when content changes)

You'll almost always use change IDs. They're shorter to type and don't change when you edit a commit.

### Revsets

Revsets are how you reference commits. The basics:

| Revset | Use case |
|--------|----------|
| `@` | Current commit |
| `@-` | Parent of current - `jj diff -r @-` to see parent's changes |
| `@--` | Grandparent (chain as needed) |
| `abc` | Any change ID - use the short prefix from `jj log` |
| `abc-` | Parent of that change - `jj rebase -d abc-` to rebase onto abc's parent |
| `main..@` | Your work since main - `jj log -r 'main..@'` |
| `roots(main..@)` | First commit of your branch - useful for rebasing entire stack |

The key insight: any change ID works like `@`. If `xyz` is a change ID:
- `xyz-` = its parent
- `xyz--` = its grandparent
- `main..xyz` = commits from main to xyz

Try it:

```bash
jj log -r '@-'
jj log -r 'main..@'
```

---

## Part 2: Planning with Empty Commits

We're going to add due dates to the todo CLI. Let's plan our commits first:

```bash
jj new -m "feat: add dueDate field to Task type"
jj new -m "feat: add --due flag to 'todo add' command"
jj new -m "feat: display due dates in 'todo list'"
```

Check your plan:

```bash
jj log
```

You now have 3 empty commits stacked on top of each other. This is your plan.

```
@  xxxxxxxxx  (empty) feat: display due dates in 'todo list'
◉  yyyyyyyyy  (empty) feat: add --due flag to 'todo add' command
◉  zzzzzzzzz  (empty) feat: add dueDate field to Task type
◉  main
```

**Why this matters:**
- You're thinking about the shape before coding
- Each commit is a reviewable unit
- Empty commits are totally fine in jj

---

## Part 3: Filling In

### Step 1: Add the due date field

Navigate to the first empty commit (find its change ID in `jj log`):

```bash
jj edit <change-id-of-first-commit>
```

Check with `jj log` — the `@` marker moved.

Load the solution:

```bash
cp _steps/01-add-due-date-field/task.ts src/task.ts
jj diff
```

See what changed? The `dueDate` field was added to the `Task` interface.

### Step 2: Add the --due flag

Move to the next commit:

```bash
jj next --edit
```

Load the solution:

```bash
cp _steps/02-add-due-flag-cli/add.ts src/commands/add.ts
jj diff
```

Test it:

```bash
bun run todo add "Buy groceries" --due 2025-01-20
bun run todo list
```

### Step 3: Display due dates

```bash
jj next --edit
```

Load the solution:

```bash
cp _steps/03-display-due-dates/list.ts src/commands/list.ts
jj diff
```

Test it:

```bash
bun run todo list
```

You should see the due date displayed.

### Check your stack

```bash
jj log
```

Three commits, each with real changes. Nice and clean.

---

## Part 4: Discovering a Bug

Let's reset our test data and try the full flow:

```bash
rm -f data/todos.json
bun run todo add "First task"
bun run todo add "Second task"
bun run todo list
```

You should see:

```
  [ ] #1 - First task
  [ ] #2 - Second task
```

Now complete task #1:

```bash
bun run todo done 1
bun run todo list
```

**Wait.** Task #1 should be marked done, but task #2 is marked instead!

```
  [ ] #1 - First task
  [✓] #2 - Second task
```

This is a bug in the original code. The `done` command uses array index instead of task ID.

### The Git instinct

In Git, you might:
- Fix it in a new commit at the top, deal with it later
- Or try to `git rebase -i` to move it earlier (scary)

### The jj way

Put the fix where it belongs: **before** our feature commits.

```bash
jj new main -m "fix: done command should find task by ID, not array index"
```

This creates a new commit with `main` as its parent—not on top of your feature stack.

Load the fix:

```bash
cp _steps/04-bugfix-done-first-task/done.ts src/commands/done.ts
jj diff
```

Test it:

```bash
rm -f data/todos.json
bun run todo add "First task"
bun run todo add "Second task"
bun run todo done 1
bun run todo list
```

Now task #1 is correctly marked done.

### Look at the graph

```bash
jj log
```

The fix commit is "floating" — it branches off from main, not connected to your feature stack:

```
◉  xxxxxxxxx  feat: display due dates in 'todo list'
◉  yyyyyyyyy  feat: add --due flag to 'todo add' command
◉  zzzzzzzzz  feat: add dueDate field to Task type
│ @  fffffffff  fix: done command should find task by ID, not array index
├─╯
◉  main
```

### Rebase the feature on top of the fix

We want the fix to come *before* the feature in history:

```bash
jj rebase -s <change-id-of-first-feature-commit> -d @
```

Replace `<change-id-of-first-feature-commit>` with the actual change ID of "feat: add dueDate field to Task type".

Check the result:

```bash
jj log
```

Now the history is: `main → bugfix → feature1 → feature2 → feature3`

```
@  xxxxxxxxx  feat: display due dates in 'todo list'
◉  yyyyyyyyy  feat: add --due flag to 'todo add' command
◉  zzzzzzzzz  feat: add dueDate field to Task type
◉  fffffffff  fix: done command should find task by ID, not array index
◉  main
```

The fix goes before the feature, as it should. **One command.**

### The safety net

Made a mistake? Check the operation log:

```bash
jj op log
```

This shows every operation you've done. Undo the last one:

```bash
jj undo
```

Or restore to any point:

```bash
jj op restore <operation-id>
```

Try it: undo the rebase, look at the graph, then redo it.

---

## Part 5: Splitting and Squashing

Split when a commit does too much. Squash when commits are too granular.

### Splitting a commit

Let's say a reviewer asks: "Can you split the --due flag commit? Separate the arg parsing from the validation logic."

First, find the change ID of that commit:

```bash
jj log
```

Then split it:

```bash
jj split -r <change-id-of-due-flag-commit>
```

This opens an interactive editor showing sections of changes. Use arrow keys to navigate, space to toggle sections.

For this exercise, select **Section 1/4** only (the `--due` flag parsing loop). Leave the rest unchecked:

```
[●] Section 1/4  ← select this (argument parsing)
[ ] Section 2/4  ← leave unchecked (validation)
[ ] Section 3/4  ← leave unchecked (dueDate field)
[ ] Section 4/4  ← leave unchecked (output message)
```

Press `c` to confirm. The selected changes become the first commit, the rest become a second commit.

Check the result:

```bash
jj log
```

Your stack now has more commits. Descendants were automatically rebased on top of the split.

**In Git, this would require:**
1. `git rebase -i` to mark the commit as "edit"
2. `git reset HEAD^` to unstage
3. Carefully `git add -p` to stage the first half
4. `git commit`
5. `git add .` and `git commit` for the second half
6. `git rebase --continue`
7. Resolve any conflicts in downstream commits
8. Hope you didn't mess up

**In jj:** one command, interactive selection, done.

### Squashing commits

Squash is the inverse of split. It folds changes into a parent commit.

**Scenario 1: Fold current commit into parent**

You made a small fix that belongs with the previous commit:

```bash
jj squash
```

Your current commit's changes merge into the parent. The current commit disappears.

**Scenario 2: Fold into a specific ancestor**

You're at the tip of your stack and realize some changes belong in an earlier commit:

```bash
jj squash --into <target-change-id>
```

This routes your working copy changes to the specified commit, skipping intermediate ancestors.

**Scenario 3: Clean up empty commits**

jj creates a new empty commit after most operations. If you accumulate empties:

```bash
jj squash              # if current is empty, just removes it
jj abandon             # discard current commit entirely
```

### When to use which

| Situation | Command |
|-----------|---------|
| Commit does too much | `jj split` |
| Small fix belongs with parent | `jj squash` |
| Changes belong in specific ancestor | `jj squash --into <change>` |
| Discard empty/unwanted commit | `jj abandon` |
| Undo accidental `jj new` | `jj squash` or `jj abandon` |

---

## Part 6: Conflicts

Let's see how jj handles conflicts differently than Git.

Create a conflicting change off of your feature tip. We'll rename `dueDate` to `deadline`:

```bash
jj new <change-id-of-your-feature-tip> -m "experiment: rename dueDate to deadline"
cp _steps/05-conflict-experiment/task.ts src/task.ts
jj diff
```

Now rebase it onto main (where `dueDate` doesn't exist yet):

```bash
jj rebase -d main
jj log
```

The commit shows `(conflict)`:

```
@  xxxxxxxxx  (conflict) experiment: rename dueDate to deadline
◉  main
```

### You're not blocked

In Git, a conflict stops everything. You must resolve it before doing anything else.

In jj, conflicts are **data**, not a broken state. You can:

```bash
jj new  # keep working on top of the conflict
```

Or work on something else entirely:

```bash
jj edit <some-other-change>
```

The conflict just sits there until you're ready to deal with it.

### Resolving the conflict

When you're ready:

```bash
jj edit <conflicted-change>
```

Look at the conflicted file:

```bash
cat src/task.ts
```

You'll see conflict markers. Edit the file to resolve them, removing the markers.

Check if it's resolved:

```bash
jj status
```

Once the conflict markers are gone, jj knows it's resolved.

### Clean up

Let's abandon this experimental commit and get back to our feature:

```bash
jj abandon
jj edit <your-feature-tip>
```

---

## Part 7: Shipping to GitHub

### Bookmarks are PR handles

In jj, "bookmarks" are like Git branches, but they **don't move automatically** when you commit.

Create a bookmark for the bugfix PR:

```bash
jj bookmark create fix/done-task-id -r <bugfix-change-id>
jj log
```

You'll see the bookmark name next to the commit.

### Push and create the PR

Push the bookmark to GitHub:

```bash
jj git push --all
```

This pushes branches but doesn't create PRs. Create the PR using `gh` or the GitHub web UI:

```bash
gh pr create --head fix/done-task-id --base main --title "fix: done command should find task by ID" --body "Fixes the bug where marking task #1 as done marked task #2 instead."
```

### Merge the fix PR

Merge the fix PR on GitHub (use the web UI or `gh pr merge`). Then fetch the updated main:

```bash
jj git fetch
```

Now rebase your feature stack onto the updated main. First, find the change ID of your first feature commit ("feat: add dueDate field"):

```bash
jj log
jj rebase -s <first-feature-change-id> -d main
jj log
```

The fix commit disappears from your local stack (it's in main now). Your feature commits rebase cleanly on top.

### Now ship the feature

Create a bookmark for the feature (pointing to the tip of your feature stack) and push:

```bash
jj bookmark create feat/due-dates -r <last-feature-change-id>
jj git push --all
gh pr create --head feat/due-dates --base main --title "feat: add due dates to tasks" --body "Adds --due flag and displays due dates in list."
```

### Bookmarks don't follow you

This is different from Git! In Git, when you commit, the branch moves with you.

In jj, bookmarks stay where you put them. Try it:

```bash
jj new -m "add tests"
echo "// TODO: add tests" >> src/commands/add.ts
jj log
```

Notice the `feat/due-dates` bookmark is still on the old commit, not on your new "add tests" commit.

**This is actually good:**
- You control exactly what's in each PR
- Work-in-progress stays out of the PR until you're ready
- No accidental "pushed my debug commit" moments

### Updating a PR

When you're ready to include new commits in the PR:

```bash
jj bookmark set feat/due-dates -r @
jj git push
```

### Keeping your branch current with main

Main moved while you were working. How do you update your branch?

**Option 1: Rebase (rewrite history)**

```bash
jj git fetch
jj rebase -d main
```

Your commits get new commit IDs. The history looks like you started from the latest main.

**Option 2: Merge (preserve history)**

```bash
jj git fetch
jj new @  main -m "merge main into feature"
```

Creates a merge commit. Your original commits keep their IDs.

### Rebase vs merge tradeoffs

| | Rebase | Merge |
|---|---|---|
| History | Linear, clean | Shows true timeline |
| Commit IDs | Change (new hashes) | Preserved |
| PR comments | **Orphaned** (GitHub loses track) | Preserved |
| Conflicts | Resolved per-commit | Resolved once |

**The PR comments problem**: When you rebase and force-push, GitHub sees entirely new commits. Review comments attached to the old commits become orphaned - they're still there but disconnected from the current code.

**When to rebase:**
- Before opening a PR (clean up your work)
- Small PRs with no comments yet
- When reviewer explicitly asks for rebase

**When to merge:**
- PR has active review comments you want to preserve
- Long-running branch with ongoing discussion
- When you want to show "I incorporated feedback on date X"

**jj makes rebasing easy, but that doesn't mean you should always do it.** The Git merge-vs-rebase debate exists for good reasons. jj just removes the "rebasing is scary" argument from the equation.

---

## Part 8: Mega Merge and Absorb

So far we've worked on one feature stack. What if you want to develop a second feature in parallel and test them together?

### A second feature branch

Let's add a `clear` command that removes completed tasks. Create it directly off main (parallel to due-dates):

```bash
jj new main -m "feat: add clear command to remove completed tasks"
```

Load the clear feature:

```bash
cp _steps/06-clear-feature/clear.ts src/commands/clear.ts
cp _steps/06-clear-feature/index.ts src/index.ts
```

Create a bookmark:

```bash
jj bookmark create feat/clear -r @
```

Check the graph:

```bash
jj log
```

Two independent branches, both off main:

```
◉  feat/due-dates  feat: display due dates in 'todo list'
◉                  feat: add --due flag to 'todo add' command
◉                  feat: add dueDate field to Task type
│ @  feat/clear  feat: add clear command to remove completed tasks
├─╯
◉  main
```

### Testing features together

You want to test both features combined before shipping. In Git, you'd have to:
1. Merge one branch into the other (polluting history), or
2. Create a temporary integration branch, or
3. Cherry-pick commits around

### Mega merge

In jj, create a merge commit with multiple parents:

```bash
jj new feat/due-dates feat/clear -m "mega: testing both features"
```

Check the graph:

```bash
jj log
```

```
@    mega: testing both features
├─╮
◉ │  feat/due-dates  feat: display due dates in 'todo list'
◉ │                  feat: add --due flag to 'todo add' command
◉ │                  feat: add dueDate field to Task type
│ ◉  feat/clear  feat: add clear command to remove completed tasks
├─╯
◉  main
```

### Resolving the merge

Both branches modified `index.ts` (to add their command). Load the merged version:

```bash
cp _steps/07-mega-merge/index.ts src/index.ts
```

Your working copy now has **both features combined**. Test them together:

```bash
rm -f data/todos.json
bun run todo add "Task one" --due 2025-01-20
bun run todo add "Task two"
bun run todo done 1
bun run todo list
bun run todo clear
bun run todo list
```

You should see due dates displayed, and `clear` removes the completed task.

### Code review feedback

Now imagine reviewers give feedback on both branches:

**Due dates feedback:**
- "Change due date display format from `[due: ...]` to `(due ...)`"

**Clear feedback:**
- "Better error message when no tasks to clear"
- "Show remaining task count after clearing"

Instead of editing each commit individually, make all fixes at once:

```bash
cp _steps/08-absorb-fixes/list.ts src/commands/list.ts
cp _steps/08-absorb-fixes/clear.ts src/commands/clear.ts
jj diff
```

You'll see changes that span both branches.

### Absorb routes fixes automatically

```bash
jj absorb
```

jj analyzes which commit last modified each changed line and routes each fix to the correct commit—across both branches.

Check the result:

```bash
jj log
jj diff -r feat/due-dates
jj diff -r feat/clear
```

Each commit now includes its review fixes. The changes were routed to the right places automatically.

### Ship the branches separately

When you're done testing, abandon the mega merge:

```bash
jj abandon
```

The branches are still separate. Push them as independent PRs:

```bash
jj git push --all
```

### Why this matters

- Test integration *before* merging to main
- Develop feature B that depends on feature A before A merges
- Apply review fixes across multiple branches with one command
- No pollution of your actual commit history

This workflow has no Git equivalent. It's one of jj's unique strengths.

---

## Cheat Sheet

| What | Command |
|------|---------|
| See the graph | `jj log` |
| Current status | `jj st` |
| See what changed | `jj diff` |
| See diff for specific commit | `jj diff -r <change>` |
| **Creating commits** | |
| Plan an empty commit | `jj new -m "..."` |
| Create commit with specific parent | `jj new <parent> -m "..."` |
| **Navigating** | |
| Work on a specific commit | `jj edit <change>` |
| Move to next commit in stack | `jj next` |
| Move to previous commit | `jj prev` |
| **Rewriting history** | |
| Rebase stack onto new base | `jj rebase -s <start> -d <dest>` |
| Move one commit earlier | `jj rebase -r <change> --before <target>` |
| Move commit to different parent | `jj rebase -r <change> -d <dest>` |
| Split a commit | `jj split -r <change>` |
| Squash into parent | `jj squash` |
| Abandon a commit | `jj abandon` |
| Restore a file | `jj restore <path>` |
| Absorb changes into stack | `jj absorb` |
| **Safety net** | |
| See operation history | `jj op log` |
| Undo last operation | `jj undo` |
| Restore to specific operation | `jj op restore <operation-id>` |
| **GitHub workflow** | |
| Create a bookmark (for PR) | `jj bookmark create <name> -r <change>` |
| Move a bookmark | `jj bookmark set <name> -r <change>` |
| Push to GitHub | `jj git push --all` |
| Fetch from GitHub | `jj git fetch` |
| **Advanced** | |
| Mega merge (test features together) | `jj new feat-a feat-b feat-c` |

---

## Key Concepts

### 1. Working copy is always a commit
No staging area. No "uncommitted changes" limbo. Every state is recorded.

### 2. Change IDs are stable
Use them instead of commit hashes. They survive rebases and edits.

### 3. Anonymous branches by default
The graph is your organization. Bookmarks are just handles for GitHub.

### 4. Conflicts are data
You're never blocked. Resolve conflicts when you're ready, not when Git demands it.

### 5. Operations are undoable
`jj undo` is your safety net. Experiment fearlessly.

### 6. Discovery order ≠ logical order
Found a bug while building a feature? Put the fix where it belongs in history, not where you found it.

---

## What's Different from Git

| Git | jj |
|-----|-----|
| Staging area + working copy | Working copy is a commit |
| Branches move with you | Bookmarks stay where you put them |
| `git stash` for temporary work | Just `jj new` and come back |
| `git rebase -i` for everything | `jj split`, `jj squash`, `jj rebase` — separate tools |
| Conflicts block you | Conflicts are just data |
| `git reflog` for recovery | `jj op log` + `jj undo` |
| Branch names required | Anonymous branches by default |

---

## Git to jj Command Reference

| Task | Git | jj |
|------|-----|-----|
| **Basics** | | |
| Check status | `git status` | `jj st` |
| View history | `git log --oneline --graph` | `jj log` |
| See changes | `git diff` | `jj diff` |
| See staged changes | `git diff --cached` | *(no staging area)* |
| **Committing** | | |
| Stage + commit | `git add . && git commit -m "msg"` | `jj describe -m "msg" && jj new` |
| Amend last commit | `git commit --amend` | `jj describe -m "new msg"` |
| Add to last commit | `git add . && git commit --amend --no-edit` | `jj squash` |
| **Branches** | | |
| Create branch | `git checkout -b name` | `jj bookmark create name` |
| Switch branch | `git checkout name` | `jj edit name` |
| List branches | `git branch` | `jj bookmark list` |
| Delete branch | `git branch -d name` | `jj bookmark delete name` |
| **History editing** | | |
| Rebase onto main | `git rebase main` | `jj rebase -d main` |
| Interactive rebase | `git rebase -i HEAD~3` | `jj squash`, `jj split`, `jj rebase` |
| Edit old commit | `git rebase -i` (mark as edit) | `jj edit <change>` |
| Split a commit | `git rebase -i` + `reset` + multiple commits | `jj split` |
| Reorder commits | `git rebase -i` (reorder lines) | `jj rebase -r <change> --before <target>` |
| **Stashing** | | |
| Stash changes | `git stash` | `jj new` (just start new commit) |
| Pop stash | `git stash pop` | `jj edit <previous>` |
| **Undoing** | | |
| Undo last commit | `git reset HEAD~1` | `jj undo` |
| Discard changes | `git checkout -- file` | `jj restore file` |
| View undo history | `git reflog` | `jj op log` |
| Undo any operation | `git reset --hard <reflog-ref>` | `jj undo` or `jj op restore <op>` |
| **Remote** | | |
| Fetch | `git fetch` | `jj git fetch` |
| Push | `git push` | `jj git push` |
| Push all branches | `git push --all` | `jj git push --all` |
| **Advanced** | | |
| Route fixes to commits | *(manual with rebase -i)* | `jj absorb` |
| Test multiple features | *(merge or cherry-pick)* | `jj new feat-a feat-b` |

---

## Next Steps

- Read the official tutorial: https://martinvonz.github.io/jj/latest/tutorial/
- Steve Klabnik's tutorial: https://steveklabnik.github.io/jujutsu-tutorial/
- Chris Krycho's jj-init: https://v5.chriskrycho.com/essays/jj-init/

Advanced topics to explore:
- Workspaces for multiple working copies
- Revsets for powerful commit selection
- Custom templates for `jj log` output

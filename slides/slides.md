---
theme: frankfurt
title: Jujutsu for Git Users
author: Laurynas Keturakis
class: text-center
drawings:
  persist: false
transition: none
mdc: true
---

# Jujutsu for Git Users

A hands-on workshop (and initiation into the cult of jj)

<div class="abs-br m-6 text-sm opacity-50">
  github.com/martinvonz/jj
</div>

---
layout: center
---

# What is Jujutsu?

- A **Git-compatible** version control system
- Different mental model, same repositories
- Works with existing GitHub/GitLab workflows


---

# The Key Mental Shift

<div class="grid grid-cols-2 gap-8">

<div>

### Git

```
Working Directory
      ↓ (git add)
Staging Area
      ↓ (git commit)
Repository
```

<v-click>

**Three states to manage**

</v-click>

</div>

<div>

### jj

```
Working Copy = A Commit
      ↓ (automatic)
Repository
```

<v-click>

**Your working directory IS a commit**

</v-click>

</div>

</div>

---

# No Staging Area

In jj, every change you make is automatically part of the current commit.

<div class="grid grid-cols-2 gap-8 mt-8">

<div>

### Git workflow

```bash
# Make changes...
git add file.ts
git add -p other.ts  # partial staging
git commit -m "message"
```

</div>

<div>

### jj workflow

```bash
# Make changes...
jj describe -m "message"
jj new  # start next commit
```

<v-click>

No `add`.

No staging.

No stashes.

No branches (kind of).

Just describe and move on.

</v-click>

</div>

</div>

---

# Change IDs vs Commit IDs

<div class="mt-4">

```
❯ jj log
@  kpqxywon laurynas 2m ago  d4f5a6b7
│  feat: add due date display
○  mzvwutvp laurynas 5m ago  a1b2c3d4
│  feat: add --due flag
○  kkmpptqz laurynas 8m ago  e5f6g7h8
│  feat: add dueDate field
◆  zzzzzzzz root() 00000000
```

</div>

<v-clicks>

- **Change ID** (letters): `kpqxywon` - stable across rewrites
- **Commit ID** (hex): `d4f5a6b7` - changes when commit changes
- **Use change IDs** for navigation - they survive rebases

</v-clicks>

---

# Revsets: Referencing Commits

<div class="mt-4">

| Revset | Meaning |
|--------|---------|
| `@` | Current working copy |
| `@-` | Parent of working copy |
| `@--` | Grandparent |
| `kpqx` | Commit by change ID prefix |
| `main` | The main bookmark |
| `trunk()` | Auto-detected main branch |

</div>

<v-click>

```bash
jj diff -r @-      # Show parent's changes
jj show kpqx       # Show specific commit
jj log -r main..@  # Commits between main and here
```

</v-click>

---
layout: center
class: text-center
---

# Part 1: Planning with Empty Commits

Code starts as a plan

---

# Creating a Roadmap

<div class="mt-4">

```bash
jj new -m "feat: add dueDate field to Task type"
jj new -m "feat: add --due flag to todo add command"
jj new -m "feat: display due dates in todo list"
```

</div>

<v-click>

```
❯ jj log
@  kpqxywon laurynas 1s ago   (empty)
│  feat: display due dates in todo list
○  mzvwutvp laurynas 1s ago   (empty)
│  feat: add --due flag to todo add command
○  kkmpptqz laurynas 1s ago   (empty)
│  feat: add dueDate field to Task type
◆  zzzzzzzz root() 00000000
```

</v-click>

<v-click>

Each commit is a reviewable unit **before any code exists**.

</v-click>

---

# Why Plan First?

<v-clicks>

- **Clarity**: Know your structure before implementation
- **Review-ready**: Each commit tells a story
- **Flexibility**: Reorder, split, or squash later
- **Claude Code**: works well with plan mode!

</v-clicks>

---
layout: center
class: text-center
---

# Part 2: Filling In

Navigate and implement

---

# Navigation Commands

<div class="mt-4">

```bash
# Go to a specific commit
jj edit <change-id>

# Move through the stack
jj next --edit    # Move to child commit
jj prev --edit    # Move to parent commit
```

</div>

<v-click>

The `@` marker shows where you are:

```
○  kpqxywon laurynas 1m ago
│  feat: display due dates in todo list
@  mzvwutvp laurynas 1m ago      ← You are here
│  feat: add --due flag
○  kkmpptqz laurynas 1m ago
│  feat: add dueDate field
```

</v-click>

---

# Implementing Each Commit

<div class="grid grid-cols-2 gap-4">

<div>

### Step 1: Navigate

```bash
jj edit kkmp  # First commit
```

</div>

<div>

### Step 2: Make changes

```typescript
// task.ts
export interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
  dueDate?: string;  // ← add this
}
```

</div>

</div>

<v-click>

### Step 3: Move forward

```bash
jj next --edit  # Go to next commit
# Make more changes...
```

Changes are automatically captured. No `git add` needed.

</v-click>

---
layout: center
class: text-center
---

# Part 3: Bug Discovery

Discovery order ≠ Logical order

---

# The Scenario

While building your feature, you discover a bug in existing code:

```typescript
// done.ts - THE BUG
const task = tasks[id];  // Uses array index, not task ID!
```

<v-click>

Task #1 can't be marked as done if tasks were deleted.

</v-click>

<v-click>

**Git approach**: Create fix commit on top, or complex rebasing

**jj approach**: Put the fix where it belongs

</v-click>

---

# Fix in the Right Place

```bash
# Create fix commit branching from main, not from features
jj new main -m "fix: done command should find task by ID"
```

<v-click>

```
○  feat3 - display due dates
○  feat2 - add --due flag
○  feat1 - add dueDate field
│
│ @  fix - find task by ID  ← Fix branches from main
├─╯
◆  main
```

</v-click>

---

# Rebase Features onto Fix

```bash
jj rebase -s <feat1-change-id> -d @
```

<v-click>

```
@  feat3 - display due dates
○  feat2 - add --due flag
○  feat1 - add dueDate field
○  fix - find task by ID  ← Fix is now in the right place
◆  main
```

</v-click>

<v-click>

The fix goes **before** the features in history, because that's where it logically belongs.

</v-click>

---
layout: center
class: text-center
---

# Part 4: Splitting and Squashing

Breaking commits apart, folding them together

---

# When to Split

<v-clicks>

- Reviewer asks for smaller commits
- You realize a commit does too much
- Better separation of concerns

</v-clicks>

<v-click>

```bash
jj split -r <change-id>
```

Opens an interactive editor to select which changes go where.

</v-click>

---

# Split Example

<div class="grid grid-cols-2 gap-4">

<div>

### Before

```
○  feat2 - add --due flag
│  (argument parsing + validation + output)
```

</div>

<div v-click>

### After

```
○  feat2b - validate --due format
○  feat2a - add --due argument parsing
```

</div>

</div>

<v-click>

Descendants automatically rebase on top of the split commits.

</v-click>

---

# Squashing: The Inverse

<div class="grid grid-cols-2 gap-8">

<div>

### Fold into parent

```bash
jj squash
```

Current commit merges into parent.

</div>

<div v-click>

### Fold into specific ancestor

```bash
jj squash --into <change-id>
```

Routes changes to any ancestor.

</div>

</div>

<v-click>

### Clean up empty commits

```bash
jj squash     # fold empty into parent
jj abandon    # discard entirely
```

</v-click>

---
layout: center
class: text-center
---

# Part 5: Conflicts as Data

Not a blocked state

---

# Git vs jj Conflicts

<div class="grid grid-cols-2 gap-8">

<div>

### Git

```
CONFLICT!
You must resolve before continuing.
Cannot switch branches.
Cannot do anything else.
```

</div>

<div v-click>

### jj

```
(conflict) in log
You can:
- jj new to work elsewhere
- jj edit other commits
- Resolve when ready
```

</div>

</div>

<v-click>

**Conflicts are just data, not a blocked state.**

</v-click>

---

# Working with Conflicts

```bash
# Create experimental change
jj new main -m "experiment: rename dueDate to deadline"
# Make conflicting changes...

# Rebase onto main
jj rebase -d main
```

<v-click>

```
❯ jj log
@  experiment (conflict)  ← Conflict noted, but you can work
│
◆  main
```

</v-click>

<v-click>

Resolve when ready. Or `jj abandon` to discard the experiment.

</v-click>

---
layout: center
class: text-center
---

# Part 6: Shipping to GitHub

Bookmarks as PR handles

---

# Bookmarks vs Git Branches

<div class="grid grid-cols-2 gap-8">

<div>

### Git branches

```bash
git checkout -b feature
# Make commits...
# Branch follows you automatically
```

Branch moves with each commit.

</div>

<div v-click>

### jj bookmarks

```bash
jj bookmark create feature -r @
# Make commits...
# Bookmark stays where you put it
```

**You control when bookmarks move.**

</div>

</div>

---

# PR Workflow

```bash
# Create bookmark for the fix
jj bookmark create fix/done-task-id -r <fix-commit>

# Push to remote
jj git push --all

# Create PR (using gh CLI)
gh pr create --title "fix: done command"
```

<v-click>

After merge on GitHub:

```bash
jj git fetch
jj rebase -s <feat1> -d main  # Rebase features onto updated main
```

</v-click>

---

# Keeping Current: Rebase vs Merge

<div class="grid grid-cols-2 gap-8">

<div>

### Rebase

```bash
jj git fetch
jj rebase -d main
```

Linear history, new commit IDs

</div>

<div>

### Merge

```bash
jj git fetch
jj new @ main -m "merge main"
```

Preserves original commit IDs

</div>

</div>

<v-click>

### The tradeoff

| | Rebase | Merge |
|---|---|---|
| PR comments | **Orphaned** | Preserved |
| History | Clean | True timeline |

**jj makes rebasing easy, but that doesn't mean always rebase.** PR comments get orphaned when commit IDs change.

</v-click>

---
layout: center
class: text-center
---

# Part 7: Mega Merge

Integration testing before shipping

---

# Multiple Features

```
feat/due-dates (feat1→feat2→feat3)
      │
   main
      │
feat/clear
```

<v-click>

Two independent features. How to test them together?

</v-click>

---

# Create a Mega Merge

```bash
jj new feat/due-dates feat/clear -m "mega: testing both features"
```

<v-click>

```
    feat/due-dates ───┐
                      │
                    mega (test commit)
                      │
    feat/clear ───────┘
```

</v-click>

<v-click>

Test both features together. When done:

```bash
jj abandon  # Remove the mega merge
# Features are still separate, ready to ship independently
```

</v-click>

---
layout: center
class: text-center
---

# Part 8: Absorb

Automatic fix routing

---

# The Problem

You get code review feedback on multiple branches:

<v-clicks>

- Fix format in `feat/due-dates`
- Better error message in `feat/clear`
- Both changes are in your working copy

</v-clicks>

<v-click>

How do you route each fix to the right branch?

</v-click>

---

# jj absorb

```bash
# Make all the fixes in your working copy
# Then:
jj absorb
```

<v-click>

jj analyzes each changed line and automatically routes it to the commit that last modified that code.

</v-click>

<v-click>

```bash
# Verify:
jj diff -r feat/due-dates  # Shows format fix
jj diff -r feat/clear      # Shows error message fix
```

</v-click>

<v-click>

**No Git equivalent.** This is magic.

</v-click>

---

# Quick Reference

| Git | jj |
|-----|-----|
| `git status` | `jj status` |
| `git add + commit` | `jj describe -m "msg"` then `jj new` |
| `git commit --amend` | `jj describe -m "new msg"` |
| `git checkout branch` | `jj edit <change-id>` |
| `git branch name` | `jj bookmark create name` |
| `git rebase -i` | `jj rebase`, `jj split`, `jj squash` |
| `git stash` | Not needed - just `jj new` |

---

# Key Takeaways

<v-clicks>

- **Working copy is a commit** - no staging area
- **Change IDs are stable** - use them for navigation
- **Plan with empty commits** - fill in later
- **Conflicts are data** - not a blocked state
- **Bookmarks are handles** - you control when they move
- **`jj undo` always works** - experiment freely

</v-clicks>

---
layout: center
class: text-center
---

# Let's Practice

```bash
cd todo-jj-workshop
```

<div class="mt-8 opacity-70">
Follow along with the workshop README
</div>

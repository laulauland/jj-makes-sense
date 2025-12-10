import { add } from "./commands/add";
import { list } from "./commands/list";
import { done } from "./commands/done";
import { clear } from "./commands/clear";

const [command, ...args] = Bun.argv.slice(2);

switch (command) {
  case "add":
    await add(args);
    break;
  case "list":
    await list();
    break;
  case "done":
    await done(args);
    break;
  case "clear":
    await clear();
    break;
  default:
    console.log("Usage: todo <add|list|done|clear> [args]");
    console.log("");
    console.log("Commands:");
    console.log("  add <text> [--due YYYY-MM-DD]   Add a new task");
    console.log("  list                           List all tasks");
    console.log("  done <id>                      Mark a task as done");
    console.log("  clear                          Remove all completed tasks");
    process.exit(1);
}

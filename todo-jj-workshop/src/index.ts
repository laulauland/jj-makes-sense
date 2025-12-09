import { add } from "./commands/add";
import { list } from "./commands/list";
import { done } from "./commands/done";

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
  default:
    console.log("Usage: todo <add|list|done> [args]");
    console.log("");
    console.log("Commands:");
    console.log("  add <text>           Add a new task");
    console.log("  list                 List all tasks");
    console.log("  done <id>            Mark a task as done");
    process.exit(1);
}

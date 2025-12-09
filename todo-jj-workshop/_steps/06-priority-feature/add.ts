import { Task } from "../task";
import { loadTasks, saveTasks, getNextId } from "../storage";

export async function add(args: string[]): Promise<void> {
  // Parse --priority flag
  let priority: "low" | "medium" | "high" | undefined;
  const textParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--priority" && args[i + 1]) {
      const p = args[i + 1];
      if (p === "low" || p === "medium" || p === "high") {
        priority = p;
      } else {
        console.error("Error: Priority must be low, medium, or high");
        process.exit(1);
      }
      i++; // skip next arg
    } else {
      textParts.push(args[i]);
    }
  }

  const text = textParts.join(" ");

  if (!text) {
    console.error("Error: Please provide task text");
    console.error("Usage: todo add <text> [--priority low|medium|high]");
    process.exit(1);
  }

  const tasks = await loadTasks();
  const newTask: Task = {
    id: await getNextId(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
    priority,
  };

  tasks.push(newTask);
  await saveTasks(tasks);

  const priorityInfo = priority ? ` [${priority}]` : "";
  console.log(`Added task #${newTask.id}: ${text}${priorityInfo}`);
}

import { Task } from "../task";
import { loadTasks, saveTasks, getNextId } from "../storage";

export async function add(args: string[]): Promise<void> {
  // Parse --due and --priority flags
  let dueDate: string | undefined;
  let priority: "low" | "medium" | "high" | undefined;
  const textParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--due" && args[i + 1]) {
      dueDate = args[i + 1];
      i++; // skip next arg
    } else if (args[i] === "--priority" && args[i + 1]) {
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
    console.error("Usage: todo add <text> [--due YYYY-MM-DD] [--priority low|medium|high]");
    process.exit(1);
  }

  // Validate due date format if provided
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    console.error("Error: Due date must be in YYYY-MM-DD format");
    process.exit(1);
  }

  const tasks = await loadTasks();
  const newTask: Task = {
    id: await getNextId(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
    dueDate,
    priority,
  };

  tasks.push(newTask);
  await saveTasks(tasks);

  const dueInfo = dueDate ? ` (due: ${dueDate})` : "";
  const priorityInfo = priority ? ` [${priority}]` : "";
  console.log(`Added task #${newTask.id}: ${text}${dueInfo}${priorityInfo}`);
}

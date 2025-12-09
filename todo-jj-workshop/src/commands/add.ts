import { Task } from "../task";
import { loadTasks, saveTasks, getNextId } from "../storage";

export async function add(args: string[]): Promise<void> {
  const text = args.join(" ");

  if (!text) {
    console.error("Error: Please provide task text");
    console.error("Usage: todo add <text>");
    process.exit(1);
  }

  const tasks = await loadTasks();
  const newTask: Task = {
    id: await getNextId(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  await saveTasks(tasks);

  console.log(`Added task #${newTask.id}: ${text}`);
}

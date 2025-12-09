import { loadTasks } from "../storage";

export async function list(): Promise<void> {
  const tasks = await loadTasks();

  if (tasks.length === 0) {
    console.log("No tasks yet. Add one with: todo add <text>");
    return;
  }

  console.log("");
  console.log("Your tasks:");
  console.log("");

  for (const task of tasks) {
    const status = task.done ? "✓" : " ";
    console.log(`  [${status}] #${task.id} - ${task.text}`);
  }

  console.log("");
}

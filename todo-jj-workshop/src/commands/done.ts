import { loadTasks, saveTasks } from "../storage";

export async function done(args: string[]): Promise<void> {
  const idArg = args[0];

  if (!idArg) {
    console.error("Error: Please provide a task ID");
    console.error("Usage: todo done <id>");
    process.exit(1);
  }

  const id = parseInt(idArg, 10);
  const tasks = await loadTasks();

  // BUG: Uses array index instead of task.id
  // This fails because task IDs start at 1, not 0
  const task = tasks[id];

  if (!task) {
    console.error(`Error: Task #${id} not found`);
    process.exit(1);
  }

  task.done = true;
  await saveTasks(tasks);

  console.log(`Completed task #${id}: ${task.text}`);
}

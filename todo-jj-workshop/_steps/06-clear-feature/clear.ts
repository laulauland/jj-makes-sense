import { loadTasks, saveTasks } from "../storage";

export async function clear(): Promise<void> {
  const tasks = await loadTasks();
  const incompleteTasks = tasks.filter((task) => !task.done);
  const clearedCount = tasks.length - incompleteTasks.length;

  if (clearedCount === 0) {
    console.log("No completed tasks to clear.");
    return;
  }

  await saveTasks(incompleteTasks);
  console.log(`Cleared ${clearedCount} completed task(s).`);
}

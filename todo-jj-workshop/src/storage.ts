import { Task } from "./task";

const DATA_FILE = "./data/todos.json";

export async function loadTasks(): Promise<Task[]> {
  try {
    const file = Bun.file(DATA_FILE);
    if (await file.exists()) {
      return await file.json();
    }
  } catch {
    // File doesn't exist or is invalid
  }
  return [];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await Bun.write(DATA_FILE, JSON.stringify(tasks, null, 2));
}

export async function getNextId(): Promise<number> {
  const tasks = await loadTasks();
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map((t) => t.id)) + 1;
}

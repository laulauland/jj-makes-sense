export interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
  dueDate?: string; // Optional due date in YYYY-MM-DD format
  priority?: "low" | "medium" | "high"; // Task priority level
}

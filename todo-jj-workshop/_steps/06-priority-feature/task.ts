export interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
  priority?: "low" | "medium" | "high"; // Task priority level
}

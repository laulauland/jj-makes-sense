export interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
  dueDate?: string; // YYYY-MM-DD format, e.g., "2025-01-15"
  priority?: "low" | "medium" | "high"; // Defaults to medium if not specified
}

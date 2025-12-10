export interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
  dueDate?: string; // ISO date string, e.g., "2025-01-15"
}

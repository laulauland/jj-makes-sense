export interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
  deadline?: string; // renamed from dueDate to deadline
}

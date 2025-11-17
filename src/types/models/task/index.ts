export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;      // ISO string
  completedAt?: string; // ISO string (for completed tasks)
  createdAt: string;
  updatedAt: string;
  projectId?: number;
  assignee?: string;
}
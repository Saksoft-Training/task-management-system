export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  assignee: string;
  createdAt: string;
  createdBy: string;
  description?: string;
  dueDate: string;
  id: number;
  priority: TaskPriority;
  projectId: string;
  status: TaskStatus;
  title: string;
  updatedAt: string;
}

export type TaskPriority = 'High' | 'Low' | 'Medium' | 'Urgent';
export type TaskStatus = 'Completed' | 'In Progress' | 'To Do';

export interface Task {
  assignee: string;
  assigneeEmail: string;
  completedAt?: string | null;
  createdAt: string;
  createdBy: string;
  description?: string;
  dueDate: string;
  id: number;
  priority: TaskPriority;
  projectId: number;
  status: TaskStatus;
  title: string;
  updatedAt: string;

}

export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;       
  assigneeEmail: string;  
  dueDate: string;
  projectId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

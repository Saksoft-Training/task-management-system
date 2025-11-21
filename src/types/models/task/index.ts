export type TaskPriority = 'High' | 'Low' | 'Medium' | 'Urgent';
export type TaskStatus = 'Completed' | 'In Progress' | 'To Do';

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: string;

  priority: TaskPriority;
  projectId: number;
  status: TaskStatus;
 
  updatedAt: string;
  completedAt?: string | null;

}


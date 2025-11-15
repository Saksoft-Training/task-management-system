export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export interface Task {
   id: number;
  projectId: number;
  title: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string;
  createdAt?: string;
}
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  createdDate: Date;
  completedDate?: Date;
  assignedTo?: string;
  projectId: string;
}
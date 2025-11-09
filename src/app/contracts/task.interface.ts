export interface Task {
  id: string;
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

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdDate: Date;
  updatedDate: Date;
}

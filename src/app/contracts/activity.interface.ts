export interface Activity {
  id: string;
  action: string;
  itemName: string;
  itemType: 'project' | 'task' | 'assignment';
  timestamp: Date;
  userId: string;
  userName: string;
  userInitials: string;
  description?: string;
}

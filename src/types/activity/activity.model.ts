export type ActivityType = 'project' | 'task';
export type ActivityAction = 'created' | 'updated' | 'deleted' | 'completed' | 'assigned';

export interface Activity {
   id: string;
  userId: string;
  itemId: string;
  action: string;   // created, updated, completed
  type: string;     // task, project
  timestamp: string;
    user?: string;
}

export type ActivityType = 'project' | 'task';
export type ActivityAction = 'created' | 'updated' | 'deleted' | 'completed' | 'assigned';

export interface Activity {
 id?: string;        // MockAPI auto-generates
  user: string;       // who did the action
  itemId: string;     // must be string
  action: string;     // created / updated / deleted
  type: string;       // task / project
  timestamp: string;  // ISO timestamp
}

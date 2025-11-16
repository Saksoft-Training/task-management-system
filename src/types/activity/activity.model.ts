export type ActivityType = 'project' | 'task';
export type ActivityAction = 'created' | 'updated' | 'deleted' | 'completed' | 'assigned';

export interface Activity {
  id: number;
  type: ActivityType;
  action: ActivityAction;
  itemId: number;
  itemName: string;
  user: string;
  timestamp: string; // ISO
}

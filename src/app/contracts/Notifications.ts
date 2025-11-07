export interface Notification {
    id:number;
    type: 'due_today' | 'due_tomorrow' | 'overdue' |'completed' |'assigned' |'project_updated';
    severity:'info' | 'warning' |'critical' |'sucess';
    title:string;
    message:string;
    read:boolean;
    timestamp:Date;
    itemId:string;
    itemType:'task'|'project';
    userId?:string;

}

export interface NotificationPreferencs {
    dueToday:boolean;
    dueTomorrow:boolean;
    overdue:boolean;
    completed:boolean;
    assigned:boolean;
    projectUpdates:boolean;
}
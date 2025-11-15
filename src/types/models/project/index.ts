export interface Project {
    id: number;
    name: string;
    startDate: string;
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
    endDate: string;
}
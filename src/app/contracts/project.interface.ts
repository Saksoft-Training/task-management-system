export interface IProject {
    createdAt: string;
    createdBy: string;
    description?: string;
    endDate: string;
    id: number;
    name: string;
    startDate: string;
    status: 'planning' | 'in progress' | 'completed' | 'on hold';
    updatedAt: string;
}
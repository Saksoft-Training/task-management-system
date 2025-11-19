export interface Project {


    createdAt: string;
    createdBy: string;
    description?: string;
    endDate: string;

    id: number;
    name: string;
    startDate: string;
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';


    updatedAt: string;

}



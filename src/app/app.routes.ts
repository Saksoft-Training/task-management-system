import { Routes } from '@angular/router';
import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';

export const routes: Routes = [
    {
        path: 'create',
        component: ProjectCreateComponent
    }
];

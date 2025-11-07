import { Routes } from '@angular/router';
import { ProjectListComponent } from './features/project-management/components/project-list.component/project-list.component';
import { ProjectCreateComponent } from './features/project-management/components/project-create.component/project-create.component';
import { ProjectDetailComponent } from './features/project-management/components/project-detail.component/project-detail.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/projects',
        pathMatch: 'full'
    },
    {
        path: 'projects',
        component: ProjectListComponent
    },
    {
        path: 'projects/create',
        component: ProjectCreateComponent
    },
    {
        path: 'projects/:id',
        component: ProjectDetailComponent
    }
];

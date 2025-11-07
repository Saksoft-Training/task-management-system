import { Routes } from '@angular/router';
import { TaskCreateComponent } from './features/task-mangement/components/task-create-component/task-create-component';
import { TasksViewComponent } from './features/task-mangement/components/tasks-view-component/tasks-view-component';

export const routes: Routes = [
    { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: 'tasks', component: TasksViewComponent },
  { path: 'projects/:projectId/tasks/create', component: TaskCreateComponent },
];

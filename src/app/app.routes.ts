import { Routes } from '@angular/router';
import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { LoginComponent } from './features/user-account-management/components/login/login.component';
import { TaskListComponent } from './features/task-management/components/task-list.component/task-list.component';
import { TaskBoardComponent } from './features/task-management/components/task-board.component/task-board.component';
import { TaskCreateComponent } from './features/task-management/components/tast-create.component/task-create.component';
import { ProfileComponent } from './features/project-management/components/profile/profile.component';
import { ForgotPasswordComponent } from './features/user-account-management/components/forgot-password/forgot-password.component';
import { ProjectListComponent } from './features/project-management/components/project-list/project-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'projects/create/:id', component: ProjectCreateComponent },
  { path: 'projects/:id', component: TaskListComponent },
  { path: 'projects/:id/board', component: TaskBoardComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/board', component: TaskBoardComponent },
  { path: 'tasks/create', component: TaskCreateComponent },
  { path: 'tasks/create/:projectId', component: TaskCreateComponent },
  { path: 'board', component: TaskBoardComponent },
  { path: "tasks/edit/:id", component: TaskCreateComponent },
  { path: 'profile', component: ProfileComponent },
];

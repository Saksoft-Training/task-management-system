import { Routes } from '@angular/router';
import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { DashboardComponentStats } from './features/display-statistics-and-overview/components/dashboard-stats.component/dashboard.component';
import { StatisticsCardComponent } from './features/display-statistics-and-overview/components/statistics-card.component/statistics-card.component';
import { LoginComponent } from './features/user-account-management/components/login/login.component';
import { TaskListComponent } from './features/task-management/components/task-list.component/task-list.component';
import { TaskBoardComponent } from './features/task-management/components/task-board.component/task-board.component';
import { TaskCreateComponent } from './features/task-management/components/tast-create.component/task-create.component';
import { ForgotPasswordComponent } from './features/user-account-management/components/forgot-password/forgot-password.component';
import { ProjectListComponent } from './features/project-management/components/project-list/project-list.component';
import { TaskDetailPageComponent } from './features/task-management/components/task-detail-page.component/task-detail-page.component';
import { ProfileComponent } from './features/user-account-management/components/profile/profile.component';
import { ProjectDetailComponent } from './features/project-management/components/project-detail/project-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'projects/:id/board', component: TaskBoardComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/board', component: TaskBoardComponent },
  { path: 'tasks/create', component: TaskCreateComponent },
  { path: 'tasks/create/:projectId', component: TaskCreateComponent },
  { path: 'tasks/edit/:id', component: TaskCreateComponent },
  { path: 'tasks/:id', component: TaskDetailPageComponent },
  { path: 'tasks/project/:projectId', component: TaskListComponent },
  { path: 'board', component: TaskBoardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'dashboard', component: DashboardComponentStats },
  { path: 'projects/:id/tasks', component: TaskListComponent },

];
import { Routes } from '@angular/router';

import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';

import { DashboardComponent } from './features/display-statistics-and-overview/components/dashboard.component/dashboard.component';
import { StatisticsCardComponent } from './features/display-statistics-and-overview/components/statistics-card.component/statistics-card.component';

import { LoginComponent } from './features/user-account-management/components/login/login.component';
import { ForgotPasswordComponent } from './features/user-account-management/components/forgot-password/forgot-password.component';
import { ProfileComponent } from './features/project-management/components/profile/profile.component';
import { ProjectListComponent } from './features/project-management/components/project-list/project-list.component';
import { TaskCreateComponent } from './features/task-management/components/tast-create.component/task-create.component';
export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  {path:'tasks',component:TaskCreateComponent},
  {path:'dashboard-comp',component:DashboardComponent},
    { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'projects/create/:id', component: ProjectCreateComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'projects', component: ProjectListComponent }

];
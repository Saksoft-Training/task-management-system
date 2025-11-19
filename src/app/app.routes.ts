import { Routes } from '@angular/router';

import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { LoginComponent } from './features/user-account-management/components/login/login.component';
import { ForgotPasswordComponent } from './features/user-account-management/components/forgot-password/forgot-password.component';
import { ProfileComponent } from './features/user-account-management/components/profile/profile.component';
import { ProjectListComponent } from './features/project-management/components/project-list/project-list.component';
import { DashboardChartsComponent } from './features/dashboard/components/dashboard-charts.component/dashboard-charts.component';
import { ActivityFeedComponent } from './features/dashboard/components/activity-feed.component/activity-feed.component';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
   {path:'dashboard',component:DashboardChartsComponent},
     { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'projects/create/:id', component: ProjectCreateComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'projects', component: ProjectListComponent },
  {path:'dashboard-comp',component:ActivityFeedComponent}

];



import { Routes } from '@angular/router';
import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { LoginComponent } from './features/user-account-management/components/login/login.component';
import { ProfileComponent } from './features/project-management/components/profile-component/profile-component';
import { ProjectListComponent } from './features/project-management/components/project-list-component/project-list-component';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'projects/create/:id', component: ProjectCreateComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'projects', component: ProjectListComponent }

];

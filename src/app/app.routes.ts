import { Routes } from '@angular/router';
import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { LoginComponent } from './features/user-account-management/components/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },

  // User module routes
  { path: 'register', component: RegisterComponent },

  // Project module routes
  { path: 'projects/create', component: ProjectCreateComponent },
];
    { path: 'login', component: LoginComponent },

];

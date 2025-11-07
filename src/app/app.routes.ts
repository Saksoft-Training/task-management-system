import { Routes } from '@angular/router';
import { RegisterComponent } from './features/components/register-component/register-component';
// import { LoginComponent } from './features/components/login-component/login-component'; // when ready

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  // { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' } // default route
];

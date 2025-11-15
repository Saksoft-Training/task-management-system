import { Routes } from '@angular/router';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { DashboardComponent } from './features/display-statistics-and-overview/components/dashboard.component/dashboard.component';
import { StatisticsCardComponent } from './features/display-statistics-and-overview/components/statistics-card.component/statistics-card.component';
export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  {path:'dashboard-comp',component:DashboardComponent},
];
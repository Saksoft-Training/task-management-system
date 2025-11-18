import { Routes } from '@angular/router';
import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { LoginComponent } from './features/user-account-management/components/login/login.component';
import { TaskListComponent } from './features/task-management/components/task-list.component/task-list.component';
import { TaskBoardComponent } from './features/task-management/components/task-board.component/task-board.component';
import { TastCreateComponent } from './features/task-management/components/tast-create.component/task-create.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'projects/:id', component: TaskListComponent },
  { path: 'projects/:id/board', component: TaskBoardComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/board', component: TaskBoardComponent },
  { path: 'tasks/create', component: TastCreateComponent },
  { path: 'board', component: TaskBoardComponent },

];

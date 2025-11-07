import { Component, signal } from '@angular/core';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { TaskCreateComponent } from "./features/task-mangement/components/task-create-component/task-create-component";
import { RouterOutlet } from '@angular/router';
import { TasksViewComponent } from "./features/task-mangement/components/tasks-view-component/tasks-view-component";


@Component({
  selector: 'app-root',
  imports: [TaskCreateComponent, RouterOutlet, TasksViewComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('task-project-management');
  constructor() {
    injectSpeedInsights();
  }
}

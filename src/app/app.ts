import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './shared/components/footer.component/footer.component';
import { ToastNotificationComponent } from './features/dashboard/components/notifications/toast-notification.component/toast-notification.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastNotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('task-project-management');
  constructor() {
    
  }
}

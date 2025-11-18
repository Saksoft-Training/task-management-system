import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer.component/footer.component';
import { ToastNotificationComponent } from './features/dashboard/components/notifications/toast-notification.component/toast-notification.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,FooterComponent, ToastNotificationComponent],

  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('task-project-management');

  constructor() {
    
  }

}

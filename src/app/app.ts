import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './features/dashboard/components/notification-component/notification-component';
import { NotificationItemComponent } from './features/dashboard/components/notification-item-component/notification-item-component';
import { Chartcomponent } from './features/dashboard/components/chartcomponent/chartcomponent';
import { ActivityFeedComponent } from './features/dashboard/components/activity-feed-component/activity-feed-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Chartcomponent,ActivityFeedComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('task-project-management');
}

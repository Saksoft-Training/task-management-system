import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header-component/header-component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('task-project-management');
}

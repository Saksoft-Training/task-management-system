import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './shared/components/header/header.component';

import { FooterComponent } from './shared/components/footer-component/footer-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('task-project-management');

  constructor() {
    
  }
=======

>>>>>>> c72fe4f70195fd7abb23737d94e2e3c2c3c19c7f
}

import { Component, signal } from '@angular/core';
import { injectSpeedInsights } from '@vercel/speed-insights';

import { FooterComponent } from './shared/components/footer-component/footer-component';



@Component({
  selector: 'app-root',
  imports: [ FooterComponent,  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('task-project-management');
  constructor() {
    injectSpeedInsights();
  }
}

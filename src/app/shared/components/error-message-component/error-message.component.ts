import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-error-message-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './error-message-component.html',
  styleUrl: './error-message-component.scss',
})
export class ErrorMessageComponent implements OnInit {
  @Input() message: string = '';
  @Input() dismissible: boolean = true;
  @Input() autoHideDuration: number = 5000;
  visible: boolean = true;

  ngOnInit(): void {
    if (this.autoHideDuration > 0) {
      setTimeout(() => (this.visible = false), this.autoHideDuration);
    }
  }

  close(): void {
    this.visible = false;
  }

}

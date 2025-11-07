//#region Imports
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
//#endregion

//#region Component Metadata
@Component({
  selector: 'app-task-card-component',
  imports: [CommonModule],
  templateUrl: './task-card-component.html',
  styleUrl: './task-card-component.scss',
})
//#endregion

//#region TaskCardComponent
export class TaskCardComponent {
  @Input() task!: Task;
}
//#endregion


//#region Imports
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { RouterModule } from '@angular/router';
//#endregion

//#region Component Metadata
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list-component.html',
  styleUrls: ['./task-list-component.scss'],
})
//#endregion

//#region TaskListComponent
export class TaskListComponent {
  //#region Inputs
  /**
   * The list of tasks passed from the parent component.
   */
  @Input() tasks: Task[] = [];
  //#endregion
}
//#endregion
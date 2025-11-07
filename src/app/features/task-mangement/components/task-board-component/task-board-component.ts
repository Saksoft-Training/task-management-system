//#region Imports
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskCardComponent } from '../task-card-component/task-card-component';
//#endregion

//#region Component Metadata
@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './task-board-component.html',
  styleUrls: ['./task-board-component.scss'],
})
//#endregion

//#region TaskBoardComponent
export class TaskBoardComponent {
  //#region Inputs
  /*
    The list of tasks passed from the parent component (TasksViewComponent).
   */
  @Input() tasks: Task[] = [];
  //#endregion

  //#region Public Methods
  /**
   * Filters tasks based on their current status.
   * @param status The status to filter by (e.g., 'To Do', 'In Progress', 'Completed').
   * @returns An array of tasks matching the specified status.
   */
  public getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(task => task.status === status);
  }
  //#endregion
}
//#endregion
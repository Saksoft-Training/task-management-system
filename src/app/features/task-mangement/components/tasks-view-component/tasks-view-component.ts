//#region Imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task-service';
import { TaskListComponent } from '../task-list-component/task-list-component';
import { TaskBoardComponent } from '../task-board-component/task-board-component';
//#endregion

//#region Component Metadata
@Component({
  selector: 'app-tasks-view',
  standalone: true,
  imports: [CommonModule, TaskListComponent, TaskBoardComponent],
  templateUrl: './tasks-view-component.html',
  styleUrls: ['./tasks-view-component.scss'],
})
//#endregion

//#region TasksViewComponent
export class TasksViewComponent implements OnInit {
  //#region Properties
  //Holds all tasks retrieved from the TaskService.
  tasks: Task[] = [];
  // Controls the current view mode: list view or board view.
  viewMode: 'list' | 'board' = 'list';
  //#endregion

  //#region Constructor
  constructor(private taskService: TaskService) {}
  //#endregion

  //#region Lifecycle Hooks
  // Loads tasks when the component initializes.
  ngOnInit(): void {
    this.loadTasks();
  }
  //#endregion

  //#region Public Methods
  /* 
  * Fetches all tasks from the TaskService and logs them to the console.
  */
  public loadTasks(): void {
    this.tasks = this.taskService.getAll();
    console.log('Loaded tasks:', this.tasks); 
  }

  /**
   * Switches between list and board view modes.
   * @param mode The desired view mode ('list' or 'board').
   */
  public toggleView(mode: 'list' | 'board'): void {
    this.viewMode = mode;
  }
  //#endregion
}
//#endregion


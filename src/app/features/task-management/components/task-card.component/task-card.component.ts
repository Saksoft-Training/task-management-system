import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../../../../types';
import { ProjectService } from '../../../project-management/services/project-service';

@Component({
  selector: 'app-task-card-component',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent implements OnInit {

  /**
   * @summary Task object passed from parent component.
   */
  @Input() public task!: Task;

  /**
   * @summary Emits when the close button on the card is clicked.
   */
  @Output() public close: EventEmitter<void> = new EventEmitter<void>();

  // #endregion

  /**
   * @summary Stores the name of the project the task belongs to.
   */
  public projectName: string = '';
  // #endregion

  /**
   * @summary Injects ProjectService to retrieve project details.
   * @param projectService Service for fetching project information.
   */
  constructor(private readonly projectService: ProjectService) {}

  // #endregion

  /**
   * @summary Loads project name from the assigned projectId of the task.
   * @returns void
   */
  public ngOnInit(): void {
    const email: string = localStorage.getItem('loggedUserEmail') || '';
    const project = this.projectService.getById(this.task.projectId, email);

    this.projectName = project?.name ?? 'Unknown';
  }

  // #endregion

  /**
   * @summary Emits a close event for parent handling.
   * @returns void
   */
  public closeCard(): void {
    this.close.emit();
  }

  // #endregion
}

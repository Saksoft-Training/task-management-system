import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../../../../types';
import { ProjectService } from '../../../project-management/services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-card-component',
  standalone: true,
  imports: [CommonModule],
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

  /**
   * @summary Stores the name of the project the task belongs to.
   */
  public projectName: string = '';

  constructor(
    private readonly projectService: ProjectService,
    private readonly router: Router
  ) {}

  /**
   * @summary Loads the project name using the projectId from the task,
   *          same way as TaskDetailPage (using currentUser.email).
   */
  public ngOnInit(): void {
    //  Get current user from localStorage or sessionStorage
    const user =
      JSON.parse(localStorage.getItem('currentUser') || 'null') ||
      JSON.parse(sessionStorage.getItem('currentUser') || 'null');

    const email: string = user?.email || '';

    //  Fetch the project using its ID and user email
    const project = this.projectService.getById(this.task.projectId, email);

    //  Safely assign name or fallback if not found
    this.projectName = project?.name || 'Unknown Project';

    if (!project) {
      console.warn(
        ` [TaskCard] Project not found for ID: ${this.task.projectId} (email: ${email})`
      );
    }
  }

  /**
   * @summary Emits the close event to parent component.
   */
  public closeCard(): void {
    this.close.emit();
  }

  /**
   * @summary Navigate to Task Details page.
   * @param id Task ID
   */
  public goToTaskDetails(id: number): void {
    this.router.navigate(['/tasks', id]);
  }
}

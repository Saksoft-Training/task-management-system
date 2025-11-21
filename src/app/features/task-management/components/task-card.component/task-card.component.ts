import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../../../../types';
import { ProjectService } from '../../../project-management/services/project.service';
import { Router } from '@angular/router';

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

  /**
   * @summary Stores the name of the project the task belongs to.
   */
  public projectName: string = '';

  constructor(
    private readonly projectService: ProjectService,
    private readonly router: Router
  ) {}

  /**
   * Loads the project name from projectId.
   */
  public ngOnInit(): void {
    const email: string = localStorage.getItem('loggedUserEmail') || '';
    const project = this.projectService.getById(this.task.projectId, email);

    this.projectName = project?.name ?? 'Unknown';
  }

  /**
   * @summary Emit close event
   */
  public closeCard(): void {
    this.close.emit();
  }

  /**
   * Navigate to Task Details page
   */
  public goToTaskDetails(id: number) {
    this.router.navigate(['/tasks', id]);
  }
}

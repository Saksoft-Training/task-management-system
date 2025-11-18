import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Task } from '../../../../../types';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss'],
})
export class TaskBoardComponent implements OnInit, OnChanges {

  /**
   * @summary The list of tasks to display in the board view.
   */
  @Input() public tasks: Task[] = [];

  /**
   * @summary The ID of the project these tasks belong to (optional).
   */
  @Input() public projectId?: number | null;

  /**
   * @summary Title displayed at the top of the board.
   */
  @Input() public title: string = 'All Board';

  // #endregion

  /**
   * @summary Current view mode of the board.
   * - "project": Board inside a project context
   * - "global": Board from global Tasks page
   */
  public mode: 'project' | 'global' = 'project';

  /**
   * @summary Predefined task statuses used to group tasks.
   */
  public readonly statuses: string[] = ['To Do', 'In Progress', 'Completed'];

  /**
   * @summary Stores tasks grouped by status columns.
   */
  public columns: Record<string, Task[]> = {
    'To Do': [],
    'In Progress': [],
    'Completed': [],
  };

  /**
   * @summary Controls whether the sort dropdown is visible.
   */
  public toggleSortMenu: boolean = false;

  // #endregion

  constructor(private router: Router) {}

  // #endregion

  /**
   * @summary Initializes the component by detecting mode and grouping tasks.
   */
  public ngOnInit(): void {
    this.detectMode();
    this.groupTasks();
  }

  /**
   * @summary Automatically triggered when @Input properties change.
   * Regroups tasks based on updated data.
   */
  public ngOnChanges(): void {
    this.groupTasks();
  }

  // #endregion

  /**
   * @summary Detects whether the board is loaded from project or global route.
   */
  private detectMode(): void {
    const url = this.router.url.toLowerCase();
    this.mode = url === '/tasks/board' ? 'global' : 'project';
  }

  /**
   * @summary Groups tasks into "To Do", "In Progress", and "Completed" columns.
   */
  private groupTasks(): void {
    this.columns = {
      'To Do': [],
      'In Progress': [],
      'Completed': [],
    };

    this.tasks.forEach(task => {
      const matchedStatus =
        this.statuses.find(
          status => status.toLowerCase() === task.status.toLowerCase()
        ) || 'To Do';

      this.columns[matchedStatus].push(task);
    });
  }

  // #endregion

  /**
   * @summary Generates initials from a user's name.
   * @param name Full name of the user.
   * @returns Two-letter initials.
   */
  public initials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return (parts[0][0] || '') + (parts[1]?.[0] || '');
  }

  /**
   * @summary Returns a lowercase priority class for CSS styling.
   */
  public priorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  /**
   * @summary Formats a given date to a readable locale string.
   */
  public formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }
  // #endregion

  /**
   * @summary Navigates to list view either for project or global tasks.
   */
  public goList(): void {
    if (this.projectId) {
      this.router.navigate([`/projects/${this.projectId}`]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  /**
   * @summary Opens create task page with optional projectId as query param.
   */
  public createTask(): void {
    this.router.navigate(['/tasks/create'], {
      queryParams: { projectId: this.projectId ?? null },
    });
  }

  // #endregion
}

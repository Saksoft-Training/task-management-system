import {
  Component,
  HostListener,
  OnDestroy,
  Pipe,
  PipeTransform,
  ChangeDetectorRef
} from '@angular/core';
import { Project } from '../../../../../types';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../user-account-management/services/auth-service';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../task-management/services/task-service';
import { Subscription } from 'rxjs';

/**
 * @summary Pipe used to convert strings by replacing spaces with hyphens
 * and converting all characters to lowercase.
 */
@Pipe({ name: 'replaceSpace', standalone: true })
export class ReplaceSpacePipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase().replace(/\s+/g, '-');
  }
}

/**
 * @summary Displays a list of projects, including search, sorting,
 * filtering, and auto-refresh via live API streams.
 */
@Component({
  selector: 'app-project-list-component',
  imports: [ProjectCardComponent, CommonModule, FormsModule, ReplaceSpacePipe],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnDestroy {

  //#region Properties

  /** Stores all projects fetched from API (for current user). */
  public projects: Project[] = [];

  /** Stores projects after applying search, sorting, and filter logic. */
  public filteredProjects: Project[] = [];

  /** Controls the visibility of the status filter dropdown. */
  public showFilters: boolean = false;

  /** Search box input for filtering projects by name. */
  public searchTerm: string = '';

  /** List of currently selected status filters. */
  public selectedStatuses: string[] = [];

  /** Currently selected sorting option ('name', 'newest', 'endingSoon'). */
  public sortOption: string = 'name';

  /** Static list of status options for filtering. */
  public statusOptions = ['Planning', 'In Progress', 'Completed', 'On Hold'];

  /** Logged-in user's email for API filtering logic. */
  public currentUserEmail: string = '';

  /** Controls the visibility of the sorting dropdown. */
  public showSort: boolean = false;

  /** Stores all subscriptions to avoid memory leaks. */
  private subs = new Subscription();

  //#endregion

  //#region Constructor

  /**
   * @summary Initializes required services for project retrieval,
   * authentication, navigation and task counting.
   */
  constructor(
    private projectService: ProjectService,
    private router: Router,
    private authService: AuthService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  //#endregion

  //#region Lifecycle Hooks

  /**
   * @summary Fetches the current user and loads all projects on component initialization.
   */
  public ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserEmail = user?.email || '';
    this.loadProjects();
  }

  /**
   * @summary Clears all active subscriptions to prevent memory leaks.
   */
  public ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  //#endregion

  //#region Data Loading

  /**
   * @summary Loads all projects and keeps UI in sync with live API stream.
   * Uses projectService.projects$ to auto-update UI when the backend changes.
   */
  private loadProjects(): void {
    const s = this.projectService.projects$.subscribe(projects => {

      // Assign API response to component
      this.projects = projects;

      // Apply filtering/sorting logic on updated projects
      this.applyFilters();
      
      // Force immediate UI update (fixes stale UI during live updates)
      this.cdr.detectChanges();
    });

    this.subs.add(s);
  }

  //#endregion

  //#region Filtering & Searching

  /**
   * @summary Applies search, status filters, and sorting to the project list.
   */
  public applyFilters(): void {
    this.filteredProjects = this.projects

      // Search filter
      .filter(p =>
        p.name?.toLowerCase().includes(this.searchTerm.toLowerCase() || '')
      )

      // Status filter
      .filter(p =>
        this.selectedStatuses.length === 0 ||
        this.selectedStatuses.includes(p.status)
      );

    // Sorting options
    if (this.sortOption === 'name') {
      this.filteredProjects = this.filteredProjects.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (this.sortOption === 'newest') {
      this.filteredProjects = this.filteredProjects.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (this.sortOption === 'endingSoon') {
      this.filteredProjects = this.filteredProjects.sort((a, b) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      );
    }
  }

  /**
   * @summary Toggles the visibility of the status filter dropdown panel.
   */
  public toggleFilterPanel(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * @summary Toggles a status filter on/off.
   */
  public toggleStatusFilter(status: string): void {
    if (this.selectedStatuses.includes(status)) {
      this.selectedStatuses = this.selectedStatuses.filter(s => s !== status);
    } else {
      this.selectedStatuses.push(status);
    }

    this.applyFilters();
  }

  /**
   * @summary Clears all active filters.
   */
  public clearFilters(): void {
    this.selectedStatuses = [];
    this.applyFilters();
  }

  //#endregion

  //#region Navigation

  /**
   * @summary Navigates user to the project creation page.
   */
  public goToCreate(): void {
    this.router.navigate(['/projects/create']);
  }

  /**
   * @summary Navigates user to the selected project details page.
   * @param id Project ID to navigate to.
   */
  public viewProject(id: number): void {
    this.router.navigate(['/projects', id]);
  }

  //#endregion

  //#region Sorting

  /**
   * @summary Toggles sorting dropdown visibility.
   */
  public toggleSort(): void {
    this.showSort = !this.showSort;
  }

  /**
   * @summary Sets sorting option and refreshes the list.
   * @param option Sorting type to apply.
   */
  public setSort(option: string): void {
    this.sortOption = option;
    this.showSort = false;
    this.applyFilters();
  }

  /**
   * @summary Returns the display label for selected sort option.
   */
  public getSortLabel(): string {
    switch (this.sortOption) {
      case 'name': return 'Name A–Z';
      case 'newest': return 'Newest First';
      case 'endingSoon': return 'Ending Soon';
      default: return 'Sort';
    }
  }

  //#endregion

  //#region UI Behaviour

  /**
   * @summary Closes dropdowns when clicking outside relevant areas.
   */
  @HostListener('document:click', ['$event'])
  public onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const insideSort = target.closest('.sort-wrapper');
    const insideFilter = target.closest('.filter-wrapper');

    if (!insideSort) this.showSort = false;
    if (!insideFilter) this.showFilters = false;
  }

  //#endregion

  //#region Task Helpers

  /**
   * @summary Returns number of tasks belonging to a project.
   */
  public getTaskCount(projectId: number): number {
    return this.taskService.getTasksByProjectId(projectId).length;
  }

  /**
   * @summary Helps Angular track items by ID for better performance.
   */
  public trackById(_index: number, item: Project) {
    return item.id;
  }

  //#endregion
}

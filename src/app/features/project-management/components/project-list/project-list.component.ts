import { Component, HostListener, Pipe, PipeTransform } from '@angular/core';
import { Project } from '../../../../../types';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../user-account-management/services/auth-service';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../task-management/services/task-service';

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
 * @summary  Displays a list of projects, including search, sorting, and filtering options.
 */
@Component({
  selector: 'app-project-list-component',
  imports: [ProjectCardComponent, CommonModule, FormsModule, ReplaceSpacePipe],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent {
  //#region Properties
  /** @summary Stores all projects belonging to the logged-in user. */
  public projects: Project[] = [];
  /** @summary Stores projects after applying search, sort, and filter options. */
  public filteredProjects: Project[] = [];
  /** @summary Controls visibility of the status filter dropdown panel. */
  public showFilters: boolean = false;
  /** @summary Search box input for filtering projects by name. */
  public searchTerm: string = '';
  /** @summary List of selected status filters (Planning, Completed, etc.). */
  public selectedStatuses: string[] = [];
  /** @summary Currently selected sort option. */
  public sortOption: string = 'name';
  /** @summary Static list of available status filter options. */
  public statusOptions = ['Planning', 'In Progress', 'Completed', 'On Hold'];
  /** @summary Logged-in user's email used for fetching projects. */
  public currentUserEmail: string = '';
  /** @summary Controls visibility of the sorting dropdown. */
  public showSort: boolean = false;
  //#endregion

  //#region Constructor
  /**
   * @summary
   * Initializes required services for project retrieval, navigation, and authentication.
   */
  constructor(
    private projectService: ProjectService,
    private router: Router,
    private authService: AuthService,
    private taskService: TaskService
  ) { }
  //#endregion

  //#region Lifecycle Hooks
  /**
   * @summary Fetches current user and loads all projects when the component initializes.
   * @returns void
   */
  public ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserEmail = user?.email || '';
    this.loadProjects();
  }
  //#endregion

  //#region Data Loading
  /**
   * @summary Loads all projects for the current user.
   * @returns void
   */
  private loadProjects(): void {
    this.projects = this.projectService.getAll(this.currentUserEmail);
    this.applyFilters();
  }
  //#endregion
  //#region Filtering & Searching
  /**
   * @summary Applies search term, selected statuses, and sorting on the project list.
   * @returns void
   */
  public applyFilters(): void {
    this.filteredProjects = this.projects
      .filter(p =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .filter(p =>
        this.selectedStatuses.length === 0 || this.selectedStatuses.includes(p.status)
      );
    if (this.sortOption === 'name') {
      this.filteredProjects = this.filteredProjects.sort((a, b) => a.name.localeCompare(b.name));
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
  public toggleFilterPanel(): void {
    this.showFilters = !this.showFilters;
  }
  /**
    * @summary Toggles a status filter badge on/off. 
    * @returns void 
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
    * @summary Navigates user to create new project page.
    */
  public goToCreate(): void {
    this.router.navigate(['/projects/create']);
    this.router.navigate(['/projects/create']).then(result => {
      console.log("Navigation result:", result);
      console.log("Current URL after nav:", this.router.url);
    });
  }
  /**
    * @summary Navigates user to a specific project details page.
    * @param id Project ID to view
    */
  public viewProject(id: number): void {
    this.router.navigate(['/projects', id]);
  }
  /**
   * @summary Toggles sort dropdown visibility. 
   * @returns void 
   * */
  public toggleSort(): void {
    this.showSort = !this.showSort;
  }
  /**
    * @summary Applies selected sorting type.
    * @param option Sorting type ('name', 'newest', 'endingSoon')
    */
  public setSort(option: string): void {
    this.sortOption = option;
    this.showSort = false;
    this.applyFilters();
  }
  /**
    * @summary Returns the user-friendly label for the selected sorting option.
    * @returns {string} The formatted label.
    */
  public getSortLabel(): string {
    switch (this.sortOption) {
      case 'name': return 'Name A–Z';
      case 'newest': return 'Newest First';
      case 'endingSoon': return 'Ending Soon';
      default: return 'Sort';
    }
  }
  /**
    * @summary Clears all active status filters. 
    * @return void*/
  public clearFilters(): void {
    this.selectedStatuses = [];
    this.applyFilters();
  }
  /**
     * @summary
     * Listens for clicks outside the sort/filter panels to close dropdowns.
     *
     * @param event Mouse click event
     */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const insideSort = target.closest('.sort-wrapper');
    const insideFilter = target.closest('.filter-wrapper');

    if (!insideSort) this.showSort = false;
    if (!insideFilter) this.showFilters = false;
  }
  public getTaskCount(projectId: number): number {
  return this.taskService
    .getTasksByProjectId(projectId)
    .length;
}

  //#endregion
}
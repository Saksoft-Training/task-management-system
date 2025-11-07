import { Component, OnInit } from '@angular/core';
import { IProject } from '../../../../contracts/project.interface';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-list.component',
  imports: [],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  //#region Fields and Properties
  /**
   * List of all projects
   */
  public projects: IProject[] = [];
  //#endregion

  //#region Constructor
  /**
   * Initializes dependencies for project management and navigation.
   * @param projectService - Used for fetching project data.
   * @param router - Router for navigating between pages.
   */
  constructor(
    private projectService: ProjectService,
    private router: Router) { }
  //#endregion

  //#region Lifecycle hooks
  /**
   * Lifecycle hook that runs when the component initializes.
   * Loads list of projects from localStorage.
   * @returns void
   */
  public ngOnInit(): void {
    this.loadProjects();
  }
  //#endregion

  //#region Data Methods
  /**
   * Loads all projects from ProjectService into the local 'projects' array.
   * @returns void
   */
  public loadProjects(): void {
    this.projects = this.projectService.getAll();
  }
  //#endregion

  //#region Navigation Methods
  /**
   * Navigates to project creation page.
   * @return void
   */
  public goToCreate(): void {
    this.router.navigate(['/projects/create']);
  }

  /**
   * Navigates to detail view of specific project by ID.
   * @param id - The ID of project to view
   * @returns void
   */
  public viewProject(id: number): void {
    this.router.navigate(['/projects', id]);
  }
  //#endregion
}

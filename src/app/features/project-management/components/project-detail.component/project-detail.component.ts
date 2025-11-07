import { Component, OnInit } from '@angular/core';
import { IProject } from '../../../../contracts/project.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-detail.component',
  imports: [DatePipe],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  //#region Fields and Properties
  /**
   * Project object currently being displayed
   */
  public project?: IProject;
  //#endregion

  //#region Constructor
  /**
   * Injects route, router and project service dependencies.
   * @param route - ActivatedRoute for accessing route parameters
   * @param projectService - Service used to retrieve project data.
   * @param router - Service for navigation.
   */
  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    protected router: Router
  ) { }
  //#endregion

  //#region Lifecycle hooks
  /**
   * Lifecycle hook that initializes component data.
   * Retrieves the project ID from the route and loads the corresponding project.
   * Redirects to project list page if no project is found.
   * @return void
   */
  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.project = this.projectService.getById(id);
    if (!this.project) {
      alert('Project not found');
      this.router.navigate(['/projects']);
    }
  }
  //#endregion
}

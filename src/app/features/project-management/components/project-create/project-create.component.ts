import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../../../../types/models/project';
import { AuthService } from '../../../user-account-management/services/auth-service';
import { DialogDeleteComponent } from '../../../../shared/components/dialog-delete/dialog-delete.component';
import { NotificationService } from '../../../dashboard/services/notification-service';
@Component({
  selector: 'app-project-create-component',
  imports: [ReactiveFormsModule, DialogDeleteComponent],
  templateUrl: './project-create.component.html',
  styleUrl: './project-create.component.scss',
})
export class ProjectCreateComponent {
  //#region Properties
  /** Reactive form for creating or editing a project */
  public projectForm: FormGroup;
  /** Available project status options */
  public statuses: string[] = ['Planning', 'In Progress', 'Completed', 'On Hold'];
  /** Message shown after creating a project successfully */
  public successMessage: string = '';
  /** Project ID when editing an existing project */
  public editProjectId: number | null = null;
  /** Logged-in user name */
  public currentUser: string = '';
  /** Minimum date allowed for date fields (today) */
  public minDate: string = new Date().toISOString().split('T')[0];
  /** Controls delete confirmation dialog */
  public showDeleteDialog = false;
  /** Delete dialog configuration data */
  public deleteDialogData = {
    title: 'DELETE PROJECT',
    message: '',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  };
  // #endregion

  //#region Constructor
  /**
   * @summary Initializes form, injects services, prepares validators.
   * @param formBuilder Angular FormBuilder
   * @param router Angular Router
   * @param projectService Project CRUD service
   * @param route ActivatedRoute for reading route parameters
   * @param authService Authentication service
   * @param notificationService Notification toast popup service
   */
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.projectForm = this.formBuilder.group({
      description: ['', [Validators.maxLength(500)]],
      endDate: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      startDate: ['', [Validators.required, this.futureOrTodayValidator.bind(this)]],
      status: ['', [Validators.required]]
    }, {
      validators: this.endDateAfterStartDateValidator.bind(this)
    });
  }
  //#endregion

  //#region Lifecycle
  /**
  * @summary Load logged-in user and check if editing an existing project.
  */
  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.currentUser = user?.email || '';
    this.validateProjectId();
  }
  //#endregion

  //#region Private Utility Methods
  /**
   * @summary Validates project ID from route. Redirects to project list if ID invalid.
   * @returns {void}
   */
  private validateProjectId(): void {
    const projectIdParam = this.route.snapshot.paramMap.get('id');
    if (!projectIdParam) {
      return;
    }
    const projectId = Number(projectIdParam);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      this.router.navigate(['/projects']);
      return;
    }
    this.projectService.projects$.subscribe(projects => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return;
    }
    this.patchProjectForm(project);
    this.editProjectId = project.id;
  });
  this.projectService.getAllAsync().subscribe();
}
  /**
  * @summary Populates form fields with project data when editing.
  * @param project Project object to load into form
  */
  private patchProjectForm(project: Project): void {
    this.editProjectId = project.id;
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate
    });
  }
  //#endregion

  //#region Date Handling Utilities
  /**
   * @summary Converts various date formats into a Date object without time.
   * @param value - Input date value
   * @returns {Date | null} Normalized date object or null
   */
  private toLocalDateOnly(value: any): Date | null {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  // #endregion

  // #region Validators
  /**
   * @summary Validator ensuring selected date is today or in the future.
   * @param control - Form control to validate
   * @returns {ValidationErrors | null} Error object if past date, otherwise null
   */
  public futureOrTodayValidator = (control: AbstractControl): ValidationErrors | null => {
    const inputDateOnly = this.toLocalDateOnly(control.value);
    if (!inputDateOnly) return null;
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return inputDateOnly < todayOnly ? { pastDate: true } : null;
  };
  /**
   * @summary Validator ensuring end date is not before start date.
   * @param group - Form group containing startDate and endDate fields
   * @returns {ValidationErrors | null} Error object if invalid range, else null
   */
  public endDateAfterStartDateValidator(group: AbstractControl): ValidationErrors | null {
    const startVal = group.get('startDate')?.value;
    const endVal = group.get('endDate')?.value;
    const startDateOnly = this.toLocalDateOnly(startVal);
    const endDateOnly = this.toLocalDateOnly(endVal);
    if (!startDateOnly || !endDateOnly) return null;
    return endDateOnly < startDateOnly ? { endBeforeStart: true } : null;
  }
  // #endregion

  // #region Getters
  /**
   * @summary Computes minimum allowed end date after selecting start date.
   * @returns {string} Minimum end date
   */
  public get minEndDate(): string {
    return this.projectForm.get('startDate')?.value || '';
  }
  // #endregion

  // #region Form Actions
  /**
   * @summary Handles project creation or update logic.
   * @description If form is invalid, marks all fields and stops. Creates new project or updates existing one.
   * @returns {void}
   */
  public onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    const form = this.projectForm.value;
    const now = new Date();
    if (this.editProjectId) {
      const updatedProject: Project = {
        ...this.projectService.getById(this.editProjectId, this.currentUser)!,
        ...form,
        updatedAt: now.toISOString()
      };
      this.projectService.update(updatedProject, this.currentUser);
      this.notificationService.addNotification({
        kind: 'custom' as any,
        severity: 'success',
        title: 'Project updated successfully',
        message: updatedProject.name,
        showToast: true
      });
      this.router.navigate(['/projects', this.editProjectId]);
      return;
    }
    const newProject: Project = {
      id: Date.now(),
      name: form.name,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      createdBy: this.currentUser,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    this.projectService.save(newProject, this.currentUser);
    this.notificationService.addNotification({
      kind: 'custom' as any,
      severity: 'success',
      title: 'Project created successfully',
      message: newProject.name,
      showToast: true
    });
    this.router.navigate(['/projects', newProject.id]);
  }
  /**
   * @summary Resets form values and clears success message.
   * @returns {void}
   */
  public onReset(): void {
    this.projectForm.reset();
    this.successMessage = '';
  }
  /**
  * @summary Navigates back to project list without saving.
  * @returns {void}
  */
  public onCancel(): void {
    this.router.navigate(['/projects']);
  }
  //#endregion

  //#region Delete Project
  /**
  * @summary Opens delete confirmation dialog.
  */
  public onDeleteProject(): void {
    if (!this.editProjectId) return;
    const project = this.projectService.getById(this.editProjectId, this.currentUser);
    if (!project) return;
    this.deleteDialogData.message =
      `Are you sure you want to delete “${project.name}” ?\n\n` +
      `Are you sure you want to delete this project? This action cannot be undone.\n\n`;
    this.showDeleteDialog = true;
  }
  public handleDeleteConfirm(): void {
    if (this.editProjectId) {
      this.projectService.delete(this.editProjectId, this.currentUser);
      this.router.navigate(['/projects']);
    }
    this.showDeleteDialog = false;
  }
  /**
    * @summary Confirms and deletes the project.
    */
  public handleDeleteCancel(): void {
    this.showDeleteDialog = false;
  }
  //#endregion

  //#region Navigation
  /**
  * @summary Navigates to the list of all projects.
  * @returns {void}
  */
  public goToProjects(): void {
    this.router.navigate(['/projects']);
  }
  // #endregion
}
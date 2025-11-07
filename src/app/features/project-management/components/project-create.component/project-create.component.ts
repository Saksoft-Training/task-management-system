import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { IProject } from '../../../../contracts/project.interface';

@Component({
  selector: 'app-project-create.component',
  imports: [ReactiveFormsModule],
  templateUrl: './project-create.component.html',
  styleUrl: './project-create.component.scss',
})
export class ProjectCreateComponent {
  //#region Fields and Properties
  /**
   * Reactive form for creating a project
   */
  public projectForm: FormGroup;

  /**
   * List of project statuses
   */
  public statuses: string[] = ['planning', 'in progress', 'completed', 'on hold'];

  /**
   * Message is displayed upon successful project creation
   */
  public successMessage: string = '';

  /**
   * Current logged-in user 
   */
  public currentUser: string = 'demoUser';
  //#endregion

  //#region Constructor
  /**
   * Initializes dependencies and set up the project form
   * @param formBuilder - Service for creating reactive forms
   * @param router - Service for navigation
   * @param projectService - Service handling project data operations
   */
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private projectService: ProjectService
  ) {
    this.projectForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      startDate: ['', [Validators.required, this.futureOrTodayValidator]],
      endDate: ['', [Validators.required]],
      status: ['', [Validators.required]]
    }, {
      validators: this.endDateAfterStartDateValidator
    });
  }
  //#endregion

  //#region Custom Validators
  /**
   * Validators to ensure that the selected start date is not in past.
   * @param control - Form control to validate
   * @returns ValidationErrors | null - Returns an error object if invalid, else null
   */
  public futureOrTodayValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate < today ? { pastDate: true } : null;
  }

  /**
   * Validator to ensure that end date occurs after the start date.
   * @param group - The form group containing start and end dates
   * @returns ValidationErrors | null - Returns an error object if invalid, else null
   */
  public endDateAfterStartDateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) return null;
    return new Date(end) < new Date(start) ? { endBeforeStart: true } : null;
  }
  //#endregion

  //#region Form Submission
  /**
   * Handles project creation form submission.
   * Validates form data, constructs new project object, saves it through ProjectService.
   * Display success message and navigates to project details page upon completion.
   * @returns void
   */
  public onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    const form = this.projectForm.value;
    const now = new Date();
    const newProject: IProject = {
      id: Date.now(),
      name: form.name,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      createdBy: this.currentUser,
      createdAt: now.toISOString().split('T')[0],
      updatedAt: now.toISOString()
    };
    this.projectService.save(newProject);
    this.successMessage = 'Project created successfully!';
    setTimeout(() => this.router.navigate(['/projects', newProject.id]), 1000);
  }
  //#endregion

  //#region Form Reset and Navigation
  /**
   * Resets form to its initial state and clears success messages.
   * @returns void
   */
  public onReset(): void {
    this.projectForm.reset();
    this.successMessage = '';
  }

  /**
   * Cancels project creation and navigates back to projects list.
   * @returns void
   */
  public onCancel(): void {
    this.router.navigate(['/projects']);
  }
  //#endregion
}

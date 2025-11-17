//#region Imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../../../types/models/project';
import { Task, TaskPriority, TaskStatus } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project-service';
import { UserStorageService } from '../../../../shared/services/user-storage-service';
import { User } from '../../../../../types/models/user';
//#endregion

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TastCreateComponent implements OnInit {

  //#region Properties
  /** Reactive form used for creating a new task */
  public form!: FormGroup;

  /** Dropdown list of allowed task statuses */
  public statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

  /** Dropdown list of allowed task priorities */
  public priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  /** List of all available projects */
  public projects: Project[] = [];

  /** Project selected either from route or by user */
  public selectedProject?: Project;

  /** Whether to show project dropdown (false if route already provides projectId) */
  public showProjectDropdown = true;

  /** Success message shown after creating a task */
  public successMessage = '';

  /** Maximum length allowed for task description */
  public maxDescription = 500;

  /** List of system users loaded from local storage */
  public users: User[] = [];

  /** Logged-in username - temporary mock value */
  public currentUser = 'demoUser';
  //#endregion

  //#region Constructor
  /**
   * @summary Initializes services and sets up dependency injection.
   *
   * @param fb - Angular FormBuilder for building reactive forms
   * @param route - ActivatedRoute for accessing route params
   * @param router - Angular Router for navigation
   * @param projectService - Service used to fetch project data
   * @param taskService - Service used to save new tasks
   * @param userStorage - Service used to load registered system users
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userStorage: UserStorageService
  ) {}
  //#endregion

  //#region Lifecycle Methods
  /**
   * @summary Loads initial data, detects selected project from route, 
   * and initializes the reactive form.
   *
   * @returns void
   */
  ngOnInit(): void {
    // Load all projects
    this.projects = this.projectService.getAll(this.currentUser);

    // Load all users from local storage
    this.users = this.userStorage.getAllUsers();

    // Detect projectId if navigating from Project Details page
    const projectIdParam =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.paramMap.get('projectId');

    if (projectIdParam) {
      const pid = Number(projectIdParam);
      this.selectedProject = this.projectService.getById(pid, this.currentUser) ?? undefined;
      this.showProjectDropdown = false;
    }

    // Build form with default values + validators
    this.form = this.fb.group({
      projectId: [
        this.selectedProject?.id || null,
        this.showProjectDropdown ? Validators.required : []
      ],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      status: ['To Do', Validators.required],
      priority: ['Medium', Validators.required],
      description: ['', [Validators.maxLength(this.maxDescription)]],
      assignee: ['', Validators.required],
      dueDate: ['', [Validators.required, this.dueDateWithinProjectValidator.bind(this)]]
    });

    // Re-validate due date whenever selected project changes
    this.form.get('projectId')?.valueChanges.subscribe(val => {
      this.selectedProject = val
        ? this.projectService.getById(Number(val), this.currentUser)
        : undefined;

      this.form.get('dueDate')?.updateValueAndValidity();
    });
  }
  //#endregion

  //#region Validators
  /**
   * @summary Ensures selected due date is not in the past,
   * and lies within the selected project's date range.
   *
   * @param control - FormControl representing the due date field
   * @returns ValidationErrors | null
   */
  dueDateWithinProjectValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const dt = new Date(value);
    dt.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent past due dates
    if (dt < today) return { pastDate: true };

    // Validate against project range if project selected
    if (this.selectedProject) {
      const start = new Date(this.selectedProject.startDate);
      const end = new Date(this.selectedProject.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (dt < start) return { beforeProjectStart: true };
      if (dt > end) return { afterProjectEnd: true };
    }

    return null;
  }
  //#endregion

  //#region Getter Helpers
  /**
   * @summary Computes minimum selectable due date.
   * @description Uses project start date if project selected; otherwise today.
   *
   * @returns string - minimum date in yyyy-mm-dd format
   */
  public get minDate(): string {
    const today = new Date().toISOString().split('T')[0];
    if (!this.selectedProject) return today;

    return (new Date(this.selectedProject.startDate) > new Date(today))
      ? this.selectedProject.startDate
      : today;
  }

  /**
   * @summary Computes maximum selectable due date.
   *
   * @returns string
   */
  public get maxDate(): string {
    return this.selectedProject?.endDate || '';
  }

  /**
   * @summary Returns current description character count.
   *
   * @returns number
   */
  public charCount(): number {
    return (this.form.get('description')?.value || '').length;
  }
  //#endregion

  //#region Form Actions
  /**
   * @summary Validates form, creates new Task object, saves it,
   * displays success message, and navigates user appropriately.
   *
   * @returns void
   */
  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const f = this.form.value;
    const now = new Date().toISOString();

    // Construct new task object
    const newTask: Task = {
      id: Date.now(),
      title: f.title,
      description: f.description,
      status: f.status,
      priority: f.priority,
      assignee: f.assignee,
      dueDate: f.dueDate,
      projectId: Number(this.selectedProject?.id ?? f.projectId),
      createdBy: this.currentUser,
      createdAt: now,
      updatedAt: now
    };

    // Save to localStorage
    this.taskService.save(newTask);
    this.successMessage = 'Task created successfully!';

    // Slight delay before navigating
    setTimeout(() => {
      if (this.selectedProject) {
        this.router.navigate(['/projects', this.selectedProject.id]);
      } else {
        this.router.navigate(['/tasks']);
      }
    }, 900);
  }

  /**
   * @summary Resets the form to initial state while keeping selected project prefilled.
   *
   * @returns void
   */
  public onReset(): void {
    this.form.reset({
      projectId: this.selectedProject?.id || null,
      status: 'To Do',
      priority: 'Medium'
    });
    this.successMessage = '';
  }

  /**
   * @summary Navigates user back to previous appropriate page.
   *
   * @returns void
   */
  public onCancel(): void {
    if (this.selectedProject) {
      this.router.navigate(['/projects', this.selectedProject.id]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }
  //#endregion
}

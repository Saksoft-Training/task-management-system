//#region Imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../../../types/models/project';
import { Task, TaskPriority, TaskStatus } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { AuthService } from '../../../user-account-management/services/auth-service';
import { User } from '../../../../../types/models/user';
import { ProjectService } from '../../../project-management/services/project.service';
import { UserStorageService } from '../../../../shared/services/storage-service';
//#endregion

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskCreateComponent implements OnInit {

  //#region Public Properties

  /** Reactive form used for creating or editing tasks */
  public form!: FormGroup;

  /** Predefined list of task statuses */
  public readonly statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

  /** Predefined list of task priorities */
  public readonly priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  /** List of all available projects */
  public projects: Project[] = [];

  /** Selected project (from route or edit mode) */
  public selectedProject?: Project;

  /** If false, hides project dropdown */
  public showProjectDropdown: boolean = true;

  /** Success message shown after create/update */
  public successMessage: string = '';

  /** Maximum description length allowed */
  public readonly maxDescription: number = 500;

  /** All users (from storage) */
  public users: User[] = [];

  /** Logged-in user email */
  public currentUser: string = '';

  /** Edit mode flag */
  public isEdit: boolean = false;

  /** ID of task being edited */
  public editTaskId?: number;

  /** Existing task loaded for editing */
  public taskToEdit?: Task;

  //#endregion

  //#region Constructor

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
    private readonly userStorageService: UserStorageService,
    private readonly authService: AuthService
  ) {}

  //#endregion

  //#region Lifecycle Methods

  /** Initializes component: loads data, detects edit mode, builds form */
  public ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUser = user?.email || '';

    this.loadProjects();
    this.loadUsers();
    this.detectProjectFromRoute();
    this.detectEditMode();

    this.buildTaskForm();
    this.subscribeToProjectChange();

    // Patch form after form creation in edit mode
    if (this.isEdit && this.taskToEdit) {
      this.form.patchValue(this.taskToEdit);
    }
  }

  //#endregion

  //#region Initialization Helpers

  /** Loads projects created by current user */
  private loadProjects(): void {
    this.projects = this.projectService.getAll(this.currentUser);
  }

  /** Loads all users from storage */
  private loadUsers(): void {
    this.users = this.userStorageService.getAllUsers();
  }

  /** Detects projectId passed via route or query params */
  private detectProjectFromRoute(): void {
    let projectIdParam =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.paramMap.get('projectId');

    if (!projectIdParam) {
      projectIdParam = this.route.snapshot.queryParamMap.get('projectId');
    }

    if (projectIdParam) {
      const projectId = Number(projectIdParam);
      this.selectedProject =
        this.projectService.getById(projectId, this.currentUser) ?? undefined;

      this.showProjectDropdown = false;
    }
  }

  /** Detects edit mode and loads task to be edited */
  private detectEditMode(): void {
    const editId = this.route.snapshot.paramMap.get('id');

    if (editId) {
      this.isEdit = true;
      this.editTaskId = Number(editId);
      this.taskToEdit = this.taskService.getTaskById(this.editTaskId);

      if (this.taskToEdit) {
        this.selectedProject =
          this.projectService.getById(this.taskToEdit.projectId, this.currentUser) ?? undefined;

        this.showProjectDropdown = false;
      }
    }
  }

  /** Builds reactive form structure */
  private buildTaskForm(): void {
    this.form = this.fb.group({
      projectId: [
        { value: this.selectedProject?.id || null, disabled: !this.showProjectDropdown },
        this.showProjectDropdown ? Validators.required : []
      ],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      status: ['To Do', Validators.required],
      priority: ['Medium', Validators.required],
      description: ['', Validators.maxLength(this.maxDescription)],
      assignee: ['', Validators.required],
      dueDate: ['', [Validators.required, this.validateDueDate.bind(this)]]
    });
  }

  /** Subscribes to project selection changes and updates due date validation */
  private subscribeToProjectChange(): void {
    this.form.get('projectId')?.valueChanges.subscribe(value => {
      this.selectedProject = value
        ? this.projectService.getById(Number(value), this.currentUser) ?? undefined
        : undefined;

      this.form.get('dueDate')?.updateValueAndValidity();
    });
  }

  //#endregion

  //#region Validators

  /** Validates due date inside project date range & prevents past date in create mode */
  private validateDueDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const selected = new Date(value);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Past date only blocked for create mode
    if (!this.isEdit && selected < today) return { pastDate: true };

    if (this.selectedProject) {
      const start = new Date(this.selectedProject.startDate);
      const end = new Date(this.selectedProject.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (selected < start) return { beforeProjectStart: true };
      if (selected > end) return { afterProjectEnd: true };
    }

    return null;
  }

  //#endregion

  //#region Getter Helpers

  /** Minimum allowed due date */
  public get minDate(): string {
    const today = new Date().toISOString().split('T')[0];
    if (!this.selectedProject) return today;

    return new Date(this.selectedProject.startDate) > new Date(today)
      ? this.selectedProject.startDate
      : today;
  }

  /** Maximum allowed due date */
  public get maxDate(): string {
    return this.selectedProject?.endDate ?? '';
  }

  /** Description character count */
  public get descriptionCount(): number {
    return this.form.get('description')?.value?.length ?? 0;
  }

  //#endregion

  //#region Form Actions

  /** Creates or updates a task depending on mode */
  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const timestamp = new Date().toISOString();

    if (this.isEdit && this.taskToEdit) {
      /** Update existing task */
      const updatedTask: Task = {
        ...this.taskToEdit,
        ...formValue,
        projectId: Number(this.selectedProject?.id ?? formValue.projectId),
        updatedAt: timestamp
      };

      this.taskService.updateTask(updatedTask);
      this.successMessage = 'Task updated successfully!';
    } else {
      /** Create new task */
      const newTask: Task = {
        id: Date.now(),
        title: formValue.title,
        description: formValue.description,
        status: formValue.status,
        priority: formValue.priority,
        assignee: formValue.assignee,
        assigneeEmail: '',
        dueDate: formValue.dueDate,
        projectId: Number(this.selectedProject?.id ?? formValue.projectId),
        createdBy: this.currentUser,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      this.taskService.saveTask(newTask);
      this.successMessage = 'Task created successfully!';
    }

    setTimeout(() => this.navigateAfterSave(), 900);
  }

  /** Navigation after create/update */
  private navigateAfterSave(): void {
    if (this.selectedProject) {
      this.router.navigate(['/projects', this.selectedProject.id]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  /** Deletes task in edit mode */
  public onDelete(): void {
    if (confirm('Delete this task?') && this.editTaskId) {
      this.taskService.deleteTask(this.editTaskId);
      this.router.navigate(['/tasks']);
    }
  }

  /** Resets form in create mode (no reset allowed in edit mode) */
  public onReset(): void {
    if (this.isEdit) return;

    this.form.reset({
      projectId: this.selectedProject?.id || null,
      status: 'To Do',
      priority: 'Medium'
    });

    this.successMessage = '';
  }

  /** Cancels and navigates back */
  public onCancel(): void {
    if (this.selectedProject) {
      this.router.navigate(['/projects', this.selectedProject.id]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }
  /** Opens date picker programmatically */
  public openDatePicker(): void {
  const element = document.querySelector<HTMLInputElement>('input[formControlName="dueDate"]');
  if (element) {
    element.showPicker(); 
  }
}

  //#endregion
}

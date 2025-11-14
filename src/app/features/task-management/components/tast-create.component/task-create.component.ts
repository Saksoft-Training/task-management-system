//#region Imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../../../types/models/project';
import { Task, TaskPriority, TaskStatus } from '../../../../../types/models/task';
import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../../project-management/services/project-service';
//#endregion

//#region Component Metadata
@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
//#endregion

//#region TaskCreate Component
export class TastCreateComponent implements OnInit {

  //#region Form + UI State
  public form!: FormGroup;

  public statuses: TaskStatus[] = ['To Do', 'In Progress', 'Completed']; // dropdown
  public priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent']; // dropdown

  public projects: Project[] = [];         // list of all projects
  public selectedProject?: Project;        // currently selected project
  public showProjectDropdown = true;       // hide dropdown if coming from inside project

  public successMessage = '';              // toast-like success message
  public maxDescription = 500;             // description limit
  //#endregion

  //#region Dummy User Data 
  public currentUser = 'demoUser';  // TEMP VALUE until Auth integration
  //#endregion

  //#region Constructor , Injected Services
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private projectService: ProjectService,
    private taskService: TaskService
  ) { }
  //#endregion

  //#region Lifecycle Hooks
  /** Initialize form, load projects & detect projectId from route */
  ngOnInit(): void {

    // TEMP: Fetching projects from local storage / dummy service
    this.projects = this.projectService.getAll(this.currentUser);

    // If coming from /projects/:id/tasks/create
    const projectIdParam =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.paramMap.get('projectId');

    if (projectIdParam) {
      const pid = Number(projectIdParam);

      // TEMP: Fetch project from dummy project service
      this.selectedProject = this.projectService.getById(pid, this.currentUser) ?? undefined;

      // Hide project dropdown because user is already inside a project
      this.showProjectDropdown = false;
    }

    // Build form
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

    // When project changes → validate due date inside project range
    this.form.get('projectId')?.valueChanges.subscribe(val => {
      if (!val) {
        this.selectedProject = undefined;
      } else {
        // TEMP: Using local project data
        this.selectedProject = this.projectService.getById(Number(val), this.currentUser);
      }

      this.form.get('dueDate')?.updateValueAndValidity();
    });
  }
  //#endregion

  //#region Validators
  /** Ensures due date is not in past & stays within project's timeline */
  dueDateWithinProjectValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const dt = new Date(value);
    dt.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dt < today) return { pastDate: true };

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

  //#region Min/Max Getters for Date Input
  public get minDate(): string {
    return this.selectedProject?.startDate ||
      new Date().toISOString().split('T')[0];
  }

  public get maxDate(): string {
    return this.selectedProject?.endDate || '';
  }
  //#endregion

  //#region Helpers
  /** Get live character count for description */
  public charCount(): number {
    return (this.form.get('description')?.value || '').length;
  }
  //#endregion

  //#region Submit / Reset / Cancel
  /** Creates a new task and redirects */
  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const f = this.form.value;
    const now = new Date().toISOString();

    // TEMP: Using Date.now() → Replace with backend ID
    const newTask: Task = {
      id: Date.now(),
      title: f.title,
      description: f.description,
      status: f.status,
      priority: f.priority,
      assignee: f.assignee,
      dueDate: f.dueDate,
      projectId: Number(this.selectedProject?.id ?? f.projectId),
      createdBy: this.currentUser,  // TEMP: Replace with real user
      createdAt: now,
      updatedAt: now
    };

    this.taskService.save(newTask);
    this.successMessage = 'Task created successfully!';

    // Redirect after short delay
    setTimeout(() => {
      if (this.selectedProject) {
        this.router.navigate(['/projects', this.selectedProject.id]);
      } else {
        this.router.navigate(['/tasks']);
      }
    }, 900);
  }

  /** Reset form values */
  public onReset(): void {
    this.form.reset({
      projectId: this.selectedProject?.id || null,
      status: 'To Do',
      priority: 'Medium'
    });
    this.successMessage = '';
  }

  /** Cancel and go back */
  public onCancel(): void {
    if (this.selectedProject) {
      this.router.navigate(['/projects', this.selectedProject.id]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }
  //#endregion
}
//#endregion

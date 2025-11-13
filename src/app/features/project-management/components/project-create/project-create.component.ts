import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../../../../types/models/project';
import { FooterComponent } from '../../../../shared/components/footer-component/footer-component';

@Component({
  selector: 'app-project-create-component',
  imports: [FooterComponent, ReactiveFormsModule],
  templateUrl: './project-create.component.html',
  styleUrl: './project-create.component.scss',
})
export class ProjectCreateComponent {
  public projectForm: FormGroup;
  public statuses: string[] = ['Planning', 'In Progress', 'Completed', 'On Hold'];
  public successMessage: string = '';
  public editProjectId: number | null = null;
  public currentUser: string = 'demoUser';
  public minDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private projectService: ProjectService,
    private route: ActivatedRoute
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
    const projectId = Number(this.route.snapshot.paramMap.get('id'));

    if (projectId) {
      const project = this.projectService.getById(projectId, this.currentUser);
      if (project) {
        this.projectForm.patchValue(project);
        this.editProjectId = projectId;
      }
    }
  }
  public futureOrTodayValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate < today ? { pastDate: true } : null;
  }

  public endDateAfterStartDateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) return null;
    return new Date(end) < new Date(start) ? { endBeforeStart: true } : null;
  }
  public get minEndDate(): string {
    return this.projectForm.get('startDate')?.value || '';
  }


  public onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    const form = this.projectForm.value;
    const now = new Date();
    if (this.editProjectId) {
      // UPDATE PROJECT
      const updatedProject: Project = {
        ...this.projectService.getById(this.editProjectId, this.currentUser)!,
        ...form,
        updatedAt: now.toISOString()
      };

      this.projectService.update(updatedProject, this.currentUser);
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
      createdAt: now.toISOString().split('T')[0],
      updatedAt: now.toISOString()
    };
    this.projectService.save(newProject, this.currentUser);
    this.successMessage = 'Project created successfully!';
    setTimeout(() => this.router.navigate(['/projects', newProject.id]), 1000);
  }
  public onReset(): void {
    this.projectForm.reset();
    this.successMessage = '';
  }
  public onCancel(): void {
    this.router.navigate(['/projects']);
  }

  public goToProjects(): void {
    this.router.navigate(['/projects']);
  }
}

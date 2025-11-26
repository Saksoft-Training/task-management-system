import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors, AsyncValidatorFn, ValidatorFn
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { UserStorageService } from '../../../../shared/services/storage-service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../../dashboard/services/notification-service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  public resetForm!: FormGroup;
  public isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userStorage: UserStorageService,
    private router: Router,
    private notificationService: NotificationService,
    private http: HttpClient     
  ) { }

  ngOnInit(): void {
    this.resetForm = this.fb.group(
      {
        email: ['', [Validators.required, this.gmailValidator()], [this.emailExistsValidator()]],
        newPassword: ['', [Validators.required, this.passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.confirmPasswordValidator() }
    );
  }

  // ---------------- VALIDATORS ------------------

  private gmailValidator(): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null =>
      /^[a-z0-9._%+-]+@gmail\.com$/.test(c.value || '') ? null : { invalidEmail: true };
  }

  private emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value?.trim().toLowerCase();
      if (!email) return of(null);

      return this.userStorage.isEmailExistsApi(email).pipe(
        map(exists => exists ? null : { emailNotFound: true })
      );
    };
  }

  private passwordStrengthValidator(): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      const p = c.value || '';
      return p.length >= 8 && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p)
        ? null
        : { weakPassword: true };
    };
  }

  private confirmPasswordValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      return group.get('newPassword')?.value === group.get('confirmPassword')?.value
        ? null
        : { mismatch: true };
    };
  }

  // ---------------- SUBMIT ------------------

  submitReset(): void {
    this.isSubmitting = true;
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.isSubmitting = false;
      return;
    }

    const email = this.resetForm.value.email.trim().toLowerCase();
    const newPassword = this.resetForm.value.newPassword;

    // Find user by email from API
    this.userStorage.findUserByEmail(email).pipe(
      switchMap(user => {
        if (!user) {
          this.notificationService.addNotification({
            kind: 'custom' as any,
            severity: 'critical',
            title: 'Reset Failed',
            message: 'Email not found',
            showToast: true
          });
          this.isSubmitting = false;
          return of(null);
        }

        // 2️ Update password using API
        return this.userStorage.updateUserPasswordApi(user.id, newPassword);
      })
    ).subscribe(updated => {

      if (!updated) return;

      this.notificationService.addNotification({
        kind: 'custom' as any,
        severity: 'success',
        title: 'Password Reset Successful',
        message: '',
        showToast: true
      });

      this.resetForm.reset();

      setTimeout(() => {
        this.isSubmitting = false;
        this.router.navigate(['/login']);
      }, 800);
    });
  }


get formControls() {
  return this.resetForm.controls;
}

public forceLowercaseEmail() {
  const ctrl = this.resetForm.get('email');
  ctrl?.setValue(ctrl.value?.toLowerCase(), { emitEvent: true });
}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

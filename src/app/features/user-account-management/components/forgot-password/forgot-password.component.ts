import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
  //#region Properties
  /** Reactive form for reset password screen */
  public resetForm!: FormGroup;
  /** Loading state shown while API call runs */
  public isSubmitting = false;
  //#endregion

  //#region Constructor
  /**
   * @summary Inject required services for form building, API calls, notification, and navigation.
   */
  constructor(
    private formBuilder: FormBuilder,
    private userStorage: UserStorageService,
    private router: Router,
    private notificationService: NotificationService,
    private http: HttpClient
  ) { }
  //#endregion

  //#region Lifecycle
  /**
   * @summary Initialize form with validation rules.
   */
  ngOnInit(): void {
    this.resetForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, this.gmailValidator()], [this.emailExistsValidator()]],
        newPassword: ['', [Validators.required, this.passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.confirmPasswordValidator() }
    );
  }
  //#endregion

  //#region Validators
  /**
   * @summary Validates only Gmail addresses.
   * @param control AbstractControl
   * @returns ValidationErrors | null
   */
  private gmailValidator(): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null =>
      /^[a-z0-9._%+-]+@gmail\.com$/.test(c.value || '')
        ? null
        : { invalidEmail: true };
  }
  /**
   * @summary Checks if email exists in MockAPI (Async Validator).
   * @returns AsyncValidatorFn
   */
  private emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value?.trim().toLowerCase();
      if (!email) return of(null);
      return this.userStorage.getAllUsersFromApi().pipe(
        map(users => {
          const exists = users.some(u => u.email.toLowerCase() === email);
          return exists ? null : { emailNotFound: true };
        })
      );
    };
  }
  /**
   * @summary Validates password strength (uppercase, number, special char, min 8 chars).
   */
  private passwordStrengthValidator(): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      const p = c.value || '';
      const strong =
        p.length >= 8 &&
        /[A-Z]/.test(p) &&
        /\d/.test(p) &&
        /[^A-Za-z0-9]/.test(p);
      return strong ? null : { weakPassword: true };
    };
  }
  /**
   * @summary Validates if new password and confirm password match.
   */
  private confirmPasswordValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const match =
        group.get('newPassword')?.value ===
        group.get('confirmPassword')?.value;

      return match ? null : { mismatch: true };
    };
  }
  //#endregion

  //#region Submit Handler
  /**
   * @summary Submit reset password form, update password through API.
   */
  public submitReset(): void {
    this.isSubmitting = true;
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.isSubmitting = false;
      return;
    }
    const email = this.resetForm.value.email.trim().toLowerCase();
    const newPassword = this.resetForm.value.newPassword;
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
  //#endregion

  //#region Helpers
  /** Getter to access controls easily in HTML */
  public get formControls() {
    return this.resetForm.controls;
  }
  /**
   * @summary Forces email field to stay in lowercase.
   */
  public forceLowercaseEmail() {
    const ctrl = this.resetForm.get('email');
    ctrl?.setValue(ctrl.value?.toLowerCase(), { emitEvent: true });
  }
  /**
   * @summary Navigate back to login page.
   */
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
  //#endregion
}
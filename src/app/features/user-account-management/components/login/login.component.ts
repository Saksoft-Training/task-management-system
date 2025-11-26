//#region Imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../services/auth-service';
import { NotificationService } from '../../../dashboard/services/notification-service';
import { ActivityService } from '../../../dashboard/services/activity-service';
//#endregion

/**
 * @summary
 * Login component responsible for handling authentication input,
 * validation, error handling, and login state management.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //#region Public Properties

  /** Main login form group */
  public loginFormGroup!: FormGroup;

  /** Indicates whether form is in submission/loading state */
  public isFormSubmitting = false;

  /** Stores API login error message */
  public loginErrorMessage = '';

  /** Used to track whether the form was already attempted */
  public loginAttempted = false;

  //#endregion


  //#region Constructor

  /**
   * @summary Injects FormBuilder, AuthService, Router, and NotificationService.
   * @param formBuilder Creates and manages reactive forms
   * @param authService Handles authentication API requests
   * @param router Used for page navigation
   * @param notificationService Displays toast notifications
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private activityService: ActivityService
  ) { }

  //#endregion


  //#region Lifecycle

  /**
   * @summary Initializes login form on component load.
   */
  ngOnInit(): void {
    this.initializeLoginForm();
  }

  //#endregion


  //#region Form Setup

  /**
   * @summary Creates login form with Gmail validation and rememberMe toggle.
   */
  private initializeLoginForm(): void {
    this.loginFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, this.gmailValidator()]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  //#endregion


  //#region Validators

  /**
   * @summary Custom validator allowing only Gmail addresses.
   * @returns ValidationErrors | null
   */
  private gmailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;

      const pattern = /^[a-z0-9._%+-]+@gmail\.com$/;
      return pattern.test(email) ? null : { invalidEmail: true };
    };
  }

  //#endregion


  //#region Helper Methods

  /**
   * @summary Forces email input to lowercase to avoid mismatch issues.
   */
  public forceLowercaseEmail(): void {
    const emailCtrl = this.loginFormGroup.get('email');
    const val = emailCtrl?.value || '';
    emailCtrl?.setValue(val.toLowerCase(), { emitEvent: true });
  }

  /**
   * @summary Shortcut to access form controls in template.
   */
  public get formControls(): FormGroup['controls'] {
    return this.loginFormGroup.controls;
  }

  //#endregion


  //#region Form Submission

  /**
   * @summary Validates form, triggers login request and handles result states.
   */
  public submitLoginForm(): void {
    this.loginErrorMessage = '';
    this.loginAttempted = true;

    // Prevents validation bypass
    if (this.loginFormGroup.invalid) {
      this.loginFormGroup.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.loginFormGroup.value;

    // Disable UI to prevent duplicate submissions
    this.isFormSubmitting = true;
    this.loginFormGroup.disable();

    this.authService.login({ email, password, rememberMe }).subscribe({
      next: () => {
        this.isFormSubmitting = false;
        this.loginAttempted = false;
         this.activityService.loadForCurrentUser();
        this.notificationService.addNotification({
          kind: 'custom' as any,
          severity: 'success',
          title: 'Login Successful',
          message: '',
          showToast: true
        });

        setTimeout(() => {
          this.isFormSubmitting = false;
          this.router.navigate(['/profile']);
        }, 600);
      },

      error: (err) => {
         this.isFormSubmitting = false;
        this.loginErrorMessage = err?.message || 'Invalid email or password';

        this.notificationService.addNotification({
          kind: 'custom' as any,
          severity: 'critical',
          title: 'Login Failed',
          message: this.loginErrorMessage,  
          showToast: true
        });

        // Re-enable UI for retry
        setTimeout(() => {
          this.isFormSubmitting = false;
          this.loginFormGroup.enable();
        }, 600);
      }
    });
  }

  //#endregion


  //#region Navigation

  /**
   * @summary Navigates user to another route (Ex: forgot-password/register)
   * @param path Router navigation path
   */
  public navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  //#endregion
}

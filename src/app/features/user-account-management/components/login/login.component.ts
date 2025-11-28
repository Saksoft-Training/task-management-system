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
  /** Reactive login form */
  public loginFormGroup!: FormGroup;
  /** Loader state during authentication */
  public isFormSubmitting = false;
  /** Stores API login failure message */
  public loginErrorMessage = '';
  /** Indicates if user has attempted login */
  public loginAttempted = false;

  //#endregion


  //#region Constructor

  /**
   * @summary Injects FormBuilder, AuthService, Router, and NotificationService
   * @param formBuilder Builds the Reactive Form
   * @param authService Handles login API calls
   * @param router Navigates between routes
   * @param notificationService Displays toast messages
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  //#endregion

  //#region Lifecycle
  /**
   * @summary Initializes the login form on component load.
   */
  ngOnInit(): void {
    this.initializeLoginForm();
  }

  //#endregion

  //#region Form Setup
  /**
   * @summary Creates login form with email, password & rememberMe.
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
   * @summary Forces email to lowercase to avoid case mismatch.
   */
  public forceLowercaseEmail(): void {
    const emailCtrl = this.loginFormGroup.get('email');
    const val = emailCtrl?.value || '';
    emailCtrl?.setValue(val.toLowerCase(), { emitEvent: true });
  }
  /**
   * @summary Returns form controls for easier template access.
   */
  public get formControls(): FormGroup['controls'] {
    return this.loginFormGroup.controls;
  }

  //#endregion


  //#region Form Submission

  /**
   * @summary Submits form, validates inputs, sends login request & handles result.
   */
  public submitLoginForm(): void {
    this.loginErrorMessage = '';
    this.loginAttempted = true;
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
        this.notificationService.addNotification({
          kind: 'custom' as any,
          severity: 'success',
          title: 'Login Successful',
          message: '',
          showToast: true
        });
        this.isFormSubmitting = false;
        this.router.navigate(['/profile']);
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
        this.loginFormGroup.enable();

      }
    });
  }

  //#endregion


  //#region Navigation

  /**
   * @summary Navigates user to the provided route (e.g., forgot-password/register)
   * @param path The route path to navigate
   */
  public navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  //#endregion
}
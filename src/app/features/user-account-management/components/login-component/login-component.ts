import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner-component/loading-spinner-component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss']
})
export class LoginComponent implements OnInit {
  //#region Properties
  public loginFormGroup!: FormGroup;
  public isFormSubmitting = false;
  public loginErrorMessage = '';
  public loginAttempted = false;
  //#endregion
  //#region Constructor
  /**
   * @summary Injects form builder, auth service and router.
   * @param formBuilder - Used to create reactive form.
   * @param authService - Handles login authentication.
   * @param router - Navigates to other pages.
   */
  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {}
  //#endregion
  //#region Lifecycle Hook
  /**
   * @summary Initializes login form when component loads.
   * @returns void
   */
  ngOnInit(): void {
    this.initializeLoginForm();
  }
  //#endregion
  //#region Form Initialization
  /**
   * @summary Creates login form with validation rules.
   * @returns void
   */
  private initializeLoginForm(): void {
    this.loginFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }
  //#endregion
  //#region Form Helper
  /**
   * @summary Shorthand getter for form controls.
   * @returns any
   */
  public get formControls() {
    return this.loginFormGroup.controls;
  }
  //#endregion
  //#region Form Submission
  /**
   * @summary Handles login process, validation, and service call.
   * @returns void
   */
  public submitLoginForm(): void {
    this.loginErrorMessage = '';
    this.loginAttempted = true;
    if (this.loginFormGroup.invalid) {
      this.loginFormGroup.markAllAsTouched();
      return;
    }
    const { email, password, rememberMe } = this.loginFormGroup.value;
    this.isFormSubmitting = true;
    this.authService.login(email, password, rememberMe).subscribe({
      next: () => {
        this.isFormSubmitting = false;
        this.loginAttempted = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isFormSubmitting = false;
        this.loginErrorMessage = err?.message || 'Invalid email or password';
      }
    });
  }
  //#endregion
  //#region Navigation
  /**
   * @summary Navigates to register page.
   * @returns void
   */
  public navigateToRegisterPage(): void {
    this.router.navigate(['/register']);
  }
  /**
   * @summary Navigates to forgot password page.
   * @returns void
   */
  public navigateToForgotPasswordPage(): void {
    this.router.navigate(['/forgot-password']);
  }
  //#endregion
}

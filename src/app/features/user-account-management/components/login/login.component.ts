import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //#region Properties
  /** Login form group */
  public loginFormGroup!: FormGroup;
  /** Whether form is in submitting/loading state */
  public isFormSubmitting = false;
  /** Error message shown when login fails */
  public loginErrorMessage = '';
  /** Tracks whether a login attempt was made */
  public loginAttempted = false;
  //#endregion

  //#region Constructor
  /**
   * @summary Injects required dependencies for login component.
   * @param formBuilder Builds reactive login form
   * @param authService Handles login authentication
   * @param router Navigates to other pages after login
   */
  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {}
  //#endregion

  //#region Lifecycle Hook
  /**
   * @summary Initializes login form on component load.
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
   * @summary Getter for easy access to form controls.
   * @returns Form controls object
   */
  public get formControls(): FormGroup['controls'] {
    return this.loginFormGroup.controls;
  }
  //#endregion

  //#region Form Submission
  /**
   * @summary Validates login form and triggers authentication process.
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
    this.authService.login({ email, password, rememberMe }).subscribe({
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
   * @summary Navigates user to different route.
   * @param path Route path to navigate
   * @returns void
   */
  public navigateTo(path: string): void {
    this.router.navigate([path]);
  }
  //#endregion
}

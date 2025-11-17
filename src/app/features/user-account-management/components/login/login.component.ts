import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormBuilder,FormGroup,Validators,AbstractControl,ValidationErrors} from '@angular/forms';
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
  public loginFormGroup!: FormGroup;
  public isFormSubmitting = false;
  public loginErrorMessage = '';
  public loginAttempted = false;
  //#endregion

  //#region Constructor
  /**
   * @summary Injects form builder, authentication service and router.
   * @param formBuilder - Used to build reactive forms.
   * @param authService - Handles API authentication.
   * @param router - Used for routing/navigation.
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
  public ngOnInit(): void {
    this.initializeLoginForm();
  }
  //#endregion

  //#region Form Initialization
  /**
   * @summary Creates login form with Gmail validation rule.
   * @returns void
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
   * @summary Validates email to accept only Gmail.
   * @param control - Form control for email.
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
   * @summary Forces email input to lowercase for consistency.
   * @returns void
   */
  public forceLowercaseEmail(): void {
    const emailCtrl = this.loginFormGroup.get('email');
    const val = emailCtrl?.value || '';
    emailCtrl?.setValue(val.toLowerCase(), { emitEvent: true });
  }

  /**
   * @summary Shortcut getter for form controls.
   * @returns any
   */
  public get formControls(): FormGroup['controls'] {
    return this.loginFormGroup.controls;
  }
  //#endregion

  //#region Form Submission
  /**
   * @summary Validates form, calls login API, and handles success/error.
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
   * @summary Navigates to given route path 
   * @param path - Router path to navigate.
   * @returns void
   */
  public navigateTo(path: string): void {
    this.router.navigate([path]);
  }
  //#endregion
}

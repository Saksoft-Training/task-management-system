import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner-component/loading-spinner-component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss']
})
export class LoginComponent implements OnInit {
  public loginFormGroup!: FormGroup;
  public isFormSubmitting: boolean = false;
  public loginErrorMessage: string = '';

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.initializeLoginForm();
  }

  public initializeLoginForm(): void {
    this.loginFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

public get formControls() {
  return this.loginFormGroup.controls;
}

  public submitLoginForm(): void {
    this.loginErrorMessage = '';
    if (this.loginFormGroup.invalid) {
      this.loginFormGroup.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.loginFormGroup.value;
    this.isFormSubmitting = true;

    this.authService.login(email, password, rememberMe).subscribe({
      next: (user) => {
        this.isFormSubmitting = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isFormSubmitting = false;
        this.loginErrorMessage = 'Invalid email or password';
      }
    });
  }

  public navigateToRegisterPage(): void {
    this.router.navigate(['/register']);
  }

  public navigateToForgotPasswordPage(): void {
    this.router.navigate(['/forgot-password']);
  }
}


import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  admin: {
    id: number;
    name: string;
    email: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    console.log('SIGN IN CLICKED');
    if (this.loginForm.invalid || this.isLoading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .post<LoginResponse>('/api/auth/login', this.loginForm.getRawValue())
      .subscribe({
        next: (response) => {
          // Temporary token storage for local development.
          sessionStorage.setItem('admin_token', response.accessToken);

          this.isLoading = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;

          this.errorMessage =
            error.status === 401
              ? 'Invalid email or password.'
              : 'Something went wrong. Please try again.';

          this.cdr.markForCheck();
        },
      });
  }
}

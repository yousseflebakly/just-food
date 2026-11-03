
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface RegisterCustomerRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginCustomerRequest {
  email: string;
  password: string;
}

export interface CustomerAuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  customer: Customer;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerAuthService {
  private readonly http = inject(HttpClient);

  private readonly tokenKey = 'just_food_customer_token';
  private readonly customerKey = 'just_food_customer';

  private readonly customerState = signal<Customer | null>(
    this.readStoredCustomer(),
  );

  readonly customer = this.customerState.asReadonly();

  readonly isLoggedIn = computed(
    () => this.customerState() !== null && !!this.getToken(),
  );

  register(
    data: RegisterCustomerRequest,
  ): Observable<CustomerAuthResponse> {
    return this.http
      .post<CustomerAuthResponse>('/api/customer-auth/register', data)
      .pipe(tap((response) => this.saveSession(response)));
  }

  login(
    data: LoginCustomerRequest,
  ): Observable<CustomerAuthResponse> {
    return this.http
      .post<CustomerAuthResponse>('/api/customer-auth/login', data)
      .pipe(tap((response) => this.saveSession(response)));
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.customerKey);
    this.customerState.set(null);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  private saveSession(response: CustomerAuthResponse): void {
    sessionStorage.setItem(this.tokenKey, response.accessToken);
    sessionStorage.setItem(
      this.customerKey,
      JSON.stringify(response.customer),
    );

    this.customerState.set(response.customer);
  }

  private readStoredCustomer(): Customer | null {
    const stored = sessionStorage.getItem(this.customerKey);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as Customer;
    } catch {
      return null;
    }
  }
}

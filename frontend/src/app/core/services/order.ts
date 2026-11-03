
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  CreateOrderRequest,
  Order,
} from '../models/order.model';
import { Observable, throwError } from 'rxjs';

import { CustomerAuthService } from './customer-auth';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly customerAuthService = inject(CustomerAuthService);

  private readonly apiUrl = '/api/orders';

  // Build authorization headers for the logged-in customer.
  private getCustomerHeaders(): HttpHeaders | null {
    const token = this.customerAuthService.getToken();

    if (!token) {
      return null;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Customer: create a new order.
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    const headers = this.getCustomerHeaders();

    if (!headers) {
      return throwError(
        () =>
          new Error(
            'Customer authentication is required to place an order.',
          ),
      );
    }

    return this.http.post<Order>(this.apiUrl, orderData, {
      headers,
    });
  }

  // Customer: get their own order history.
  getMyOrders(): Observable<Order[]> {
    const headers = this.getCustomerHeaders();

    if (!headers) {
      return throwError(
        () =>
          new Error(
            'Customer authentication is required to view orders.',
          ),
      );
    }

    return this.http.get<Order[]>(
      `${this.apiUrl}/my-orders`,
      {
        headers,
      },
    );
  }
}

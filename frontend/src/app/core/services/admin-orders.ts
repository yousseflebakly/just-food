
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminOrder {
  id: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  notes: string | null;
  status: string;
  totalPrice: string;
  createdAt: string;
  items: {
    id: number;
    productId: number;
    quantity: number;
    unitPrice: string;
    product: {
      id: number;
      name: string;
    };
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminOrdersService {
  private http = inject(HttpClient);

  getOrders(): Observable<AdminOrder[]> {
    const token = sessionStorage.getItem('admin_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });

    return this.http.get<AdminOrder[]>('/api/orders', { headers });
  }
  
updateOrderStatus(
  orderId: number,
  status: OrderStatus,
): Observable<AdminOrder> {
  const token = sessionStorage.getItem('admin_token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token ?? ''}`,
  });

  return this.http.patch<AdminOrder>(
    `/api/orders/${orderId}/status`,
    { status },
    { headers },
  );
}
}
export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';
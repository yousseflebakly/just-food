
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: string;
  image: string;
  category: string;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  categoryId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/products';

  // Customer Menu
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Admin Authentication Headers
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('admin_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }

  // Add Product
  createProduct(data: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(
      this.apiUrl,
      data,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // Edit Product
  updateProduct(
    id: number,
    data: CreateProductRequest
  ): Observable<Product> {
    return this.http.patch<Product>(
      `${this.apiUrl}/${id}`,
      data,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // Soft Delete Product
  softDeleteProduct(id: number): Observable<Product> {
    return this.http.delete<Product>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // Restore Product
  restoreProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(
      `${this.apiUrl}/${id}/restore`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }
}

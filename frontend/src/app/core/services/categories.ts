
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/categories';

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('admin_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getAdminCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.apiUrl}/admin/all`,
      { headers: this.getHeaders() }
    );
  }

  createCategory(name: string): Observable<Category> {
    return this.http.post<Category>(
      this.apiUrl,
      { name },
      { headers: this.getHeaders() }
    );
  }

  updateCategory(id: number, name: string): Observable<Category> {
    return this.http.patch<Category>(
      `${this.apiUrl}/${id}`,
      { name },
      { headers: this.getHeaders() }
    );
  }

  deleteCategory(id: number): Observable<Category> {
    return this.http.delete<Category>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  restoreCategory(id: number): Observable<Category> {
    return this.http.patch<Category>(
      `${this.apiUrl}/${id}/restore`,
      {},
      { headers: this.getHeaders() }
    );
  }
}

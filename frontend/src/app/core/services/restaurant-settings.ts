
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RestaurantSettings {
  id: number;
  name: string;
  description: string;
  logo: string;
  phone: string;
  address: string;
  openingTime: string;
  closingTime: string;
  deliveryFee: string;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRestaurantSettings {
  name: string;
  description: string;
  logo: string;
  phone: string;
  address: string;
  openingTime: string;
  closingTime: string;
  deliveryFee: number;
  isOpen: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantSettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/restaurant-settings';

  getSettings(): Observable<RestaurantSettings> {
    return this.http.get<RestaurantSettings>(this.apiUrl);
  }

  updateSettings(
    data: UpdateRestaurantSettings,
  ): Observable<RestaurantSettings> {
    const token = sessionStorage.getItem('admin_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });

    return this.http.patch<RestaurantSettings>(
      this.apiUrl,
      data,
      { headers },
    );
  }
}

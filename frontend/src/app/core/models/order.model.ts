
export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  notes: string;
  items: OrderItem[];
}

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

// Product details returned with each order item.
export interface OrderProduct {
  id: number;
  name: string;
  nameAr: string | null;
  image: string | null;
}

// Order item returned from the backend.
export interface OrderDetailsItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  product: OrderProduct;
}

// Customer order returned from GET /api/orders/my-orders.
export interface Order {
  id: number;
  status: OrderStatus;
  fullName: string;
  phoneNumber: string;
  address: string;
  notes: string | null;
  totalPrice: number | string;
  createdAt: string;
  updatedAt: string;
  items: OrderDetailsItem[];
}

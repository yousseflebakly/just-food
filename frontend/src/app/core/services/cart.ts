import { Injectable, computed, signal, effect, } from '@angular/core';

export interface CartProduct {
  id: number;
  name: string;
  nameAr?: string | null;
  price: number;
  image: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
 private readonly cartItems = signal<CartItem[]>(this.loadCart());

private loadCart(): CartItem[] {
  try {
    const savedCart = localStorage.getItem('just-food-cart');

    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
}
  readonly items = this.cartItems.asReadonly();

  readonly totalItems = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.quantity,
      0
    )
  );

  readonly totalPrice = computed(() =>
    this.cartItems().reduce(
      (total, item) =>
        total + item.product.price * item.quantity,
      0
    )
  );

  addToCart(product: CartProduct): void {
    this.cartItems.update((items) => {
      const existingItem = items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...items, { product, quantity: 1 }];
    });
  }
  increaseQuantity(productId: number): void {
  this.cartItems.update((items) =>
    items.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
}

decreaseQuantity(productId: number): void {
  this.cartItems.update((items) =>
    items
      .map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
}
    constructor() {
     effect(() => {
     localStorage.setItem(
      'just-food-cart',
      JSON.stringify(this.cartItems())
    );
  });
}

  removeFromCart(productId: number): void {
    this.cartItems.update((items) =>
      items.filter((item) => item.product.id !== productId)
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }
}

import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminOrdersService,
  AdminOrder,
   OrderStatus,
} from '../../../core/services/admin-orders';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit {
  private ordersService = inject(AdminOrdersService);
  private cdr = inject(ChangeDetectorRef);

  orders: AdminOrder[] = [];
  isLoading = true;
  errorMessage = '';
  
selectedOrder: AdminOrder | null = null;

openOrderDetails(order: AdminOrder): void {
  this.selectedOrder = order;
}

closeOrderDetails(): void {
  this.selectedOrder = null;
}

updatingOrderId: number | null = null;
statusMessage = '';
statusErrorMessage = '';

getNextStatus(status: string): OrderStatus | null {
  const transitions: Partial<Record<OrderStatus, OrderStatus>> = {
    PENDING: 'ACCEPTED',
    ACCEPTED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'DELIVERED',
  };

  return transitions[status as OrderStatus] ?? null;
}

getStatusButtonLabel(status: string): string {
  const labels: Partial<Record<OrderStatus, string>> = {
    PENDING: 'Accept Order',
    ACCEPTED: 'Start Preparing',
    PREPARING: 'Mark Ready',
    READY: 'Mark Delivered',
  };

  return labels[status as OrderStatus] ?? '';
}

updateStatus(order: AdminOrder): void {
  const nextStatus = this.getNextStatus(order.status);

  if (!nextStatus || this.updatingOrderId !== null) {
    return;
  }

  
  this.updatingOrderId = order.id;
  this.statusMessage = '';
  this.statusErrorMessage = '';

  this.ordersService.updateOrderStatus(order.id, nextStatus).subscribe({
    next: (updatedOrder) => {
      this.orders = this.orders.map((currentOrder) =>
        currentOrder.id === updatedOrder.id
          ? { ...currentOrder, status: updatedOrder.status }
          : currentOrder
      );

      if (this.selectedOrder?.id === updatedOrder.id) {
        this.selectedOrder = {
          ...this.selectedOrder,
          status: updatedOrder.status,
        };
      }

      this.updatingOrderId = null;
      this.statusMessage =
        `Order #${order.id} updated successfully to ${nextStatus}.`;

      this.cdr.markForCheck();
    },
    error: (error) => {
      this.updatingOrderId = null;
      this.statusErrorMessage =
        error.status === 401
          ? 'Session expired. Please sign in again.'
          : 'Failed to update order status. Please try again.';

      this.cdr.markForCheck();
    },
  });
}

cancelOrder(order: AdminOrder): void {
  if (
    !['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status) ||
    this.updatingOrderId !== null
  ) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to cancel Order #${order.id}?`
  );

  if (!confirmed) {
    return;
  }

  this.updatingOrderId = order.id;
  this.statusMessage = '';
  this.statusErrorMessage = '';

  this.ordersService.updateOrderStatus(order.id, 'CANCELLED').subscribe({
    next: (updatedOrder) => {
      this.orders = this.orders.map((currentOrder) =>
        currentOrder.id === updatedOrder.id
          ? { ...currentOrder, status: updatedOrder.status }
          : currentOrder
      );

      if (this.selectedOrder?.id === updatedOrder.id) {
        this.selectedOrder = {
          ...this.selectedOrder,
          status: updatedOrder.status,
        };
      }

      this.updatingOrderId = null;
      this.statusMessage = `Order #${order.id} cancelled successfully.`;
      this.cdr.markForCheck();
    },
    error: (error) => {
      this.updatingOrderId = null;
      this.statusErrorMessage =
        error.status === 401
          ? 'Session expired. Please sign in again.'
          : 'Failed to cancel order. Please try again.';

      this.cdr.markForCheck();
    },
  });
}


  
searchTerm = '';
selectedStatus = 'ALL';
currentPage = 1;
pageSize = 10;

get filteredOrders(): AdminOrder[] {
  const search = this.searchTerm.trim().toLowerCase();

  return this.orders.filter((order) => {
    const matchesSearch =
      !search ||
      order.id.toString().includes(search) ||
      order.fullName.toLowerCase().includes(search) ||
      order.phoneNumber.includes(search);

    const matchesStatus =
      this.selectedStatus === 'ALL' ||
      order.status === this.selectedStatus;

    return matchesSearch && matchesStatus;
  });
}

get totalPages(): number {
  return Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize));
}

get paginatedOrders(): AdminOrder[] {
  const page = Math.min(this.currentPage, this.totalPages);
  const startIndex = (page - 1) * this.pageSize;

  return this.filteredOrders.slice(
    startIndex,
    startIndex + this.pageSize
  );
}

changePage(page: number): void {
  if (page < 1 || page > this.totalPages) {
    return;
  }
  
  this.currentPage = page;
}



  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.status === 401
            ? 'Your session has expired. Please sign in again.'
            : 'Failed to load orders. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }
  
resetPagination(): void {
  this.currentPage = 1;
}

}

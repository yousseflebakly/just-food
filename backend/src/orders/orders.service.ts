
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '../generated/prisma/client';
import { OrderStatus } from '../generated/prisma/enums';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createOrderDto: CreateOrderDto,
    customerId: number,
  ) {
    const { fullName, phoneNumber, address, notes, items } =
      createOrderDto;

    // Require an authenticated customer.
    if (!Number.isInteger(customerId) || customerId <= 0) {
      throw new UnauthorizedException(
        'Customer login is required to place an order.',
      );
    }

    if (!items?.length) {
      throw new BadRequestException(
        'Order must contain at least one item.',
      );
    }

    if (
      items.some(
        (item) =>
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isInteger(item.productId) ||
          item.productId <= 0,
      )
    ) {
      throw new BadRequestException('Invalid order items.');
    }

    const productIds = [
      ...new Set(items.map((item) => item.productId)),
    ];

    return this.prisma.$transaction(async (tx) => {
      // Verify the customer still exists and is active.
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!customer || !customer.isActive) {
        throw new UnauthorizedException(
          'Customer account is invalid or inactive.',
        );
      }

      // Read restaurant settings from the database.
      const restaurantSettings =
        await tx.restaurantSettings.findFirst({
          orderBy: { id: 'asc' },
        });

      if (
        restaurantSettings &&
        !restaurantSettings.isOpen
      ) {
        throw new BadRequestException(
          'Restaurant is currently closed and cannot accept orders.',
        );
      }

      const deliveryFee = restaurantSettings
        ? restaurantSettings.deliveryFee
        : new Prisma.Decimal(0);

      // Only allow available, non-deleted products.
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isAvailable: true,
          isDeleted: false,
        },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException(
          'One or more products are unavailable.',
        );
      }

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

      let subtotal = new Prisma.Decimal(0);

      const orderItems = items.map((item) => {
        const product = productMap.get(item.productId)!;

        subtotal = subtotal.plus(
          product.price.mul(item.quantity),
        );

        return {
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        };
      });

      // Calculate the final total on the backend.
      const totalPrice = subtotal.plus(deliveryFee);

      return tx.order.create({
        data: {
          customer: {
            connect: {
              id: customer.id,
            },
          },
          fullName,
          phoneNumber,
          address,
          notes,
          totalPrice,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });
    });
  }

  // Customer: get only their own orders.
  async findByCustomerId(customerId: number) {
    if (!Number.isInteger(customerId) || customerId <= 0) {
      throw new UnauthorizedException(
        'Customer authentication is required.',
      );
    }

    return this.prisma.order.findMany({
      where: {
        customerId,
      },
      select: {
        id: true,
        status: true,
        fullName: true,
        phoneNumber: true,
        address: true,
        notes: true,
        totalPrice: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            unitPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Admin: get all orders.
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Admin: update order status.
  async updateStatus(
    id: number,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const allowedTransitions: Record<
      OrderStatus,
      OrderStatus[]
    > = {
      PENDING: [
        OrderStatus.ACCEPTED,
        OrderStatus.CANCELLED,
      ],
      ACCEPTED: [
        OrderStatus.PREPARING,
        OrderStatus.CANCELLED,
      ],
      PREPARING: [
        OrderStatus.READY,
        OrderStatus.CANCELLED,
      ],
      READY: [OrderStatus.DELIVERED],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (
      !allowedTransitions[order.status].includes(
        dto.status,
      )
    ) {
      throw new BadRequestException(
        `Cannot change order status from ${order.status} to ${dto.status}`,
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }
}

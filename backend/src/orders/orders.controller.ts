
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CustomerJwtGuard } from '../customer-auth/customer-jwt/customer-jwt.guard';
import type { CustomerRequest } from '../customer-auth/customer-jwt/customer-jwt.guard';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  // Customer: create a new order
  @Post()
  @UseGuards(CustomerJwtGuard)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: CustomerRequest,
  ) {
    const customerId = request.customer!.id;

    return this.ordersService.create(
      createOrderDto,
      customerId,
    );
  }

  // Customer: get their own orders
  @Get('my-orders')
  @UseGuards(CustomerJwtGuard)
  findMyOrders(
    @Req() request: CustomerRequest,
  ) {
    const customerId = request.customer!.id;

    return this.ordersService.findByCustomerId(customerId);
  }

  // Admin: get all orders
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.ordersService.findAll();
  }

  // Admin: update order status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}

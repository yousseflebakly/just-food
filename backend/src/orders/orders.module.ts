
import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { AuthModule } from '../auth/auth.module';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';

@Module({
  imports: [
    AuthModule,
    CustomerAuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

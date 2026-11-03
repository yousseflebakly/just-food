import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { RestaurantSettingsModule } from './restaurant-settings/restaurant-settings.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';

@Module({
  imports: [OrdersModule, PrismaModule, ProductsModule, AuthModule, CategoriesModule, RestaurantSettingsModule, CustomerAuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

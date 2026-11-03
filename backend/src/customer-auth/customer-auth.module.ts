
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerJwtGuard } from './customer-jwt/customer-jwt.guard';

const customerJwtSecret = process.env.CUSTOMER_JWT_SECRET;

if (!customerJwtSecret) {
  throw new Error(
    'CUSTOMER_JWT_SECRET is missing from environment variables',
  );
}

@Module({
  imports: [
    JwtModule.register({
      secret: customerJwtSecret,
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [
    CustomerAuthService,
    CustomerJwtGuard,
  ],
  exports: [
    CustomerAuthService,
    CustomerJwtGuard,
    JwtModule,
  ],
})
export class CustomerAuthModule {}

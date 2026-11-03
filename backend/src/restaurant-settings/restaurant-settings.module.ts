
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

import { RestaurantSettingsController } from './restaurant-settings.controller';
import { RestaurantSettingsService } from './restaurant-settings.service';

@Module({
  imports: [AuthModule, JwtModule],
  controllers: [RestaurantSettingsController],
  providers: [RestaurantSettingsService],
})
export class RestaurantSettingsModule {}

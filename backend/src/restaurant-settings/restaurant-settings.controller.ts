
import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RestaurantSettingsService } from './restaurant-settings.service';

class UpdateRestaurantSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  openingTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  closingTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}

@Controller('restaurant-settings')
export class RestaurantSettingsController {
  constructor(
    private readonly restaurantSettingsService: RestaurantSettingsService,
  ) {}

  @Get()
  getSettings() {
    return this.restaurantSettingsService.getSettings();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateSettings(
    @Body(      
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    data: UpdateRestaurantSettingsDto,
  ) {
    return this.restaurantSettingsService.updateSettings(data);
  }
}


import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateRestaurantSettingsDto {
  name?: string;
  description?: string;
  logo?: string;
  phone?: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  deliveryFee?: number;
  isOpen?: boolean;
}

@Injectable()
export class RestaurantSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const existing = await this.prisma.restaurantSettings.findFirst({
      orderBy: { id: 'asc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.restaurantSettings.create({
      data: {
        name: 'Just Food',
        description: '',
        logo: '',
        phone: '',
        address: '',
        openingTime: '10:00',
        closingTime: '23:00',
        deliveryFee: 0,
        isOpen: true,
      },
    });
  }

  async updateSettings(data: UpdateRestaurantSettingsDto) {
    const settings = await this.getSettings();

    if (
      data.deliveryFee !== undefined &&
      (!Number.isFinite(data.deliveryFee) || data.deliveryFee < 0)
    ) {
      throw new BadRequestException(
        'Delivery fee must be a valid non-negative number',
      );
    }

    return this.prisma.restaurantSettings.update({
      where: { id: settings.id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.description !== undefined && {
          description: data.description.trim(),
        }),
        ...(data.logo !== undefined && { logo: data.logo.trim() }),
        ...(data.phone !== undefined && { phone: data.phone.trim() }),
        ...(data.address !== undefined && { address: data.address.trim() }),
        ...(data.openingTime !== undefined && {
          openingTime: data.openingTime,
        }),
        ...(data.closingTime !== undefined && {
          closingTime: data.closingTime,
        }),
        ...(data.deliveryFee !== undefined && {
          deliveryFee: data.deliveryFee,
        }),
        ...(data.isOpen !== undefined && { isOpen: data.isOpen }),
      },
    });
  }
}

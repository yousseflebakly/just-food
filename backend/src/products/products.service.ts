
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      where: {
        isAvailable: true,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForAdmin() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  private async resolveCategory(data: CreateProductDto) {
    if (data.categoryId !== undefined) {
      const selected = await this.prisma.category.findFirst({
        where: {
          id: data.categoryId,
          isActive: true,
        },
      });

      if (!selected) {
        throw new BadRequestException(
          'Selected category does not exist or is inactive',
        );
      }

      return selected;
    }

    const name = data.category.trim();

    if (!name) {
      throw new BadRequestException('Category is required');
    }

    // Keep existing Frontend compatible.
    // Automatically create a category if needed.
    return this.prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  async createProduct(data: CreateProductDto) {
    const category = await this.resolveCategory(data);

    return this.prisma.product.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        price: data.price,
        image: data.image,
        category: category.name,
        categoryId: category.id,
        isAvailable: data.isAvailable ?? true,
      },
    });
  }

  async updateProduct(id: number, data: CreateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct || existingProduct.isDeleted) {
      throw new NotFoundException(
        `Product with ID ${id} not found`,
      );
    }

    const category = await this.resolveCategory(data);

    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        price: data.price,
        image: data.image,
        category: category.name,
        categoryId: category.id,
        isAvailable: data.isAvailable,
      },
    });
  }

  async softDeleteProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product || product.isDeleted) {
      throw new NotFoundException(
        `Product with ID ${id} not found`,
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async restoreProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product || !product.isDeleted) {
      throw new NotFoundException(
        `Deleted product with ID ${id} not found`,
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: false },
    });
  }
}

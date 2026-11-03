
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAllForAdmin() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async create(name: string) {
    const cleanName = this.validateName(name);

    const existing = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: cleanName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Category already exists. You can restore it if inactive.',
      );
    }

    return this.prisma.category.create({
      data: {
        name: cleanName,
        isActive: true,
      },
    });
  }

  async update(id: number, name: string) {
    const cleanName = this.validateName(name);

    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const duplicate = await this.prisma.category.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: cleanName,
          mode: 'insensitive',
        },
      },
    });

    if (duplicate) {
      throw new ConflictException('Category already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.category.update({
        where: { id },
        data: { name: cleanName },
      });

      await tx.product.updateMany({
        where: { categoryId: id },
        data: { category: cleanName },
      });

      return updatedCategory;
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async restore(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: { isActive: true },
    });
  }

  private validateName(name: unknown): string {
    if (typeof name !== 'string') {
      throw new BadRequestException('Category name is required');
    }

    const cleanName = name.trim();

    if (!cleanName || cleanName.length > 100) {
      throw new BadRequestException(
        'Category name must be between 1 and 100 characters',
      );
    }

    return cleanName;
  }
}

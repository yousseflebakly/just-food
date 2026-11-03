
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  // Customer - Active Categories
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // Admin - All Categories
  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAllForAdmin() {
    return this.categoriesService.findAllForAdmin();
  }

  // Admin - Create Category
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body('name') name: string) {
    return this.categoriesService.create(name);
  }

  // Admin - Update Category
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') name: string,
  ) {
    return this.categoriesService.update(id, name);
  }

  // Admin - Soft Delete Category
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }

  // Admin - Restore Category
  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.restore(id);
  }
}


import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';

const allowedImageTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  // Customer - Available Products
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // Admin - All Products Including Deleted
  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAllForAdmin() {
    return this.productsService.findAllForAdmin();
  }

  // Admin - Upload Product Image
  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const extension = allowedImageTypes.get(file.mimetype);

          if (!extension) {
            return callback(
              new BadRequestException(
                'Only JPG, PNG and WebP images are allowed.',
              ),
              '',
            );
          }

          callback(null, `${randomUUID()}${extension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (_req, file, callback) => {
        if (!allowedImageTypes.has(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only JPG, PNG and WebP images are allowed.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Please select an image.');
    }

    return {
      message: 'Image uploaded successfully.',
      imageUrl: `/uploads/${file.filename}`,
    };
  }

  // Admin - Create Product
  @UseGuards(JwtAuthGuard)
  @Post()
  createProduct(@Body() data: CreateProductDto) {
    return this.productsService.createProduct(data);
  }

  // Admin - Update Product
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateProductDto,
  ) {
    return this.productsService.updateProduct(id, data);
  }

  // Admin - Soft Delete Product
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  softDeleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.softDeleteProduct(id);
  }

  // Admin - Restore Deleted Product
  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  restoreProduct(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.restoreProduct(id);
  }
}

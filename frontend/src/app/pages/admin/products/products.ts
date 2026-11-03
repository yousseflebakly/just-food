
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  ProductsService,
  CreateProductRequest,
} from '../../../core/services/products';

import {
  CategoriesService,
  Category,
} from '../../../core/services/categories';

interface AdminProduct {
  id: number;
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: string;
  image: string;
  category: string;
  categoryId?: number | null;
  isAvailable: boolean;
  isDeleted: boolean;
}

interface UploadImageResponse {
  message: string;
  imageUrl: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  products: AdminProduct[] = [];
  categories: Category[] = [];

  selectedCategoryId: number | null = null;

  priceOptions: number[] = Array.from(
    { length: 21 },
    (_, index) => index * 25,
  );

  isLoading = true;
  isSavingProduct = false;
  isUpdatingProduct = false;
  isUploadingImage = false;
  isAddProductFormOpen = false;

  editingProductId: number | null = null;

  errorMessage = '';
  successMessage = '';
  formErrorMessage = '';

  newProduct: CreateProductRequest = this.getEmptyProduct();

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  get activeProducts(): AdminProduct[] {
    return this.products.filter((product) => !product.isDeleted);
  }

  get deletedProducts(): AdminProduct[] {
    return this.products.filter((product) => product.isDeleted);
  }

  private getEmptyProduct(): CreateProductRequest {
    return {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      price: 0,
      image: '',
      category: '',
      isAvailable: true,
    };
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.markForCheck();
      },
      error: () => {
        this.formErrorMessage = 'Failed to load categories.';
        this.cdr.markForCheck();
      },
    });
  }

  openAddProductForm(): void {
    if (this.isUploadingImage || this.isSavingProduct) {
      return;
    }

    this.editingProductId = null;
    this.newProduct = this.getEmptyProduct();
    this.selectedCategoryId = null;
    this.formErrorMessage = '';
    this.successMessage = '';
    this.isAddProductFormOpen = true;
  }

  openEditProductForm(product: AdminProduct): void {
    if (
      product.isDeleted ||
      this.isUpdatingProduct ||
      this.isUploadingImage ||
      this.isSavingProduct
    ) {
      return;
    }

    this.editingProductId = product.id;

    this.newProduct = {
      name: product.name,
      nameAr: product.nameAr ?? '',
      description: product.description,
      descriptionAr: product.descriptionAr ?? '',
      price: Number(product.price),
      image: product.image,
      category: product.category,
      isAvailable: product.isAvailable,
    };

    this.selectedCategoryId =
      product.categoryId ??
      this.categories.find(
        (category) => category.name === product.category,
      )?.id ??
      null;

    this.formErrorMessage = '';
    this.successMessage = '';
    this.isAddProductFormOpen = true;
  }

  closeAddProductForm(): void {
    if (this.isSavingProduct || this.isUploadingImage) {
      return;
    }

    this.isAddProductFormOpen = false;
    this.editingProductId = null;
    this.selectedCategoryId = null;
    this.formErrorMessage = '';
  }

  // Resolve image URLs for the frontend.
  getImageUrl(image: string): string {
    if (!image) {
      return '';
    }

    if (
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('data:')
    ) {
      return image;
    }

    if (image.startsWith('/uploads/')) {
  return image;
}

    return image;
  }

  // Upload a product image from the admin device.
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || this.isUploadingImage || this.isSavingProduct) {
      return;
    }

    this.formErrorMessage = '';

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.formErrorMessage =
        'Only JPG, PNG and WebP images are allowed.';
      input.value = '';
      this.cdr.markForCheck();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.formErrorMessage =
        'Image size must not exceed 5MB.';
      input.value = '';
      this.cdr.markForCheck();
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = sessionStorage.getItem('admin_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });

    this.isUploadingImage = true;

    this.http
      .post<UploadImageResponse>(
        '/api/products/upload-image',
        formData,
        { headers },
      )
      .subscribe({
        next: (response) => {
          this.newProduct.image = response.imageUrl;
          this.isUploadingImage = false;
          input.value = '';
          this.cdr.markForCheck();
        },

        error: (error) => {
          this.isUploadingImage = false;

          this.formErrorMessage =
            error.status === 401
              ? 'Your session has expired. Please sign in again.'
              : error.status === 413
                ? 'Image is too large. Maximum size is 5MB.'
                : 'Failed to upload image. Please try again.';

          input.value = '';
          this.cdr.markForCheck();
        },
      });
  }

  saveProduct(): void {
    if (this.isSavingProduct || this.isUploadingImage) {
      return;
    }

    this.formErrorMessage = '';
    this.successMessage = '';

    const selectedCategory = this.categories.find(
      (category) => category.id === Number(this.selectedCategoryId),
    );

    const product: CreateProductRequest & { categoryId?: number } = {
      name: this.newProduct.name.trim(),
      nameAr: this.newProduct.nameAr?.trim() ?? '',
      description: this.newProduct.description.trim(),
      descriptionAr: this.newProduct.descriptionAr?.trim() ?? '',
      price: Number(this.newProduct.price),
      image: this.newProduct.image.trim(),
      category: selectedCategory?.name ?? '',
      categoryId: selectedCategory?.id,
      isAvailable: this.newProduct.isAvailable,
    };

    if (
      !product.name ||
      !product.description ||
      !product.image ||
      !selectedCategory ||
      !Number.isFinite(product.price) ||
      product.price <= 0
    ) {
      this.formErrorMessage =
        'Please complete all fields, select a category, and enter a valid price.';
      this.cdr.markForCheck();
      return;
    }

    this.isSavingProduct = true;

    const editingId = this.editingProductId;

    const request$ =
      editingId !== null
        ? this.productsService.updateProduct(editingId, product)
        : this.productsService.createProduct(product);

    request$.subscribe({
      next: () => {
        this.isSavingProduct = false;
        this.isAddProductFormOpen = false;
        this.editingProductId = null;
        this.selectedCategoryId = null;
        this.newProduct = this.getEmptyProduct();

        this.successMessage =
          editingId !== null
            ? 'Product updated successfully!'
            : 'Product added successfully!';

        this.loadProducts();
        this.cdr.markForCheck();
      },

      error: (error) => {
        this.isSavingProduct = false;

        this.formErrorMessage =
          error.status === 401
            ? 'Your session has expired. Please sign in again.'
            : error.status === 404
              ? 'Product not found. Please refresh the page.'
              : 'Failed to save product. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }

  softDeleteProduct(product: AdminProduct): void {
    if (this.isUpdatingProduct || product.isDeleted) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?\n\nYou can restore it later.`,
    );

    if (!confirmed) {
      return;
    }

    this.isUpdatingProduct = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productsService.softDeleteProduct(product.id).subscribe({
      next: () => {
        this.isUpdatingProduct = false;
        this.successMessage =
          `"${product.name}" moved to Deleted Products.`;

        this.loadProducts();
        this.cdr.markForCheck();
      },

      error: (error) => {
        this.isUpdatingProduct = false;
        this.errorMessage =
          error.status === 401
            ? 'Your session has expired. Please sign in again.'
            : 'Failed to delete product. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }

  restoreProduct(product: AdminProduct): void {
    if (this.isUpdatingProduct || !product.isDeleted) {
      return;
    }

    this.isUpdatingProduct = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productsService.restoreProduct(product.id).subscribe({
      next: () => {
        this.isUpdatingProduct = false;
        this.successMessage =
          `"${product.name}" restored successfully!`;

        this.loadProducts();
        this.cdr.markForCheck();
      },

      error: (error) => {
        this.isUpdatingProduct = false;
        this.errorMessage =
          error.status === 401
            ? 'Your session has expired. Please sign in again.'
            : 'Failed to restore product. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const token = sessionStorage.getItem('admin_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });

    this.http
      .get<AdminProduct[]>('/api/products/admin/all', { headers })
      .subscribe({
        next: (products) => {
          this.products = products;
          this.isLoading = false;
          this.cdr.markForCheck();
        },

        error: (error) => {
          this.isLoading = false;

          this.errorMessage =
            error.status === 401
              ? 'Your session has expired. Please sign in again.'
              : 'Failed to load products. Please try again.';

          this.cdr.markForCheck();
        },
      });
  }
}

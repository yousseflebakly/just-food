
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CategoriesService,
  Category,
} from '../../../core/services/categories';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  isLoading = true;
  isSaving = false;

  categoryName = '';
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  get activeCategories(): Category[] {
    return this.categories.filter((category) => category.isActive);
  }

  get inactiveCategories(): Category[] {
    return this.categories.filter((category) => !category.isActive);
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.categoriesService.getAdminCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load categories.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  saveCategory(): void {
    const name = this.categoryName.trim();

    if (!name) {
      this.errorMessage = 'Category name is required.';
      return;
    }

    if (this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request =
      this.editingId === null
        ? this.categoriesService.createCategory(name)
        : this.categoriesService.updateCategory(this.editingId, name);

    request.subscribe({
      next: () => {
        this.successMessage =
          this.editingId === null
            ? 'Category added successfully.'
            : 'Category updated successfully.';

        this.cancelEdit();
        this.isSaving = false;
        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to save category.';
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  editCategory(category: Category): void {
    this.editingId = category.id;
    this.categoryName = category.name;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.categoryName = '';
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Deactivate "${category.name}"?`)) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.categoriesService.deleteCategory(category.id).subscribe({
      next: () => {
        this.successMessage = 'Category deactivated successfully.';
        this.loadCategories();
      },
      error: () => {
        this.errorMessage = 'Failed to deactivate category.';
        this.cdr.detectChanges();
      },
    });
  }

  restoreCategory(category: Category): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.categoriesService.restoreCategory(category.id).subscribe({
      next: () => {
        this.successMessage = 'Category restored successfully.';
        this.loadCategories();
      },
      error: () => {
        this.errorMessage = 'Failed to restore category.';
        this.cdr.detectChanges();
      },
    });
  }
}

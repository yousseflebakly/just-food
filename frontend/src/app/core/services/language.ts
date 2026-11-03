
import { Injectable, signal, inject, DOCUMENT } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  readonly currentLanguage = signal<Language>('en');

  constructor() {
    const savedLanguage = localStorage.getItem('just-food-language');
    const language: Language = savedLanguage === 'ar' ? 'ar' : 'en';

    this.setLanguage(language);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.applyDocumentDirection());
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);

    this.applyDocumentDirection();

    localStorage.setItem('just-food-language', language);
  }

  private applyDocumentDirection(): void {
    const isAdmin = this.router.url.startsWith('/admin') ||
      this.document.location?.pathname.startsWith('/admin');
    this.document.documentElement.lang = isAdmin ? 'en' : this.currentLanguage();
    this.document.documentElement.dir = isAdmin ? 'ltr' :
      (this.currentLanguage() === 'ar' ? 'rtl' : 'ltr');
  }

  private readonly translations: Record<string, { en: string; ar: string }> = {
    'nav.home': { en: 'Home', ar: 'الرئيسية' },
    'nav.menu': { en: 'Menu', ar: 'قائمة الطعام' },
    'nav.cart': { en: 'Cart', ar: 'السلة' },
    'footer.rights': { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },
    'home.badge': { en: 'Fresh & Delicious', ar: 'طازج ولذيذ' },
    'home.title': { en: 'Delicious Food,', ar: 'أكل لذيذ،' },
    'home.subtitle': { en: 'Delivered Fresh.', ar: 'يوصلك طازج.' },
    'home.description': { en: 'Discover your favorite meals, freshly prepared with the finest ingredients and delivered straight to your door.', ar: 'اكتشف وجباتك المفضلة المحضّرة بأجود المكونات وتوصلك لحد باب بيتك.' },
    'home.order': { en: 'Order Now', ar: 'اطلب الآن' },
    'home.explore': { en: 'Explore More', ar: 'اكتشف المزيد' },
    'menu.badge': { en: 'Our Specialties', ar: 'أطباقنا المميزة' },
    'menu.title': { en: 'Explore Our Menu 🍔', ar: 'اكتشف قائمة الطعام 🍔' },
    'menu.description': { en: 'Discover our delicious meals, freshly prepared with quality ingredients.', ar: 'اكتشف وجباتنا اللذيذة المحضّرة بمكونات عالية الجودة.' },
    'menu.loading': { en: 'Loading products...', ar: 'جارٍ تحميل المنتجات...' },
    'menu.error': { en: 'Unable to load products. Please try again.', ar: 'تعذّر تحميل المنتجات. حاول مرة أخرى.' },
    'menu.empty': { en: 'No products available.', ar: 'لا توجد منتجات متاحة.' },
    'menu.add': { en: 'Add to Cart', ar: 'أضف للسلة' },
    'menu.search': { en: 'Search for a product...', ar: 'ابحث عن منتج...' },
    'menu.noResults': { en: 'No products match your search.', ar: 'لا توجد منتجات مطابقة لبحثك.' },
    'common.currency': { en: 'EGP', ar: 'ج.م' },
    'common.price': { en: 'Price:', ar: 'السعر:' },
    'common.remove': { en: 'Remove', ar: 'حذف' },
    'common.quantity': { en: 'Quantity:', ar: 'الكمية:' },
    'common.loading': { en: 'Loading...', ar: 'جارٍ التحميل...' },
    'common.decrease': { en: 'Decrease quantity', ar: 'تقليل الكمية' },
    'common.increase': { en: 'Increase quantity', ar: 'زيادة الكمية' },
    'cart.title': { en: 'Your Shopping Cart', ar: 'سلة التسوق' },
    'cart.subtitle': { en: 'Review your items before checkout.', ar: 'راجع منتجاتك قبل إتمام الطلب.' },
    'cart.emptyTitle': { en: 'Your cart is empty!', ar: 'سلتك فاضية!' },
    'cart.emptyText': { en: 'Looks like you haven\'t added any food yet.', ar: 'لسه ما أضفتش أي أكل للسلة.' },
    'cart.browse': { en: 'Browse Menu', ar: 'تصفح المنيو' },
    'cart.summary': { en: 'Order Summary', ar: 'ملخص الطلب' },
    'cart.totalItems': { en: 'Total Items:', ar: 'عدد المنتجات:' },
    'cart.total': { en: 'Total:', ar: 'الإجمالي:' },
    'cart.checkout': { en: 'Proceed to Checkout →', ar: 'المتابعة لإتمام الطلب ←' },
    'checkout.title': { en: 'Checkout 🛒', ar: 'إتمام الطلب 🛒' },
    'checkout.subtitle': { en: 'Complete your details to place your order.', ar: 'أكمل بياناتك لتأكيد طلبك.' },
    'checkout.deliveryInfo': { en: 'Delivery Information', ar: 'بيانات التوصيل' },
    'checkout.checkingStatus': { en: 'Checking restaurant availability...', ar: 'جارٍ التحقق من حالة المطعم...' },
    'checkout.closed': { en: 'Restaurant Closed', ar: 'المطعم مغلق' },
    'checkout.closedInfo': { en: 'We\'re currently not accepting new orders. Please check back later.', ar: 'لا نستقبل طلبات جديدة حاليًا. حاول مرة أخرى لاحقًا.' },
    'checkout.open': { en: 'Restaurant Open', ar: 'المطعم مفتوح' },
    'checkout.openInfo': { en: 'We\'re currently accepting orders.', ar: 'نستقبل الطلبات حاليًا.' },
    'checkout.fullName': { en: 'Full Name', ar: 'الاسم بالكامل' },
    'checkout.namePlaceholder': { en: 'Enter your full name', ar: 'اكتب اسمك بالكامل' },
    'checkout.nameError': { en: 'Please enter a valid name (at least 3 characters).', ar: 'من فضلك اكتب اسمًا صحيحًا (3 أحرف على الأقل).' },
    'checkout.phone': { en: 'Phone Number', ar: 'رقم الهاتف' },
    'checkout.phoneError': { en: 'Please enter a valid Egyptian phone number.', ar: 'من فضلك اكتب رقم موبايل مصري صحيح.' },
    'checkout.address': { en: 'Delivery Address', ar: 'عنوان التوصيل' },
    'checkout.addressPlaceholder': { en: 'Street, building number, apartment, area...', ar: 'الشارع، رقم العمارة، الشقة، المنطقة...' },
    'checkout.addressError': { en: 'Please enter a delivery address (at least 10 characters).', ar: 'من فضلك اكتب عنوان توصيل واضح (10 أحرف على الأقل).' },
    'checkout.notes': { en: 'Order Notes (Optional)', ar: 'ملاحظات الطلب (اختياري)' },
    'checkout.notesPlaceholder': { en: 'Any special instructions?', ar: 'أي تعليمات خاصة؟' },
    'checkout.placing': { en: 'Placing Order...', ar: 'جارٍ إرسال الطلب...' },
    'checkout.checking': { en: 'Checking Availability...', ar: 'جارٍ التحقق من الإتاحة...' },
    'checkout.place': { en: 'Place Order', ar: 'تأكيد الطلب' },
    'checkout.emptyWarning': { en: 'Your cart is empty. Please add products before placing an order.', ar: 'السلة فارغة. أضف منتجات قبل تأكيد الطلب.' },
    'checkout.empty': { en: 'Your cart is empty.', ar: 'السلة فارغة.' },
    'checkout.addFirst': { en: 'Please add some delicious food first!', ar: 'أضف بعض الوجبات أولًا!' },
    'checkout.totalItems': { en: 'Total Items', ar: 'عدد المنتجات' },
    'checkout.subtotal': { en: 'Products Subtotal', ar: 'إجمالي المنتجات' },
    'checkout.deliveryFee': { en: 'Delivery Fee', ar: 'رسوم التوصيل' },
    'checkout.finalTotal': { en: 'Final Total', ar: 'الإجمالي النهائي' },
    'checkout.calculating': { en: 'Calculating...', ar: 'جارٍ الحساب...' },
    'checkout.totalNote': { en: 'Final amount is confirmed when your order is placed.', ar: 'يتم تأكيد المبلغ النهائي عند إرسال الطلب.' },
    'checkout.settingsError': { en: 'Unable to load restaurant settings. Please refresh the page.', ar: 'تعذّر تحميل إعدادات المطعم. حدّث الصفحة.' },
    'checkout.closedError': { en: 'Restaurant is currently closed and cannot accept orders.', ar: 'المطعم مغلق حاليًا ولا يمكنه استقبال الطلبات.' },
    'checkout.cartError': { en: 'Your cart is empty.', ar: 'السلة فارغة.' },
    'checkout.success': { en: 'Your order has been placed successfully!', ar: 'تم إرسال طلبك بنجاح!' },
    'checkout.orderError': { en: 'Unable to place your order. Please check your cart.', ar: 'تعذّر إرسال الطلب. راجع السلة وحاول مرة أخرى.' },
    'checkout.retryError': { en: 'Unable to place your order. Please try again later.', ar: 'تعذّر إرسال الطلب. حاول مرة أخرى لاحقًا.' },
  };

  translate(key: string): string {
    const item = this.translations[key];
    return item ? item[this.currentLanguage()] : key;
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLanguage() === 'en' ? 'ar' : 'en');
  }
}

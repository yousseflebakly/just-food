/** Bilingual catalog presentation. Saved Arabic fields always take priority.
 * Legacy fallbacks are only for products whose translations are not yet saved.
 */
const legacyArabicNames: Record<string, string> = {
  'chicken burger': 'برجر دجاج',
  'cheese burger': 'تشيز برجر',
  'cheeseburger': 'تشيز برجر',
  'classic burger': 'برجر كلاسيك',
  'double burger': 'دبل برجر',
};

const legacyArabicDescriptions: Record<string, string> = {
  'crispy chicken burger with lettuce and mayonnaise': 'برجر دجاج مقرمش مع الخس والمايونيز',
  'double beef patties with cheese and special sauce': 'قطعتان من اللحم البقري مع الجبنة والصوص الخاص',
  'beef burger with melted cheddar cheese and fresh vegetables': 'برجر لحم بقري مع جبنة شيدر سايحة وخضار طازج',
  'juicy beef burger with cheese, lettuce and special sauce': 'برجر لحم بقري طري مع الجبنة والخس والصوص الخاص',
};

const legacyArabicCategories: Record<string, string> = {
  burgers: 'برجر',
  burger: 'برجر',
  drinks: 'مشروبات',
  drink: 'مشروبات',
  sides: 'أطباق جانبية',
  desserts: 'حلويات',
  pizza: 'بيتزا',
  sandwiches: 'ساندوتشات',
};

function normalize(value: string): string {
  return (value ?? '').trim().replace(/[.!]+$/, '').replace(/\s+/g, ' ').toLowerCase();
}

export function localizedProductName(product: { name: string; nameAr?: string | null }, language: string): string {
  if (language !== 'ar') return product.name;
  return product.nameAr?.trim() || legacyArabicNames[normalize(product.name)] || product.name;
}

export function localizedProductDescription(product: { description: string; descriptionAr?: string | null }, language: string): string {
  if (language !== 'ar') return product.description;
  return product.descriptionAr?.trim() || legacyArabicDescriptions[normalize(product.description)] || product.description;
}

export function localizedCategory(category: string, language: string): string {
  if (language !== 'ar') return category;
  return legacyArabicCategories[normalize(category)] || category;
}

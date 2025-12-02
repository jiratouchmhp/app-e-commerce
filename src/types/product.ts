import type { Product, Category } from '@prisma/client'

export type { Product, Category }

export interface ProductWithCategory extends Product {
  category: Category
}

export interface ProductFilters {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest'
}

export interface PaginatedProducts {
  products: ProductWithCategory[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

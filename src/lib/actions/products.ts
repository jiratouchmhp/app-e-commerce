'use server'

import { prisma } from '@/lib/db/prisma'
import { productFiltersSchema } from '@/lib/validations/product'
import type { ProductWithCategory, PaginatedProducts } from '@/types/product'
import { PRODUCTS_PER_PAGE } from '@/lib/constants'

/**
 * Get all products with optional filtering and pagination
 */
export async function getProducts(
  filters?: Record<string, string | string[] | undefined>
): Promise<PaginatedProducts> {
  try {
    // Validate and parse filters
    const validatedFilters = productFiltersSchema.parse({
      categoryId: filters?.categoryId,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
      search: filters?.search,
      sortBy: filters?.sortBy,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || PRODUCTS_PER_PAGE,
    })

    // Build where clause
    const where = {
      ...(validatedFilters.categoryId && { categoryId: validatedFilters.categoryId }),
      ...(validatedFilters.search && {
        OR: [
          { name: { contains: validatedFilters.search, mode: 'insensitive' as const } },
          { description: { contains: validatedFilters.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(validatedFilters.minPrice &&
        validatedFilters.maxPrice && {
          price: {
            gte: validatedFilters.minPrice,
            lte: validatedFilters.maxPrice,
          },
        }),
    }

    // Build orderBy clause
    let orderBy = {}
    switch (validatedFilters.sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'name-asc':
        orderBy = { name: 'asc' }
        break
      case 'name-desc':
        orderBy = { name: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        take: validatedFilters.pageSize,
        skip: (validatedFilters.page - 1) * validatedFilters.pageSize,
      }),
      prisma.product.count({ where }),
    ])

    return {
      products: products as ProductWithCategory[],
      total,
      page: validatedFilters.page,
      pageSize: validatedFilters.pageSize,
      totalPages: Math.ceil(total / validatedFilters.pageSize),
    }
  } catch (error) {
    console.error('Get products error:', error)
    return {
      products: [],
      total: 0,
      page: 1,
      pageSize: PRODUCTS_PER_PAGE,
      totalPages: 0,
    }
  }
}

/**
 * Get a single product by ID or slug
 */
export async function getProduct(
  idOrSlug: string
): Promise<ProductWithCategory | null> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
      },
    })

    return product as ProductWithCategory | null
  } catch (error) {
    console.error('Get product error:', error)
    return null
  }
}

/**
 * Get all categories
 */
export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return []
  }
}

/**
 * Get related products by category (excluding current product)
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
): Promise<ProductWithCategory[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
      },
      include: {
        category: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return products as ProductWithCategory[]
  } catch (error) {
    console.error('Get related products error:', error)
    return []
  }
}

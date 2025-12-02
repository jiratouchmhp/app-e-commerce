# Product Catalog Pattern

## Overview

Product listing and detail pages with filtering, search, and SEO optimization.

## When to Use

- Displaying product collections
- Product detail pages with images and information
- Search and filtering functionality
- SEO-optimized product pages

## Implementation

### Product Listing Page

```typescript
// app/(shop)/products/page.tsx
import { Suspense } from 'react'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductFilters } from '@/components/products/product-filters'
import { ProductGridSkeleton } from '@/components/products/product-grid-skeleton'
import { getProducts } from '@/lib/actions/products'

interface ProductsPageProps {
  searchParams: {
    category?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductsContent searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const products = await getProducts({
    category: searchParams.category,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    sort: searchParams.sort,
    page: searchParams.page ? Number(searchParams.page) : 1,
  })

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    )
  }

  return <ProductGrid products={products} />
}
```

### Product Detail Page

```typescript
// app/(shop)/products/[id]/page.tsx
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductImages } from '@/components/products/product-images'
import { AddToCartButton } from '@/components/products/add-to-cart-button'
import { RelatedProducts } from '@/components/products/related-products'
import { getProduct } from '@/lib/actions/products'

interface ProductPageProps {
  params: { id: string }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <ProductImages images={product.images} alt={product.name} />

        {/* Info */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {product.name}
          </h1>
          
          <p className="text-3xl font-bold mb-6">
            ${product.price.toFixed(2)}
          </p>

          {/* Add to Cart */}
          <div className="mt-8">
            {product.stock > 0 ? (
              <AddToCartButton productId={product.id} />
            ) : (
              <p className="text-destructive font-medium">Out of Stock</p>
            )}
          </div>

          {/* Product Details */}
          <div className="mt-8 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <RelatedProducts productId={product.id} categoryId={product.categoryId} />
        </Suspense>
      </section>
    </div>
  )
}
```

### Get Products Server Action

```typescript
// lib/actions/products.ts
'use server'

import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const getProductsSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
})

export async function getProducts(input: unknown) {
  try {
    const params = getProductsSchema.parse(input)
    
    // Build where clause
    const where = {
      ...(params.category && { categoryId: params.category }),
      ...(params.minPrice && { price: { gte: params.minPrice } }),
      ...(params.maxPrice && { price: { ...where.price, lte: params.maxPrice } }),
    }
    
    // Build orderBy clause
    const orderBy = params.sort
      ? params.sort.startsWith('price')
        ? { price: params.sort.endsWith('asc') ? 'asc' : 'desc' }
        : { name: params.sort.endsWith('asc') ? 'asc' : 'desc' }
      : { createdAt: 'desc' }
    
    // Fetch products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: params.limit,
      skip: (params.page - 1) * params.limit,
      include: {
        category: true,
      },
    })
    
    return products
  } catch (error) {
    console.error('Get products error:', error)
    return []
  }
}

export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })
    
    return product
  } catch (error) {
    console.error('Get product error:', error)
    return null
  }
}
```

### Product Card Component

```typescript
// components/products/product-card.tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Details */}
      <div className="p-4">
        <h3 className="font-semibold mb-1 truncate group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">
            ${product.price.toFixed(2)}
          </p>
          
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs text-warning">
              Only {product.stock} left
            </p>
          )}
          
          {product.stock === 0 && (
            <p className="text-xs text-destructive">
              Out of stock
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
```

### Product Search Component

```typescript
// components/products/product-search.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

export function ProductSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    
    router.push(`/products?${params.toString()}`)
  }, 300)

  useEffect(() => {
    handleSearch(query)
  }, [query, handleSearch])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full pl-10 pr-10 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  )
}
```

## Key Features

- **Server Components**: Product listing rendered on server for SEO
- **Streaming**: Use Suspense for progressive loading
- **SEO Optimization**: Dynamic metadata generation
- **Image Optimization**: Next.js Image component with proper sizing
- **Filtering**: Category, price range, and sorting
- **Search**: Debounced search with URL params
- **Related Products**: Show similar items
- **Stock Indicators**: Low stock warnings

## Performance Optimizations

- Parallel data fetching for independent queries
- Image lazy loading with blur placeholders
- ISR for product pages (revalidate every hour)
- Optimistic UI updates for cart actions

## Related Patterns

- [Cart Management](./cart-management.md) - Add to cart functionality
- [Authentication](./authentication.md) - User-specific features

---

**Last Updated:** November 24, 2025

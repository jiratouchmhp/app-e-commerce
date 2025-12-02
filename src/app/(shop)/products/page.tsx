import { Suspense } from 'react'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductFilters } from '@/components/products/product-filters'
import { SortSelect } from '@/components/products/sort-select'
import { Skeleton } from '@/components/ui/skeleton'
import { getProducts, getCategories } from '@/lib/actions/products'
import type { ProductFiltersInput } from '@/lib/validations/product'

interface ProductsPageProps {
  searchParams: {
    categoryId?: string
    minPrice?: string
    maxPrice?: string
    search?: string
    sortBy?: string
    page?: string
  }
}

export const metadata = {
  title: 'Products',
  description: 'Browse our collection of high-quality products',
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = {
    categoryId: searchParams.categoryId,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    search: searchParams.search,
    sortBy: searchParams.sortBy,
    page: searchParams.page,
    pageSize: '12',
  }

  const [productsData, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ])

  const totalPages = productsData.totalPages

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Showing {productsData.products.length} of {productsData.total} products
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <ProductFilters categories={categories} />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort Controls */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {productsData.page} of {totalPages}
            </p>
            <SortSelect defaultValue={searchParams.sortBy} />
          </div>

          {/* Products */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={productsData.products} />
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={productsData.page} totalPages={totalPages} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Pagination Component
function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')

  function getPageUrl(page: number) {
    const newParams = new URLSearchParams(params)
    newParams.set('page', page.toString())
    return `/products?${newParams.toString()}`
  }

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (currentPage <= 3) return i + 1
    if (currentPage >= totalPages - 2) return totalPages - 4 + i
    return currentPage - 2 + i
  })

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 && (
        <a
          href={getPageUrl(currentPage - 1)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-accent"
        >
          Previous
        </a>
      )}

      {/* Page Numbers */}
      {pages.map((page) => (
        <a
          key={page}
          href={getPageUrl(page)}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-primary text-primary-foreground'
              : 'border border-input hover:bg-accent'
          }`}
        >
          {page}
        </a>
      ))}

      {/* Next */}
      {currentPage < totalPages && (
        <a
          href={getPageUrl(currentPage + 1)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-accent"
        >
          Next
        </a>
      )}
    </nav>
  )
}

// Loading Skeleton
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

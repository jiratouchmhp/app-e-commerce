'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useTransition } from 'react'

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string }>
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')

  function updateFilters(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Reset to page 1 when filters change
    params.delete('page')

    startTransition(() => {
      router.push(`/products?${params.toString()}`)
    })
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateFilters({ search })
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Filters</h3>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <Label htmlFor="search" className="mb-2 block text-sm font-medium">
            Search
          </Label>
          <div className="flex gap-2">
            <Input
              id="search"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Category */}
        <div className="mb-6">
          <Label htmlFor="category" className="mb-2 block text-sm font-medium">
            Category
          </Label>
          <select
            id="category"
            value={searchParams.get('categoryId') || ''}
            onChange={(e) => updateFilters({ categoryId: e.target.value })}
            disabled={isPending}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="minPrice" className="mb-2 block text-sm font-medium">
              Min Price ($)
            </Label>
            <Input
              id="minPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              defaultValue={searchParams.get('minPrice') || ''}
              onBlur={(e) => updateFilters({ minPrice: e.target.value })}
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="maxPrice" className="mb-2 block text-sm font-medium">
              Max Price ($)
            </Label>
            <Input
              id="maxPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="999.99"
              defaultValue={searchParams.get('maxPrice') || ''}
              onBlur={(e) => updateFilters({ maxPrice: e.target.value })}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(searchParams.get('search') ||
        searchParams.get('categoryId') ||
        searchParams.get('minPrice') ||
        searchParams.get('maxPrice')) && (
        <button
          onClick={() => {
            setSearch('')
            router.push('/products')
          }}
          disabled={isPending}
          className="w-full rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}

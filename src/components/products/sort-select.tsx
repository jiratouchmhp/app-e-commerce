'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface SortSelectProps {
  defaultValue?: string
}

export function SortSelect({ defaultValue }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', value)
    params.delete('page') // Reset to page 1 when sorting changes
    router.push(`/products?${params.toString()}`)
  }

  return (
    <select
      name="sortBy"
      defaultValue={defaultValue || 'newest'}
      onChange={(e) => handleChange(e.target.value)}
      className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name-asc">Name: A to Z</option>
      <option value="name-desc">Name: Z to A</option>
    </select>
  )
}

import { describe, it, expect } from 'vitest'
import type { WishlistItem, WishlistResult } from '@/types/wishlist'

describe('WishlistItem type', () => {
  it('accepts a valid WishlistItem object', () => {
    const item: WishlistItem = {
      id: 'item-123',
      productId: 'product-123',
      name: 'Test Product',
      slug: 'test-product',
      price: 1999, // Price in cents
      image: 'https://example.com/image.jpg',
      stock: 10,
      category: {
        id: 'category-123',
        name: 'Electronics',
        slug: 'electronics',
      },
      addedAt: new Date(),
    }

    expect(item.id).toBe('item-123')
    expect(item.productId).toBe('product-123')
    expect(item.name).toBe('Test Product')
    expect(item.slug).toBe('test-product')
    expect(item.price).toBe(1999) // $19.99 in cents
    expect(item.image).toBe('https://example.com/image.jpg')
    expect(item.stock).toBe(10)
    expect(item.category.id).toBe('category-123')
    expect(item.category.name).toBe('Electronics')
    expect(item.category.slug).toBe('electronics')
    expect(item.addedAt).toBeInstanceOf(Date)
  })

  it('handles edge case values', () => {
    const item: WishlistItem = {
      id: '',
      productId: '',
      name: '',
      slug: '',
      price: 0,
      image: '',
      stock: 0,
      category: {
        id: '',
        name: '',
        slug: '',
      },
      addedAt: new Date(0),
    }

    expect(item.price).toBe(0)
    expect(item.stock).toBe(0)
    expect(item.addedAt.getTime()).toBe(0)
  })
})

describe('WishlistResult type', () => {
  it('accepts a successful result with items', () => {
    const result: WishlistResult = {
      success: true,
      items: [
        {
          id: 'item-123',
          productId: 'product-123',
          name: 'Test Product',
          slug: 'test-product',
          price: 1999, // Price in cents
          image: 'https://example.com/image.jpg',
          stock: 10,
          category: {
            id: 'category-123',
            name: 'Electronics',
            slug: 'electronics',
          },
          addedAt: new Date(),
        },
      ],
    }

    expect(result.success).toBe(true)
    expect(result.items).toHaveLength(1)
    expect(result.error).toBeUndefined()
  })

  it('accepts a successful result with empty items array', () => {
    const result: WishlistResult = {
      success: true,
      items: [],
    }

    expect(result.success).toBe(true)
    expect(result.items).toHaveLength(0)
  })

  it('accepts a failed result with error message', () => {
    const result: WishlistResult = {
      success: false,
      error: 'Something went wrong',
      items: [],
    }

    expect(result.success).toBe(false)
    expect(result.error).toBe('Something went wrong')
    expect(result.items).toHaveLength(0)
  })

  it('handles multiple items in the wishlist', () => {
    const baseItem: Omit<WishlistItem, 'id' | 'productId' | 'name'> = {
      slug: 'test-product',
      price: 1999, // Price in cents
      image: 'https://example.com/image.jpg',
      stock: 10,
      category: {
        id: 'category-123',
        name: 'Electronics',
        slug: 'electronics',
      },
      addedAt: new Date(),
    }

    const result: WishlistResult = {
      success: true,
      items: [
        { ...baseItem, id: 'item-1', productId: 'product-1', name: 'Product 1' },
        { ...baseItem, id: 'item-2', productId: 'product-2', name: 'Product 2' },
        { ...baseItem, id: 'item-3', productId: 'product-3', name: 'Product 3' },
      ],
    }

    expect(result.items).toHaveLength(3)
    expect(result.items[0].name).toBe('Product 1')
    expect(result.items[1].name).toBe('Product 2')
    expect(result.items[2].name).toBe('Product 3')
  })
})

import { describe, it, expect } from 'vitest'
import { wishlistItemSchema, moveToCartSchema } from '@/lib/validations/wishlist'

describe('wishlistItemSchema', () => {
  it('validates a valid product ID', () => {
    const result = wishlistItemSchema.safeParse({
      productId: 'clm1234567890abcdefghijkl',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty product ID', () => {
    const result = wishlistItemSchema.safeParse({
      productId: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a non-cuid product ID', () => {
    const result = wishlistItemSchema.safeParse({
      productId: 'not-a-valid-cuid',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid product ID')
    }
  })
})

describe('moveToCartSchema', () => {
  it('validates a valid move to cart request', () => {
    const result = moveToCartSchema.safeParse({
      productId: 'clm1234567890abcdefghijkl',
      quantity: 1,
    })
    expect(result.success).toBe(true)
  })

  it('uses default quantity of 1 when not provided', () => {
    const result = moveToCartSchema.safeParse({
      productId: 'clm1234567890abcdefghijkl',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.quantity).toBe(1)
    }
  })

  it('rejects zero quantity', () => {
    const result = moveToCartSchema.safeParse({
      productId: 'clm1234567890abcdefghijkl',
      quantity: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative quantity', () => {
    const result = moveToCartSchema.safeParse({
      productId: 'clm1234567890abcdefghijkl',
      quantity: -1,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Quantity must be positive')
    }
  })

  it('rejects non-integer quantity', () => {
    const result = moveToCartSchema.safeParse({
      productId: 'clm1234567890abcdefghijkl',
      quantity: 1.5,
    })
    expect(result.success).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { wishlistItemSchema, moveToCartSchema } from '@/lib/validations/wishlist'

describe('wishlistItemSchema', () => {
  // Valid CUID for testing
  const validCuid = 'clm1234567890abcdefghijkl'

  describe('valid inputs', () => {
    it('validates a valid product ID', () => {
      const result = wishlistItemSchema.safeParse({
        productId: validCuid,
      })
      expect(result.success).toBe(true)
    })

    it('accepts various valid CUID formats', () => {
      const validCuids = [
        'clm1234567890abcdefghijkl',
        'cla9876543210zyxwvutsrqpo',
        'clz0000000000000000000000',
      ]

      validCuids.forEach((cuid) => {
        const result = wishlistItemSchema.safeParse({ productId: cuid })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('invalid inputs', () => {
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

    it('rejects missing productId field', () => {
      const result = wishlistItemSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('rejects null productId', () => {
      const result = wishlistItemSchema.safeParse({
        productId: null,
      })
      expect(result.success).toBe(false)
    })

    it('rejects undefined productId', () => {
      const result = wishlistItemSchema.safeParse({
        productId: undefined,
      })
      expect(result.success).toBe(false)
    })

    it('rejects number type for productId', () => {
      const result = wishlistItemSchema.safeParse({
        productId: 12345,
      })
      expect(result.success).toBe(false)
    })

    it('rejects UUID format (different from CUID)', () => {
      const result = wishlistItemSchema.safeParse({
        productId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(false)
    })

    it('rejects whitespace-only productId', () => {
      const result = wishlistItemSchema.safeParse({
        productId: '   ',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('moveToCartSchema', () => {
  const validCuid = 'clm1234567890abcdefghijkl'

  describe('valid inputs', () => {
    it('validates a valid move to cart request with quantity', () => {
      const result = moveToCartSchema.safeParse({
        productId: validCuid,
        quantity: 1,
      })
      expect(result.success).toBe(true)
    })

    it('uses default quantity of 1 when not provided', () => {
      const result = moveToCartSchema.safeParse({
        productId: validCuid,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.quantity).toBe(1)
      }
    })

    it('accepts large quantity values', () => {
      const result = moveToCartSchema.safeParse({
        productId: validCuid,
        quantity: 999,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.quantity).toBe(999)
      }
    })
  })

  describe('invalid productId', () => {
    it('rejects invalid productId', () => {
      const result = moveToCartSchema.safeParse({
        productId: 'invalid',
        quantity: 1,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid product ID')
      }
    })

    it('rejects empty productId', () => {
      const result = moveToCartSchema.safeParse({
        productId: '',
        quantity: 1,
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing productId', () => {
      const result = moveToCartSchema.safeParse({
        quantity: 1,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('invalid quantity', () => {
    it('rejects zero quantity', () => {
      const result = moveToCartSchema.safeParse({
        productId: validCuid,
        quantity: 0,
      })
      expect(result.success).toBe(false)
    })

    it('rejects negative quantity', () => {
      const result = moveToCartSchema.safeParse({
        productId: validCuid,
        quantity: -1,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Quantity must be positive')
      }
    })

    it('rejects non-integer quantity (float)', () => {
      const result = moveToCartSchema.safeParse({
        productId: validCuid,
        quantity: 1.5,
      })
      expect(result.success).toBe(false)
    })

    it('rejects string quantity', () => {
      const result = moveToCartSchema.safeParse({
        productId: validCuid,
        quantity: '1',
      })
      expect(result.success).toBe(false)
    })

    it('rejects NaN quantity', () => {
      const result = moveToCartSchema.safeParse({
        productId: validCuid,
        quantity: NaN,
      })
      expect(result.success).toBe(false)
    })

    it('rejects Infinity quantity', () => {
      const result = moveToCartSchema.safeParse({
        productId: validCuid,
        quantity: Infinity,
      })
      expect(result.success).toBe(false)
    })
  })
})

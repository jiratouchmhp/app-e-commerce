---
agent: unit-test
description: 'Generate validation tests for Zod schemas'
---

# Generate Validation Tests

I need to create comprehensive tests for Zod validation schemas with full coverage of all validation rules, edge cases, and error messages.

Please follow these steps:

1. **Ask clarifying questions** about:
   - Which validation schema should be tested? (product, cart, auth, order)
   - Should all fields be tested or specific ones?
   - Are there custom refinements or transforms to test?

2. **Research the schema** to:
   - Read the validation file in `lib/validations/`
   - Identify all fields and their constraints
   - Note custom validation rules (`.refine()`, `.transform()`)
   - Check for conditional logic

3. **Create test plan** covering:
   - Valid input test (happy path)
   - Tests for each field's constraints
   - Edge cases (empty, boundary values)
   - Error message verification
   - Custom refinement tests

4. **Generate test file** with:
   - Location: `__tests__/lib/validations/[schema].test.ts`
   - Nested describe blocks for organization
   - Valid data fixture
   - Tests for each field validation
   - Error message assertions

Make sure tests include:
- One test for completely valid input
- Separate describe blocks for each field
- Tests for min/max constraints
- Tests for regex patterns
- Tests for type coercion
- Tests for custom refinements
- Verification of error messages

## Examples

### Example: Complete Validation Schema Test

```typescript
// __tests__/lib/validations/product.test.ts
import { describe, it, expect } from 'vitest'
import { createProductSchema } from '@/lib/validations/product'

describe('createProductSchema', () => {
  const validProduct = {
    name: 'Test Product',
    description: 'A comprehensive test product description',
    price: 1999,
    stock: 10,
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    images: ['https://example.com/image.jpg'],
  }

  it('validates correct product data', () => {
    const result = createProductSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validProduct)
    }
  })

  describe('name validation', () => {
    it('rejects empty name', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        name: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required')
      }
    })

    it('rejects name over 100 characters', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        name: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('100')
      }
    })

    it('accepts name with 100 characters', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        name: 'a'.repeat(100),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('description validation', () => {
    it('rejects description under 10 characters', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        description: 'short',
      })
      expect(result.success).toBe(false)
    })

    it('rejects description over 1000 characters', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        description: 'a'.repeat(1001),
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid description length', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        description: 'a'.repeat(100),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('price validation', () => {
    it('rejects negative price', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        price: -10,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('positive')
      }
    })

    it('rejects zero price', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        price: 0,
      })
      expect(result.success).toBe(false)
    })

    it('accepts positive price', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        price: 1,
      })
      expect(result.success).toBe(true)
    })

    it('accepts large price', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        price: 999999,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('stock validation', () => {
    it('rejects negative stock', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        stock: -1,
      })
      expect(result.success).toBe(false)
    })

    it('accepts zero stock', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        stock: 0,
      })
      expect(result.success).toBe(true)
    })

    it('rejects decimal stock', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        stock: 1.5,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('categoryId validation', () => {
    it('rejects invalid UUID format', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        categoryId: 'not-a-uuid',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid')
      }
    })

    it('accepts valid UUID', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('images validation', () => {
    it('requires at least one image', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        images: [],
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least one')
      }
    })

    it('rejects invalid URLs', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        images: ['not-a-url'],
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid')
      }
    })

    it('rejects more than 5 images', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        images: Array(6).fill('https://example.com/image.jpg'),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('5')
      }
    })

    it('accepts valid image URLs', () => {
      const result = createProductSchema.safeParse({
        ...validProduct,
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      })
      expect(result.success).toBe(true)
    })
  })
})
```

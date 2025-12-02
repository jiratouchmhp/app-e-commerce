---
agent: unit-test
description: 'Generate unit tests for utilities, validations, and Server Actions'
---

# Generate Unit Tests

I need to create comprehensive unit tests for utilities, validation schemas, or Server Actions with 100% code coverage.

Please follow these steps:

1. **Ask clarifying questions** about:
   - What file(s) should be tested? (specific path or multiple files)
   - What type of code is it? (utility function, Zod schema, Server Action)
   - Are there any specific edge cases to focus on?
   - Should mocks be created for external dependencies?

2. **Research the codebase** to:
   - Read the target file(s) to understand the code
   - Identify all exported functions/schemas
   - Check for dependencies (Prisma, NextAuth, external APIs)
   - Review existing test patterns if any

3. **Create a test plan** that includes:
   - List of functions/schemas to test
   - Test cases for each (happy path, edge cases, errors)
   - Mock strategy for external dependencies
   - Expected code coverage percentage

4. **Generate test files** with:
   - Proper file location (`__tests__/lib/[module].test.ts`)
   - Vitest imports and setup
   - Describe blocks for each function
   - Test cases with Arrange-Act-Assert pattern
   - Proper mocks for Prisma, NextAuth, etc.
   - Coverage for all branches and edge cases

Make sure tests include:
- Descriptive test names ("should format price correctly for valid input")
- Arrange-Act-Assert structure
- Mock setup with `vi.mock()`
- Assertions using `expect()`
- Edge case coverage (empty, null, boundary values)
- Error case testing
- 100% code coverage goal for utilities

## Examples

### Example 1: Utility Function Test

```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice, cn } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats price in cents to dollars', () => {
    expect(formatPrice(1299)).toBe('$12.99')
  })

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('handles large numbers', () => {
    expect(formatPrice(999999)).toBe('$9,999.99')
  })
})
```

### Example 2: Zod Schema Test

```typescript
// __tests__/lib/validations/product.test.ts
import { describe, it, expect } from 'vitest'
import { createProductSchema } from '@/lib/validations/product'

describe('createProductSchema', () => {
  const validProduct = {
    name: 'Test Product',
    description: 'Test description',
    price: 1999,
    stock: 10,
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    images: ['https://example.com/image.jpg'],
  }

  it('validates correct product data', () => {
    const result = createProductSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      name: '',
    })
    expect(result.success).toBe(false)
  })
})
```

### Example 3: Server Action Test

```typescript
// __tests__/lib/actions/cart.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { addToCart } from '@/lib/actions/cart'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from '@/lib/auth'

vi.mock('@/lib/db/prisma')
vi.mock('@/lib/auth')

describe('addToCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds product to cart for authenticated user', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' }
    })
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-123',
      price: 1999,
      stock: 10,
    })

    const result = await addToCart('product-123', 1)
    expect(result.success).toBe(true)
  })

  it('returns error for unauthenticated user', async () => {
    getServerSession.mockResolvedValue(null)
    const result = await addToCart('product-123', 1)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })
})
```

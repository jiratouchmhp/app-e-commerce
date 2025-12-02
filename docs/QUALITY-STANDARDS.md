# Quality Standards & Validation Requirements

## Overview

This document defines the quality gates, validation requirements, linting rules, testing expectations, and performance budgets that all code must meet before being considered complete.

## Validation Requirements

### Input Validation with Zod

All user inputs and external data must be validated using Zod schemas on both client and server.

#### Schema Location
```
src/lib/validations/
├── auth.ts          # Authentication schemas
├── cart.ts          # Cart operation schemas
├── checkout.ts      # Checkout flow schemas
├── order.ts         # Order management schemas
└── product.ts       # Product CRUD schemas
```

#### Schema Pattern

```typescript
// lib/validations/product.ts
import { z } from 'zod'

// Create schema
export const createProductSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  
  price: z.number()
    .positive('Price must be positive')
    .max(999999, 'Price is too high'),
  
  stock: z.number()
    .int('Stock must be a whole number')
    .nonnegative('Stock cannot be negative'),
  
  categoryId: z.string()
    .uuid('Invalid category ID'),
  
  images: z.array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed'),
})

// Update schema (all fields optional)
export const updateProductSchema = createProductSchema.partial()

// Type inference
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
```

#### Server-Side Validation

```typescript
// lib/actions/products.ts
'use server'

import { createProductSchema } from '@/lib/validations/product'

export async function createProduct(input: unknown) {
  try {
    // Validate with Zod
    const validatedData = createProductSchema.parse(input)
    
    // Proceed with validated data
    const product = await prisma.product.create({
      data: validatedData,
    })
    
    return { success: true, product }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input',
        details: error.errors,
      }
    }
    
    return { success: false, error: 'Failed to create product' }
  }
}
```

#### Client-Side Validation

```typescript
// components/forms/product-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductSchema } from '@/lib/validations/product'

export function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProductSchema),
  })
  
  // Form implementation
}
```

### Validation Rules

**Required for All Schemas:**
- ✅ Descriptive error messages
- ✅ Appropriate constraints (min/max, regex patterns)
- ✅ Type coercion where needed (z.coerce.number())
- ✅ Custom refinements for complex validation
- ✅ Exported TypeScript types using z.infer

**Common Patterns:**
```typescript
// Email validation
email: z.string().email('Invalid email address')

// Password validation
password: z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')

// URL validation
url: z.string().url('Invalid URL')

// UUID validation
id: z.string().uuid('Invalid ID')

// Enum validation
status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'])

// Optional with default
quantity: z.number().int().positive().default(1)

// Custom refinement
.refine(
  (data) => data.endDate > data.startDate,
  { message: 'End date must be after start date', path: ['endDate'] }
)
```

## ESLint Configuration

### .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        "prefer": "type-imports"
      }
    ],
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": false
      }
    ],
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### ESLint Rules Explanation

**Must Fix (Error Level):**
- `no-explicit-any`: No `any` types allowed
- `no-unused-vars`: All variables must be used
- `consistent-type-imports`: Use `type` keyword for type-only imports
- `prefer-const`: Use `const` for non-reassigned variables
- `no-var`: Never use `var`, use `const` or `let`

**Should Fix (Warning Level):**
- `no-console`: Remove console.logs (except warn/error)

### Running ESLint

```bash
# Check for errors
pnpm lint

# Fix auto-fixable errors
pnpm lint:fix
```

## TypeScript Configuration

### Strict Mode Requirements

All TypeScript strict flags must be enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Checking Commands

```bash
# Type check all files
pnpm type-check

# Type check with watch mode
pnpm type-check:watch

# Type check should pass with zero errors
tsc --noEmit
```

### Common Type Errors to Avoid

```typescript
// ❌ Bad - implicit any
function process(data) {
  return data
}

// ✅ Good - explicit types
function process(data: string): string {
  return data
}

// ❌ Bad - type assertion
const user = data as User

// ✅ Good - type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  )
}

if (isUser(data)) {
  // TypeScript knows data is User here
}

// ❌ Bad - non-null assertion
const value = maybeValue!

// ✅ Good - null check
if (maybeValue !== null) {
  const value = maybeValue
}
```

## Testing Requirements

### Testing Strategy

**Unit Tests**: Utilities, helpers, and pure functions
**Component Tests**: UI components in isolation
**Integration Tests**: Feature workflows and user journeys
**E2E Tests**: Critical paths (checkout, payment, auth)

### Test Coverage Goals

- **Utilities**: 100% coverage
- **Components**: 80% coverage
- **Server Actions**: 90% coverage
- **Overall**: 80% coverage

### Testing Tools

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0"
  }
}
```

### Test Examples

#### Unit Test
```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice, calculateTotal } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats price in USD', () => {
    expect(formatPrice(1299)).toBe('$12.99')
  })

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('rounds to 2 decimals', () => {
    expect(formatPrice(999)).toBe('$9.99')
  })
})
```

#### Component Test
```typescript
// __tests__/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

#### Integration Test
```typescript
// __tests__/features/cart.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartPage } from '@/app/(shop)/cart/page'

describe('Shopping Cart', () => {
  it('adds item to cart and updates total', async () => {
    render(<CartPage />)
    
    const addButton = screen.getByRole('button', { name: /add to cart/i })
    await userEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText(/1 item/i)).toBeInTheDocument()
    })
  })

  it('removes item from cart', async () => {
    render(<CartPage />)
    
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await userEvent.click(removeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
    })
  })
})
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## Performance Budgets

### Core Web Vitals Targets

**Lighthouse Scores (Minimum)**
- Performance: 90+
- Accessibility: 100
- Best Practices: 95+
- SEO: 100

**Web Vitals Thresholds**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 800ms
- **FCP** (First Contentful Paint): < 1.8s

### Bundle Size Budgets

```javascript
// next.config.js
module.exports = {
  performance: {
    maxEntrypointSize: 250000, // 250kb
    maxAssetSize: 250000,
  },
}
```

**Page Weight Limits:**
- Homepage: < 500kb
- Product List: < 600kb
- Product Detail: < 700kb
- Cart/Checkout: < 550kb

**JavaScript Bundle Limits:**
- First-party JS: < 170kb (gzipped)
- Third-party JS: < 80kb (gzipped)
- Total JS: < 250kb (gzipped)

### Image Optimization

**Requirements:**
- Use Next.js `<Image>` component for all images
- Provide width and height (prevent CLS)
- Use appropriate sizes attribute
- Enable blur placeholders for above-fold images
- Lazy load below-fold images

```typescript
// ✅ Good
<Image
  src="/product.jpg"
  alt="Product name"
  width={400}
  height={500}
  sizes="(max-width: 768px) 100vw, 400px"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  priority={isAboveFold}
/>

// ❌ Bad
<img src="/product.jpg" alt="Product" />
```

### Database Performance

**Query Performance Targets:**
- Simple queries: < 50ms
- Complex queries: < 200ms
- Full-text search: < 500ms

**Optimization Requirements:**
- Index all foreign keys
- Index frequently queried columns
- Use `select` to limit fields returned
- Use pagination for lists
- Implement query result caching

```typescript
// ✅ Good - Optimized query
const products = await prisma.product.findMany({
  where: { categoryId },
  select: {
    id: true,
    name: true,
    price: true,
    images: true,
  },
  take: 20,
  skip: (page - 1) * 20,
})

// ❌ Bad - Fetches all fields, no pagination
const products = await prisma.product.findMany({
  where: { categoryId },
})
```

## Accessibility Requirements

### WCAG 2.1 AA Compliance

All features must meet WCAG 2.1 Level AA standards.

### Accessibility Checklist

**Keyboard Navigation**
- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order
- [ ] Visible focus indicators
- [ ] No keyboard traps

**Screen Readers**
- [ ] Semantic HTML elements
- [ ] ARIA labels on icon-only buttons
- [ ] Alt text on all images
- [ ] Form labels properly associated
- [ ] Error messages announced

**Visual**
- [ ] Minimum 4.5:1 contrast ratio for text
- [ ] Minimum 3:1 contrast ratio for UI elements
- [ ] Text resizable up to 200%
- [ ] No information conveyed by color alone

**Interactive**
- [ ] Touch targets minimum 44x44px
- [ ] Clear hover/focus states
- [ ] Loading states announced
- [ ] Form validation errors announced

### Accessibility Testing

```bash
# Run automated accessibility tests
pnpm test:a11y

# Manual testing checklist:
# 1. Navigate with keyboard only (Tab, Enter, Space, Arrows)
# 2. Test with screen reader (NVDA, JAWS, VoiceOver)
# 3. Test at 200% zoom
# 4. Test with high contrast mode
# 5. Verify color contrast with browser tools
```

## Code Review Checklist

Before merging any code, verify:

### Functionality
- [ ] Feature works as expected
- [ ] All edge cases handled
- [ ] Error cases handled gracefully
- [ ] Loading states implemented
- [ ] Success states implemented

### Code Quality
- [ ] TypeScript: No errors (`tsc --noEmit`)
- [ ] ESLint: No errors (`pnpm lint`)
- [ ] Tests: All passing (`pnpm test`)
- [ ] Coverage: Meets thresholds
- [ ] No console.logs in production code

### Validation & Security
- [ ] All inputs validated with Zod (client and server)
- [ ] Authentication checked where needed
- [ ] Authorization enforced
- [ ] No sensitive data exposed to client
- [ ] XSS protection verified
- [ ] CSRF protection in place (Server Actions provide this)

### Performance
- [ ] Lighthouse score > 90
- [ ] Images optimized
- [ ] Code split appropriately
- [ ] Database queries optimized
- [ ] No unnecessary re-renders
- [ ] Bundle size within budget

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast meets standards
- [ ] Focus indicators visible
- [ ] ARIA labels present

### UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Follows design system
- [ ] Loading states present
- [ ] Error states handled
- [ ] Empty states designed
- [ ] Animations are smooth (60fps)

### Documentation
- [ ] Complex logic has JSDoc comments
- [ ] README updated if needed
- [ ] Type definitions exported
- [ ] Usage examples provided

## Pre-Commit Hooks

Use Husky to enforce quality gates:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## CI/CD Pipeline

Required checks before deployment:

1. **Type Check**: `tsc --noEmit`
2. **Lint**: `pnpm lint`
3. **Tests**: `pnpm test`
4. **Build**: `pnpm build`
5. **Lighthouse**: Run on preview deployment

## Quality Metrics Dashboard

Monitor these metrics:

- Code coverage percentage
- TypeScript error count
- ESLint error/warning count
- Lighthouse scores over time
- Bundle size trends
- Core Web Vitals (RUM data)
- Error rate in production
- Page load times (P50, P95, P99)

---

**Remember**: These are minimum standards. Strive to exceed them whenever possible. Quality is not negotiable.

**Last Updated:** November 24, 2025

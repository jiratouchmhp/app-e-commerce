# Contributing Guidelines

## Overview

This document outlines coding standards, best practices, and development workflows for contributing to the e-commerce application. Following these guidelines ensures consistency, maintainability, and code quality across the project.

## Development Setup

### Prerequisites
- Node.js 18+ (use 20 LTS recommended)
- pnpm 8+ (preferred package manager)
- PostgreSQL 14+
- Git

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd dev-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed

# Start development server
pnpm dev
```

## Coding Standards

### TypeScript

#### Type Safety
- **Always use explicit types** - No implicit `any` types
- **Avoid type assertions** - Use type guards instead
- **Prefer interfaces over types** for object shapes
- **Use enums or const objects** for fixed sets of values

```typescript
// ✅ Good
interface Product {
  id: string
  name: string
  price: number
  inStock: boolean
}

function getProduct(id: string): Promise<Product> {
  // implementation
}

// ❌ Bad
function getProduct(id: any): any {
  // implementation
}
```

#### Naming Conventions
- **Files**: kebab-case (`product-card.tsx`, `use-cart.ts`)
- **Components**: PascalCase (`ProductCard`, `AddToCartButton`)
- **Functions**: camelCase (`getProducts`, `formatPrice`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CART_ITEMS`, `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`Product`, `CartItem`)
- **Private properties**: prefix with underscore (`_internalState`)

#### File Organization
```typescript
// 1. Imports (grouped and sorted)
import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'

// 2. Types/Interfaces
interface ProductCardProps {
  product: Product
  onAddToCart?: (id: string) => void
}

// 3. Component/Function
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // implementation
}

// 4. Helper functions (if any)
function calculateDiscount(price: number, discount: number): number {
  return price * (1 - discount / 100)
}
```

### React & Next.js

#### Server vs Client Components

**Default to Server Components**
```typescript
// app/products/page.tsx
// Server Component (default)
import { getProducts } from '@/lib/actions/products'

export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <div>
      <h1>Products</h1>
      <ProductGrid products={products} />
    </div>
  )
}
```

**Use Client Components when needed**
```typescript
// components/products/add-to-cart-button.tsx
'use client'

import { useState } from 'react'
import { addToCart } from '@/lib/actions/cart'

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  
  async function handleClick() {
    setLoading(true)
    await addToCart(productId)
    setLoading(false)
  }
  
  return <button onClick={handleClick} disabled={loading}>Add to Cart</button>
}
```

**Client Component Indicators**:
- Uses React hooks (`useState`, `useEffect`, `useContext`)
- Uses browser APIs (`window`, `localStorage`, `navigator`)
- Uses event handlers (`onClick`, `onChange`, `onSubmit`)
- Uses client-only libraries (animation, charting)

#### Component Structure

```typescript
'use client' // Only if needed

import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// Props interface
interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

// Component with JSDoc
/**
 * Reusable button component with multiple variants and sizes
 * @example
 * <Button variant="primary" size="lg">Click me</Button>
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors',
        {
          'bg-black text-white hover:bg-gray-800': variant === 'primary',
          'bg-gray-200 text-black hover:bg-gray-300': variant === 'secondary',
          'border border-gray-300 hover:bg-gray-50': variant === 'outline',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}
```

#### Server Actions

```typescript
// lib/actions/cart.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/lib/db/prisma'
import { getServerSession } from '@/lib/auth'
import { addToCartSchema } from '@/lib/validations/cart'

/**
 * Add a product to the user's cart
 */
export async function addToCart(formData: FormData) {
  try {
    // 1. Validate input
    const { productId, quantity } = addToCartSchema.parse({
      productId: formData.get('productId'),
      quantity: Number(formData.get('quantity')),
    })
    
    // 2. Authenticate user
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // 3. Business logic
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, stock: true },
    })
    
    if (!product) {
      return { success: false, error: 'Product not found' }
    }
    
    if (product.stock < quantity) {
      return { success: false, error: 'Insufficient stock' }
    }
    
    // 4. Database operation
    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      create: {
        userId: session.user.id,
        productId,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
    })
    
    // 5. Revalidate cache
    revalidatePath('/cart')
    
    return { success: true }
  } catch (error) {
    console.error('Add to cart error:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    return { success: false, error: 'Something went wrong' }
  }
}
```

### Styling with Tailwind CSS

#### Utility Classes
- Use Tailwind utilities first
- Create custom classes only when necessary
- Use `cn()` helper for conditional classes

```typescript
// ✅ Good
<div className={cn(
  'rounded-lg border p-4',
  isActive && 'border-black',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
  {children}
</div>

// ❌ Bad - inline styles
<div style={{ 
  borderRadius: '8px', 
  padding: '16px',
  border: isActive ? '1px solid black' : '1px solid gray'
}}>
  {children}
</div>
```

#### Responsive Design
```typescript
// Mobile-first approach
<div className="
  px-4 py-8          // Mobile
  md:px-8 md:py-12   // Tablet
  lg:px-12 lg:py-16  // Desktop
">
  {children}
</div>
```

#### Design Tokens
Use design system values from `tailwind.config.ts`:
```typescript
// Colors
'bg-background'
'text-foreground'
'border-border'
'bg-primary'
'text-primary-foreground'

// Spacing
'space-y-4'    // 1rem
'space-y-6'    // 1.5rem
'gap-4'        // 1rem

// Typography
'text-sm'      // 0.875rem
'text-base'    // 1rem
'text-lg'      // 1.125rem
```

### Error Handling

#### Client Components
```typescript
'use client'

import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

export function ProductForm() {
  const [error, setError] = useState<string | null>(null)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    try {
      const result = await createProduct(formData)
      if (!result.success) {
        setError(result.error)
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'Product created successfully' })
    } catch (error) {
      setError('Something went wrong')
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      {/* form fields */}
    </form>
  )
}
```

#### Error Boundaries
```typescript
// app/products/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Product page error:', error)
  }, [error])
  
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
      <p className="mb-6 text-gray-600">We couldn't load the products.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

### Validation with Zod

```typescript
// lib/validations/product.ts
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  categoryId: z.string().uuid('Invalid category ID'),
  images: z.array(z.string().url()).min(1, 'At least one image required'),
})

export type ProductInput = z.infer<typeof productSchema>

// Usage in Server Action
export async function createProduct(input: unknown) {
  const validatedData = productSchema.parse(input)
  // ... create product
}
```

## Git Workflow

### Branch Naming
- `feature/` - New features (`feature/add-product-search`)
- `fix/` - Bug fixes (`fix/cart-quantity-update`)
- `refactor/` - Code refactoring (`refactor/extract-cart-logic`)
- `docs/` - Documentation (`docs/update-readme`)

### Commit Messages
Follow Conventional Commits:
```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(cart): add quantity selector to cart items
fix(checkout): resolve payment form validation error
docs(readme): update installation instructions
refactor(products): extract product card component
```

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with clear commits
3. Write/update tests
4. Ensure all tests pass locally
5. Update documentation if needed
6. Create pull request with description
7. Request code review
8. Address feedback
9. Merge after approval

## Code Review Guidelines

### For Authors
- Keep PRs small and focused (< 400 lines)
- Write clear PR descriptions
- Include screenshots for UI changes
- Link related issues
- Ensure CI passes

### For Reviewers
- Review within 24 hours
- Be constructive and respectful
- Test locally for complex changes
- Check for security issues
- Verify tests are adequate

### Review Checklist
- [ ] Code follows style guidelines
- [ ] TypeScript types are correct
- [ ] Components use appropriate rendering strategy (Server/Client)
- [ ] Error handling is proper
- [ ] Validation is implemented
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No console.logs in production code
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

## Testing

### Unit Tests
```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice, cn } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats price correctly', () => {
    expect(formatPrice(1299)).toBe('$12.99')
    expect(formatPrice(0)).toBe('$0.00')
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })
})
```

### Component Tests
```typescript
// __tests__/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('applies variant classes', () => {
    render(<Button variant="primary">Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-black')
  })
})
```

## Performance Best Practices

### Images
```typescript
import Image from 'next/image'

// ✅ Good
<Image
  src="/products/shirt.jpg"
  alt="Blue cotton shirt"
  width={400}
  height={500}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ❌ Bad
<img src="/products/shirt.jpg" alt="shirt" />
```

### Data Fetching
```typescript
// ✅ Good - Parallel fetching
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories(),
])

// ❌ Bad - Sequential fetching
const products = await getProducts()
const categories = await getCategories()
```

### Code Splitting
```typescript
// ✅ Good - Dynamic import for heavy component
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <Skeleton className="h-[400px]" />,
  ssr: false,
})
```

## Accessibility

### Semantic HTML
```typescript
// ✅ Good
<nav>
  <ul>
    <li><a href="/products">Products</a></li>
  </ul>
</nav>

// ❌ Bad
<div>
  <div>
    <div><a href="/products">Products</a></div>
  </div>
</div>
```

### ARIA Labels
```typescript
// ✅ Good
<button aria-label="Add to cart">
  <ShoppingCart />
</button>

// ❌ Bad
<button>
  <ShoppingCart />
</button>
```

### Keyboard Navigation
```typescript
// ✅ Good - Keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Submit
</button>
```

## Security

### Input Sanitization
- Always validate user inputs with Zod
- Never trust client-side data
- Sanitize before rendering user-generated content

### Authentication
- Use NextAuth.js for authentication
- Protect routes with middleware
- Check permissions in Server Actions

### Environment Variables
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
})

export const env = envSchema.parse(process.env)
```

## Documentation

### Code Comments
```typescript
// ✅ Good - Explains "why"
// Cache user preferences for 24 hours to reduce database load
const userPrefs = await getCachedUserPreferences(userId, { ttl: 86400 })

// ❌ Bad - States "what" (obvious from code)
// Get user preferences
const userPrefs = await getUserPreferences(userId)
```

### JSDoc
```typescript
/**
 * Calculate the total price of items in the cart including tax
 * @param items - Array of cart items
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price with tax applied
 * @example
 * calculateTotal([{ price: 100, quantity: 2 }], 0.08) // Returns 216
 */
export function calculateTotal(
  items: CartItem[],
  taxRate: number
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return subtotal * (1 + taxRate)
}
```

## Common Pitfalls

### ❌ Using Client Components Unnecessarily
```typescript
// Bad - Doesn't need to be a Client Component
'use client'
export function ProductTitle({ title }: { title: string }) {
  return <h1>{title}</h1>
}

// Good - Server Component
export function ProductTitle({ title }: { title: string }) {
  return <h1>{title}</h1>
}
```

### ❌ Not Validating Server Action Inputs
```typescript
// Bad - No validation
export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
}

// Good - Validated input
export async function deleteProduct(id: string) {
  const validated = z.string().uuid().parse(id)
  await prisma.product.delete({ where: { id: validated } })
}
```

### ❌ Missing Error Boundaries
```typescript
// Bad - No error handling
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id)
  return <ProductDetails product={product} />
}

// Good - Has error.tsx file in same directory
// app/products/[id]/error.tsx exists
```

## Getting Help

- **Documentation**: Check project docs first
- **Code Review**: Ask questions in PRs
- **Team Chat**: Use designated channels
- **Pair Programming**: Schedule sessions for complex tasks

---

**Last Updated:** November 24, 2025

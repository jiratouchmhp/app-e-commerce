# Core Development Principles

## Overview

This document consolidates the fundamental patterns and principles used throughout the Next.js e-commerce application. These principles are extracted from detailed documentation to serve as a quick reference for AI agents and developers.

**For detailed implementations, see:**
- [`CONTRIBUTING.md`](CONTRIBUTING.md) - Full coding standards
- [`TYPESCRIPT-NEXTJS-CONVENTIONS.md`](TYPESCRIPT-NEXTJS-CONVENTIONS.md) - Framework patterns
- [`QUALITY-STANDARDS.md`](QUALITY-STANDARDS.md) - Validation and testing

---

## 1. Server-First Architecture

### Principle
**Default to React Server Components.** Only use Client Components when absolutely necessary.

### When to Use Server Components (Default)
✅ Fetching data from database or API  
✅ Accessing backend resources  
✅ Rendering static content  
✅ SEO-critical content  
✅ Large dependencies without interactivity  

### When to Use Client Components
❌ Event handlers (`onClick`, `onChange`, `onSubmit`)  
❌ React hooks (`useState`, `useEffect`, `useContext`)  
❌ Browser APIs (`localStorage`, `window`, `navigator`)  
❌ Real-time features  
❌ Client-only libraries  

### Quick Example
```typescript
// Server Component (default) - no 'use client'
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  return (
    <div>
      <h1>{product.name}</h1>
      <AddToCartButton productId={product.id} /> {/* Client Component */}
    </div>
  )
}

// Client Component - needs 'use client' directive
'use client'
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  // ... event handlers, state management
}
```

---

## 2. Type Safety First

### Principle
**Always use explicit TypeScript types.** Enable strict mode. Never use `any` without justification.

### Core Rules
✅ Explicit types for all functions and variables  
✅ Use `unknown` instead of `any`, then narrow with type guards  
✅ Prefer type inference over explicit typing when obvious  
✅ Use `satisfies` operator for type narrowing  
✅ No type assertions (`as`) - use type guards instead  

### Type Guard Pattern
```typescript
// ✅ Good - Type guard
function isProduct(item: unknown): item is Product {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item &&
    'price' in item
  )
}

if (isProduct(data)) {
  // TypeScript knows data is Product here
  console.log(data.name)
}

// ❌ Bad - Type assertion
const product = data as Product // Unsafe!
```

### Discriminated Unions
```typescript
// Use discriminated unions for result types
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// Always check the discriminator
const result = await createProduct(input)
if (!result.success) {
  return result.error // TypeScript knows it's string
}
return result.data // TypeScript knows it's Product
```

---

## 3. Validation Everywhere

### Principle
**Validate all inputs with Zod on both client and server.** Never trust client-side data.

### Validation Pattern
```typescript
// 1. Define Zod schema
const productSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
})

type ProductInput = z.infer<typeof productSchema>

// 2. Validate in Server Action
'use server'
export async function createProduct(input: unknown) {
  try {
    // Parse and validate
    const data = productSchema.parse(input)
    
    // Use validated data
    const product = await prisma.product.create({ data })
    return { success: true, product }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    return { success: false, error: 'Failed to create product' }
  }
}

// 3. Also validate on client for UX
'use client'
export function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema)
  })
  // ... form implementation
}
```

### Common Validation Patterns
```typescript
// Email
z.string().email()

// Password (min 8 chars, at least one number)
z.string().min(8).regex(/\d/)

// URL
z.string().url()

// UUID
z.string().uuid()

// Enum
z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'])

// Array with min/max
z.array(z.string()).min(1).max(10)

// Optional with default
z.string().optional().default('default value')

// Transform
z.string().transform(val => val.toLowerCase())
```

---

## 4. Server Actions for Mutations

### Principle
**Use Server Actions instead of API routes for all data mutations.** They provide type safety and automatic security.

### Server Action Pattern
```typescript
// lib/actions/products.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { productSchema } from '@/lib/validations/product'

export async function createProduct(input: unknown) {
  try {
    // 1. Validate input
    const data = productSchema.parse(input)
    
    // 2. Authenticate & authorize
    const session = await getServerSession()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' }
    }
    
    // 3. Business logic
    const exists = await prisma.product.findFirst({
      where: { name: data.name }
    })
    if (exists) {
      return { success: false, error: 'Product already exists' }
    }
    
    // 4. Database operation
    const product = await prisma.product.create({ data })
    
    // 5. Revalidate cache
    revalidatePath('/products')
    revalidatePath(`/products/${product.id}`)
    
    return { success: true, product }
  } catch (error) {
    console.error('Create product error:', error)
    return { success: false, error: 'Failed to create product' }
  }
}
```

### 5-Step Server Action Checklist
1. ✅ **Validate** - Parse input with Zod schema
2. ✅ **Authenticate** - Check session and permissions
3. ✅ **Business Logic** - Validate business rules
4. ✅ **Database** - Perform database operation
5. ✅ **Revalidate** - Clear affected cache paths

---

## 5. Error Handling

### Principle
**Handle errors gracefully at every level.** Provide user-friendly messages while logging details.

### Error Handling Pattern
```typescript
// 1. Define custom error classes
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

// 2. Use try-catch in Server Actions
export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to delete product' }
  }
}

// 3. Handle in Client Component
'use client'
export function DeleteButton({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null)
  
  async function handleDelete() {
    setError(null)
    const result = await deleteProduct(id)
    
    if (!result.success) {
      setError(result.error)
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    
    toast({ title: 'Success', description: 'Product deleted' })
  }
  
  return (
    <>
      {error && <p className="text-destructive">{error}</p>}
      <button onClick={handleDelete}>Delete</button>
    </>
  )
}

// 4. Add error.tsx for route-level errors
export default function Error({ error, reset }: ErrorPageProps) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## 6. Loading States

### Principle
**Always provide visual feedback during async operations.** Use loading.tsx, Suspense, and loading states.

### Loading Pattern
```typescript
// 1. Route-level loading (loading.tsx)
export default function Loading() {
  return <ProductGridSkeleton />
}

// 2. Component-level loading (Suspense)
export default function Page() {
  return (
    <div>
      <h1>Products</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  )
}

// 3. Action-level loading (useState)
'use client'
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  
  async function handleClick() {
    setLoading(true)
    try {
      await addToCart(productId)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}

// 4. Skeleton component
export function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-48 bg-muted rounded animate-pulse" />
      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
    </div>
  )
}
```

---

## 7. Data Fetching Optimization

### Principle
**Fetch data in parallel when possible.** Use streaming with Suspense for slow queries.

### Parallel Fetching
```typescript
// ✅ Good - Parallel
const [products, categories, featured] = await Promise.all([
  getProducts(),
  getCategories(),
  getFeaturedProducts(),
])

// ❌ Bad - Sequential
const products = await getProducts()
const categories = await getCategories()
const featured = await getFeaturedProducts()
```

### Streaming with Suspense
```typescript
export default async function ProductPage({ params }: { params: { id: string } }) {
  // Fast data - fetch immediately
  const product = await getProduct(params.id)
  
  return (
    <div>
      <ProductDetails product={product} />
      
      {/* Slow data - stream when ready */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />
      </Suspense>
    </div>
  )
}
```

---

## 8. Caching Strategy

### Principle
**Cache aggressively, revalidate appropriately.** Use Next.js caching for performance.

### Caching Patterns
```typescript
// 1. Static Generation (default)
export default async function HomePage() {
  const products = await getProducts()
  return <ProductGrid products={products} />
}

// 2. Incremental Static Regeneration
export const revalidate = 3600 // Revalidate every hour

export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductGrid products={products} />
}

// 3. Dynamic Rendering
export const dynamic = 'force-dynamic' // Never cache

export default async function CartPage() {
  const cart = await getUserCart()
  return <Cart items={cart.items} />
}

// 4. Per-Request Caching
const product = await fetch(`/api/products/${id}`, {
  next: { revalidate: 60 } // Cache for 60 seconds
})

// 5. Revalidate After Mutations
'use server'
export async function createProduct(input: unknown) {
  const product = await prisma.product.create({ data })
  
  revalidatePath('/products') // Clear products list cache
  revalidatePath(`/products/${product.id}`) // Clear product page cache
  
  return { success: true }
}
```

---

## 9. Component Composition

### Principle
**Build complex components by composing simpler ones.** Prefer composition over configuration.

### Composition Pattern
```typescript
// ✅ Good - Composable
<Card>
  <Card.Header>
    <Card.Title>Product Name</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>Product description</p>
  </Card.Content>
  <Card.Footer>
    <Button>Add to Cart</Button>
  </Card.Footer>
</Card>

// ❌ Bad - Configuration props
<Card
  title="Product Name"
  content="Product description"
  footer={<Button>Add to Cart</Button>}
  showBorder={true}
  padding="large"
/>
```

---

## 10. Accessibility

### Principle
**Build accessible interfaces by default.** Follow WCAG 2.1 AA standards.

### Accessibility Checklist
```typescript
// 1. Semantic HTML
<nav>
  <ul>
    <li><a href="/products">Products</a></li>
  </ul>
</nav>

// 2. ARIA labels for icon-only buttons
<button aria-label="Close menu">
  <X className="h-5 w-5" />
</button>

// 3. Image alt text
<img src="/product.jpg" alt="Blue cotton t-shirt, front view" />

// 4. Focus states
<button className="focus-visible:ring-2 focus-visible:ring-ring">
  Click me
</button>

// 5. Keyboard navigation
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Submit
</button>

// 6. Form labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// 7. Color contrast (minimum 4.5:1 for body text)
<p className="text-foreground">High contrast text</p>
```

---

## Quick Reference Checklist

When implementing any feature, verify:

- [ ] **Server-First**: Using Server Component unless interactivity needed?
- [ ] **Type Safety**: All types explicit, no `any` types?
- [ ] **Validation**: Zod schema on client and server?
- [ ] **Server Action**: Using Server Action for mutations (not API route)?
- [ ] **Error Handling**: Try-catch with user-friendly messages?
- [ ] **Loading State**: Visual feedback during async operations?
- [ ] **Data Fetching**: Parallel fetching where possible?
- [ ] **Caching**: Appropriate caching strategy applied?
- [ ] **Revalidation**: Cache cleared after mutations?
- [ ] **Composition**: Component composable and reusable?
- [ ] **Accessibility**: ARIA labels, semantic HTML, keyboard support?

---

## When to Reference Detailed Docs

**Need more detail? Check these docs:**

- **TypeScript patterns** → [`TYPESCRIPT-NEXTJS-CONVENTIONS.md`](TYPESCRIPT-NEXTJS-CONVENTIONS.md)
- **Coding standards** → [`CONTRIBUTING.md`](CONTRIBUTING.md)
- **Validation examples** → [`QUALITY-STANDARDS.md`](QUALITY-STANDARDS.md) @section validation-patterns
- **Testing patterns** → [`QUALITY-STANDARDS.md`](QUALITY-STANDARDS.md) @section testing-strategy
- **Design system** → [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md)
- **E-commerce patterns** → Use `@reference patterns/[pattern-name]` for full implementations
- **Architecture decisions** → [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

**Last Updated:** November 24, 2025

**Remember:** These are principles, not rigid rules. Use judgment, but favor these patterns unless there's a compelling reason not to.

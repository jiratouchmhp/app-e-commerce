# TypeScript & Next.js Conventions

## Overview

This document provides detailed conventions and best practices for TypeScript and Next.js development in the e-commerce application. These guidelines ensure type safety, optimal performance, and maintainable code.

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Type Safety Rules

1. **No `any` types** - Use `unknown` if type is truly unknown, then narrow with type guards
2. **No type assertions** - Use type guards and validation instead
3. **Enable all strict flags** - Already configured in tsconfig
4. **Use `satisfies` operator** - For type narrowing without losing literal types

```typescript
// ✅ Good - Using satisfies
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} satisfies Config

// ❌ Bad - Type assertion
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as Config

// ✅ Good - Type guard instead of assertion
function isProduct(item: unknown): item is Product {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item
  )
}

// ❌ Bad - Type assertion
const product = data as Product
```

## Next.js App Router Conventions

### File Naming

```
page.tsx        # Route page
layout.tsx      # Layout wrapper
loading.tsx     # Loading UI
error.tsx       # Error boundary
not-found.tsx   # 404 page
route.ts        # API route
template.tsx    # Template (resets state on navigation)
default.tsx     # Parallel routes fallback
```

### Server Components vs Client Components

#### Server Components (Default)

**When to use:**
- Fetching data from database or API
- Accessing backend resources
- Rendering static content
- SEO-critical content
- Large dependencies that don't need interactivity

```typescript
// app/products/[id]/page.tsx
import { getProduct } from '@/lib/actions/products'
import { ProductImages } from '@/components/products/product-images'
import { AddToCartButton } from '@/components/products/add-to-cart-button'

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  // Direct database access in Server Component
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Server Component - no JS sent to client */}
        <ProductImages images={product.images} />
        
        <div>
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold mt-4">${product.price}</p>
          
          {/* Client Component - interactive */}
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </div>
  )
}
```

#### Client Components

**When to use:**
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, useContext, etc.)
- Browser APIs (localStorage, window, etc.)
- Custom hooks
- Third-party libraries that use browser APIs

```typescript
// components/products/add-to-cart-button.tsx
'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { addToCart } from '@/lib/actions/cart'
import { useToast } from '@/hooks/use-toast'

interface AddToCartButtonProps {
  productId: string
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleAddToCart() {
    setIsLoading(true)
    try {
      const result = await addToCart(productId, 1)
      
      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Added to cart',
        description: 'Product added to your cart',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add product to cart',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      <ShoppingCart className="inline-block mr-2 h-5 w-5" />
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
```

### Server Actions

Server Actions are the recommended way to handle mutations in Next.js App Router.

#### Basic Server Action

```typescript
// lib/actions/products.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from '@/lib/auth'
import { createProductSchema } from '@/lib/validations/product'

type CreateProductResult = 
  | { success: true; productId: string }
  | { success: false; error: string }

/**
 * Create a new product
 * @param formData - Form data containing product details
 * @returns Result with success flag and product ID or error message
 */
export async function createProduct(
  formData: FormData
): Promise<CreateProductResult> {
  try {
    // 1. Authenticate
    const session = await getServerSession()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' }
    }

    // 2. Parse and validate input
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      categoryId: formData.get('categoryId'),
      images: JSON.parse(formData.get('images') as string),
    }

    const validatedData = createProductSchema.parse(rawData)

    // 3. Business logic
    const existingProduct = await prisma.product.findFirst({
      where: { name: validatedData.name },
    })

    if (existingProduct) {
      return { success: false, error: 'Product with this name already exists' }
    }

    // 4. Database operation
    const product = await prisma.product.create({
      data: validatedData,
    })

    // 5. Revalidate cache
    revalidatePath('/products')
    revalidatePath(`/products/${product.id}`)

    return { success: true, productId: product.id }
  } catch (error) {
    console.error('Create product error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    
    return { success: false, error: 'Failed to create product' }
  }
}
```

#### Server Action with Optimistic Updates

```typescript
// components/cart/cart-item.tsx
'use client'

import { useOptimistic } from 'react'
import { updateCartItemQuantity, removeCartItem } from '@/lib/actions/cart'
import type { CartItem } from '@/types/cart'

export function CartItem({ item }: { item: CartItem }) {
  const [optimisticQuantity, updateOptimisticQuantity] = useOptimistic(
    item.quantity,
    (state, newQuantity: number) => newQuantity
  )

  async function handleQuantityChange(newQuantity: number) {
    // Update UI immediately
    updateOptimisticQuantity(newQuantity)
    
    // Send to server
    await updateCartItemQuantity(item.id, newQuantity)
  }

  return (
    <div className="flex items-center gap-4">
      <img src={item.product.image} alt={item.product.name} />
      <div className="flex-1">
        <h3>{item.product.name}</h3>
        <p>${item.product.price}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => handleQuantityChange(optimisticQuantity - 1)}>
          -
        </button>
        <span>{optimisticQuantity}</span>
        <button onClick={() => handleQuantityChange(optimisticQuantity + 1)}>
          +
        </button>
      </div>
    </div>
  )
}
```

### Data Fetching Patterns

#### Parallel Data Fetching

```typescript
// app/products/[id]/page.tsx
export default async function ProductPage({ params }: { params: { id: string } }) {
  // ✅ Good - Fetch in parallel
  const [product, relatedProducts, reviews] = await Promise.all([
    getProduct(params.id),
    getRelatedProducts(params.id),
    getProductReviews(params.id),
  ])

  return (
    <div>
      <ProductDetails product={product} />
      <RelatedProducts products={relatedProducts} />
      <Reviews reviews={reviews} />
    </div>
  )
}
```

#### Streaming with Suspense

```typescript
// app/products/[id]/page.tsx
import { Suspense } from 'react'
import { ProductDetails } from '@/components/products/product-details'
import { Reviews } from '@/components/products/reviews'
import { ReviewsSkeleton } from '@/components/products/reviews-skeleton'

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Fast data - fetch immediately
  const product = await getProduct(params.id)

  return (
    <div>
      <ProductDetails product={product} />
      
      {/* Slow data - stream in when ready */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />
      </Suspense>
    </div>
  )
}

// components/products/reviews.tsx - Separate component for streaming
async function Reviews({ productId }: { productId: string }) {
  // This data loads independently and streams when ready
  const reviews = await getProductReviews(productId)
  
  return (
    <div>
      {reviews.map(review => (
        <div key={review.id}>{review.comment}</div>
      ))}
    </div>
  )
}
```

#### Sequential Data Fetching (When Required)

```typescript
// Only use sequential fetching when data depends on previous result
export default async function UserOrderPage({ params }: { params: { id: string } }) {
  // Must fetch user first
  const user = await getUser(params.id)
  
  // Order depends on user data
  const orders = await getUserOrders(user.email)
  
  return <OrderList orders={orders} />
}
```

### Caching Strategies

#### Static Generation (Default)

```typescript
// Fully static - built at build time
export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()
  return <ProductGrid products={featuredProducts} />
}
```

#### Incremental Static Regeneration (ISR)

```typescript
// Revalidate every hour
export const revalidate = 3600

export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductGrid products={products} />
}
```

#### Dynamic Rendering

```typescript
// Force dynamic - never cached
export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const cart = await getUserCart()
  return <Cart items={cart.items} />
}
```

#### Per-Request Caching

```typescript
// Cache for specific fetch requests
const product = await fetch(`https://api.example.com/products/${id}`, {
  next: { revalidate: 60 }, // Revalidate every 60 seconds
})

// No cache for specific fetch requests
const user = await fetch(`https://api.example.com/users/${id}`, {
  cache: 'no-store',
})
```

### Route Handlers (API Routes)

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'

const searchParamsSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
})

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const params = searchParamsSchema.parse({
      category: searchParams.get('category'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    // Build query
    const where = {
      ...(params.category && { categoryId: params.category }),
      ...(params.minPrice && { price: { gte: params.minPrice } }),
      ...(params.maxPrice && { price: { lte: params.maxPrice } }),
    }

    // Execute query
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: params.limit,
        skip: (params.page - 1) * params.limit,
        include: {
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ])

    // Return response
    return NextResponse.json({
      products,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    })
  } catch (error) {
    console.error('Products API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Handle POST request
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
```

### Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/account')

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  // Redirect unauthenticated users to login
  if (isProtectedPage && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/account/:path*',
    '/login',
    '/register',
  ],
}
```

## Type Definitions

### Proper Type Organization

```typescript
// types/product.ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  images: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProductWithCategory extends Product {
  category: Category
}

export type ProductCreateInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export type ProductUpdateInput = Partial<ProductCreateInput>

// Discriminated unions for result types
export type ProductResult =
  | { success: true; product: Product }
  | { success: false; error: string }
```

### Generic Types

```typescript
// types/api.ts
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Usage
type ProductsResponse = PaginatedResponse<Product>
type CreateProductResponse = ApiResponse<Product>
```

### Utility Types

```typescript
// Make specific fields required
type ProductWithRequiredImages = Product & Required<Pick<Product, 'images'>>

// Make specific fields optional
type OptionalPrice = Omit<Product, 'price'> & Partial<Pick<Product, 'price'>>

// Readonly for immutable data
type ImmutableProduct = Readonly<Product>

// Deep readonly
type DeepReadonlyProduct = {
  readonly [K in keyof Product]: Product[K] extends object
    ? DeepReadonly<Product[K]>
    : readonly Product[K]
}
```

## Environment Variables

### Type-Safe Environment Variables

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  
  // Optional
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

const envParsed = envSchema.safeParse(process.env)

if (!envParsed.success) {
  console.error('❌ Invalid environment variables:', envParsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = envParsed.data

// Type augmentation for process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
```

## Error Handling

### Custom Error Classes

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}
```

### Error Handling in Server Actions

```typescript
import { AppError, ValidationError, NotFoundError } from '@/lib/errors'

export async function deleteProduct(productId: string) {
  try {
    // Validate input
    if (!productId) {
      throw new ValidationError('Product ID is required')
    }

    // Check if exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new NotFoundError('Product')
    }

    // Delete
    await prisma.product.delete({
      where: { id: productId },
    })

    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Delete product error:', error)

    if (error instanceof AppError) {
      return { success: false, error: error.message, code: error.code }
    }

    return { success: false, error: 'Failed to delete product' }
  }
}
```

## Best Practices Summary

### DO ✅

- Use Server Components by default
- Use Server Actions for mutations
- Validate all inputs with Zod
- Use proper TypeScript types (no `any`)
- Implement error boundaries
- Add loading states
- Use parallel data fetching when possible
- Implement proper caching strategies
- Use type-safe environment variables
- Follow file naming conventions

### DON'T ❌

- Don't use Client Components unnecessarily
- Don't use type assertions (`as`)
- Don't ignore TypeScript errors
- Don't fetch data sequentially when parallel is possible
- Don't use inline styles (use Tailwind)
- Don't expose sensitive data to client
- Don't skip input validation
- Don't use `any` type
- Don't ignore error handling
- Don't forget to revalidate cache after mutations

---

**Last Updated:** November 24, 2025

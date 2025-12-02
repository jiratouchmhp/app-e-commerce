import '@testing-library/jest-dom'
import { render, screen, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import type { Decimal } from '@prisma/client/runtime/library'

// Re-export screen for convenience
export { screen }

/**
 * Custom render function that wraps components with required providers
 * Use this for testing Client Components that depend on context
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    session = null,
    ...renderOptions
  }: RenderOptions & { session?: Session | null } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <SessionProvider session={session}>{children}</SessionProvider>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Mock factories for generating test data
 * These match the Prisma schema types but use simplified types for testing
 */

type MockProduct = {
  id: string
  name: string
  slug: string
  description: string
  price: number | Decimal
  stock: number
  categoryId: string
  images: string[]
  createdAt: Date
  updatedAt: Date
}

export const mockProduct = (overrides: Partial<MockProduct> = {}): MockProduct => ({
  id: 'product-123',
  name: 'Test Product',
  slug: 'test-product',
  description: 'A comprehensive test product description for testing purposes',
  price: 1999,
  stock: 10,
  categoryId: 'category-123',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

type MockUser = {
  id: string
  email: string
  name: string | null
  role: string
  image?: string | null
  hashedPassword?: string | null
  emailVerified?: Date | null
  createdAt: Date
  updatedAt: Date
}

export const mockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'CUSTOMER',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

export const mockSession = (
  overrides: Partial<Session> & { user?: Partial<MockUser> } = {}
): Session => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  user: mockUser(overrides.user ?? {}) as any, // Type assertion needed for test mocks
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
})

type MockCartItem = {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: Date
  updatedAt: Date
  product?: MockProduct
}

export const mockCartItem = (overrides: Partial<MockCartItem> = {}): MockCartItem => ({
  id: 'cart-item-123',
  userId: 'user-123',
  productId: 'product-123',
  quantity: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  product: mockProduct(),
  ...overrides,
})

type MockOrder = {
  id: string
  userId: string | null
  guestEmail?: string | null
  status: string
  total: number | Decimal
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  createdAt: Date
  updatedAt: Date
}

export const mockOrder = (overrides: Partial<MockOrder> = {}): MockOrder => ({
  id: 'order-123',
  userId: 'user-123',
  status: 'PENDING',
  total: 1999,
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'US',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

type MockCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export const mockCategory = (overrides: Partial<MockCategory> = {}): MockCategory => ({
  id: 'category-123',
  name: 'Electronics',
  slug: 'electronics',
  description: 'Electronic devices and accessories',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

/**
 * Helper to create FormData for testing Server Actions
 */
export function createFormData(data: Record<string, string | number>): FormData {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return formData
}

/**
 * Helper to wait for a specific time (use sparingly, prefer waitFor)
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Re-export everything from Testing Library
 */
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

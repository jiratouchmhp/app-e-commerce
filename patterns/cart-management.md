# Shopping Cart Management Pattern

## Overview

Client-side cart state management using Zustand with persistence. Provides optimistic updates and localStorage sync.

## When to Use

- Managing shopping cart state across pages
- Adding/removing/updating cart items
- Persisting cart between sessions
- Calculating cart totals and item counts

## Implementation

### Cart Store (Zustand)

```typescript
// store/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId)
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          }
        })
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
```

### Cart Page

```typescript
// app/(shop)/cart/page.tsx
'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { CartItem } from '@/components/cart/cart-item'
import { CartSummary } from '@/components/cart/cart-summary'
import { ShoppingCart } from 'lucide-react'

export default function CartPage() {
  const items = useCartStore((state) => state.items)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some products to get started
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
```

### Cart Item Component

```typescript
// components/cart/cart-item.tsx
'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore, type CartItem as CartItemType } from '@/store/cart-store'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-4 p-4 border border-border rounded-lg">
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded-md"
        />
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{item.name}</h3>
        <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="p-1 rounded hover:bg-accent"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className="w-12 text-center font-medium">{item.quantity}</span>
        
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="p-1 rounded hover:bg-accent"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="flex flex-col items-end gap-2">
        <p className="font-semibold">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        
        <button
          onClick={() => removeItem(item.id)}
          className="text-destructive hover:text-destructive/80 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
```

### Cart Summary Component

```typescript
// components/cart/cart-summary.tsx
'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'

export function CartSummary() {
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  
  const subtotal = getTotalPrice()
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="border border-border rounded-lg p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({getTotalItems()} items)
          </span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {subtotal > 0 && subtotal < 50 && (
        <p className="text-sm text-muted-foreground mb-4">
          Add ${(50 - subtotal).toFixed(2)} more for free shipping
        </p>
      )}
      
      <Link
        href="/checkout"
        className="block w-full bg-primary text-primary-foreground text-center px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Proceed to Checkout
      </Link>
    </div>
  )
}
```

## Key Features

- **Persistent State**: Cart persists across page reloads using localStorage
- **Optimistic Updates**: UI updates immediately before server sync
- **Quantity Management**: Increment/decrement with automatic removal at 0
- **Duplicate Handling**: Automatically merges duplicate products
- **Calculations**: Automatic subtotal, tax, and shipping calculations
- **Free Shipping**: Threshold-based free shipping promotion

## Testing

```typescript
// __tests__/store/cart-store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/store/cart-store'

describe('Cart Store', () => {
  beforeEach(() => {
    // Clear store before each test
    useCartStore.getState().clearCart()
  })

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCartStore())
    
    act(() => {
      result.current.addItem({
        id: '1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 29.99,
        image: '/test.jpg',
      })
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(1)
  })

  it('increments quantity for existing item', () => {
    const { result } = renderHook(() => useCartStore())
    
    const item = {
      id: '1',
      productId: 'prod-1',
      name: 'Test Product',
      price: 29.99,
      image: '/test.jpg',
    }
    
    act(() => {
      result.current.addItem(item)
      result.current.addItem(item)
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })
})
```

## Related Patterns

- [Checkout Flow](./checkout-flow.md) - Multi-step checkout process
- [Product Catalog](./product-catalog.md) - Product listing and details

---

**Last Updated:** November 24, 2025

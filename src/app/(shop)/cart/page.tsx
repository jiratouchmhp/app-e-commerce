'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { CartItem } from '@/components/cart/cart-item'
import { CartSummary } from '@/components/cart/cart-summary'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Shopping Cart</h1>
        </div>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Shopping Cart</h1>
        </div>

        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mb-6 text-muted-foreground">
              Add some products to get started!
            </p>
            <Button asChild size="lg">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">Shopping Cart</h1>
        <Button
          variant="outline"
          onClick={() => {
            if (confirm('Are you sure you want to clear your cart?')) {
              clearCart()
            }
          }}
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Cart Items ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>
            <div className="space-y-0">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}

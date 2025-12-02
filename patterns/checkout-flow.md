# Checkout Flow Pattern

## Overview

Multi-step checkout process with shipping and payment forms, validation, and Stripe integration.

## When to Use

- Processing customer orders
- Collecting shipping information
- Handling payments with Stripe
- Creating order records

## Implementation

### Checkout Page

```typescript
// app/(shop)/checkout/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { ShippingForm } from '@/components/checkout/shipping-form'
import { PaymentForm } from '@/components/checkout/payment-form'
import { OrderSummary } from '@/components/checkout/order-summary'
import { createOrder } from '@/lib/actions/orders'
import type { ShippingInfo, PaymentInfo } from '@/types/checkout'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, getTotalPrice } = useCartStore()
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping')
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleShippingSubmit(data: ShippingInfo) {
    setShippingInfo(data)
    setStep('payment')
  }

  async function handlePaymentSubmit(paymentInfo: PaymentInfo) {
    if (!shippingInfo) return

    setIsProcessing(true)
    try {
      const result = await createOrder({
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping: shippingInfo,
        payment: paymentInfo,
        total: getTotalPrice(),
      })

      if (result.success) {
        clearCart()
        router.push(`/checkout/success?orderId=${result.orderId}`)
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step Indicator */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            
            <div className="flex-1 h-0.5 bg-border" />
            
            <div className={`flex items-center ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-8 w-8 rounded-full ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} flex items-center justify-center font-semibold`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>

          {/* Forms */}
          {step === 'shipping' && (
            <ShippingForm onSubmit={handleShippingSubmit} />
          )}
          
          {step === 'payment' && shippingInfo && (
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              onBack={() => setStep('shipping')}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary items={items} />
        </div>
      </div>
    </div>
  )
}
```

### Shipping Form

```typescript
// components/checkout/shipping-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid zip code'),
})

type ShippingInfo = z.infer<typeof shippingSchema>

interface ShippingFormProps {
  onSubmit: (data: ShippingInfo) => void
}

export function ShippingForm({ onSubmit }: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingInfo>({
    resolver: zodResolver(shippingSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
        
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                id="firstName"
                {...register('firstName')}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                {...register('lastName')}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Address
            </label>
            <input
              id="address"
              {...register('address')}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* City, Zip */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                City
              </label>
              <input
                id="city"
                {...register('city')}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                Zip Code
              </label>
              <input
                id="zipCode"
                {...register('zipCode')}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.zipCode && (
                <p className="text-sm text-destructive mt-1">{errors.zipCode.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  )
}
```

### Create Order Server Action

```typescript
// lib/actions/orders.ts
'use server'

import { prisma } from '@/lib/db/prisma'
import { getServerSession } from '@/lib/auth'
import { createPaymentIntent } from '@/lib/stripe'
import { z } from 'zod'

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1),
  shipping: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    address: z.string(),
    city: z.string(),
    zipCode: z.string(),
  }),
  payment: z.object({
    paymentIntentId: z.string(),
    paymentMethod: z.string(),
  }),
  total: z.number().positive(),
})

export async function createOrder(input: unknown) {
  try {
    // Validate input
    const data = createOrderSchema.parse(input)
    
    // Get session (optional - support guest checkout)
    const session = await getServerSession()
    
    // Create payment intent
    const paymentIntent = await createPaymentIntent(data.total)
    
    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id,
        total: data.total,
        status: 'PENDING',
        paymentIntentId: paymentIntent.id,
        shippingAddress: JSON.stringify(data.shipping),
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    })
    
    return {
      success: true,
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error('Create order error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid order data' }
    }
    
    return { success: false, error: 'Failed to create order' }
  }
}
```

## Key Features

- **Multi-Step Process**: Shipping → Payment with progress indicator
- **Form Validation**: Zod schemas with React Hook Form
- **Guest Checkout**: Optional user authentication
- **Stripe Integration**: Payment intent creation and confirmation
- **Order Persistence**: Database record with items and shipping info
- **Error Handling**: User-friendly error messages
- **Back Navigation**: Ability to go back and edit shipping info

## Related Patterns

- [Cart Management](./cart-management.md) - Shopping cart state
- [Payment Integration](./payment-integration.md) - Stripe setup and webhooks

---

**Last Updated:** November 24, 2025

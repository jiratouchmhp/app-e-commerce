# Payment Integration Pattern

## Overview

Stripe payment processing with payment intents, webhooks, and order status updates.

## When to Use

- Processing credit card payments
- Handling payment confirmations
- Managing order status based on payment events
- Refunds and payment disputes

## Implementation

### Stripe Configuration

```typescript
// lib/stripe.ts
import Stripe from 'stripe'
import { env } from '@/lib/env'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function createPaymentIntent(amount: number) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  )
}
```

### Payment Form Component

```typescript
// components/checkout/payment-form.tsx
'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import type { PaymentInfo } from '@/types/checkout'

interface PaymentFormProps {
  onSubmit: (paymentInfo: PaymentInfo) => Promise<void>
  onBack: () => void
  isProcessing: boolean
}

export function PaymentForm({ onSubmit, onBack, isProcessing }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'An error occurred')
      return
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (paymentError) {
      setError(paymentError.message || 'Payment failed')
      return
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      await onSubmit({
        paymentIntentId: paymentIntent.id,
        paymentMethod: paymentIntent.payment_method as string,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
        
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <PaymentElement />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 border border-input px-6 py-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
        >
          Back
        </button>
        
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </form>
  )
}
```

### Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe, verifyWebhookSignature } from '@/lib/stripe'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    const event = await verifyWebhookSignature(body, signature)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        
        // Update order status
        await prisma.order.update({
          where: {
            paymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        })
        
        // Optional: Send confirmation email
        // await sendOrderConfirmationEmail(order.id)
        
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        
        // Update order status
        await prisma.order.update({
          where: {
            paymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'PAYMENT_FAILED',
          },
        })
        
        // Optional: Notify customer
        // await sendPaymentFailedEmail(order.id)
        
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        
        // Find order by payment intent
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: charge.payment_intent as string },
        })
        
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'REFUNDED',
              refundedAt: new Date(),
            },
          })
        }
        
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
```

### Create Payment Intent Server Action

```typescript
// lib/actions/payment.ts
'use server'

import { createPaymentIntent } from '@/lib/stripe'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  orderId: z.string().uuid(),
})

export async function createCheckoutPaymentIntent(input: unknown) {
  try {
    const data = createPaymentIntentSchema.parse(input)
    
    // Optional: Verify user owns the order
    const session = await getServerSession()
    if (session?.user?.id) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: { userId: true },
      })
      
      if (order?.userId !== session.user.id) {
        return { success: false, error: 'Unauthorized' }
      }
    }
    
    // Create payment intent
    const paymentIntent = await createPaymentIntent(data.amount)
    
    // Store payment intent ID with order
    await prisma.order.update({
      where: { id: data.orderId },
      data: { paymentIntentId: paymentIntent.id },
    })
    
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error('Create payment intent error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    
    return { success: false, error: 'Failed to create payment intent' }
  }
}
```

### Stripe Provider Setup

```typescript
// app/(shop)/checkout/layout.tsx
'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}
```

## Key Features

- **Payment Intents**: Secure payment processing with 3D Secure support
- **Webhook Handling**: Async payment confirmation and status updates
- **Signature Verification**: Secure webhook endpoint validation
- **Idempotency**: Prevent duplicate payments
- **Error Handling**: User-friendly error messages
- **Order Tracking**: Link payments to orders in database
- **Refund Support**: Handle refunds via webhooks

## Security Best Practices

- Store Stripe secret key in environment variables
- Verify webhook signatures
- Never expose secret keys to client
- Use HTTPS in production
- Implement rate limiting on payment endpoints
- Log all payment events for audit trail
- Set up Stripe monitoring and alerts

## Testing

### Test Cards

```typescript
// Development test cards
const testCards = {
  success: '4242 4242 4242 4242',
  decline: '4000 0000 0000 0002',
  requiresAuth: '4000 0025 0000 3155',
  insufficientFunds: '4000 0000 0000 9995',
}
```

### Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

## Related Patterns

- [Checkout Flow](./checkout-flow.md) - Full checkout implementation
- [Cart Management](./cart-management.md) - Order totals and items

---

**Last Updated:** November 24, 2025

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

import { useCartStore } from '@/store/cart-store'
import { ShippingForm } from '@/components/checkout/shipping-form'
import { PaymentForm } from '@/components/checkout/payment-form'
import { CartSummary } from '@/components/cart/cart-summary'
import { createOrder } from '@/lib/actions/orders'
import { createPaymentIntent } from '@/lib/stripe'
import type { ShippingAddressInput } from '@/lib/validations/order'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, TAX_RATE } from '@/lib/constants'

type CheckoutStep = 'shipping' | 'payment'

export default function CheckoutPage() {
  const router = useRouter()
  const { status } = useSession()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressInput | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout')
    }
  }, [status, router])

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart')
    }
  }, [mounted, items.length, router])

  async function handleShippingSubmit(data: ShippingAddressInput) {
    setError(null)
    setIsProcessing(true)

    try {
      setShippingAddress(data)

      // Calculate total
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
      const tax = subtotal * TAX_RATE
      const total = subtotal + shipping + tax

      // Create payment intent
      const paymentIntent = await createPaymentIntent(Math.round(total * 100))

      if (!paymentIntent.client_secret) {
        throw new Error('Failed to create payment intent')
      }

      setClientSecret(paymentIntent.client_secret)
      setCurrentStep('payment')
    } catch (error) {
      console.error('Shipping submit error:', error)
      setError('Failed to process shipping information')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handlePaymentSuccess() {
    if (!shippingAddress || !clientSecret) return

    setIsProcessing(true)

    try {
      const result = await createOrder({
        shippingAddress,
        paymentIntentId: clientSecret.split('_secret_')[0],
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order')
      }

      clearCart()
      router.push(`/checkout/success?orderId=${result.orderId}`)
    } catch (error) {
      console.error('Order creation error:', error)
      setError('Failed to create order')
    } finally {
      setIsProcessing(false)
    }
  }

  function handlePaymentError(errorMessage: string) {
    setError(errorMessage)
  }

  if (status === 'loading' || !mounted) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Checkout</h1>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 ${
              currentStep === 'shipping' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep === 'shipping' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              1
            </div>
            <span className="font-medium">Shipping</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div
            className={`flex items-center gap-2 ${
              currentStep === 'payment' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              2
            </div>
            <span className="font-medium">Payment</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {currentStep === 'shipping' && (
            <ShippingForm onSubmit={handleShippingSubmit} isLoading={isProcessing} />
          )}

          {currentStep === 'payment' && clientSecret && (
            <PaymentForm
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}

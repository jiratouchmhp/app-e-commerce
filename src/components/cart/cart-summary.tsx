'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, TAX_RATE } from '@/lib/constants'
import { Truck, Sparkles } from 'lucide-react'

export function CartSummary() {
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotal())

  const subtotalInCents = subtotal * 100
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const shippingInCents = shipping * 100
  const tax = subtotal * TAX_RATE
  const taxInCents = tax * 100
  const total = subtotal + shipping + tax
  const totalInCents = total * 100

  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subtotal */}
        <motion.div
          className="flex justify-between text-sm"
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-muted-foreground">Subtotal</span>
          <motion.span
            key={subtotalInCents}
            className="font-medium"
            initial={{ scale: 1.2, color: 'rgb(34, 197, 94)' }}
            animate={{ scale: 1, color: 'inherit' }}
            transition={{ duration: 0.3 }}
          >
            {formatPrice(subtotalInCents)}
          </motion.span>
        </motion.div>

        {/* Shipping */}
        <motion.div
          className="flex justify-between text-sm"
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <span className="text-muted-foreground flex items-center gap-1">
            <Truck className="h-4 w-4" />
            Shipping
          </span>
          <AnimatePresence mode="wait">
            {shipping === 0 ? (
              <motion.span
                key="free"
                className="font-medium text-green-600 flex items-center gap-1"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Sparkles className="h-4 w-4" />
                FREE
              </motion.span>
            ) : (
              <motion.span
                key="paid"
                className="font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {formatPrice(shippingInCents)}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Free Shipping Progress */}
        <AnimatePresence>
          {remainingForFreeShipping > 0 && (
            <motion.div
              className="rounded-lg bg-muted p-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs text-muted-foreground">
                Add <span className="font-semibold">{formatPrice(remainingForFreeShipping * 100)}</span> more
                to get <span className="font-semibold text-green-600">FREE SHIPPING</span>
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${freeShippingProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Free Shipping Celebration */}
        <AnimatePresence>
          {hasFreeShipping && (
            <motion.div
              className="rounded-lg bg-green-50 border border-green-200 p-3"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center gap-2 text-green-700">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Truck className="h-5 w-5" />
                </motion.div>
                <p className="text-sm font-semibold flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  You've unlocked FREE shipping!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tax */}
        <motion.div
          className="flex justify-between text-sm"
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-muted-foreground">Tax ({TAX_RATE * 100}%)</span>
          <motion.span
            key={taxInCents}
            className="font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {formatPrice(taxInCents)}
          </motion.span>
        </motion.div>

        {/* Total */}
        <motion.div
          className="border-t border-border pt-4"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <motion.span
              key={totalInCents}
              className="text-lg font-bold"
              initial={{ scale: 1.2, color: 'rgb(34, 197, 94)' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.3 }}
            >
              {formatPrice(totalInCents)}
            </motion.span>
          </div>
        </motion.div>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button asChild className="w-full" size="lg" disabled={items.length === 0}>
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

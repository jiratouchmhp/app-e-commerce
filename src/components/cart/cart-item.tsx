'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types/cart'
import { useState } from 'react'

interface CartItemProps {
  item: CartItemType & { slug?: string }
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const [isRemoving, setIsRemoving] = useState(false)

  const priceInCents = item.price * 100
  const subtotalInCents = item.price * item.quantity * 100

  function handleQuantityChange(newQuantity: number) {
    if (newQuantity <= 0) {
      handleRemove()
    } else if (newQuantity <= item.stock) {
      updateQuantity(item.productId, newQuantity)
    }
  }

  function handleRemove() {
    setIsRemoving(true)
    // Wait for animation to complete before removing
    setTimeout(() => {
      removeItem(item.productId)
    }, 300)
  }

  if (isRemoving) {
    return (
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: 0, x: -100 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        className="flex gap-4 border-b border-border py-4"
      >
        {/* Fading out content */}
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 border-b border-border py-4"
    >
      {/* Product Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <Link href={`/products/${item.slug || item.productId}`}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover transition-transform hover:scale-105"
          />
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <Link
              href={`/products/${item.slug || item.productId}`}
              className="font-semibold transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{formatPrice(priceInCents)}</p>
          </div>

          {/* Remove Button */}
          <motion.button
            onClick={handleRemove}
            className="h-8 w-8 rounded-lg transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove item"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Quantity Controls and Subtotal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="h-8 w-8"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <AnimatePresence mode="wait">
              <motion.span
                key={item.quantity}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-12 text-center text-sm font-medium"
              >
                {item.quantity}
              </motion.span>
            </AnimatePresence>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="h-8 w-8"
            >
              <Plus className="h-3 w-3" />
            </Button>

            {item.quantity >= item.stock && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-2 text-xs text-destructive"
              >
                Max stock reached
              </motion.span>
            )}
          </div>

          <motion.p
            key={subtotalInCents}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-semibold"
          >
            {formatPrice(subtotalInCents)}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

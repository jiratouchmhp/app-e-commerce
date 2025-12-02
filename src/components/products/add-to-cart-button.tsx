'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'

interface AddToCartButtonProps {
  productId: string
  productName: string
  productPrice: number
  productImage: string
  productStock: number
  productSlug?: string
  disabled?: boolean
}

export function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  productStock,
  disabled = false,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  // Reset success state after 2 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isSuccess])

  async function handleAddToCart() {
    setIsLoading(true)

    try {
      // Simulate async operation for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      addItem(
        {
          productId,
          name: productName,
          price: productPrice,
          image: productImage,
          stock: productStock,
        },
        1
      )

      setIsLoading(false)
      setIsSuccess(true)
    } catch (error) {
      console.error('Add to cart error:', error)
      setIsLoading(false)
    }
  }

  const buttonVariant = isSuccess ? 'secondary' : 'default'

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isLoading || isSuccess}
      className="w-full"
      size="lg"
      variant={buttonVariant}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <ShoppingCart className="h-5 w-5" />
            </motion.div>
            <span>Adding...</span>
          </motion.div>
        ) : isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <Check className="h-5 w-5" />
            </motion.div>
            <span>Added to Cart!</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Add to Cart</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}

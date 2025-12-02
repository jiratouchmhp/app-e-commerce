'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cart-store'
import { useEffect, useState } from 'react'

export function CartIcon() {
  const [mounted, setMounted] = useState(false)
  const [prevCount, setPrevCount] = useState(0)
  const itemCount = useCartStore((state) => state.getItemCount())

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track count changes for animation
  useEffect(() => {
    if (mounted && itemCount > prevCount) {
      // Item was added - trigger bounce
      setPrevCount(itemCount)
    } else if (mounted) {
      setPrevCount(itemCount)
    }
  }, [itemCount, mounted, prevCount])

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-accent"
      aria-label="Shopping cart"
    >
      <motion.div
        animate={
          mounted && itemCount > prevCount
            ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }
            : {}
        }
        transition={{ duration: 0.5 }}
      >
        <ShoppingCart className="h-5 w-5" />
      </motion.div>
      
      <AnimatePresence mode="wait">
        {mounted && itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
          >
            <motion.span
              key={`count-${itemCount}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {itemCount > 9 ? '9+' : itemCount}
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

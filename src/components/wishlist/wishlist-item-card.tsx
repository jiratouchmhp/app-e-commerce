'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { removeFromWishlist, moveToCart } from '@/lib/actions/wishlist'
import { formatPrice } from '@/lib/utils'
import type { WishlistItem } from '@/types/wishlist'

interface WishlistItemCardProps {
  item: WishlistItem
}

export function WishlistItemCard({ item }: WishlistItemCardProps) {
  const [isRemoving, startRemoveTransition] = useTransition()
  const [isMoving, startMoveTransition] = useTransition()
  const [isRemoved, setIsRemoved] = useState(false)

  const handleRemove = () => {
    startRemoveTransition(async () => {
      const result = await removeFromWishlist(item.productId)
      if (result.success) {
        setIsRemoved(true)
      }
    })
  }

  const handleMoveToCart = () => {
    startMoveTransition(async () => {
      const result = await moveToCart(item.productId)
      if (result.success) {
        setIsRemoved(true)
      }
    })
  }

  if (isRemoved) {
    return null
  }

  const priceInCents = item.price * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group overflow-hidden rounded-lg border border-border bg-card"
    >
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {item.stock === 0 && (
            <div className="absolute left-3 top-3 rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
              Out of Stock
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {item.category.name}
        </p>
        <Link href={`/products/${item.slug}`}>
          <h3 className="mb-2 line-clamp-2 font-semibold transition-colors hover:text-primary">
            {item.name}
          </h3>
        </Link>
        <p className="mb-4 text-lg font-bold">{formatPrice(priceInCents)}</p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleMoveToCart}
            disabled={isMoving || isRemoving || item.stock === 0}
            isLoading={isMoving}
            className="flex-1"
            size="sm"
          >
            {!isMoving && <ShoppingCart className="mr-1 h-4 w-4" />}
            {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          <Button
            onClick={handleRemove}
            disabled={isRemoving || isMoving}
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

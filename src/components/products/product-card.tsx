'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart } from 'lucide-react'
import type { ProductWithCategory } from '@/types/product'
import { formatPrice } from '@/lib/utils'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleWishlist } from '@/lib/actions/wishlist'
import { StarRating } from '@/components/reviews/star-rating'

interface ProductCardProps {
  product: ProductWithCategory
  initialIsInWishlist?: boolean
}

export function ProductCard({ product, initialIsInWishlist = false }: ProductCardProps) {
  const priceInCents = Number(product.price) * 100
  const [isFavorite, setIsFavorite] = useState(initialIsInWishlist)
  const [isAdding, setIsAdding] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    
    // Simulate add to cart
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsAdding(false)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Store previous state before optimistic update
    const previousState = isFavorite
    
    // Optimistically update the UI
    setIsFavorite(!previousState)
    
    startTransition(async () => {
      const result = await toggleWishlist(product.id)
      if (!result.success) {
        // Revert on failure
        setIsFavorite(previousState)
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      className="group relative"
    >
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-xl"
      >
        {/* Image Container with Overlay */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <motion.div
            variants={{
              hover: { scale: 1.1 },
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full w-full"
          >
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          </motion.div>
          
          {/* Gradient Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            variants={{
              hover: { opacity: 1 },
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          >
            {/* Quick Add Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              variants={{
                hover: { y: 0, opacity: 1 },
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <Button
                onClick={handleQuickAdd}
                isLoading={isAdding}
                className="w-full bg-white text-black hover:bg-white/90"
                size="sm"
              >
                {!isAdding && <ShoppingCart className="h-4 w-4" />}
                Quick Add
              </Button>
            </motion.div>
          </motion.div>

          {/* Favorite Button */}
          <motion.button
            onClick={handleToggleFavorite}
            disabled={isPending}
            className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={isFavorite ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </motion.div>
          </motion.button>

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute left-3 top-3 rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.category.name}
          </p>
          <h3 className="mb-2 line-clamp-2 font-semibold transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.reviewStats && product.reviewStats.averageRating > 0 && (
            <div className="mb-2 flex items-center gap-2">
              <StarRating rating={product.reviewStats.averageRating} size="sm" showValue />
              {product._count && product._count.reviews > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({product._count.reviews})
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <motion.p 
              className="text-lg font-bold"
              whileHover={{ scale: 1.05 }}
            >
              {formatPrice(priceInCents)}
            </motion.p>
            {product.stock > 0 && product.stock <= 5 && (
              <motion.span 
                className="text-xs font-medium text-warning"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Only {product.stock} left
              </motion.span>
            )}
            {product.stock > 5 && (
              <span className="text-xs text-muted-foreground">In stock</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

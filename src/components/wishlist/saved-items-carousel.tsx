'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react'
import { useState, useTransition, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { moveToCart } from '@/lib/actions/wishlist'
import { formatPrice } from '@/lib/utils'
import type { WishlistItem } from '@/types/wishlist'

interface SavedItemsCarouselProps {
  items: WishlistItem[]
  title?: string
}

export function SavedItemsCarousel({
  items,
  title = 'Saved Items',
}: SavedItemsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 300
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (items.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-bold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </div>
        <Link
          href="/account/wishlist"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="relative">
        {/* Scroll Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {canScrollRight && items.length > 3 && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Carousel */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <SavedItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface SavedItemCardProps {
  item: WishlistItem
}

function SavedItemCard({ item }: SavedItemCardProps) {
  const [isMoving, startMoveTransition] = useTransition()
  const [isMoved, setIsMoved] = useState(false)

  const handleMoveToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startMoveTransition(async () => {
      const result = await moveToCart(item.productId)
      if (result.success) {
        setIsMoved(true)
      }
    })
  }

  if (isMoved) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group w-48 flex-shrink-0"
    >
      <Link href={`/products/${item.slug}`} className="block">
        <div className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="200px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {item.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-xs font-medium text-white">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="mb-1 truncate text-sm font-medium">{item.name}</h3>
            <p className="mb-2 text-sm font-bold">{formatPrice(item.price)}</p>

            <Button
              onClick={handleMoveToCart}
              disabled={isMoving || item.stock === 0}
              isLoading={isMoving}
              size="sm"
              className="w-full"
              variant="outline"
            >
              {!isMoving && <ShoppingCart className="mr-1 h-3 w-3" />}
              {item.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

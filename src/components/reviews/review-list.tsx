'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ReviewCard } from './review-card'
import { Button } from '@/components/ui/button'
import type { ReviewWithUser } from '@/types/review'

interface ReviewListProps {
  initialReviews: ReviewWithUser[]
  totalReviews: number
  currentUserId?: string
  onLoadMore?: () => Promise<ReviewWithUser[]>
  className?: string
}

export function ReviewList({
  initialReviews,
  totalReviews,
  currentUserId,
  onLoadMore,
  className = '',
}: ReviewListProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [isLoading, setIsLoading] = useState(false)
  const hasMore = reviews.length < totalReviews

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoading) return

    setIsLoading(true)
    try {
      const newReviews = await onLoadMore()
      setReviews((prev) => [...prev, ...newReviews])
    } catch (error) {
      console.error('Failed to load more reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className={`rounded-lg border border-border bg-card p-8 text-center ${className}`}>
        <p className="text-muted-foreground">No reviews yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Be the first to share your thoughts!
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Reviews */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ReviewCard review={review} currentUserId={currentUserId} />
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="mt-8 text-center">
          <Button
            onClick={handleLoadMore}
            isLoading={isLoading}
            disabled={isLoading}
            variant="outline"
            size="lg"
          >
            Load More Reviews
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Showing {reviews.length} of {totalReviews} reviews
          </p>
        </div>
      )}
    </div>
  )
}

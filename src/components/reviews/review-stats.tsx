'use client'

import { motion } from 'framer-motion'
import { StarRating } from './star-rating'
import type { ReviewStats as ReviewStatsType } from '@/types/review'

interface ReviewStatsProps {
  stats: ReviewStatsType
  className?: string
}

export function ReviewStats({ stats, className = '' }: ReviewStatsProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats

  if (totalReviews === 0) {
    return (
      <div className={`rounded-lg border border-border bg-card p-6 ${className}`}>
        <p className="text-center text-muted-foreground">No reviews yet</p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Be the first to review this product!
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-border bg-card p-6 ${className}`}>
      {/* Average Rating */}
      <div className="mb-6 text-center">
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-2 text-5xl font-bold text-foreground"
        >
          {averageRating.toFixed(1)}
        </motion.p>
        <StarRating rating={averageRating} size="lg" className="justify-center" />
        <p className="mt-2 text-sm text-muted-foreground">
          Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating as 1 | 2 | 3 | 4 | 5]
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

          return (
            <motion.div
              key={rating}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (5 - rating) * 0.05 }}
              className="flex items-center gap-3"
            >
              {/* Star label */}
              <div className="flex w-16 items-center gap-1 text-sm font-medium text-foreground">
                {rating} <span className="text-yellow-400">★</span>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: (5 - rating) * 0.05 }}
                  className="h-full bg-yellow-400"
                />
              </div>

              {/* Count */}
              <div className="w-12 text-right text-sm text-muted-foreground">
                {count}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

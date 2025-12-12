'use client'

import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface StarRatingProps {
  rating: number
  maxRating?: number
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function StarRating({
  rating,
  maxRating = 5,
  showValue = false,
  size = 'md',
  className = '',
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1)
  const roundedRating = Math.round(rating * 2) / 2 // Round to nearest 0.5

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center" aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
        {stars.map((star) => {
          const fillPercentage = Math.min(Math.max(roundedRating - (star - 1), 0), 1)
          
          return (
            <motion.div
              key={star}
              className="relative"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: star * 0.05 }}
            >
              {/* Background star (empty) */}
              <Star className={`${sizeClasses[size]} text-gray-300`} />
              
              {/* Foreground star (filled) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage * 100}%` }}
              >
                <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {showValue && (
        <span className={`${textSizeClasses[size]} font-medium text-foreground`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

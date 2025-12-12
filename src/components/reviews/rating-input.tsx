'use client'

import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function RatingInput({
  value,
  onChange,
  maxRating = 5,
  size = 'md',
  disabled = false,
  className = '',
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1)
  const displayRating = hoverRating || value

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className="flex items-center"
        onMouseLeave={() => setHoverRating(0)}
        role="radiogroup"
        aria-label="Select rating"
      >
        {stars.map((star) => {
          const isActive = star <= displayRating
          
          return (
            <motion.button
              key={star}
              type="button"
              onClick={() => !disabled && onChange(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              disabled={disabled}
              whileHover={{ scale: disabled ? 1 : 1.1 }}
              whileTap={{ scale: disabled ? 1 : 0.9 }}
              className={`transition-transform ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              aria-label={`Rate ${star} out of ${maxRating} stars`}
              role="radio"
              aria-checked={star === value}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors ${
                  isActive
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              />
            </motion.button>
          )
        })}
      </div>
      
      {value > 0 && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-2 text-sm font-medium text-foreground"
        >
          {value} {value === 1 ? 'star' : 'stars'}
        </motion.span>
      )}
    </div>
  )
}

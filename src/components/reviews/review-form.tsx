'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RatingInput } from './rating-input'
import { Button } from '@/components/ui/button'
import { createReview } from '@/lib/actions/reviews'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
  className?: string
}

export function ReviewForm({ productId, onSuccess, className = '' }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    // Client-side validation
    const newErrors: Record<string, string> = {}
    if (rating === 0) newErrors.rating = 'Please select a rating'
    if (title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters'
    if (content.trim().length < 10) newErrors.content = 'Review must be at least 10 characters'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    startTransition(async () => {
      const result = await createReview({
        productId,
        rating,
        title: title.trim(),
        content: content.trim(),
      })

      if (result.success) {
        setSuccessMessage('Thank you for your review!')
        setRating(0)
        setTitle('')
        setContent('')
        
        // Call onSuccess callback after a short delay to show success message
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      } else {
        setErrors({ submit: result.error || 'Failed to submit review' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-success/10 p-4 text-success"
          >
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Rating <span className="text-destructive">*</span>
        </label>
        <RatingInput value={rating} onChange={setRating} disabled={isPending} size="lg" />
        {errors.rating && (
          <p className="mt-1 text-sm text-destructive">{errors.rating}</p>
        )}
      </div>

      {/* Title Input */}
      <div>
        <label htmlFor="review-title" className="mb-2 block text-sm font-medium text-foreground">
          Review Title <span className="text-destructive">*</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          placeholder="Summarize your review"
          maxLength={100}
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Content Textarea */}
      <div>
        <label htmlFor="review-content" className="mb-2 block text-sm font-medium text-foreground">
          Your Review <span className="text-destructive">*</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
          placeholder="Share your experience with this product"
          maxLength={2000}
          rows={6}
          className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content}</p>
          )}
          <p className="ml-auto text-xs text-muted-foreground">
            {content.length}/2000
          </p>
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        isLoading={isPending}
        disabled={isPending}
        className="w-full"
        size="lg"
      >
        Submit Review
      </Button>
    </form>
  )
}

'use client'

import { motion } from 'framer-motion'
import { ThumbsUp, CheckCircle } from 'lucide-react'
import { StarRating } from './star-rating'
import { Button } from '@/components/ui/button'
import { useState, useTransition } from 'react'
import { voteReviewHelpful } from '@/lib/actions/reviews'
import type { ReviewWithUser } from '@/types/review'
import Image from 'next/image'

interface ReviewCardProps {
  review: ReviewWithUser
  currentUserId?: string
}

export function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const helpfulVotesCount = review.votes.filter((vote) => vote.helpful).length
  const userVote = review.votes.find((vote) => vote.userId === currentUserId)
  
  const [hasVoted, setHasVoted] = useState(!!userVote)
  const [votesCount, setVotesCount] = useState(helpfulVotesCount)
  const [isPending, startTransition] = useTransition()

  const handleVoteHelpful = () => {
    if (!currentUserId || isPending) return

    const previousState = { hasVoted, votesCount }
    
    // Optimistic update
    setHasVoted(true)
    setVotesCount((prev) => (hasVoted ? prev : prev + 1))

    startTransition(async () => {
      const result = await voteReviewHelpful(review.id, true)
      if (!result.success) {
        // Revert on failure
        setHasVoted(previousState.hasVoted)
        setVotesCount(previousState.votesCount)
      }
    })
  }

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border pb-6 last:border-0"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
            {review.user.image ? (
              <Image
                src={review.user.image}
                alt={review.user.name || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">
                {((review.user.name ?? 'U')[0] ?? 'U').toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{review.user.name || 'Anonymous'}</p>
              {review.verifiedPurchase && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                >
                  <CheckCircle className="h-3 w-3" />
                  Verified Purchase
                </motion.div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>

        {/* Rating */}
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <h4 className="mb-2 font-semibold text-foreground">{review.title}</h4>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {review.content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVoteHelpful}
          disabled={!currentUserId || isPending || hasVoted}
          className={`gap-2 ${hasVoted ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <ThumbsUp className={`h-4 w-4 ${hasVoted ? 'fill-current' : ''}`} />
          <span className="text-xs">
            Helpful {votesCount > 0 && `(${votesCount})`}
          </span>
        </Button>
      </div>
    </motion.div>
  )
}

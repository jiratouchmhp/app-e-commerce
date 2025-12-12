import type { Review, ReviewVote, User } from '@prisma/client'

export type { Review, ReviewVote }

export interface ReviewWithUser extends Review {
  user: Pick<User, 'id' | 'name' | 'image'>
  votes: ReviewVote[]
  _count: {
    votes: number
  }
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface PaginatedReviews {
  reviews: ReviewWithUser[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  stats: ReviewStats
}

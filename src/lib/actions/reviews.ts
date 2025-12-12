'use server'

import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import {
  reviewSchema,
  reviewFiltersSchema,
  reviewVoteSchema,
  type ReviewInput,
} from '@/lib/validations/review'
import type { PaginatedReviews, ReviewStats } from '@/types/review'

/**
 * Get reviews for a product with pagination and filtering
 */
export async function getProductReviews(
  filters: Record<string, string | string[] | undefined>
): Promise<PaginatedReviews> {
  try {
    const validatedFilters = reviewFiltersSchema.parse({
      productId: filters.productId,
      rating: filters.rating,
      verifiedOnly: filters.verifiedOnly,
      sortBy: filters.sortBy || 'newest',
      page: filters.page || 1,
      pageSize: filters.pageSize || 10,
    })

    // Build where clause
    const where = {
      productId: validatedFilters.productId,
      ...(validatedFilters.rating && { rating: validatedFilters.rating }),
      ...(validatedFilters.verifiedOnly && { verifiedPurchase: true }),
    }

    // Build orderBy clause
    const orderByOptions = {
      highest: { rating: 'desc' as const },
      lowest: { rating: 'asc' as const },
      helpful: { createdAt: 'desc' as const }, // Fallback to newest for now
      newest: { createdAt: 'desc' as const },
    }
    
    const orderBy = orderByOptions[validatedFilters.sortBy || 'newest']

    // Execute queries in parallel
    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          votes: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
        orderBy,
        take: validatedFilters.pageSize,
        skip: (validatedFilters.page - 1) * validatedFilters.pageSize,
      }),
      prisma.review.count({ where }),
      getReviewStats(validatedFilters.productId),
    ])

    return {
      reviews,
      total,
      page: validatedFilters.page,
      pageSize: validatedFilters.pageSize,
      totalPages: Math.ceil(total / validatedFilters.pageSize),
      stats,
    }
  } catch (error) {
    console.error('Get product reviews error:', error)
    return {
      reviews: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      stats: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    }
  }
}

/**
 * Get review statistics for a product
 */
export async function getReviewStats(productId: string): Promise<ReviewStats> {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    })

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    // Calculate rating distribution
    const ratingDistribution = reviews.reduce(
      (dist, review) => {
        dist[review.rating as 1 | 2 | 3 | 4 | 5]++
        return dist
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    )

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
      ratingDistribution,
    }
  } catch (error) {
    console.error('Get review stats error:', error)
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }
}

/**
 * Create a new review for a product
 */
export async function createReview(input: ReviewInput) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'You must be logged in to submit a review',
      }
    }

    const validatedInput = reviewSchema.parse(input)

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: validatedInput.productId,
        },
      },
    })

    if (existingReview) {
      return {
        success: false,
        error: 'You have already reviewed this product',
      }
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedInput.productId },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Check if user has purchased this product (verified purchase)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: validatedInput.productId,
        order: {
          userId: session.user.id,
          status: 'DELIVERED',
        },
      },
    })

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: validatedInput.productId,
        rating: validatedInput.rating,
        title: validatedInput.title,
        content: validatedInput.content,
        verifiedPurchase: !!hasPurchased,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return {
      success: true,
      data: review,
    }
  } catch (error) {
    console.error('Create review error:', error)
    return {
      success: false,
      error: 'Failed to submit review. Please try again.',
    }
  }
}

/**
 * Vote on a review (helpful/not helpful)
 */
export async function voteReviewHelpful(reviewId: string, helpful: boolean) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'You must be logged in to vote',
      }
    }

    const validatedInput = reviewVoteSchema.parse({ reviewId, helpful })

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: validatedInput.reviewId },
    })

    if (!review) {
      return {
        success: false,
        error: 'Review not found',
      }
    }

    // Check if user already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        userId_reviewId: {
          userId: session.user.id,
          reviewId: validatedInput.reviewId,
        },
      },
    })

    if (existingVote) {
      // Update existing vote
      await prisma.reviewVote.update({
        where: {
          userId_reviewId: {
            userId: session.user.id,
            reviewId: validatedInput.reviewId,
          },
        },
        data: {
          helpful: validatedInput.helpful,
        },
      })
    } else {
      // Create new vote
      await prisma.reviewVote.create({
        data: {
          userId: session.user.id,
          reviewId: validatedInput.reviewId,
          helpful: validatedInput.helpful,
        },
      })
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Vote review helpful error:', error)
    return {
      success: false,
      error: 'Failed to vote. Please try again.',
    }
  }
}

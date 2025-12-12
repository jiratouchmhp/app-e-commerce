import { z } from 'zod'

export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating must be at most 5 stars'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  content: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review must be less than 2000 characters'),
})

export const reviewFiltersSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  sortBy: z.enum(['newest', 'highest', 'lowest', 'helpful']).optional().default('newest'),
  page: z.coerce.number().positive().default(1),
  pageSize: z.coerce.number().positive().max(50).default(10),
})

export const reviewVoteSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  helpful: z.boolean(),
})

export type ReviewInput = z.infer<typeof reviewSchema>
export type ReviewFiltersInput = z.infer<typeof reviewFiltersSchema>
export type ReviewVoteInput = z.infer<typeof reviewVoteSchema>

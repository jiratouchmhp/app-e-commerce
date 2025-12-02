import { z } from 'zod'

export const wishlistItemSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
})

export const moveToCartSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive').default(1),
})

export type WishlistItemInput = z.infer<typeof wishlistItemSchema>
export type MoveToCartInput = z.infer<typeof moveToCartSchema>

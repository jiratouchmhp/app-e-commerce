export interface WishlistItem {
  id: string
  productId: string
  name: string
  slug: string
  /** Price in cents */
  price: number
  image: string
  stock: number
  category: {
    id: string
    name: string
    slug: string
  }
  addedAt: Date
}

export interface WishlistResult {
  success: boolean
  error?: string
  items: WishlistItem[]
}

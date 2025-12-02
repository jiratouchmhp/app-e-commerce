'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from '@/lib/auth'
import { wishlistItemSchema, moveToCartSchema } from '@/lib/validations/wishlist'

const GUEST_TOKEN_COOKIE = 'guest_wishlist_token'

/**
 * Get or create a guest token for wishlist
 */
function getOrCreateGuestToken(): string {
  const cookieStore = cookies()
  let token = cookieStore.get(GUEST_TOKEN_COOKIE)?.value

  if (!token) {
    token = crypto.randomUUID()
    cookieStore.set(GUEST_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return token
}

/**
 * Get wishlist items for authenticated user or guest
 */
export async function getWishlist() {
  try {
    const session = await getServerSession()
    const userId = session?.user?.id

    let wishlistItems

    if (userId) {
      wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
              stock: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      const guestToken = getOrCreateGuestToken()
      wishlistItems = await prisma.wishlistItem.findMany({
        where: { guestToken },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
              stock: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    const items = wishlistItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      price: Math.round(Number(item.product.price) * 100), // Convert to cents
      image: item.product.images[0] || '/placeholder.jpg',
      stock: item.product.stock,
      category: item.product.category,
      addedAt: item.createdAt,
    }))

    return { success: true, items }
  } catch (error) {
    console.error('Get wishlist error:', error)
    return { success: false, error: 'Failed to get wishlist', items: [] }
  }
}

/**
 * Check if a product is in the wishlist
 */
export async function isInWishlist(productId: string): Promise<boolean> {
  try {
    const validated = wishlistItemSchema.parse({ productId })
    const session = await getServerSession()
    const userId = session?.user?.id

    let item

    if (userId) {
      item = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: validated.productId,
          },
        },
      })
    } else {
      const guestToken = getOrCreateGuestToken()
      item = await prisma.wishlistItem.findUnique({
        where: {
          guestToken_productId: {
            guestToken,
            productId: validated.productId,
          },
        },
      })
    }

    return !!item
  } catch {
    return false
  }
}

/**
 * Add item to wishlist
 */
export async function addToWishlist(productId: string) {
  try {
    const validated = wishlistItemSchema.parse({ productId })
    const session = await getServerSession()
    const userId = session?.user?.id

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    if (userId) {
      await prisma.wishlistItem.upsert({
        where: {
          userId_productId: {
            userId,
            productId: validated.productId,
          },
        },
        create: {
          userId,
          productId: validated.productId,
        },
        update: {
          updatedAt: new Date(),
        },
      })
    } else {
      const guestToken = getOrCreateGuestToken()
      await prisma.wishlistItem.upsert({
        where: {
          guestToken_productId: {
            guestToken,
            productId: validated.productId,
          },
        },
        create: {
          guestToken,
          productId: validated.productId,
        },
        update: {
          updatedAt: new Date(),
        },
      })
    }

    revalidatePath('/account/wishlist')
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Add to wishlist error:', error)
    return { success: false, error: 'Failed to add to wishlist' }
  }
}

/**
 * Remove item from wishlist
 */
export async function removeFromWishlist(productId: string) {
  try {
    const validated = wishlistItemSchema.parse({ productId })
    const session = await getServerSession()
    const userId = session?.user?.id

    if (userId) {
      await prisma.wishlistItem.deleteMany({
        where: {
          userId,
          productId: validated.productId,
        },
      })
    } else {
      const guestToken = getOrCreateGuestToken()
      await prisma.wishlistItem.deleteMany({
        where: {
          guestToken,
          productId: validated.productId,
        },
      })
    }

    revalidatePath('/account/wishlist')
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return { success: false, error: 'Failed to remove from wishlist' }
  }
}

/**
 * Toggle item in wishlist (add if not present, remove if present)
 */
export async function toggleWishlist(productId: string) {
  try {
    const inWishlist = await isInWishlist(productId)

    if (inWishlist) {
      return await removeFromWishlist(productId)
    } else {
      return await addToWishlist(productId)
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error)
    return { success: false, error: 'Failed to toggle wishlist' }
  }
}

/**
 * Move item from wishlist to cart
 */
export async function moveToCart(productId: string, quantity: number = 1) {
  try {
    const validated = moveToCartSchema.parse({ productId, quantity })
    const session = await getServerSession()

    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to add items to cart' }
    }

    const userId = session.user.id

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
      select: { stock: true },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Get existing cart item
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: validated.productId,
        },
      },
    })

    const newQuantity = existingCartItem
      ? existingCartItem.quantity + validated.quantity
      : validated.quantity

    if (newQuantity > product.stock) {
      return { success: false, error: 'Not enough stock available' }
    }

    // Add to cart and remove from wishlist in a transaction
    await prisma.$transaction([
      prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId,
            productId: validated.productId,
          },
        },
        create: {
          userId,
          productId: validated.productId,
          quantity: validated.quantity,
        },
        update: {
          quantity: newQuantity,
        },
      }),
      // Use deleteMany to avoid errors if item doesn't exist
      prisma.wishlistItem.deleteMany({
        where: {
          userId,
          productId: validated.productId,
        },
      }),
    ])

    revalidatePath('/cart')
    revalidatePath('/account/wishlist')
    return { success: true }
  } catch (error) {
    console.error('Move to cart error:', error)
    return { success: false, error: 'Failed to move to cart' }
  }
}

/**
 * Merge guest wishlist with user wishlist after login
 */
export async function mergeGuestWishlist() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const cookieStore = cookies()
    const guestToken = cookieStore.get(GUEST_TOKEN_COOKIE)?.value

    if (!guestToken) {
      return { success: true }
    }

    // Get guest wishlist items
    const guestItems = await prisma.wishlistItem.findMany({
      where: { guestToken },
      select: { productId: true },
    })

    // Merge guest items into user wishlist in parallel
    await Promise.all(
      guestItems.map((item) =>
        prisma.wishlistItem.upsert({
          where: {
            userId_productId: {
              userId: session.user.id,
              productId: item.productId,
            },
          },
          create: {
            userId: session.user.id,
            productId: item.productId,
          },
          update: {
            updatedAt: new Date(),
          },
        })
      )
    )

    // Delete guest wishlist items
    await prisma.wishlistItem.deleteMany({
      where: { guestToken },
    })

    // Clear guest token cookie
    cookieStore.delete(GUEST_TOKEN_COOKIE)

    revalidatePath('/account/wishlist')
    return { success: true }
  } catch (error) {
    console.error('Merge guest wishlist error:', error)
    return { success: false, error: 'Failed to merge wishlist' }
  }
}

/**
 * Clear all items from wishlist
 */
export async function clearWishlist() {
  try {
    const session = await getServerSession()
    const userId = session?.user?.id

    if (userId) {
      await prisma.wishlistItem.deleteMany({
        where: { userId },
      })
    } else {
      const guestToken = getOrCreateGuestToken()
      await prisma.wishlistItem.deleteMany({
        where: { guestToken },
      })
    }

    revalidatePath('/account/wishlist')
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Clear wishlist error:', error)
    return { success: false, error: 'Failed to clear wishlist' }
  }
}

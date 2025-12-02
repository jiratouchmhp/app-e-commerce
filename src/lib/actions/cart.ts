'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from '@/lib/auth'
import { cartItemSchema, updateCartItemSchema } from '@/lib/validations/cart'

/**
 * Get cart items for authenticated user
 */
export async function getCart() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const items = cartItems.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.images[0] || '/placeholder.jpg',
      quantity: item.quantity,
      stock: item.product.stock,
      slug: item.product.slug,
    }))

    return { success: true, items }
  } catch (error) {
    console.error('Get cart error:', error)
    return { success: false, error: 'Failed to get cart' }
  }
}

/**
 * Add item to cart for authenticated user
 */
export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validated = cartItemSchema.parse({ productId, quantity })

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
      select: { stock: true },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Get existing cart item
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: validated.productId,
        },
      },
    })

    const newQuantity = existingItem ? existingItem.quantity + validated.quantity : validated.quantity

    if (newQuantity > product.stock) {
      return { success: false, error: 'Not enough stock available' }
    }

    // Upsert cart item
    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: validated.productId,
        },
      },
      create: {
        userId: session.user.id,
        productId: validated.productId,
        quantity: validated.quantity,
      },
      update: {
        quantity: newQuantity,
      },
    })

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Add to cart error:', error)
    return { success: false, error: 'Failed to add to cart' }
  }
}

/**
 * Update cart item quantity for authenticated user
 */
export async function updateCartItem(productId: string, quantity: number) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validated = updateCartItemSchema.parse({ productId, quantity })

    if (validated.quantity === 0) {
      // Remove item if quantity is 0
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: validated.productId,
          },
        },
      })
    } else {
      // Check stock
      const product = await prisma.product.findUnique({
        where: { id: validated.productId },
        select: { stock: true },
      })

      if (!product) {
        return { success: false, error: 'Product not found' }
      }

      if (validated.quantity > product.stock) {
        return { success: false, error: 'Not enough stock available' }
      }

      // Update quantity
      await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: validated.productId,
          },
        },
        data: { quantity: validated.quantity },
      })
    }

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Update cart item error:', error)
    return { success: false, error: 'Failed to update cart item' }
  }
}

/**
 * Remove item from cart for authenticated user
 */
export async function removeFromCart(productId: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Remove from cart error:', error)
    return { success: false, error: 'Failed to remove from cart' }
  }
}

/**
 * Clear all items from cart for authenticated user
 */
export async function clearCart() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Clear cart error:', error)
    return { success: false, error: 'Failed to clear cart' }
  }
}

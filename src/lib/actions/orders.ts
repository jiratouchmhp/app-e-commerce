'use server'

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from '@/lib/auth'
import { createOrderSchema } from '@/lib/validations/order'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, TAX_RATE } from '@/lib/constants'

/**
 * Create a new order
 */
export async function createOrder(input: unknown) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validated = createOrderSchema.parse(input)

    // Get cart items
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
          },
        },
      },
    })

    if (cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        return {
          success: false,
          error: `Insufficient stock for ${item.product.name}`,
        }
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + Number(item.product.price) * item.quantity,
      0
    )
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const tax = subtotal * TAX_RATE
    const total = subtotal + shipping + tax

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: validated.shippingAddress,
        stripePaymentIntentId: validated.paymentIntentId || null,
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.productId,
            name: item.product.name,
            price: Number(item.product.price),
            quantity: item.quantity,
            image: item.product.images[0] || '/placeholder.jpg',
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    revalidatePath('/cart')
    revalidatePath('/account/orders')

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Create order error:', error)
    return { success: false, error: 'Failed to create order' }
  }
}

/**
 * Get orders for authenticated user
 */
export async function getOrders() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, orders }
  } catch (error) {
    console.error('Get orders error:', error)
    return { success: false, error: 'Failed to get orders' }
  }
}

/**
 * Get single order by ID
 */
export async function getOrder(orderId: string): Promise<
  | { success: true; order: any }
  | { success: false; error: string }
> {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    return { success: true, order }
  } catch (error) {
    console.error('Get order error:', error)
    return { success: false, error: 'Failed to get order' }
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' }
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    revalidatePath('/account/orders')
    revalidatePath(`/account/orders/${orderId}`)

    return { success: true, order }
  } catch (error) {
    console.error('Update order status error:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

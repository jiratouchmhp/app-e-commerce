/**
 * Application constants
 */

export const APP_NAME = 'E-Commerce Store'
export const APP_DESCRIPTION = 'Modern e-commerce platform built with Next.js'

// Pagination
export const PRODUCTS_PER_PAGE = 12
export const ORDERS_PER_PAGE = 10

// Cart
export const MAX_CART_ITEMS = 50
export const MAX_QUANTITY_PER_ITEM = 99

// Shipping
export const FREE_SHIPPING_THRESHOLD = 50 // $50.00 in dollars
export const SHIPPING_COST = 5 // $5.00 in dollars

// Tax
export const TAX_RATE = 0.08 // 8%

// Order status
export const ORDER_STATUS_LABELS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  PAYMENT_FAILED: 'Payment Failed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
} as const

// Product placeholders
export const PRODUCT_PLACEHOLDER_IMAGE = 'https://placehold.co/400x500/e5e5e5/737373?text=Product+Image'

// Cache revalidation
export const CACHE_REVALIDATE = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

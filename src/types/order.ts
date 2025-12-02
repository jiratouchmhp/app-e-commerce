export interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  userId: string | null
  guestEmail: string | null
  status: OrderStatus
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: ShippingAddress
  stripePaymentIntentId: string | null
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
}

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

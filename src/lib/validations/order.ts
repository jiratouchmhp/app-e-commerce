import { z } from 'zod'

export const shippingAddressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().default('US'),
})

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentIntentId: z.string().optional(),
})

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>

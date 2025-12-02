import Stripe from 'stripe'
import { env } from '@/lib/env'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

/**
 * Create a payment intent for an order
 * @param amount - Amount in cents
 * @param metadata - Additional metadata for the payment
 * @returns Stripe PaymentIntent
 */
export async function createPaymentIntent(
  amount: number,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  })
}

/**
 * Retrieve a payment intent
 * @param paymentIntentId - Payment intent ID
 * @returns Stripe PaymentIntent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Cancel a payment intent
 * @param paymentIntentId - Payment intent ID
 * @returns Cancelled PaymentIntent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.cancel(paymentIntentId)
}

/**
 * Create a refund for a payment intent
 * @param paymentIntentId - Payment intent ID
 * @param amount - Optional partial refund amount
 * @returns Stripe Refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
  })
}

/**
 * Verify Stripe webhook signature
 * @param payload - Request body
 * @param signature - Stripe signature header
 * @returns Stripe event
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET)
}

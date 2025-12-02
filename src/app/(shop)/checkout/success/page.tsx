import Link from 'next/link'
import { CheckCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SuccessPageProps {
  searchParams: {
    orderId?: string
  }
}

export const metadata = {
  title: 'Order Confirmed',
  description: 'Your order has been confirmed',
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const orderId = searchParams.orderId

  return (
    <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="pt-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight">Order Confirmed!</h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Thank you for your purchase. Your order has been successfully placed.
            </p>

            {orderId && (
              <div className="mb-8">
                <p className="mb-2 text-sm font-medium">Order Number</p>
                <p className="font-mono text-lg">{orderId.slice(0, 8)}</p>
              </div>
            )}

            <div className="mb-8 rounded-lg bg-muted p-6">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Package className="h-5 w-5" />
                <p className="font-medium">What&apos;s Next?</p>
              </div>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a confirmation email with your order details. You can track your order
                status in your account.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/account/orders">View Order</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

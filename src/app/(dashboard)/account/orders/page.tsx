import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { getServerSession } from '@/lib/auth'
import { getOrders } from '@/lib/actions/orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'

export const metadata = {
  title: 'My Orders',
  description: 'View your order history',
}

export default async function OrdersPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  const result = await getOrders()

  if (!result.success || !result.orders) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">My Orders</h1>
        </div>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Failed to load orders</p>
        </div>
      </div>
    )
  }

  const orders = result.orders

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">My Orders</h1>
        </div>

        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-semibold">No orders yet</h2>
            <p className="mb-6 text-muted-foreground">
              Start shopping to see your orders here
            </p>
            <Button asChild size="lg">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">{orders.length} order(s)</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm">
                    {order.items.length} item(s) • {formatPrice(order.total * 100)}
                  </p>
                </div>

                <Button asChild variant="outline">
                  <Link href={`/account/orders/${order.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

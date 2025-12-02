import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'My Account',
  description: 'Manage your account and orders',
}

export default async function AccountPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name}!</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              View and track your order history
            </p>
            <Button asChild className="w-full">
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Wishlist */}
        <Card>
          <CardHeader>
            <CardTitle>Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              View and manage your saved items
            </p>
            <Button asChild className="w-full">
              <Link href="/account/wishlist">View Wishlist</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Manage your account information
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span> {session.user.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {session.user.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Manage your shipping addresses
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

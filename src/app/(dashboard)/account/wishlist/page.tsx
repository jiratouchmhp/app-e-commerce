import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { getWishlist } from '@/lib/actions/wishlist'
import { WishlistItemCard } from '@/components/wishlist/wishlist-item-card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingBag } from 'lucide-react'

export const metadata = {
  title: 'My Wishlist',
  description: 'View and manage your saved items',
}

export default async function WishlistPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/wishlist')
  }

  const result = await getWishlist()
  const items = result.success ? result.items : []

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">My Wishlist</h1>
          <p className="text-muted-foreground">
            Items you&apos;ve saved for later
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            Start adding items you love by clicking the heart icon on any product.
          </p>
          <Button asChild>
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">My Wishlist</h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <WishlistItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

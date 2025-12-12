import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import { getProduct, getRelatedProducts } from '@/lib/actions/products'
import { getProductReviews } from '@/lib/actions/reviews'
import { formatPrice } from '@/lib/utils'
import { ProductGrid } from '@/components/products/product-grid'
import { AddToCartButton } from '@/components/products/add-to-cart-button'
import { StarRating } from '@/components/reviews/star-rating'
import { ReviewStats } from '@/components/reviews/review-stats'
import { ReviewList } from '@/components/reviews/review-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/lib/auth'

interface ProductPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId, 4)
  const priceInCents = Number(product.price) * 100
  const session = await auth()

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      {/* Product Details */}
      <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    fill
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-2 text-sm text-muted-foreground">{product.category.name}</div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{product.name}</h1>

          {/* Rating Display */}
          {product.reviewStats && product.reviewStats.averageRating > 0 && (
            <div className="mb-4 flex items-center gap-3">
              <StarRating rating={product.reviewStats.averageRating} size="lg" showValue />
              {product._count && product._count.reviews > 0 && (
                <a
                  href="#reviews"
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  ({product._count.reviews} {product._count.reviews === 1 ? 'review' : 'reviews'})
                </a>
              )}
            </div>
          )}

          <div className="mb-6">
            <p className="text-3xl font-bold">{formatPrice(priceInCents)}</p>
            {product.stock > 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{product.stock} in stock</p>
            ) : (
              <p className="mt-2 text-sm text-destructive">Out of stock</p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="leading-relaxed text-muted-foreground">{product.description}</p>
          </div>

          {/* Add to Cart */}
          <div className="space-y-4">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              productPrice={Number(product.price)}
              productImage={product.images[0] || '/placeholder.jpg'}
              productStock={product.stock}
              productSlug={product.slug}
              disabled={product.stock === 0}
            />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="mb-16 scroll-mt-20">
        <h2 className="mb-8 text-3xl font-bold">Customer Reviews</h2>
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsSection productId={product.id} currentUserId={session?.user?.id} />
        </Suspense>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  )
}

async function ReviewsSection({
  productId,
  currentUserId,
}: {
  productId: string
  currentUserId?: string
}) {
  const { reviews, total, stats } = await getProductReviews({
    productId,
    page: '1',
    pageSize: '5',
  })

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Column: Stats and Write Review */}
      <div className="space-y-6">
        <ReviewStats stats={stats} />
        
        {currentUserId && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Write a Review</h3>
            <ReviewForm productId={productId} />
          </div>
        )}
        
        {!currentUserId && (
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in to write a review
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Review List */}
      <div className="lg:col-span-2">
        <ReviewList
          initialReviews={reviews}
          totalReviews={total}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}

function ReviewsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
      <div className="lg:col-span-2">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

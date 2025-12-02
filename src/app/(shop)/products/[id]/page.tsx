import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProduct, getRelatedProducts } from '@/lib/actions/products'
import { formatPrice } from '@/lib/utils'
import { ProductGrid } from '@/components/products/product-grid'
import { AddToCartButton } from '@/components/products/add-to-cart-button'

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

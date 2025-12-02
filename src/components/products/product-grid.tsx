'use client'

import { motion } from 'framer-motion'
import type { ProductWithCategory } from '@/types/product'
import { ProductCard } from './product-card'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface ProductGridProps {
  products: ProductWithCategory[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-[400px] items-center justify-center"
      >
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          variants={staggerItem}
          custom={index}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  )
}

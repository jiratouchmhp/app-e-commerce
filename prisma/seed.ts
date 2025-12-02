/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // eslint-disable-next-line no-console
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home' },
      update: {},
      create: {
        name: 'Home & Garden',
        slug: 'home',
        description: 'Home decor and garden supplies',
      },
    }),
  ])

  // eslint-disable-next-line no-console
  console.log('✅ Categories created')

  // Create test user
  const hashedPassword = await hash('password123', 10)
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      hashedPassword,
      role: 'CUSTOMER',
    },
  })

  // eslint-disable-next-line no-console
  console.log('✅ Test user created (email: test@example.com, password: password123)')

  // Create admin user
  const adminPassword = await hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      hashedPassword: adminPassword,
      role: 'ADMIN',
    },
  })

  // eslint-disable-next-line no-console
  console.log('✅ Admin user created (email: admin@example.com, password: admin123)')

  // Create products
  const products = await Promise.all([
    // Electronics
    prisma.product.upsert({
      where: { slug: 'wireless-headphones' },
      update: {},
      create: {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'Premium wireless headphones with noise cancellation and superior sound quality.',
        price: 12999, // $129.99
        stock: 50,
        categoryId: categories[0]!.id,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'laptop-stand' },
      update: {},
      create: {
        name: 'Laptop Stand',
        slug: 'laptop-stand',
        description: 'Ergonomic aluminum laptop stand for better posture and workspace organization.',
        price: 3999, // $39.99
        stock: 100,
        categoryId: categories[0]!.id,
        images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=500&fit=crop'],
      },
    }),
    // Clothing
    prisma.product.upsert({
      where: { slug: 'cotton-t-shirt' },
      update: {},
      create: {
        name: 'Cotton T-Shirt',
        slug: 'cotton-t-shirt',
        description: 'Soft, breathable cotton t-shirt perfect for everyday wear.',
        price: 2499, // $24.99
        stock: 200,
        categoryId: categories[1]!.id,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'denim-jeans' },
      update: {},
      create: {
        name: 'Denim Jeans',
        slug: 'denim-jeans',
        description: 'Classic blue denim jeans with a comfortable fit.',
        price: 5999, // $59.99
        stock: 75,
        categoryId: categories[1]!.id,
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop'],
      },
    }),
    // Home & Garden
    prisma.product.upsert({
      where: { slug: 'ceramic-vase' },
      update: {},
      create: {
        name: 'Ceramic Vase',
        slug: 'ceramic-vase',
        description: 'Handcrafted ceramic vase with modern minimalist design.',
        price: 4999, // $49.99
        stock: 30,
        categoryId: categories[2]!.id,
        images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=500&fit=crop'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'throw-blanket' },
      update: {},
      create: {
        name: 'Throw Blanket',
        slug: 'throw-blanket',
        description: 'Cozy knitted throw blanket for living room or bedroom.',
        price: 3499, // $34.99
        stock: 60,
        categoryId: categories[2]!.id,
        images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400&h=500&fit=crop'],
      },
    }),
  ])

  // eslint-disable-next-line no-console
  console.log(`✅ ${products.length} products created`)

  // eslint-disable-next-line no-console
  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

'use server'

import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { registerSchema } from '@/lib/validations/auth'

/**
 * Register a new user
 */
export async function registerUser(input: unknown) {
  try {
    // Validate input
    const validated = registerSchema.parse(input)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { success: false, error: 'Email already registered' }
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        hashedPassword,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Register user error:', error)
    return { success: false, error: 'Failed to register user' }
  }
}

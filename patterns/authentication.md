# Authentication Pattern

## Overview

User authentication using NextAuth.js v5 with credentials provider, session management, and route protection.

## When to Use

- User login and registration
- Protected routes (account, orders)
- Session-based features
- Role-based access control

## Implementation

### NextAuth Configuration

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}

export async function getServerSession() {
  const { getServerSession: nextAuthGetServerSession } = await import('next-auth')
  return nextAuthGetServerSession(authOptions)
}
```

### Login Form

```typescript
// components/forms/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginInput = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setError(null)

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      return
    }

    router.push('/account')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.password && (
          <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

### Register Server Action

```typescript
// lib/actions/auth.ts
'use server'

import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function register(input: unknown) {
  try {
    const data = registerSchema.parse(input)
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })
    
    if (existingUser) {
      return { success: false, error: 'Email already registered' }
    }
    
    // Hash password
    const hashedPassword = await hash(data.password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword,
        role: 'CUSTOMER',
      },
    })
    
    return { success: true, userId: user.id }
  } catch (error) {
    console.error('Register error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    
    return { success: false, error: 'Failed to register' }
  }
}
```

### Middleware for Route Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/account')

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  // Redirect unauthenticated users to login
  if (isProtectedPage && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/login', '/register'],
}
```

### Protected Page Example

```typescript
// app/(dashboard)/account/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'

export default async function AccountPage() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <p>Welcome, {session.user.name}!</p>
    </div>
  )
}
```

## Key Features

- **JWT Sessions**: Stateless session management
- **Credential Authentication**: Email and password login
- **Password Hashing**: bcrypt for secure password storage
- **Route Protection**: Middleware-based access control
- **Role-Based Access**: Support for different user roles
- **Redirect After Login**: Return users to intended page
- **Error Handling**: User-friendly error messages

## Security Best Practices

- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens stored in httpOnly cookies
- CSRF protection enabled by default
- Input validation with Zod
- Rate limiting on auth routes (recommended)
- Secure session secret (min 32 characters)

## Related Patterns

- [Product Catalog](./product-catalog.md) - User-specific features
- [Checkout Flow](./checkout-flow.md) - Guest vs authenticated checkout

---

**Last Updated:** November 24, 2025

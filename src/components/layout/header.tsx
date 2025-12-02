'use client'

import Link from 'next/link'
import { Search, User, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { CartIcon } from '@/components/cart/cart-icon'
import { APP_NAME } from '@/lib/constants'

export function Header() {
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  
  // Transform scroll position to blur and shadow values
  const backdropBlur = useTransform(scrollY, [0, 50], [8, 16])
  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 0.1])

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', updateScroll)
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border"
      style={{
        backdropFilter: isScrolled ? 'blur(16px)' : 'blur(8px)',
        backgroundColor: isScrolled ? 'hsl(var(--background) / 0.8)' : 'hsl(var(--background) / 0.95)',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <motion.span
            className="text-xl font-bold"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {APP_NAME}
          </motion.span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          {[
            { href: '/products', label: 'Products' },
            { href: '/products?category=electronics', label: 'Electronics' },
            { href: '/products?category=clothing', label: 'Clothing' },
            { href: '/products?category=home', label: 'Home & Garden' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium transition-colors hover:text-primary"
            >
              <motion.span
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" aria-label="Search" asChild>
              <Link href="/products">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
          
          {session ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" aria-label="Account" asChild>
                  <Link href="/account">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hidden md:flex"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </motion.div>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          )}
          
          <CartIcon />
        </div>
      </div>
    </motion.header>
  )
}

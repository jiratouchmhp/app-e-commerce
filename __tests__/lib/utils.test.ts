import { describe, it, expect } from 'vitest'
import { formatPrice } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats price in cents to USD currency', () => {
    expect(formatPrice(1999)).toBe('$19.99')
  })

  it('handles zero price', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('handles single digit cents', () => {
    expect(formatPrice(505)).toBe('$5.05')
  })

  it('handles large amounts', () => {
    expect(formatPrice(999999)).toBe('$9,999.99')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatPrice(1234)).toBe('$12.34')
  })
})

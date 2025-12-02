import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/lib/test-utils'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders children text', () => {
    renderWithProviders(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    renderWithProviders(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary')
  })

  it('is disabled when disabled prop is true', () => {
    renderWithProviders(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('accepts custom className', () => {
    renderWithProviders(<Button className="custom-class">Button</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})

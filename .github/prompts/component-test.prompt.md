---
agent: component-test
description: 'Generate component tests for React components with Testing Library'
---

# Generate Component Tests

I need to create comprehensive tests for React components that verify rendering, user interactions, and accessibility with Testing Library.

Please follow these steps:

1. **Ask clarifying questions** about:
   - Which component should be tested? (specific path)
   - Is it a Server Component or Client Component?
   - What interactions should be tested?
   - Should accessibility be tested?
   - Are there specific variants or states to cover?

2. **Research the component** to:
   - Read the component file
   - Identify all props and their types
   - Check for variants, sizes, states
   - Note user interactions (onClick, onChange, etc.)
   - Identify Server Actions or hooks used
   - Check for conditional rendering

3. **Create test plan** covering:
   - Basic rendering with required props
   - All variants/sizes/states
   - User interactions
   - Loading and error states
   - Accessibility (ARIA, keyboard)
   - Edge cases

4. **Generate test file** with:
   - Location: `__tests__/components/[category]/[component].test.tsx`
   - Testing Library imports
   - Mock setup for Server Actions/hooks
   - Describe blocks for organization
   - Tests with userEvent for interactions
   - Accessibility assertions

Make sure tests include:
- `render()` for Server Components, `renderWithProviders()` for Client Components
- `screen.getByRole()` queries (preferred over getByTestId)
- `userEvent.setup()` for realistic interactions
- `await waitFor()` for async operations
- ARIA label verification
- Keyboard navigation tests
- Loading/error state tests

## Examples

### Example 1: UI Component Test

```typescript
// __tests__/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  describe('variants', () => {
    it('renders primary variant', () => {
      render(<Button variant="primary">Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary')
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick} disabled>Click me</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('is keyboard accessible', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button')
      
      button.focus()
      await user.keyboard('{Enter}')
      
      expect(handleClick).toHaveBeenCalled()
    })
  })
})
```

### Example 2: Form Component Test

```typescript
// __tests__/components/forms/login-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from '@/components/forms/login-form'
import { signIn } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password inputs', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    signIn.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<LoginForm />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
    })
  })

  it('shows error message on failed login', async () => {
    signIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' })
    const user = userEvent.setup()
    render(<LoginForm />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
```

### Example 3: Client Component with Server Action

```typescript
// __tests__/components/products/add-to-cart-button.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddToCartButton } from '@/components/products/add-to-cart-button'
import { addToCart } from '@/lib/actions/cart'

vi.mock('@/lib/actions/cart', () => ({
  addToCart: vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('AddToCartButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders button', () => {
    render(<AddToCartButton productId="product-123" />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
  })

  it('calls addToCart action when clicked', async () => {
    addToCart.mockResolvedValue({ success: true })
    const user = userEvent.setup()
    
    render(<AddToCartButton productId="product-123" />)
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledWith('product-123', 1)
    })
  })

  it('shows loading state', async () => {
    addToCart.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    const user = userEvent.setup()
    
    render(<AddToCartButton productId="product-123" />)
    await user.click(screen.getByRole('button'))
    
    expect(screen.getByText(/adding/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows error on failure', async () => {
    addToCart.mockResolvedValue({ success: false, error: 'Out of stock' })
    const user = userEvent.setup()
    
    render(<AddToCartButton productId="product-123" />)
    await user.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
    })
  })
})
```

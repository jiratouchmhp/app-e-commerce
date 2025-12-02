---
agent: e2e-test
description: 'Generate E2E tests for critical user flows with Playwright'
---

# Generate E2E Tests

I need to create end-to-end tests for complete user flows using Playwright that verify the entire application works correctly across browsers.

Please follow these steps:

1. **Ask clarifying questions** about:
   - Which user flow should be tested? (checkout, authentication, cart, product browsing)
   - Should it test happy path, error cases, or both?
   - Which browsers should be tested? (Chromium, Firefox, WebKit)
   - Should mobile devices be tested?
   - Is test data available or should fixtures be created?

2. **Research the flow** to:
   - Read pattern documentation (e.g., `patterns/checkout-flow.md`)
   - Understand the steps involved
   - Identify pages and components in the flow
   - Note expected user actions and outcomes
   - Check for edge cases and validations

3. **Create test plan** covering:
   - Happy path (complete flow successfully)
   - Validation errors
   - Edge cases (empty cart, out of stock, etc.)
   - Authentication requirements
   - Payment scenarios (if applicable)

4. **Generate test file** with:
   - Location: `__tests__/e2e/[flow-name].spec.ts`
   - Playwright imports and test structure
   - Page Object classes if needed
   - Multiple test scenarios
   - Proper waits and assertions
   - Screenshot captures on failure

Make sure tests include:
- `test.describe()` for grouping
- Semantic selectors (`getByRole`, `getByLabel`)
- Explicit waits (`waitForSelector`, `expect` with timeout)
- Page navigation verification (`expect(page).toHaveURL()`)
- Element visibility checks
- Form submission
- Success/error message verification

## Examples

### Example 1: Checkout Flow E2E Test

```typescript
// __tests__/e2e/checkout-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should complete purchase as guest user', async ({ page }) => {
    // 1. Navigate to products page
    await page.goto('/products')
    await expect(page).toHaveTitle(/products/i)

    // 2. Add product to cart
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.getByRole('button', { name: /add to cart/i }).click()
    
    // Wait for cart update
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')

    // 3. Go to cart
    await page.getByRole('link', { name: /cart/i }).click()
    await expect(page).toHaveURL(/\/cart/)
    
    // Verify product in cart
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()

    // 4. Proceed to checkout
    await page.getByRole('button', { name: /checkout/i }).click()
    await expect(page).toHaveURL(/\/checkout/)

    // 5. Fill shipping information
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('First Name').fill('John')
    await page.getByLabel('Last Name').fill('Doe')
    await page.getByLabel('Address').fill('123 Main St')
    await page.getByLabel('City').fill('San Francisco')
    await page.getByLabel('State').selectOption('CA')
    await page.getByLabel('ZIP Code').fill('94102')

    // 6. Continue to payment
    await page.getByRole('button', { name: /continue to payment/i }).click()
    
    // Wait for Stripe to load
    await page.waitForSelector('iframe[name^="__privateStripeFrame"]')

    // 7. Fill payment details (Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
    await stripeFrame.locator('[name="cardnumber"]').fill('4242424242424242')
    await stripeFrame.locator('[name="exp-date"]').fill('12/34')
    await stripeFrame.locator('[name="cvc"]').fill('123')
    await stripeFrame.locator('[name="postal"]').fill('94102')

    // 8. Complete order
    await page.getByRole('button', { name: /place order/i }).click()

    // 9. Verify success
    await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 10000 })
    await expect(page.getByText(/order confirmed/i)).toBeVisible()
    await expect(page.getByText(/order number/i)).toBeVisible()
  })

  test('should show validation errors for invalid shipping info', async ({ page }) => {
    await page.goto('/checkout')

    // Try to submit without filling form
    await page.getByRole('button', { name: /continue to payment/i }).click()

    // Verify validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/first name is required/i)).toBeVisible()
    await expect(page.getByText(/address is required/i)).toBeVisible()
  })
})
```

### Example 2: Authentication Flow E2E Test

```typescript
// __tests__/e2e/authentication.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.getByLabel('Email').fill(`test${Date.now()}@example.com`)
    await page.getByLabel('Password').fill('Password123!')
    await page.getByLabel('Confirm Password').fill('Password123!')
    await page.getByLabel('Name').fill('Test User')

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click()

    // Verify redirect to account page
    await expect(page).toHaveURL(/\/account/)
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })

  test('should login existing user', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Verify redirect to account page
    await expect(page).toHaveURL(/\/account/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Verify error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('should protect account page from unauthenticated users', async ({ page }) => {
    await page.goto('/account')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
```

### Example 3: Shopping Cart Operations E2E Test

```typescript
// __tests__/e2e/cart-operations.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Shopping Cart', () => {
  test('should add product to cart', async ({ page }) => {
    await page.goto('/products')

    // Click add to cart on first product
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()

    // Verify cart count updated
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')

    // Verify toast notification
    await expect(page.getByText(/added to cart/i)).toBeVisible()
  })

  test('should update product quantity in cart', async ({ page }) => {
    // Add product first
    await page.goto('/products')
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()

    // Go to cart
    await page.goto('/cart')

    // Increase quantity
    await page.getByRole('button', { name: /increase quantity/i }).click()
    await expect(page.locator('[data-testid="quantity"]')).toHaveText('2')

    // Verify subtotal updated
    const initialSubtotal = await page.locator('[data-testid="subtotal"]').textContent()
    await page.getByRole('button', { name: /increase quantity/i }).click()
    const newSubtotal = await page.locator('[data-testid="subtotal"]').textContent()
    expect(newSubtotal).not.toBe(initialSubtotal)
  })

  test('should remove product from cart', async ({ page }) => {
    // Add product first
    await page.goto('/products')
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()

    // Go to cart
    await page.goto('/cart')

    // Remove item
    await page.getByRole('button', { name: /remove/i }).click()

    // Verify empty cart message
    await expect(page.getByText(/your cart is empty/i)).toBeVisible()
  })

  test('should persist cart across page navigation', async ({ page }) => {
    // Add product to cart
    await page.goto('/products')
    await page.locator('[data-testid="product-card"]').first()
      .getByRole('button', { name: /add to cart/i }).click()

    // Navigate away and back
    await page.goto('/')
    await page.goto('/cart')

    // Verify item still in cart
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
  })
})
```

### Example 4: Page Object Pattern

```typescript
// __tests__/e2e/page-objects/checkout-page.ts
import { Page, Locator } from '@playwright/test'

export class CheckoutPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly addressInput: Locator
  readonly cityInput: Locator
  readonly stateSelect: Locator
  readonly zipInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.firstNameInput = page.getByLabel('First Name')
    this.lastNameInput = page.getByLabel('Last Name')
    this.addressInput = page.getByLabel('Address')
    this.cityInput = page.getByLabel('City')
    this.stateSelect = page.getByLabel('State')
    this.zipInput = page.getByLabel('ZIP Code')
    this.submitButton = page.getByRole('button', { name: /continue to payment/i })
  }

  async goto() {
    await this.page.goto('/checkout')
  }

  async fillShippingInfo(info: {
    email: string
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zip: string
  }) {
    await this.emailInput.fill(info.email)
    await this.firstNameInput.fill(info.firstName)
    await this.lastNameInput.fill(info.lastName)
    await this.addressInput.fill(info.address)
    await this.cityInput.fill(info.city)
    await this.stateSelect.selectOption(info.state)
    await this.zipInput.fill(info.zip)
  }

  async submit() {
    await this.submitButton.click()
  }
}

// Usage in test
import { CheckoutPage } from './page-objects/checkout-page'

test('checkout with page object', async ({ page }) => {
  const checkoutPage = new CheckoutPage(page)
  await checkoutPage.goto()
  await checkoutPage.fillShippingInfo({
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
  })
  await checkoutPage.submit()
})
```

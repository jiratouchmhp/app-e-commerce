# E2E Tests

This directory contains end-to-end tests written with Playwright.

## Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm playwright test --ui

# Run E2E tests in specific browser
pnpm playwright test --project=chromium
pnpm playwright test --project=firefox
pnpm playwright test --project=webkit

# Debug E2E tests
pnpm playwright test --debug
```

## Test Organization

```
__tests__/e2e/
├── README.md                   # This file
├── auth/                       # Authentication flow tests
│   └── login.spec.ts
├── checkout/                   # Checkout flow tests
│   └── checkout.spec.ts
└── cart/                       # Shopping cart tests
    └── cart.spec.ts
```

## Writing E2E Tests

Use the E2E test agent or prompt:

```bash
# Use E2E test agent
@e2e-test Generate E2E tests for the product search flow

# Use E2E test prompt
#file:../.github/prompts/e2e-test.prompt.md
```

## Page Object Pattern

All E2E tests should use the Page Object pattern for maintainability:

```typescript
// pages/checkout.page.ts
export class CheckoutPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/checkout')
  }
  
  async fillShippingForm(data: ShippingFormData) {
    await this.page.fill('[name="firstName"]', data.firstName)
    // ... more fields
  }
  
  async submitOrder() {
    await this.page.click('button[type="submit"]')
  }
}
```

## Best Practices

1. **Wait for elements properly** - Use `waitForSelector`, `waitForLoadState`
2. **Use data-testid** - Add `data-testid` attributes to important elements
3. **Test real user flows** - Test complete scenarios, not isolated features
4. **Handle async operations** - Wait for API calls, navigation, animations
5. **Clean up test data** - Reset database state between tests when needed
6. **Test error states** - Test failure scenarios, not just happy paths
7. **Cross-browser testing** - Run tests on all configured browsers

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [E2E Test Agent](../.github/agents/e2e-test.agent.md)
- [E2E Test Prompt](../.github/prompts/e2e-test.prompt.md)

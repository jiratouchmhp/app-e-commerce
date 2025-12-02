# Test Agent Quick Start Guide

## TL;DR

Three specialized test agents are ready to generate tests for your code:

```bash
@unit-test       # For utilities, validations, Server Actions
@component-test  # For React components  
@e2e-test        # For user flows (checkout, auth, cart)
```

## Quick Examples

### Generate Unit Tests

```bash
@unit-test Generate tests for the formatPrice utility in src/lib/utils.ts
```

**What you'll get**: Complete Vitest tests with edge cases, error handling, and 100% coverage

### Generate Component Tests

```bash
@component-test Generate tests for the ProductCard component
```

**What you'll get**: Testing Library tests covering rendering, user interactions, and accessibility

### Generate E2E Tests

```bash
@e2e-test Generate E2E tests for the complete checkout flow
```

**What you'll get**: Playwright tests covering the full user journey from cart to order confirmation

## Using Prompt Shortcuts

For even faster test generation, use the prompt shortcuts:

### Unit Test Shortcut
```bash
#file:.github/prompts/unit-test.prompt.md
Test the formatPrice function
```

### Validation Test Shortcut
```bash
#file:.github/prompts/validation-test.prompt.md
Test the productSchema
```

### Component Test Shortcut
```bash
#file:.github/prompts/component-test.prompt.md
Test the AddToCartButton component
```

### E2E Test Shortcut
```bash
#file:.github/prompts/e2e-test.prompt.md
Test the checkout flow
```

## Running Tests

```bash
# Unit & Component Tests
pnpm test                  # Run once
pnpm test:watch            # Watch mode
pnpm test:coverage         # With coverage

# E2E Tests
pnpm test:e2e              # All browsers
pnpm test:e2e --ui         # UI mode
pnpm test:e2e --debug      # Debug mode
```

## Coverage Requirements

| Type | Target | Agent |
|------|--------|-------|
| Utilities | 100% | @unit-test |
| Components | 80% | @component-test |
| Server Actions | 90% | @unit-test |
| E2E Flows | Critical paths | @e2e-test |

## Test Utilities Available

Import from `@/lib/test-utils`:

```typescript
import {
  renderWithProviders,  // Render with SessionProvider
  mockProduct,          // Mock product data
  mockUser,             // Mock user data
  mockSession,          // Mock NextAuth session
  mockCartItem,         // Mock cart item
  mockOrder,            // Mock order
  mockCategory,         // Mock category
  createFormData,       // Create FormData for Server Actions
  screen,               // Testing Library screen
  userEvent,            // Testing Library userEvent
  waitFor,              // Testing Library waitFor
} from '@/lib/test-utils'
```

## Example Test Files

Check these examples to see the patterns:

- **Unit Test**: `__tests__/lib/utils.test.ts`
- **Component Test**: `__tests__/components/ui/button.test.tsx`

## When to Use Which Agent

### Use @unit-test when:
- Testing pure functions (utilities)
- Testing Zod schemas (validations)
- Testing Server Actions (with database mocking)
- Testing business logic

### Use @component-test when:
- Testing UI components
- Testing forms with validation
- Testing components with Server Actions
- Testing user interactions

### Use @e2e-test when:
- Testing complete user flows
- Testing checkout process
- Testing authentication flows
- Testing shopping cart operations
- Testing cross-page navigation

## Agent Handoffs

Agents can hand off to each other:

```
You: @unit-test Test the cart utilities
Agent: ✅ Created utility tests
       💡 Tip: Use @component-test to test CartItem component
       💡 Tip: Use @e2e-test to test complete cart flow
```

## Pro Tips

1. **Start with unit tests** - Test utilities and validations first
2. **Mock external dependencies** - Use mock factories for Prisma models
3. **Test user behavior** - Use Testing Library queries (getByRole, etc.)
4. **Use Page Objects for E2E** - Keep E2E tests maintainable
5. **Check coverage regularly** - Run `pnpm test:coverage`
6. **Test error states** - Don't just test happy paths

## Need Help?

Check the full documentation:

- **Complete Guide**: `docs/TEST-SETUP.md`
- **Unit Test Agent**: `.github/agents/unit-test.agent.md`
- **Component Test Agent**: `.github/agents/component-test.agent.md`
- **E2E Test Agent**: `.github/agents/e2e-test.agent.md`
- **Testing Guide**: `__tests__/README.md`
- **E2E Guide**: `__tests__/e2e/README.md`

---

**Ready to test?** Just type: `@unit-test`, `@component-test`, or `@e2e-test` followed by what you want to test!

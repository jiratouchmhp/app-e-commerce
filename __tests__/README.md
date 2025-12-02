# Unit & Component Tests

This directory contains unit and component tests written with Vitest and Testing Library.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test __tests__/lib/utils.test.ts
```

## Test Organization

```
__tests__/
├── README.md                   # This file
├── lib/                        # Unit tests for utilities
│   ├── utils.test.ts
│   ├── validations/
│   │   ├── product.test.ts
│   │   ├── auth.test.ts
│   │   └── cart.test.ts
│   └── actions/
│       ├── products.test.ts
│       ├── cart.test.ts
│       └── orders.test.ts
└── components/                 # Component tests
    ├── ui/
    │   ├── button.test.tsx
    │   └── card.test.tsx
    ├── products/
    │   └── product-card.test.tsx
    └── cart/
        └── cart-item.test.tsx
```

## Writing Tests

Use the test agents or prompts:

```bash
# Use unit test agent
@unit-test Generate tests for src/lib/utils.ts

# Use validation test prompt
#file:../.github/prompts/validation-test.prompt.md

# Use component test agent
@component-test Generate tests for ProductCard component
```

## Test Utilities

Import shared test utilities from `src/lib/test-utils.tsx`:

```typescript
import { 
  renderWithProviders, 
  mockProduct, 
  mockUser, 
  mockSession,
  mockCartItem,
  screen,
  userEvent,
} from '@/lib/test-utils'

test('component renders correctly', () => {
  const product = mockProduct({ name: 'Test Product' })
  renderWithProviders(<ProductCard product={product} />)
  expect(screen.getByText('Test Product')).toBeInTheDocument()
})
```

## Coverage Requirements

From QUALITY-STANDARDS.md:

- **Utilities**: 100% coverage
- **Components**: 80% coverage  
- **Server Actions**: 90% coverage
- **Overall**: 80% coverage

Check coverage with:

```bash
pnpm test:coverage
```

## Best Practices

1. **Use descriptive test names** - Tests should document behavior
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Mock external dependencies** - Prisma, NextAuth, external APIs
4. **Test user behavior** - Use Testing Library queries (getByRole, etc.)
5. **Avoid implementation details** - Don't test internal state
6. **Keep tests isolated** - Each test should be independent
7. **Use mock factories** - Reuse mockProduct, mockUser, etc.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/react)
- [Unit Test Agent](../.github/agents/unit-test.agent.md)
- [Component Test Agent](../.github/agents/component-test.agent.md)

# E-Commerce Pattern Library

## Overview

This document provides a quick reference to reusable patterns for common e-commerce features. Full implementations with complete code examples are available in the `patterns/` directory.

## Pattern Index

### Core Patterns

| Pattern | Purpose | Files Affected | Complexity |
|---------|---------|----------------|------------|
| [Cart Management](../patterns/cart-management.md) | Client-side cart state with Zustand | `store/cart-store.ts`<br>`components/cart/*` | Medium |
| [Checkout Flow](../patterns/checkout-flow.md) | Multi-step checkout with validation | `app/(shop)/checkout/*`<br>`lib/actions/orders.ts` | High |
| [Product Catalog](../patterns/product-catalog.md) | Product listing and details | `app/(shop)/products/*`<br>`lib/actions/products.ts` | Medium |
| [Authentication](../patterns/authentication.md) | NextAuth.js setup and route protection | `lib/auth.ts`<br>`middleware.ts` | Medium |
| [Payment Integration](../patterns/payment-integration.md) | Stripe payments and webhooks | `lib/stripe.ts`<br>`app/api/webhooks/stripe/*` | High |

---

## Quick Pattern Reference

Below are condensed summaries of each pattern. **For full implementations with complete code, see the linked pattern files in the `patterns/` directory.**

---

## Product Catalog Patterns

**Pattern**: [Product Catalog](../patterns/product-catalog.md)

**Use Cases:**
- Product listing pages with filtering
- Product detail pages with SEO
- Search functionality
- Related products

**Key Components:**
- `app/(shop)/products/page.tsx` - Product listing page (Server Component)
- `app/(shop)/products/[id]/page.tsx` - Product detail page with dynamic metadata
- `components/products/product-card.tsx` - Reusable product card
- `components/products/product-search.tsx` - Debounced search (Client Component)
- `lib/actions/products.ts` - Server Actions for data fetching

**Core Features:**
- Server Components for SEO-friendly product pages
- Streaming with Suspense for progressive loading
- Dynamic metadata generation for each product
- Image optimization with Next.js Image
- Filtering, sorting, and pagination
- Debounced search with URL params

**Implementation Details:** See [patterns/product-catalog.md](../patterns/product-catalog.md)

---

## Shopping Cart Patterns

**Pattern**: [Cart Management](../patterns/cart-management.md)

**Use Cases:**
- Client-side cart state management
- Adding/removing/updating cart items
- Persistent cart across sessions
- Cart calculations (subtotal, tax, shipping)

**Key Components:**
- `store/cart-store.ts` - Zustand store with persistence
- `components/cart/cart-item.tsx` - Cart item with quantity controls
- `components/cart/cart-summary.tsx` - Order summary with totals
- `app/(shop)/cart/page.tsx` - Cart page with empty state

**Core Features:**
- Persistent state with localStorage
- Optimistic UI updates
- Automatic duplicate handling
- Quantity management with auto-removal at 0
- Free shipping threshold calculation

**Implementation Details:** See [patterns/cart-management.md](../patterns/cart-management.md)

---

## Checkout Patterns

**Pattern**: [Checkout Flow](../patterns/checkout-flow.md)

**Use Cases:**
- Multi-step checkout process
- Collecting shipping information
- Payment processing with Stripe
- Order creation and confirmation

**Key Components:**
- `app/(shop)/checkout/page.tsx` - Checkout page with step indicator
- `components/checkout/shipping-form.tsx` - Shipping form with validation
- `components/checkout/payment-form.tsx` - Stripe payment form
- `lib/actions/orders.ts` - Order creation Server Action

**Core Features:**
- Multi-step flow (shipping → payment)
- Form validation with React Hook Form + Zod
- Guest checkout support
- Stripe payment integration
- Order persistence in database
- Back navigation between steps

**Implementation Details:** See [patterns/checkout-flow.md](../patterns/checkout-flow.md)

---

## Authentication Patterns

**Pattern**: [Authentication](../patterns/authentication.md)

**Use Cases:**
- User login and registration
- Protected routes (account, orders)
- Session management
- Role-based access control

**Key Components:**
- `lib/auth.ts` - NextAuth.js configuration
- `components/forms/login-form.tsx` - Login form with validation
- `lib/actions/auth.ts` - Registration Server Action
- `middleware.ts` - Route protection middleware

**Core Features:**
- JWT-based sessions
- Credential authentication (email/password)
- Password hashing with bcrypt
- Middleware-based route protection
- Redirect after login
- Role-based authorization

**Implementation Details:** See [patterns/authentication.md](../patterns/authentication.md)

---

## Payment Integration Patterns

**Pattern**: [Payment Integration](../patterns/payment-integration.md)

**Use Cases:**
- Processing credit card payments
- Handling payment confirmations
- Order status updates via webhooks
- Refunds and disputes

**Key Components:**
- `lib/stripe.ts` - Stripe client configuration
- `components/checkout/payment-form.tsx` - Payment form with Stripe Elements
- `app/api/webhooks/stripe/route.ts` - Webhook handler
- `lib/actions/payment.ts` - Payment intent creation

**Core Features:**
- Payment Intent API for secure processing
- Webhook handling for async confirmations
- Signature verification for security
- Order status tracking
- Refund support
- 3D Secure authentication

**Implementation Details:** See [patterns/payment-integration.md](../patterns/payment-integration.md)

---

## Usage Guidelines

### When to Reference Patterns

1. **During Planning**: Review pattern index to identify reusable solutions
2. **During Implementation**: Load full pattern file for detailed code examples
3. **For Similar Features**: Adapt existing patterns to new use cases

### How to Use Patterns

```typescript
// Example: Implementing wishlist feature (similar to cart pattern)
// 1. Reference cart-management.md pattern
// 2. Adapt Zustand store for wishlist items
// 3. Modify components for wishlist-specific behavior
// 4. Keep same persistence and state management approach
```

### Pattern Adaptation

Most patterns can be adapted for similar use cases:
- **Cart Management** → Wishlist, Compare List, Recently Viewed
- **Checkout Flow** → Multi-step forms, Onboarding flows
- **Product Catalog** → Any content listing (blogs, docs, etc.)
- **Authentication** → Any protected content or features
- **Payment Integration** → Subscriptions, donations, marketplace payments

---

**Last Updated:** November 24, 2025

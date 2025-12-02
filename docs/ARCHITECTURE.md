# System Architecture and Design Principles

## Overview

This document describes the technical architecture of our Next.js e-commerce application. The architecture prioritizes performance, scalability, maintainability, and developer experience while leveraging modern web technologies.

## Technology Stack

### Core Framework
- **Next.js 14+**: React framework with App Router
- **React 18+**: UI library with Server Components
- **TypeScript 5+**: Type-safe development

### Styling & UI
- **Tailwind CSS 3+**: Utility-first CSS framework
- **CSS Modules**: Component-scoped styles when needed
- **Lucide React**: Icon library
- **tailwindcss-animate**: Animation utilities

### Data & State
- **Prisma**: Type-safe ORM
- **PostgreSQL**: Primary database
- **Zustand**: Lightweight state management
- **React Query**: Server state management (if needed)

### Authentication & Security
- **NextAuth.js v5**: Authentication solution
- **Zod**: Runtime validation
- **bcrypt**: Password hashing

### Payments
- **Stripe**: Payment processing
- **Stripe Webhooks**: Event handling

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **TypeScript ESLint**: TypeScript-specific linting

## Application Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   React     │  │   Zustand   │  │   React     │     │
│  │ Components  │  │    Store    │  │   Query     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/WebSocket
┌────────────────────────┼────────────────────────────────┐
│               Next.js Application Server                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │              App Router (Route Handlers)          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │   │
│  │  │   Server   │  │   Server   │  │    API     │ │   │
│  │  │ Components │  │  Actions   │  │   Routes   │ │   │
│  │  └────────────┘  └────────────┘  └────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │               Business Logic Layer                │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │   │
│  │  │  Services  │  │Validations │  │   Utils    │ │   │
│  │  └────────────┘  └────────────┘  └────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  Data Layer                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │   │
│  │  │   Prisma   │  │   Cache    │  │  External  │ │   │
│  │  │   Client   │  │   Layer    │  │    APIs    │ │   │
│  │  └────────────┘  └────────────┘  └────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │    Stripe    │  │     CDN      │  │
│  │   Database   │  │   Payments   │  │   (Images)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Folder Structure

```
dev-app/
├── .github/
│   ├── copilot-instructions.md       # AI context instructions
│   ├── agents/                       # Custom AI agents
│   │   ├── plan.agent.md
│   │   └── implement.agent.md
│   └── prompts/                      # Reusable prompts
│       ├── component.prompt.md
│       └── api-route.prompt.md
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Database migrations
│   └── seed.ts                       # Seed data
│
├── public/
│   ├── images/                       # Static images
│   ├── icons/                        # Icon files
│   └── favicon.ico
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group: Authentication
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Auth layout
│   │   │
│   │   ├── (shop)/                   # Route group: Main shop
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Product listing
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx      # Product detail
│   │   │   │   │   └── loading.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── categories/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx
│   │   │   │   └── success/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx            # Shop layout
│   │   │
│   │   ├── (dashboard)/              # Route group: User dashboard
│   │   │   ├── account/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── addresses/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx            # Dashboard layout
│   │   │
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── cart/
│   │   │   │   └── route.ts
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Root page
│   │   ├── loading.tsx               # Global loading
│   │   ├── error.tsx                 # Global error
│   │   ├── not-found.tsx             # 404 page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── sidebar.tsx
│   │   │
│   │   ├── products/                 # Product components
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── product-list.tsx
│   │   │   ├── product-details.tsx
│   │   │   ├── product-images.tsx
│   │   │   ├── product-filters.tsx
│   │   │   └── product-search.tsx
│   │   │
│   │   ├── cart/                     # Cart components
│   │   │   ├── cart-item.tsx
│   │   │   ├── cart-summary.tsx
│   │   │   ├── cart-drawer.tsx
│   │   │   ├── cart-icon.tsx
│   │   │   └── add-to-cart-button.tsx
│   │   │
│   │   ├── checkout/                 # Checkout components
│   │   │   ├── checkout-form.tsx
│   │   │   ├── payment-form.tsx
│   │   │   ├── shipping-form.tsx
│   │   │   └── order-summary.tsx
│   │   │
│   │   └── forms/                    # Form components
│   │       ├── login-form.tsx
│   │       ├── register-form.tsx
│   │       └── search-form.tsx
│   │
│   ├── lib/                          # Utilities & configurations
│   │   ├── actions/                  # Server actions
│   │   │   ├── products.ts
│   │   │   ├── cart.ts
│   │   │   ├── checkout.ts
│   │   │   ├── auth.ts
│   │   │   └── orders.ts
│   │   │
│   │   ├── api/                      # API client functions
│   │   │   └── client.ts
│   │   │
│   │   ├── db/                       # Database utilities
│   │   │   └── prisma.ts             # Prisma client
│   │   │
│   │   ├── validations/              # Zod schemas
│   │   │   ├── product.ts
│   │   │   ├── cart.ts
│   │   │   ├── checkout.ts
│   │   │   ├── auth.ts
│   │   │   └── order.ts
│   │   │
│   │   ├── auth.ts                   # NextAuth configuration
│   │   ├── stripe.ts                 # Stripe configuration
│   │   ├── utils.ts                  # General utilities
│   │   ├── constants.ts              # Constants
│   │   └── env.ts                    # Environment validation
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-cart.ts
│   │   ├── use-products.ts
│   │   ├── use-auth.ts
│   │   ├── use-toast.ts
│   │   └── use-media-query.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   ├── user.ts
│   │   ├── order.ts
│   │   └── index.ts
│   │
│   ├── store/                        # Client-side state
│   │   ├── cart-store.ts
│   │   └── ui-store.ts
│   │
│   ├── config/                       # Configuration files
│   │   ├── site.ts                   # Site metadata
│   │   └── navigation.ts             # Navigation config
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── .env.local                        # Local environment variables
├── .env.example                      # Example environment variables
├── .eslintrc.json                    # ESLint configuration
├── .gitignore
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── postcss.config.js                 # PostCSS configuration
├── package.json
├── README.md
├── PRODUCT.md                        # Product documentation
├── ARCHITECTURE.md                   # This file
├── CONTRIBUTING.md                   # Contributing guidelines
├── DESIGN-SYSTEM.md                  # Design system
├── ECOMMERCE-PATTERNS.md             # E-commerce patterns
└── TYPESCRIPT-NEXTJS-CONVENTIONS.md  # Code conventions
```

## Design Patterns

### 1. Server Components by Default

**Principle**: Use React Server Components for all pages and components unless client-side interactivity is required.

**Benefits**:
- Zero JavaScript sent to client
- Better SEO
- Faster initial page loads
- Direct database access

**When to use Client Components**:
- User interactions (clicks, form inputs)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Real-time features

### 2. Server Actions for Mutations

**Principle**: Use Server Actions for all data mutations instead of API routes.

**Benefits**:
- Type-safe
- No API endpoints needed
- Automatic request deduplication
- Built-in security

```typescript
'use server'

export async function addToCart(productId: string, quantity: number) {
  const session = await getServerSession()
  // Validation, business logic, database operation
}
```

### 3. Optimistic Updates

**Principle**: Update UI immediately while server request is in progress.

**Benefits**:
- Perceived performance improvement
- Better user experience
- Instant feedback

### 4. Parallel Data Fetching

**Principle**: Fetch independent data in parallel rather than sequentially.

```typescript
// Good: Parallel fetching
const [products, categories] = await Promise.all([
  getProducts(),
  getCategories()
])

// Bad: Sequential fetching
const products = await getProducts()
const categories = await getCategories()
```

### 5. Component Composition

**Principle**: Build complex components by composing simpler ones.

**Benefits**:
- Reusability
- Maintainability
- Flexibility

```typescript
<ProductCard>
  <ProductCard.Image src={image} />
  <ProductCard.Title>{title}</ProductCard.Title>
  <ProductCard.Price>{price}</ProductCard.Price>
  <ProductCard.Actions>
    <AddToCartButton />
  </ProductCard.Actions>
</ProductCard>
```

### 6. Error Boundaries

**Principle**: Handle errors gracefully at component and route levels.

**Implementation**:
- `error.tsx` files for route-level errors
- `ErrorBoundary` components for component-level errors
- Global error handler for uncaught errors

### 7. Loading States

**Principle**: Provide visual feedback during async operations.

**Implementation**:
- `loading.tsx` files for route-level loading
- Suspense boundaries for component-level loading
- Skeleton screens for content loading

## Data Flow

### Read Operations (Queries)

```
User Request
    ↓
Server Component
    ↓
Database Query (Prisma)
    ↓
Data Transformation
    ↓
Render HTML
    ↓
Send to Client
```

### Write Operations (Mutations)

```
User Action (Client Component)
    ↓
Server Action Call
    ↓
Input Validation (Zod)
    ↓
Authentication Check
    ↓
Business Logic
    ↓
Database Operation (Prisma)
    ↓
Cache Revalidation
    ↓
Return Result
    ↓
Update UI (Optimistic)
```

## Caching Strategy

### Static Pages
- Product details (ISR with revalidation)
- Category pages
- Homepage

### Dynamic Pages
- User dashboard
- Cart
- Checkout
- Order status

### Cache Configuration
```typescript
// Static with revalidation
export const revalidate = 3600 // 1 hour

// Dynamic (no cache)
export const dynamic = 'force-dynamic'

// Partial caching
fetch(url, { next: { revalidate: 60 } })
```

## Security Architecture

### Authentication Flow
1. User submits credentials
2. NextAuth.js validates credentials
3. JWT token generated and stored in httpOnly cookie
4. Session validated on each request via middleware
5. Protected routes redirect unauthenticated users

### Authorization
- Role-based access control (customer, admin)
- Route protection via middleware
- API route guards
- Server action authorization checks

### Input Validation
- Client-side validation (UX)
- Server-side validation (security)
- Zod schemas for type safety and runtime validation
- Sanitization of user inputs

### Payment Security
- Stripe handles PCI compliance
- Never store credit card data
- Webhook signature verification
- Idempotency keys for payment operations

## Performance Optimization

### Code Splitting
- Automatic route-based code splitting
- Dynamic imports for heavy components
- Lazy loading for below-the-fold content

### Image Optimization
- Next.js Image component
- WebP format with fallbacks
- Responsive images
- Blur placeholders

### Font Optimization
- `next/font` for zero layout shift
- Self-hosted fonts
- Preload critical fonts

### Database Optimization
- Indexed columns for frequent queries
- Query optimization (select only needed fields)
- Connection pooling
- Query result caching

## Scalability Considerations

### Horizontal Scaling
- Stateless server architecture
- Session data in database or Redis
- File uploads to cloud storage (S3)

### Database Scaling
- Read replicas for read-heavy operations
- Connection pooling
- Query optimization
- Caching layer (Redis) for frequently accessed data

### CDN Strategy
- Static assets served from CDN
- Edge caching for dynamic content
- Image optimization at edge

## Monitoring & Observability

### Logging
- Structured logging (JSON format)
- Error tracking (Sentry or similar)
- Request logging
- Performance metrics

### Analytics
- User behavior tracking
- Conversion funnel analysis
- Performance monitoring (Core Web Vitals)
- Error rates and types

### Alerts
- Error rate thresholds
- Performance degradation
- Payment failures
- Database connection issues

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies (`pnpm install`)
3. Set up environment variables
4. Run database migrations (`pnpm prisma migrate dev`)
5. Seed database (`pnpm prisma db seed`)
6. Start development server (`pnpm dev`)

### Testing Strategy
- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for critical flows
- E2E tests for user journeys

### Deployment Pipeline
1. Push to feature branch
2. Automated tests run
3. Create pull request
4. Code review
5. Merge to main
6. Automated deployment to staging
7. Manual approval for production
8. Deploy to production

---

**Last Updated:** November 24, 2025

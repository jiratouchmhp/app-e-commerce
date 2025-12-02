# Next.js E-Commerce Context Engineering Specification

## Overview

This repository contains a comprehensive context engineering framework for building a modern, production-ready Next.js e-commerce application with AI assistance. The specification ensures consistent, high-quality code generation aligned with best practices.

## Quick Start

### For AI Agents (Optimized for Performance)

**Core Context (Load First - ~36k tokens):**
1. **Start here**: Read `.github/copilot-instructions.md` for tiered loading strategy
2. **Core patterns**: Review `docs/CORE-PRINCIPLES.md` for fundamental patterns
3. **Product vision**: Understand `docs/PRODUCT.md` for goals and user personas
4. **Pattern index**: Check `docs/ECOMMERCE-PATTERNS.md` for available patterns

**Extended Context (Load On-Demand):**
5. **Architecture**: Reference `docs/ARCHITECTURE.md` when planning system structure
6. **Design system**: Reference `docs/DESIGN-SYSTEM.md` when building UI
7. **Code standards**: Reference `docs/CONTRIBUTING.md` for specific conventions
8. **Full patterns**: Load `patterns/[name].md` when implementing similar features
9. **Quality requirements**: Reference `docs/QUALITY-STANDARDS.md` for validation and testing

**Performance**: This tiered approach reduces initial context by **85%** (255k → 36k tokens). See `CONTEXT-OPTIMIZATION.md` for details.

### For Developers

1. **Plan features**: Use `@plan` agent to create implementation plans
2. **Implement features**: Use `@implement` agent to execute plans
3. **Use prompts**: Invoke `/component`, `/page`, `/server-action` for common tasks
4. **Follow checklist**: Verify against quality standards before submitting PRs

## Documentation Structure

```
dev-app/
├── .github/
│   ├── copilot-instructions.md    # AI agent entry point (OPTIMIZED)
│   ├── agents/
│   │   ├── plan.agent.md          # Planning persona (tiered loading)
│   │   └── implement.agent.md     # Implementation persona (tiered loading)
│   └── prompts/
│       ├── component.prompt.md    # Create new components
│       ├── page.prompt.md         # Create new pages
│       └── server-action.prompt.md # Create server actions
│
├── docs/                           # ⭐ Documentation folder
│   ├── CORE-PRINCIPLES.md          # Consolidated fundamental patterns
│   ├── PRODUCT.md                  # Product vision, goals, personas
│   ├── ECOMMERCE-PATTERNS.md       # Pattern index with references
│   ├── ARCHITECTURE.md             # System architecture, patterns
│   ├── CONTRIBUTING.md             # Coding standards, workflows
│   ├── DESIGN-SYSTEM.md            # UI/UX guidelines, components
│   ├── TYPESCRIPT-NEXTJS-CONVENTIONS.md # Framework-specific best practices
│   └── QUALITY-STANDARDS.md        # Validation, testing, performance
│
├── patterns/                       # Full pattern implementations
│   ├── cart-management.md
│   ├── checkout-flow.md
│   ├── product-catalog.md
│   ├── authentication.md
│   └── payment-integration.md
│
└── README.md                       # This file
```

## Technology Stack

**Core Framework**
- Next.js 14+ (App Router)
- React 18+ (Server Components)
- TypeScript 5+ (Strict mode)

**Styling & UI**
- Tailwind CSS 3+
- Lucide React (Icons)
- CSS Variables (Design tokens)

**Data & State**
- Prisma (ORM)
- PostgreSQL (Database)
- Zustand (Client state)
- Server Actions (Mutations)

**Authentication & Security**
- NextAuth.js v5
- Zod (Validation)
- bcrypt (Password hashing)

**Payments**
- Stripe
- Stripe Webhooks

## Key Design Principles

### 1. Server-First Architecture
Default to React Server Components. Only use Client Components when you need:
- Event handlers (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs (localStorage, window)

### 2. Type Safety First
- Strict TypeScript configuration
- No `any` types without justification
- Zod validation on client and server
- Type inference over explicit typing

### 3. Minimal & Professional Design
- Embrace whitespace
- Subtle animations
- High-quality imagery
- Clean typography
- Accessible by default

### 4. Performance by Default
- Optimize images with `next/image`
- Code splitting with dynamic imports
- Proper caching strategies
- Database query optimization
- Target: Lighthouse score >90

### 5. Progressive Enhancement
- Core functionality works without JavaScript
- Graceful degradation
- Accessible to all users
- Mobile-first responsive design

## AI Agent Workflow

### Planning Phase (@plan agent)

```
User Request
     ↓
Ask Clarifying Questions (2-3 questions)
     ↓
Research Codebase (autonomous with runSubagent)
     ↓
Create Implementation Plan
     ↓
User Reviews & Approves
     ↓
Handoff to Implementation Agent
```

### Implementation Phase (@implement agent)

```
Receive Plan
     ↓
Phase 1: Database & Types
  - Update Prisma schema
  - Create TypeScript types
  - Define Zod schemas
     ↓
Phase 2: Server Logic
  - Implement Server Actions
  - Add validation
  - Add auth checks
  - Handle errors
     ↓
Phase 3: UI Components
  - Create Server Components
  - Add Client Components (minimal)
  - Add loading states
  - Add error boundaries
     ↓
Phase 4: Integration & Testing
  - Wire components together
  - Test all flows
  - Verify responsiveness
  - Check accessibility
```

## Common Workflows

### Create a New Feature

```bash
# 1. Plan the feature
@plan Add product wishlist functionality

# 2. Review and approve the plan

# 3. Implement the feature (handed off from plan agent)
@implement

# 4. Verify quality standards
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

### Create a New Component

```bash
# Use the component prompt
/component

# Answer questions about the component
# - Name and purpose
# - Server or Client component?
# - Props needed
# - Styling requirements
```

### Create a New Page

```bash
# Use the page prompt
/page

# Answer questions about the page
# - Route path
# - Data requirements
# - Authentication needed?
# - Layout preferences
```

### Create a Server Action

```bash
# Use the server action prompt
/server-action

# Answer questions about the action
# - Operation type (create, update, delete)
# - Entity/resource
# - Required inputs
# - Authentication requirements
```

## Code Quality Standards

### Must Pass Before Merging

✅ **Type Checking**: `tsc --noEmit` with zero errors
✅ **Linting**: `pnpm lint` with zero errors
✅ **Tests**: All tests passing
✅ **Build**: `pnpm build` succeeds
✅ **Lighthouse**: Performance >90, Accessibility 100
✅ **Accessibility**: Keyboard navigation, screen reader tested

### Required for All Code

✅ Explicit TypeScript types (no `any`)
✅ Zod validation on client and server
✅ Error handling with try-catch
✅ Loading states for async operations
✅ Error boundaries for component errors
✅ Responsive design (mobile, tablet, desktop)
✅ Accessibility (WCAG 2.1 AA)
✅ Performance optimization
✅ Follow design system
✅ Use existing patterns

## Example: Creating a Product Review Feature

### 1. Planning (@plan agent)

```
@plan Add product reviews and ratings feature

Questions from agent:
1. Should users need to purchase the product before reviewing?
2. Can users edit/delete their reviews?
3. What's the rating scale (1-5 stars)?

After research, agent provides:
- Database schema changes (Review model)
- Server Actions needed (createReview, updateReview, deleteReview)
- Components to create (ReviewForm, ReviewList, ReviewCard, StarRating)
- Validation schemas
- Implementation tasks (14 tasks broken down)
```

### 2. Implementation (@implement agent)

The agent implements in phases:

**Phase 1: Database**
```prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int      @db.SmallInt
  comment   String   @db.Text
  productId String
  userId    String
  product   Product  @relation(fields: [productId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([productId, userId])
  @@index([productId])
}
```

**Phase 2: Validation**
```typescript
// lib/validations/review.ts
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
  productId: z.string().uuid(),
})
```

**Phase 3: Server Action**
```typescript
// lib/actions/reviews.ts
'use server'
export async function createReview(input: unknown) {
  const data = createReviewSchema.parse(input)
  const session = await getServerSession()
  // ... implementation
}
```

**Phase 4: Components**
```typescript
// components/reviews/review-form.tsx (Client)
// components/reviews/review-list.tsx (Server)
// components/reviews/review-card.tsx (Server)
// components/reviews/star-rating.tsx (Client)
```

## Best Practices Summary

### DO ✅

- Use Server Components by default
- Validate all inputs with Zod
- Handle errors gracefully
- Add loading states
- Follow design system
- Write tests
- Document complex logic
- Use TypeScript strictly
- Optimize images
- Consider accessibility

### DON'T ❌

- Use Client Components unnecessarily
- Skip input validation
- Ignore error handling
- Forget loading states
- Use inline styles
- Use `any` types
- Skip type checking
- Ignore performance
- Overlook mobile
- Forget accessibility

## Resources

### Internal Documentation
- [Product Vision](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Design System](docs/DESIGN-SYSTEM.md)
- [E-Commerce Patterns](docs/ECOMMERCE-PATTERNS.md)
- [TypeScript & Next.js](docs/TYPESCRIPT-NEXTJS-CONVENTIONS.md)
- [Quality Standards](docs/QUALITY-STANDARDS.md)

### External References
- [Next.js Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/react/use-server)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org)

## Maintaining This Specification

### When to Update

Update these documents when:
- New patterns emerge
- Architecture decisions change
- Design system evolves
- Quality standards improve
- New technologies adopted
- Best practices refined

### How to Update

1. Make changes to relevant documentation files
2. Update `copilot-instructions.md` if structure changes
3. Test with AI agents to verify clarity
4. Update "Last Updated" date in each file
5. Commit with descriptive message

### Review Schedule

- **Monthly**: Review and refine based on AI agent performance
- **Quarterly**: Major updates to reflect learnings
- **As Needed**: When significant changes occur

## Success Metrics

This context engineering specification is successful when:

✅ AI agents consistently generate correct code on first try
✅ Code reviews require minimal changes
✅ Generated code passes all quality gates
✅ Time to implement features decreases
✅ Code quality and consistency improves
✅ Team onboarding is faster
✅ Technical debt is minimized

## Support

For questions or issues with the context engineering specification:

1. Check relevant documentation files first
2. Review examples in `ECOMMERCE-PATTERNS.md`
3. Test with `@plan` agent for guidance
4. Consult with team leads
5. Update documentation with learnings

---

**Version**: 1.0.0
**Last Updated**: November 24, 2025
**Maintained By**: Development Team

**Remember**: This specification is a living document. Continuously refine it based on what works and what doesn't. The goal is to make AI-assisted development more effective, not to create rigid constraints.

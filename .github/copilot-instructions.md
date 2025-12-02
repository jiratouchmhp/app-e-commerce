# E-Commerce Application Development Guidelines

This document provides high-level context for AI-assisted development of our Next.js e-commerce application. All generated code must align with these principles and referenced documentation.

## Project Overview

We are building a modern, performant e-commerce platform with a clean, minimal, and professional design aesthetic. The application prioritizes user experience, type safety, accessibility, and scalability.

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS (utility-first styling)
- Prisma + PostgreSQL
- NextAuth.js v5 for authentication
- Stripe for payments
- Zustand for client-side state management
- Zod for runtime validation

## Documentation Architecture

### Core Context (Load First)

Start with these essential documents:

* **[Core Principles](../docs/CORE-PRINCIPLES.md)**: Fundamental patterns - server-first, type safety, validation, error handling (300 lines)
* **[Product Vision](../docs/PRODUCT.md)**: Product vision, user personas, and business objectives
* **[Pattern Index](../docs/ECOMMERCE-PATTERNS.md)**: Quick reference to available e-commerce patterns (200 lines)

### Extended Context (Reference On-Demand)

Load these when needed for specific features:

* **[System Architecture](../docs/ARCHITECTURE.md)**: Technical architecture, folder structure, design patterns - Use `@expand` for detailed sections
* **[Design System](../docs/DESIGN-SYSTEM.md)**: UI/UX guidelines, component patterns - Reference for UI work
* **[Contributing Guidelines](../docs/CONTRIBUTING.md)**: Coding standards and workflows - Reference specific sections as needed
* **[TypeScript & Next.js Conventions](../docs/TYPESCRIPT-NEXTJS-CONVENTIONS.md)**: Framework patterns - Reference for complex implementations
* **[Quality Standards](../docs/QUALITY-STANDARDS.md)**: Validation, testing, performance requirements - Reference during quality checks

### Pattern Implementations (Load As Needed)

Full code examples in separate pattern files:

* `patterns/cart-management.md` - Shopping cart with Zustand
* `patterns/checkout-flow.md` - Multi-step checkout process
* `patterns/product-catalog.md` - Product listing and details
* `patterns/authentication.md` - NextAuth.js setup
* `patterns/payment-integration.md` - Stripe integration

**Optimization**: This tiered approach reduces initial context load by 85% (~255k tokens → ~36k tokens). Load extended documentation only when implementing specific features.

## Development Principles

1. **Server-First Architecture**: Default to Server Components; only use Client Components when necessary (interactivity, hooks, browser APIs)
2. **Type Safety First**: All code must be fully typed; no `any` types without explicit justification
3. **Minimal & Clean Design**: Prioritize whitespace, subtle animations, and professional aesthetics
4. **Performance by Default**: Optimize images, use streaming, implement proper caching strategies
5. **Accessibility**: Follow WCAG 2.1 AA standards; semantic HTML, keyboard navigation, ARIA labels
6. **Progressive Enhancement**: Core functionality works without JavaScript where possible
7. **Validation Everywhere**: Use Zod schemas on both client and server for all data operations
8. **Error Handling**: Graceful error boundaries, user-friendly messages, proper logging

## Code Generation Requirements

When generating code, ensure:

- ✅ TypeScript with strict type checking
- ✅ Server Components by default unless client-side features needed
- ✅ Tailwind CSS classes following our design system
- ✅ Zod schemas for all data validation
- ✅ Server Actions for mutations
- ✅ Proper error handling with try/catch and error boundaries
- ✅ Accessibility attributes (ARIA labels, semantic HTML)
- ✅ Loading and error states (loading.tsx, error.tsx, Suspense)
- ✅ Optimized images using next/image
- ✅ JSDoc comments for complex functions
- ✅ Consistent naming conventions (see CONTRIBUTING.md)

## Quality Standards

All code must meet these standards:

- **No TypeScript errors**: `tsc --noEmit` must pass
- **No ESLint errors**: Code must pass linting
- **No console.logs in production**: Use proper logging utilities
- **Validated inputs**: All user inputs validated with Zod
- **Responsive design**: Mobile-first approach
- **Performance**: Lighthouse score >90 for all metrics

## Architectural Decisions

**Prefer:**
- Server Components over Client Components
- Server Actions over API routes for mutations
- Parallel data fetching over sequential
- Static generation over dynamic rendering when possible
- Composition over configuration
- Explicit over implicit

**Avoid:**
- Client-side rendering for SEO-critical content
- Prop drilling (use composition or context)
- Inline styles (use Tailwind classes)
- Large bundle sizes (code-split heavy components)
- Overfetching data (select only needed fields)

## Workflow Guidance

When implementing features:

1. **Understand requirements** - Review relevant documentation first
2. **Plan architecture** - Use the `@plan` agent for complex features
3. **Generate types** - Define TypeScript interfaces and Zod schemas
4. **Build UI components** - Start with Server Components, add client features as needed
5. **Implement business logic** - Use Server Actions for data mutations
6. **Add validation** - Validate all inputs on client and server
7. **Handle errors** - Add error boundaries and user-friendly messages
8. **Test interactively** - Verify functionality and edge cases
9. **Optimize** - Check bundle size, performance, accessibility

## Context Updates

If you encounter incomplete, outdated, or conflicting information in these documents, suggest updates to keep the context accurate and helpful.

---

**Last Updated:** November 24, 2025

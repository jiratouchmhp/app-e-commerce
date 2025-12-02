---
agent: front-end-plan
description: 'Create a new page with proper data fetching and layouts'
---

# Create Page

I need to create a new page in the Next.js e-commerce application.

Please follow these steps:

1. **Ask clarifying questions** about:
   - What is the page route? (e.g., /products, /products/[id])
   - What data does it display?
   - Is it static or dynamic?
   - Does it require authentication?
   - What layout should it use?

2. **Research the codebase** to:
   - Check existing pages for patterns
   - Identify reusable components
   - Verify data fetching methods

3. **Create an implementation plan** that includes:
   - Page file location (app/)
   - Route structure (static vs dynamic)
   - Data fetching strategy
   - Metadata for SEO
   - Loading state (loading.tsx)
   - Error boundary (error.tsx)
   - Layout wrapper (if needed)
   - Components to create/use

4. **Provide code examples** showing:
   - Complete page component
   - Data fetching function
   - Metadata generation
   - Loading component
   - Error component

Make sure the page includes:
- Proper file structure (page.tsx, loading.tsx, error.tsx)
- Server Component by default
- generateMetadata() for SEO
- Suspense boundaries for streaming
- Error boundaries for failures
- Responsive layout
- Accessibility attributes

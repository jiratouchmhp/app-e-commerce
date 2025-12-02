---
agent: front-end-plan
description: 'Create a new Server Action for data mutations'
---

# Create Server Action

I need to create a new Server Action for handling data mutations in the e-commerce application.

Please follow these steps:

1. **Ask clarifying questions** about:
   - What data operation is needed? (create, update, delete)
   - What entity/resource does it operate on?
   - What inputs does it require?
   - Does it require authentication?
   - Should it revalidate any cache?

2. **Research the codebase** to:
   - Check existing Server Actions for patterns
   - Verify database schema
   - Identify similar operations

3. **Create an implementation plan** that includes:
   - Server Action file location (lib/actions/)
   - Input validation schema (Zod)
   - Authentication/authorization check
   - Database operation (Prisma)
   - Error handling strategy
   - Cache revalidation paths
   - Return type definition

4. **Provide code examples** showing:
   - Complete Server Action implementation
   - Validation schema
   - Usage from Client Component
   - Error handling

Make sure the Server Action includes:
- 'use server' directive
- Zod input validation
- Try-catch error handling
- Proper TypeScript types
- Authentication check (if needed)
- Cache revalidation (revalidatePath/revalidateTag)
- Structured return type (success/error)

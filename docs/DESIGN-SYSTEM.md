# Design System

## Overview

This design system defines the visual language and component patterns for the e-commerce application. The aesthetic is **minimal, clean, and professional** with a focus on clarity, whitespace, and subtle interactions.

## Design Principles

### 1. Minimal & Clean
- **Embrace whitespace**: Let content breathe
- **Remove unnecessary elements**: Every element must have a purpose
- **Subtle over bold**: Prefer understated elegance to flashy design

### 2. Professional & Trustworthy
- **High-quality imagery**: Sharp, well-composed product photos
- **Consistent typography**: Clear hierarchy, readable fonts
- **Refined interactions**: Smooth, purposeful animations

### 3. User-Focused
- **Clarity over creativity**: Users should never be confused
- **Accessibility first**: Everyone can use the interface
- **Performance**: Fast loading, smooth interactions

## Color Palette

### Base Colors

```css
/* Light Mode (Default) */
--background: 0 0% 100%           /* #FFFFFF - Pure white */
--foreground: 0 0% 3.9%           /* #0A0A0A - Near black */

/* Neutral Grays */
--muted: 0 0% 96.1%               /* #F5F5F5 - Light gray background */
--muted-foreground: 0 0% 45.1%    /* #737373 - Medium gray text */

/* Borders & Dividers */
--border: 0 0% 89.8%              /* #E5E5E5 - Light gray borders */
--input: 0 0% 89.8%               /* #E5E5E5 - Input borders */
--ring: 0 0% 3.9%                 /* #0A0A0A - Focus rings */

/* Primary Actions */
--primary: 0 0% 9%                /* #171717 - Black for CTAs */
--primary-foreground: 0 0% 98%    /* #FAFAFA - White text on black */

/* Secondary Actions */
--secondary: 0 0% 96.1%           /* #F5F5F5 - Light gray background */
--secondary-foreground: 0 0% 9%   /* #171717 - Black text */

/* Accents */
--accent: 0 0% 96.1%              /* #F5F5F5 - Subtle highlights */
--accent-foreground: 0 0% 9%      /* #171717 - Text on accents */

/* Destructive Actions */
--destructive: 0 84.2% 60.2%      /* #DC2626 - Red for errors/delete */
--destructive-foreground: 0 0% 98% /* #FAFAFA - White on red */

/* Success States */
--success: 142 76% 36%            /* #16A34A - Green for success */
--success-foreground: 0 0% 98%    /* #FAFAFA - White on green */

/* Warning States */
--warning: 38 92% 50%             /* #F59E0B - Orange for warnings */
--warning-foreground: 0 0% 98%    /* #FAFAFA - White on orange */
```

### Usage Guidelines

**Primary (Black)**
- Main CTAs: "Add to Cart", "Checkout", "Buy Now"
- Active navigation items
- Important headings

**Secondary (Light Gray)**
- Secondary actions: "Cancel", "Back"
- Inactive states
- Background sections

**Muted (Very Light Gray)**
- Card backgrounds
- Input backgrounds
- Hover states

**Destructive (Red)**
- Delete buttons
- Error messages
- Critical warnings

**Success (Green)**
- Success messages
- Confirmation states
- Stock indicators

## Typography

### Font Stack

```typescript
// Primary Font: Inter (via next/font)
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

### Type Scale

```css
/* Headings */
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */
--text-5xl: 3rem        /* 48px */

/* Line Heights */
--leading-none: 1
--leading-tight: 1.25
--leading-snug: 1.375
--leading-normal: 1.5
--leading-relaxed: 1.625
--leading-loose: 2

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Typography Components

```typescript
// Headings
<h1 className="text-4xl font-bold tracking-tight">
  Product Name
</h1>

<h2 className="text-3xl font-semibold tracking-tight">
  Section Title
</h2>

<h3 className="text-2xl font-semibold">
  Subsection
</h3>

// Body Text
<p className="text-base leading-relaxed text-muted-foreground">
  Product description goes here...
</p>

// Small Text
<span className="text-sm text-muted-foreground">
  Additional details
</span>

// Price
<span className="text-2xl font-bold">
  $99.99
</span>
```

### Typography Rules

1. **Hierarchy**: Use size and weight to establish clear hierarchy
2. **Line Length**: 60-80 characters for optimal readability
3. **Line Height**: Larger for body text (1.5-1.625), tighter for headings (1.25)
4. **Letter Spacing**: Slightly tighter for large headings (`tracking-tight`)
5. **Contrast**: Ensure minimum 4.5:1 contrast ratio for body text

## Spacing System

### Spacing Scale

```css
--spacing-0: 0px      /* 0 */
--spacing-1: 0.25rem  /* 4px */
--spacing-2: 0.5rem   /* 8px */
--spacing-3: 0.75rem  /* 12px */
--spacing-4: 1rem     /* 16px */
--spacing-5: 1.25rem  /* 20px */
--spacing-6: 1.5rem   /* 24px */
--spacing-8: 2rem     /* 32px */
--spacing-10: 2.5rem  /* 40px */
--spacing-12: 3rem    /* 48px */
--spacing-16: 4rem    /* 64px */
--spacing-20: 5rem    /* 80px */
--spacing-24: 6rem    /* 96px */
```

### Layout Spacing

```typescript
// Container
<div className="container mx-auto px-4 md:px-6 lg:px-8">

// Section Spacing
<section className="py-12 md:py-16 lg:py-20">

// Component Spacing
<div className="space-y-6">  {/* Vertical spacing between items */}
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div className="flex gap-4">  {/* Horizontal spacing */}
  <button>Action 1</button>
  <button>Action 2</button>
</div>
```

### Spacing Guidelines

1. **Consistent**: Use spacing scale, avoid arbitrary values
2. **Generous**: Prefer more whitespace for a clean look
3. **Responsive**: Reduce spacing on mobile, increase on desktop
4. **Grouping**: Use proximity to show relationships

## Border Radius

```css
--radius-none: 0px
--radius-sm: 0.125rem    /* 2px */
--radius-default: 0.5rem /* 8px */
--radius-md: 0.75rem     /* 12px */
--radius-lg: 1rem        /* 16px */
--radius-full: 9999px    /* Pill shape */
```

### Usage

```typescript
// Cards
<div className="rounded-lg">

// Buttons
<button className="rounded-lg">

// Images
<img className="rounded-lg">

// Pills/Badges
<span className="rounded-full">
```

## Shadows

```css
/* Subtle elevation */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Card elevation */
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

/* Modal/Dropdown elevation */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Prominent elevation */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

### Usage

```typescript
// Cards
<div className="shadow-sm hover:shadow-md transition-shadow">

// Dropdowns
<div className="shadow-lg">

// Images on hover
<img className="hover:shadow-lg transition-shadow">
```

## Components

### Button

```typescript
// Primary Button
<button className="
  inline-flex items-center justify-center
  rounded-lg
  bg-primary text-primary-foreground
  px-6 py-3
  text-base font-medium
  transition-colors
  hover:bg-primary/90
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
  disabled:pointer-events-none disabled:opacity-50
">
  Add to Cart
</button>

// Secondary Button
<button className="
  inline-flex items-center justify-center
  rounded-lg
  bg-secondary text-secondary-foreground
  px-6 py-3
  text-base font-medium
  transition-colors
  hover:bg-secondary/80
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
">
  Learn More
</button>

// Outline Button
<button className="
  inline-flex items-center justify-center
  rounded-lg
  border border-input
  bg-background
  px-6 py-3
  text-base font-medium
  transition-colors
  hover:bg-accent hover:text-accent-foreground
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
">
  View Details
</button>

// Ghost Button
<button className="
  inline-flex items-center justify-center
  rounded-lg
  px-4 py-2
  text-base font-medium
  transition-colors
  hover:bg-accent hover:text-accent-foreground
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
">
  Cancel
</button>
```

### Card

```typescript
<div className="
  rounded-lg
  border border-border
  bg-background
  p-6
  shadow-sm
  transition-shadow
  hover:shadow-md
">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content goes here...</p>
</div>
```

### Input

```typescript
<input className="
  flex h-10 w-full
  rounded-lg
  border border-input
  bg-background
  px-3 py-2
  text-sm
  ring-offset-background
  placeholder:text-muted-foreground
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
  disabled:cursor-not-allowed disabled:opacity-50
" />
```

### Badge

```typescript
// Default Badge
<span className="
  inline-flex items-center
  rounded-full
  bg-primary
  px-2.5 py-0.5
  text-xs font-medium
  text-primary-foreground
">
  New
</span>

// Outline Badge
<span className="
  inline-flex items-center
  rounded-full
  border border-input
  px-2.5 py-0.5
  text-xs font-medium
">
  Sale
</span>
```

## Animations

### Transitions

```css
/* Default transition */
transition-all duration-200 ease-in-out

/* Color transitions */
transition-colors duration-200

/* Transform transitions */
transition-transform duration-200

/* Opacity transitions */
transition-opacity duration-200

/* Shadow transitions */
transition-shadow duration-200
```

### Hover Effects

```typescript
// Button Hover
<button className="hover:bg-primary/90 transition-colors">

// Card Hover
<div className="hover:shadow-lg hover:-translate-y-0.5 transition-all">

// Image Hover
<img className="hover:scale-105 transition-transform duration-300">

// Link Hover
<a className="hover:text-primary transition-colors">
```

### Loading States

```typescript
// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />

// Pulse
<div className="animate-pulse bg-muted h-4 w-full rounded" />

// Skeleton
<div className="space-y-2">
  <div className="h-4 bg-muted rounded animate-pulse" />
  <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
</div>
```

## Icons

### Icon Library
Use **Lucide React** for all icons:

```typescript
import { ShoppingCart, Search, User, Heart, Menu, X } from 'lucide-react'

<ShoppingCart className="h-5 w-5" />
```

### Icon Sizes

```typescript
// Small (16px)
<Icon className="h-4 w-4" />

// Default (20px)
<Icon className="h-5 w-5" />

// Medium (24px)
<Icon className="h-6 w-6" />

// Large (32px)
<Icon className="h-8 w-8" />
```

### Icon Usage

```typescript
// With Button
<button className="inline-flex items-center gap-2">
  <ShoppingCart className="h-5 w-5" />
  <span>Add to Cart</span>
</button>

// Icon Only Button
<button aria-label="Shopping Cart" className="p-2">
  <ShoppingCart className="h-5 w-5" />
</button>
```

## Layout Patterns

### Page Container

```typescript
<div className="min-h-screen bg-background">
  <Header />
  <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
    {children}
  </main>
  <Footer />
</div>
```

### Grid Layouts

```typescript
// Product Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// Two Column Layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
  <div>{/* Column 1 */}</div>
  <div>{/* Column 2 */}</div>
</div>
```

### Section Spacing

```typescript
<section className="py-12 md:py-16 lg:py-20">
  <div className="container mx-auto px-4 md:px-6">
    <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
    {/* Content */}
  </div>
</section>
```

## Responsive Design

### Breakpoints

```typescript
// Tailwind breakpoints
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large desktop
```

### Mobile-First Examples

```typescript
// Text size
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Padding
<div className="p-4 md:p-6 lg:p-8">

// Grid columns
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hidden on mobile
<div className="hidden md:block">

// Show on mobile only
<div className="block md:hidden">
```

## Accessibility

### Focus States

```typescript
// All interactive elements must have visible focus states
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
```

### Color Contrast

- **Body text**: Minimum 4.5:1 contrast ratio
- **Large text (18px+)**: Minimum 3:1 contrast ratio
- **UI elements**: Minimum 3:1 contrast ratio

### ARIA Labels

```typescript
// Icon-only buttons
<button aria-label="Close menu">
  <X className="h-5 w-5" />
</button>

// Image alt text
<img src="/product.jpg" alt="Blue cotton t-shirt, front view" />
```

## Dark Mode (Future)

```typescript
// Prepare for dark mode with CSS variables
<div className="bg-background text-foreground">
  {/* Will automatically adapt when dark mode is implemented */}
</div>
```

## Design Checklist

When creating new components:

- [ ] Uses design system colors (CSS variables)
- [ ] Uses design system spacing (Tailwind scale)
- [ ] Typography follows type scale
- [ ] Has proper focus states
- [ ] Has hover/active states
- [ ] Is fully responsive (mobile-first)
- [ ] Meets accessibility standards (WCAG 2.1 AA)
- [ ] Includes loading states
- [ ] Includes error states
- [ ] Uses semantic HTML
- [ ] Icons from Lucide React
- [ ] Smooth transitions (200ms default)

---

**Last Updated:** November 24, 2025

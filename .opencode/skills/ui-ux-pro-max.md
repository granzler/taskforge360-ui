---
name: ui-ux-pro-max
description: "AI-powered design intelligence for web and mobile. 67 UI styles, 161 color palettes, 57 typography pairs, 161 industry reasoning rules, 99 UX guides, and 25 chart types for 15+ stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, HTML/CSS)."
version: 2.5.0
author: NextLevelBuilder (adapted for Hermes)
license: MIT
tags: [ui, ux, design-system, color-palette, typography, accessibility, frontend]
---

# UI/UX Pro Max — Design Intelligence

Comprehensive UI/UX design guide for web and mobile applications. Contains 67 styles, 161 color palettes, 57 typography pairs, 161 product types with reasoning rules, 99 UX guides, and 25 chart types for 10+ technology stacks.

## When to apply this skill

Use this skill when the task involves **UI structure, visual design decisions, interaction patterns, or UX quality control**.

### Mandatory use
- Designing new pages (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts)
- Choosing color schemes, typography, spacing, or layout systems
- Reviewing UI code for UX, accessibility, or visual consistency
- Implementing navigation, animations, or responsive behavior
- Product-level design decisions (style, information hierarchy, brand identity)

### Recommended use
- The UI "doesn't look professional" but you don't know why
- You received usability or experience feedback
- Pre-launch UI optimization
- Aligning design cross-platform (Web / iOS / Android)
- Building design systems or reusable component libraries

### Not needed
- Pure backend logic
- APIs or databases only
- Performance optimization unrelated to the interface
- Infrastructure or DevOps
- Non-visual scripts or automation

---

## Rule Categories by Priority

| Prio | Category | Impact | Key Checks | Anti-Patterns |
|------|----------|--------|------------|---------------|
| 1 | Accessibility | CRITICAL | 4.5:1 contrast, alt text, keyboard navigation, aria-labels | Removing focus rings, icon-only without labels |
| 2 | Touch and Interaction | CRITICAL | Min 44x44px, 8px+ spacing, loading feedback | Relying on hover only, instant transitions |
| 3 | Performance | HIGH | WebP/AVIF, lazy loading, reserved space (CLS < 0.1) | Layout thrashing, Cumulative Layout Shift |
| 4 | Style Selection | HIGH | Product match, consistency, SVG icons | Mixing flat and skeuomorphic, emojis as icons |
| 5 | Layout and Responsive | HIGH | Mobile-first, viewport meta, no horizontal scroll | Horizontal scroll, fixed px containers, disabling zoom |
| 6 | Typography and Color | MEDIUM | 16px base, 1.5 line-height, semantic tokens | Body text < 12px, gray-on-gray, raw hex in components |
| 7 | Animation | MEDIUM | 150-300ms duration, meaningful motion, spatial continuity | Decorative animations, animating width/height, no reduced-motion |
| 8 | Forms and Feedback | MEDIUM | Visible labels, errors near field, progressive disclosure | Placeholder as label, errors only at top |
| 9 | Navigation Patterns | HIGH | Predictable back, bottom nav <=5, deep links | Overloaded nav, broken back, no deep links |
| 10 | Charts and Data | LOW | Legends, tooltips, accessible colors | Color-only information |

---

## Quick Reference

### 1. Accessibility (CRITICAL)

- `color-contrast` — Minimum 4.5:1 for normal text (3:1 for large text)
- `focus-states` — Visible focus rings on interactive elements (2-4px)
- `alt-text` — Descriptive alt text for meaningful images
- `aria-labels` — aria-label on icon-only buttons
- `keyboard-nav` — Tab order matches visual order
- `form-labels` — Use label with `for` attribute
- `skip-links` — Skip to main content for keyboard users
- `heading-hierarchy` — h1->h6 sequential, no skips
- `color-not-only` — Never convey information with color alone (add icon/text)
- `dynamic-type` — Support system text scaling
- `reduced-motion` — Respect `prefers-reduced-motion`
- `voiceover-sr` — Meaningful accessibilityLabel/accessibilityHint
- `escape-routes` — Cancel/back in modals and multi-step flows
- `keyboard-shortcuts` — Preserve system shortcuts

### 2. Touch and Interaction (CRITICAL)

- `touch-target-size` — Min 44x44pt (Apple) / 48x48dp (Material)
- `touch-spacing` — Min 8px/8dp between touch targets
- `hover-vs-tap` — Use click/tap for primary actions
- `loading-buttons` — Disable button during async; show spinner
- `error-feedback` — Errors near the problematic field
- `cursor-pointer` — cursor-pointer on clickables (Web)
- `gesture-conflicts` — Avoid horizontal swipe in main content
- `tap-delay` — Use `touch-action: manipulation`
- `standard-gestures` — Standard platform gestures
- `safe-area-awareness` — Targets outside notch, Dynamic Island
- `swipe-clarity` — Swipe actions must show affordance
- `drag-threshold` — Threshold before starting drag

### 3. Performance (HIGH)

- `image-optimization` — WebP/AVIF, srcset/sizes, lazy load
- `image-dimension` — width/height or aspect-ratio to prevent CLS
- `font-loading` — `font-display: swap/optional`
- `critical-css` — Prioritize above-the-fold CSS
- `lazy-loading` — Lazy load non-critical components
- `bundle-splitting` — Split by route/feature
- `third-party-scripts` — async/defer, audit unnecessary ones
- `reduce-reflows` — Batch DOM reads before writes
- `virtualize-lists` — Virtualize lists with 50+ items
- `main-thread-budget` — <16ms per frame for 60fps
- `progressive-loading` — Skeleton screens when >1s
- `input-latency` — <100ms for taps/scrolls
- `debounce-throttle` — Debounce/throttle frequent events
- `offline-support` — Offline state + basic fallback

### 4. Style Selection (HIGH)

- `style-match` — Match style to product type
- `consistency` — Same style across all pages
- `no-emoji-icons` — SVG icons (Heroicons, Lucide), not emojis
- `color-palette-from-product` — Palette from the industry/product
- `effects-match-style` — Shadows/blur/radius aligned with style
- `platform-adaptive` — Respect platform idioms (iOS HIG vs Material)
- `state-clarity` — hover/pressed/disabled states visually distinct
- `elevation-consistent` — Consistent elevation/shadow scale
- `dark-mode-pairing` — Design light/dark variants together
- `icon-style-consistent` — Single icon set across the product
- `primary-action` — Only one primary CTA per screen

### 5. Layout and Responsive (HIGH)

- `viewport-meta` — `width=device-width, initial-scale=1` (never disable zoom)
- `mobile-first` — Design mobile-first, scale up to tablet/desktop
- `breakpoint-consistency` — Systematic breakpoints (375/768/1024/1440)
- `readable-font-size` — Min 16px body on mobile
- `line-length-control` — Mobile 35-60 chars/line; desktop 60-75
- `horizontal-scroll` — No horizontal scroll on mobile
- `spacing-scale` — 4pt/8dp incremental spacing system
- `container-width` — Consistent max-w on desktop
- `z-index-management` — Defined z-index scale (0/10/20/40/100/1000)
- `viewport-units` — Prefer `min-h-dvh` over `100vh`
- `visual-hierarchy` — Hierarchy via size, spacing, contrast
- `content-priority` — Core content first on mobile

### 6. Typography and Color (MEDIUM)

- `line-height` — 1.5-1.75 for body text
- `line-length` — 65-75 characters per line
- `font-pairing` — Match heading/body personalities
- `font-scale` — Consistent type scale (12 14 16 18 24 32)
- `contrast-readability` — Dark text on light background
- `weight-hierarchy` — Bold headings (600-700), regular body (400)
- `color-semantic` — Semantic tokens (primary, secondary, error)
- `color-dark-mode` — Desaturated/light variants, don't invert
- `color-accessible-pairs` — 4.5:1 (AA) or 7:1 (AAA)
- `truncation-strategy` — Prefer wrapping over truncation
- `letter-spacing` — Respect default letter-spacing
- `whitespace-balance` — Intentional whitespace for grouping

### 7. Animation (MEDIUM)

- `duration-timing` — 150-300ms micro-interactions; complex <=400ms
- `transform-performance` — Use transform/opacity only
- `loading-states` — Skeleton or progress indicator if >300ms
- `excessive-motion` — Animate 1-2 key elements per view
- `easing` — ease-out for entrance, ease-in for exit
- `motion-meaning` — Every animation has a cause-effect relationship
- `state-transition` — Animate state changes, don't snap
- `continuity` — Transitions with spatial continuity
- `exit-faster-than-enter` — Exit 60-70% of entrance duration
- `stagger-sequence` — Stagger lists 30-50ms per item
- `interruptible` — Animations interruptible by tap/gesture
- `modal-motion` — Modals animate from their trigger source
- `layout-shift-avoid` — Animations must not cause reflow

### 8. Forms and Feedback (MEDIUM)

- `input-labels` — Visible label per input (not placeholder-only)
- `error-placement` — Error below the field
- `submit-feedback` — Loading, success, error
- `required-indicators` — Mark required fields
- `empty-states` — Useful message + action when there is no content
- `toast-dismiss` — Auto-dismiss in 3-5s
- `confirmation-dialogs` — Confirm before destructive actions
- `progressive-disclosure` — Reveal complex options progressively
- `inline-validation` — Validate on blur (not per keystroke)
- `input-type-keyboard` — Semantic types (email, tel, number)
- `autofill-support` — autocomplete / textContentType
- `undo-support` — Allow undo on destructive actions
- `error-clarity` — Cause + how to fix it
- `focus-management` — Auto-focus first invalid field after error
- `aria-live-errors` — aria-live or role="alert" on errors
- `contrast-feedback` — error/success states at 4.5:1

### 9. Navigation (HIGH)

- `bottom-nav-limit` — Max 5 items with labels + icons
- `drawer-usage` — Drawer/sidebar for secondary navigation
- `back-behavior` — Predictable back, preserve scroll/state
- `deep-linking` — All key screens reachable via deep link
- `nav-label-icon` — Icon + text in navigation
- `nav-state-active` — Current location visually highlighted
- `nav-hierarchy` — Separate primary nav (tabs) from secondary (drawer)
- `modal-escape` — Clear close/dismiss in modals
- `breadcrumb-web` — Breadcrumbs for 3+ level hierarchies
- `state-preservation` — Going back restores scroll/state
- `overflow-menu` — Overflow menu when actions overflow
- `adaptive-navigation` — >=1024px sidebar; <=768px bottom/top nav
- `back-stack-integrity` — Never silently reset the stack
- `avoid-mixed-patterns` — Don't mix Tab + Sidebar + Bottom Nav

### 10. Charts and Data (LOW)

- `chart-type` — Match chart type to data type
- `color-guidance` — Accessible palettes; avoid red/green only
- `data-table` — Table alternative for accessibility
- `pattern-texture` — Supplement color with patterns/textures
- `legend-visible` — Legend always visible
- `tooltip-on-interact` — Tooltips on hover (Web) or tap (mobile)
- `responsive-chart` — Charts reflow on small screens
- `empty-data-state` — Meaningful empty state
- `loading-chart` — Skeleton while loading
- `large-dataset` — Aggregate/sample 1000+ points
- `number-formatting` — Locale-aware formatting
- `touch-target-chart` — Interactive elements >=44pt
- `sortable-table` — Tables with sorting + aria-sort
- `error-state-chart` — Error message + retry

---

## Supported Stacks

| Stack | Notes |
|-------|-------|
| React / Next.js | shadcn/ui, Tailwind CSS |
| Vue / Nuxt.js | Nuxt UI |
| Svelte / SvelteKit | |
| Angular | |
| Astro | |
| SwiftUI | Native iOS/macOS |
| React Native / Flutter | Mobile cross-platform |
| HTML + Tailwind | Standalone CSS |
| Laravel | |

---

## Project Integration

This skill is designed to review and improve the UI/UX quality of the TaskForge360 project. Use it when you:

- **Review** existing components (accessibility, visual consistency)
- **Design** new pages or features
- **Audit** the UI before a release
- **Optimize** the user experience in forms, navigation, and feedback
- **Implement** a design system with semantic tokens

For specific details, use `--domain <domain>` with: `style`, `color`, `typography`, `product`, `ux`, `chart`.

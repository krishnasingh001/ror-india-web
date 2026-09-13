# Design System Master File — ROR World Web

> Brand-adapted from ui-ux-pro-max. Ruby accent for ROR identity; Plus Jakarta Sans; marketplace/job-board pattern.

**Project:** ROR World  
**Stack:** React + Vite + Tailwind

## Colors

| Role | Hex | Tailwind |
|------|-----|----------|
| Primary / CTA | `#DC2626` | `brand` |
| Primary hover | `#B91C1C` | `brand-hover` |
| Soft brand | `#FEF2F2` | `brand-soft` |
| Background | `#F8FAFC` | `surface-page` |
| Surface | `#FFFFFF` | `white` |
| Text | `#0F172A` | `ink` |
| Muted text | `#475569` | `ink-muted` |
| Border | `#E2E8F0` | `slate-200` |
| Success | `#16A34A` | `green-600` |

## Typography

- **UI / headings / body:** Plus Jakarta Sans (300–700)
- Clear hierarchy; no emoji icons — SVG only

## Effects

- Transitions 150–250ms ease-out
- Hover: color/border/shadow only (no layout-shifting scale)
- `cursor-pointer` on interactive elements
- Respect `prefers-reduced-motion`
- Skeleton loaders for async states

## Patterns

- Marketplace: hero search → filters → listings grid
- Auth: focused form card, labeled inputs, clear errors
- Dashboard: summary stats + recent lists

## Anti-patterns

- Hidden filters
- Placeholder-only labels
- Overlapping badges / absolute meta on cards

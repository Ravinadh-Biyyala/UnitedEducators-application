# Dashboard — Phase 1: App Shell

## 1. Goal

Implement the persistent application shell (sidebar + topbar + content wrapper) that wraps all authenticated routes. After this phase, navigating to `/dashboard` shows the correct layout chrome with the real UE logo, styled nav, live user data from Redux, and the correct page background.

## 2. Figma source

- **File URL:** `https://www.figma.com/design/79XQ7SEn2lCXo84Dy5ngVm/Underwriting-Workbench?node-id=320-49329`
- **Frame name:** `Body`
- **Node ID:** `320-49329`
- **Dimensions:** 1534 × 2250 px

## 3. Scope — files created or modified

| Path | Purpose | Status |
|---|---|---|
| `src/theme/tokens.ts` | Add `neutral` scale, fix `brand.accent` to `#C9A227`, update `surface.*` | modified |
| `tailwind.config.ts` | Mirror new tokens | modified |
| `src/components/layout/AppShell.tsx` | Update main area bg + padding to match Figma | modified |
| `src/components/layout/Sidebar/Sidebar.tsx` | Full redesign: logo, styled nav items with icons, AI assistant panel | modified |
| `src/components/layout/TopBar/TopBar.tsx` | Full redesign: search, notification bell, live user from Redux | modified |
| `src/hooks/auth/useAuthUser.ts` | Typed selector hook for auth user | created |
| `src/hooks/auth/index.ts` | Barrel export | created |

## 4. Layout dimensions (from Figma)

| Element | Value |
|---|---|
| Sidebar nav width | 220 px |
| AI panel width | 44 px |
| Logo area height | 76.8 px |
| Nav item height | 44 px |
| Nav item left padding | 18 px |
| Active accent bar width | 2.4 px |
| TopBar height | 64 px |
| Main content padding | top 28 px · left/right 32 px · bottom 0 |

## 5. Key design tokens (fill → token → Tailwind class)

| Figma fill | Hex | Token | Tailwind class |
|---|---|---|---|
| fill_0AVDLG | `#0123D4` | `brand.vivid` | `bg-brand-vivid` |
| fill_LYIISI | `#C9A227` | `brand.accent` | `bg-brand-accent` |
| fill_HZ01TL | `#EEF1F6` | `neutral.100` | `bg-neutral-100` |
| fill_NSGJ90 | `#FFFFFF` | `surface.card` | `bg-white` |
| fill_X10TJE | `#DCE3EC` | `neutral.200` | `border-neutral-200` |
| fill_MJ50ID | `#C4CDD8` | `surface.border` | `border-surface-border` |
| fill_V8PE7P | `#F4F6FA` | `surface.input` | `bg-surface-input` |
| fill_URG5VV | `#1A2530` | `neutral.900` | `text-neutral-900` |
| fill_6RIG81 | `#4A5D6E` | `neutral.700` | `text-neutral-700` |
| fill_L53JAX | `#7A8FA3` | `neutral.500` | `text-neutral-500` |
| fill_LGIXK7 | `#1A7A4A` | `semantic.avatarGreen` | `bg-semantic-avatarGreen` |
| fill_3MM9WH | `#B91C1C` | `semantic.notificationRed` | `bg-semantic-notificationRed` |

## 6. Reuse — components that must NOT be re-created

| Component | Source path |
|---|---|
| `useAppSelector` | `@/app/hooks` (via `useAuthUser`) |
| `NavLink` | `react-router-dom` |
| `Outlet` | `react-router-dom` |
| `User` type | `@/shared/types` |
| UE logo image | `@/assets/logos/ue-logo.png` |

## 7. Acceptance criteria

**Layout**
- [ ] Sidebar is 220 px wide with a 44 px AI panel strip to its right; total left chrome = 264 px
- [ ] TopBar is 64 px tall, white, with a 0.8 px bottom divider (`#DCE3EC`)
- [ ] Main content area background is `#EEF1F6` with padding 28 px top, 32 px left/right
- [ ] No horizontal scrollbar at 1440 px viewport width

**Sidebar**
- [ ] Logo area: 76.8 px tall, UE logo 123×30 px, bottom divider
- [ ] Active nav item: `#0123D4` background, 2.4 px gold left accent, white bold label + full-opacity icon
- [ ] Inactive nav item: transparent background, `#4A5D6E` label at 100% opacity, icon at 65% opacity
- [ ] Hover state on inactive items: `#F4F6FA` background
- [ ] All 6 nav items present in order: Dashboard, Submissions, Task Queue, Inbox, Portfolio, Appetite Rules
- [ ] AI Assistant panel: 44 px wide, centered `#0123D4` sparkle icon, vertical "AI ASSISTANT" label, gold "NEW" badge

**TopBar**
- [ ] Search input: 448 px wide, `#F4F6FA` background, `#C4CDD8` border, magnifying glass icon at left, placeholder text
- [ ] Notification bell: 38.6×38.6 px bordered button, red badge with count "2"
- [ ] User avatar: 32×32 px circle, `#1A7A4A` background, initials derived from `auth.user.name`
- [ ] User name: bold, `#1A2530`, sourced from Redux `auth.user.name`
- [ ] User role: semibold, `#1A7A4A`, sourced from Redux `auth.user.role`
- [ ] Chevron icon at right of user profile

**Code quality**
- [ ] All colors use Tailwind tokens — no hex codes in component files
- [ ] All imports use `@/` aliases
- [ ] `useAuthUser` is the only Redux access point; presentational sub-elements receive plain props
- [ ] `npm run type-check` passes

## 8. Out of scope

- Notification count wired to a real service (hardcoded "2" for phase 1)
- User profile dropdown menu
- Sidebar collapse / mobile drawer
- AI Assistant panel functionality (visual only)
- `<RequireAuth>` route guard (phase 2)
- Routes beyond `/dashboard`

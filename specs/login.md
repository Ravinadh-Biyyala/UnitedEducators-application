# Login Page

## 1. Goal

Authenticated users sign in to the Underwriter Workbench with email and password.
On success, they navigate to `/dashboard`. The screen also communicates the product's value proposition (left branding panel) before sign-in, building trust on first visit.

## 2. Figma source

- **File URL:** `https://www.figma.com/design/79XQ7SEn2lCXo84Dy5ngVm/Underwriting-Workbench?node-id=320-47570&t=PdfK826GytyVN59M-4`
- **Frame name:** `Login / Desktop`
- **Node ID:** `320-47570`
- **Selection method:** [x] use the URL above (preferred — reproducible) &nbsp; [ ] currently selected in Figma desktop

> Tip: in Figma, right-click the frame → **Copy link to selection**. Paste here. The MCP will extract the node-id automatically.

## 3. Scope — files to create or modify

| Path | Purpose | Status |
|---|---|---|
| `src/features/login/pages/LoginPage.tsx` | Two-column layout composing BrandPanel + LoginFormContainer | modify |
| `src/containers/login/LoginFormContainer.tsx` | Form state, validation, submit, dispatch, navigation | modify |
| `src/components/domain/BrandPanel/BrandPanel.tsx` | Left dark-blue panel: logo, headline, feature list, footer | create |
| `src/components/domain/BrandPanel/index.ts` | Barrel | create |
| `src/components/domain/index.ts` | Add `BrandPanel` export | modify |
| `src/components/common/PasswordInput/PasswordInput.tsx` | Input with show/hide eye icon toggle | create |
| `src/components/common/PasswordInput/index.ts` | Barrel | create |
| `src/components/common/index.ts` | Add `PasswordInput` export | modify |
| `src/theme/tokens.ts` | Add brand-blue / brand-gold tokens if missing | modify (only if needed) |
| `tailwind.config.ts` | Mirror new tokens if added | modify (only if needed) |

> If the AI needs assets (logo SVG, hero photo), download them via `download_figma_images` to `src/assets/images/`.

## 4. Data + behavior

- **API call:** stubbed for now via `setTimeout` (300ms) inside the container. Real `useLoginMutation` from `services/auth/authApi.ts` is out of scope for this pass.
- **Redux dispatch:** on stubbed success, dispatch `setCredentials({ user, token })` from `@/store/slices/authSlice` with mock user `{ id: 'u1', name: 'John Michaels', email, role: 'Sr. Underwriter' }` and `token: 'dev-token'`.
- **Validation:**
  - Email — required, must match basic email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
  - Password — required, minimum 8 characters
  - Validation errors render below each field via `FormField`'s `error` prop
  - Form submission disabled if either field is empty
- **Side effect on success:** `navigate('/dashboard')` via `useNavigate` from `react-router-dom`
- **Loading state:** Sign In button shows "Signing in…" and is disabled while submitting
- **Error state:** if stubbed login were to fail (skip for now), a single error line appears above the button — leave hook in place but don't trigger
- **"Forgot password?" link:** anchor to `/forgot-password` (route not implemented — leave the link as-is, no error if clicked)

## 5. Reuse — components that must NOT be re-created

| Component | Source path |
|---|---|
| `Button` | `@/components/common` |
| `Input` | `@/components/common` |
| `FormField` | `@/components/common` |
| `setCredentials` action | `@/store/slices/authSlice` |
| `useAppDispatch` | `@/app/hooks` |
| `useNavigate` | `react-router-dom` |
| Tokens (`colors`, etc.) | `@/theme` |

`PasswordInput` is being NEWLY created in this spec because no project component currently has show/hide toggle. Build it as a wrapper around the existing `Input` primitive — do not duplicate input styling.

## 6. Acceptance criteria

**Layout**
- [ ] Two-column 50/50 layout on viewports ≥1024px
- [ ] Stacks vertically on viewports <1024px (branding panel above form)
- [ ] Page fills the viewport height (no scroll on desktop at 1280×800)

**Left panel (BrandPanel)**
- [ ] Solid dark-blue background using brand color token
- [ ] UE logo at top-left (downloaded from Figma)
- [ ] Headline "Education Insurance Underwriting Made Smarter." with "Underwriting" rendered in brand-gold/accent token, other text whitezp
- [ ] Sub-paragraph in lighter blue/grey
- [ ] Three feature bullets with check-circle icons:
  - "9 UE product lines in a single workflow"
  - "Role-based access for UW teams"
  - "Real-time appetite scoring & alerts"
- [ ] Footer text: "© 2024 United Educators. All rights reserved." + "For authorized personnel only. Unauthorized access is prohibited." in muted color, fixed to bottom of panel

**Right panel (form area)**
- [ ] Hero photo as background (downloaded from Figma if available; otherwise leave a neutral background and note it in the summary)
- [ ] White sign-in card overlaid on the photo, centered vertically, right-aligned
- [ ] Card has subtle shadow and rounded corners per token radii
- [ ] Heading "Sign in to your account" — semibold, large
- [ ] Sub-text "Select your role below to load demo credentials, or enter your own."
- [ ] Email field: label "EMAIL ADDRESS" (uppercase, small), placeholder `you@ue.org`
- [ ] Password field: label "PASSWORD" (uppercase, small) on left + "Forgot password?" link on right, placeholder dots, eye toggle on the right
- [ ] Sign In button: full width, brand-blue background, white text, lock icon on left, arrow on right, semibold

**Code quality**
- [ ] All colors/spacing/radii from `src/theme/tokens.ts` — no hex codes in component files
- [ ] All imports use `@/` aliases — no `../../../`
- [ ] All new public exports added to relevant `index.ts` barrels
- [ ] `npm run lint` passes (boundary rules respected — `BrandPanel` in domain/ does NOT import Redux or services)
- [ ] `npm run type-check` passes

**Behavior**
- [ ] Submitting a valid email + password (≥8 chars) dispatches `setCredentials` and navigates to `/dashboard`
- [ ] Invalid email shows inline error, no submission
- [ ] Password under 8 chars shows inline error, no submission
- [ ] Eye icon toggles password visibility (type=text ↔ type=password)
- [ ] Page renders without console errors

## 7. Out of scope

- Real authentication API call (use stub — mark `TODO` for `useLoginMutation` swap)
- `/forgot-password` page implementation (leave link only)
- "Select your role" demo-credential picker mentioned in the sub-text (the design hints at it but doesn't show controls — leave as just the descriptive sub-text for now)
- Unit tests
- i18n / translation
- Animations beyond default Tailwind transitions
- Mobile breakpoints below 768px (tablet+ only for this pass)
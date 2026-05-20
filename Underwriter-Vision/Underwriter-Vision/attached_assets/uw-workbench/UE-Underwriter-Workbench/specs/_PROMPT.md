# PROMPT — Execute a Spec

> Use this prompt every time you ask Cursor to implement a spec.
> Replace `<FILENAME>` with the spec file (e.g., `login.md`).

---

Read `specs/login.md` and implement it.

## Hard rules

1. **Architecture comes first.** Follow `.cursorrules` strictly — the layer boundary table and "Where does X go?" decision rule are non-negotiable.

2. **Read the design before coding.** Use `get_figma_data` on the Figma source in §2 of the spec. If the spec says "currently selected," use the active selection. Use `download_figma_images` for any icons, logos, or images you'll embed.

3. **Stick to the file list.** Place every file exactly per the table in §3 of the spec. Do NOT create files outside that list. If you need an additional file, stop and ask.

4. **Reuse, don't recreate.** The components in §5 already exist. Import them — do not duplicate them under different names. If something needed is missing from the project, add it to `components/common/` or `components/domain/` per the decision rule, NOT inline.

5. **Tokens only.** Map all Figma variables (colors, spacing, typography, radii) to `src/theme/tokens.ts`. No hex codes, no hardcoded `px` values, no inline `style={}` unless the value is dynamic.

6. **Tailwind only for styling.** Use Tailwind utility classes. The Tailwind config reads from theme tokens — keep it in sync if you add tokens.

7. **`@/` aliases only.** No `../../../` relative imports anywhere.

8. **Barrel exports.** Every new public component/hook/page must be exported from the relevant `index.ts`.

9. **Self-check before stopping.** Walk through §6 acceptance criteria mentally. If any item isn't satisfied, fix it before ending the response. Run lint mentally — if you'd violate a boundary rule, refactor.

10. **End with a summary.** Your final message must include:
    - List of files created and modified (paths only)
    - Acceptance criteria you couldn't verify (and why)
    - Any decisions you made that the spec didn't specify
    - Any place you deviated from §5 reuse rules and why

## Anti-patterns to refuse

- ❌ `fetch(` or `axios.` directly in a container — extract to `services/`
- ❌ `useGetXQuery` or `useAppSelector` in a presentational component
- ❌ Cross-feature imports (`@/features/A` → `@/features/B`)
- ❌ Re-implementing `Button`, `Input`, `Card` etc. when they exist in `common/`
- ❌ Storing server data in Redux slices (use RTK Query)
- ❌ Inline color hex codes or pixel values

## When in doubt

If the spec is ambiguous on a behavior, state your assumption explicitly in the final summary instead of guessing silently. If the spec contradicts `.cursorrules`, **`.cursorrules` wins** — flag the contradiction in your summary so we can update the spec.
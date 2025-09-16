# Repository Guidelines

## Project Structure & Module Organization
- `src/` — React + TypeScript app: `components/` (PascalCase `*.tsx`), `utils/` (helpers), `hooks/`, `constants/`, `types/`, `assets/`.
- `index.html`, `vite.config.ts`, `postcss.config.js`, `tailwind.config.js` — Vite/Tailwind setup.
- `public/` — static assets served as‑is.
- `src-tauri/` — Tauri (Rust) backend: commands in `src/main.rs`, config in `tauri.conf.json`, crate manifest `Cargo.toml`.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server for the web UI.
- `npm run tauri dev` — run the desktop app (Vite + Tauri backend).
- `npm run build` — type‑check and build production assets.
- `npm run preview` — preview the built web bundle locally.
- `npm run tauri build` — create desktop binaries via Tauri/Cargo.
Prereqs: Node 18+, Rust stable, and Tauri system deps installed.

## Coding Style & Naming Conventions
- TypeScript is strict (see `tsconfig.json`). Use explicit types for props and return values.
- Indentation: 2 spaces; keep lines focused and readable.
- Components: PascalCase files and exports (e.g., `ImagePreview.tsx`, `export function ImagePreview()` or named `export const …`).
- Functions/variables: `camelCase`; constants: `SCREAMING_SNAKE_CASE` (e.g., `DPI`).
- Prefer named exports; avoid default exports for components.
- Styling: Tailwind utility classes primarily; keep global CSS in `src/index.css` and `src/App.css` minimal.

## Testing Guidelines
- No test suite yet. If adding tests, use Vitest + React Testing Library.
- Location: co‑locate (`MyComp.test.tsx`) or under `src/__tests__/`.
- Cover utilities in `src/utils/` and critical component behavior; mock Tauri APIs.
- Aim for fast, isolated unit tests; add a `test` npm script when introducing Vitest.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Keep messages imperative and scoped (e.g., `feat(upload): drag‑drop support`).
- PRs must include: clear summary, linked issues, before/after UI screenshots (when relevant), and steps to verify (`npm run tauri dev`, flows touched).

## Security & Configuration Tips
- File I/O runs in Tauri via `save_image`/`save_multiple_images`; do not broaden capabilities in `tauri.conf.json` without discussion.
- Never embed secrets; avoid unnecessary permissions/plugins; validate user‑provided filenames.

## Agent-Specific Instructions
- After completing and validating changes, always create a commit:
  - Stage: `git add -A`
  - Commit (single change): `git commit -m "fix(image-utils): handle zero-dimension resize"`
  - Commit (multi-part):
    - `git commit -m "feat(watermark): add repeat pattern" -m "Adds tiled watermark with rotation; updates settings UI; docs updated."`
- Write clear, imperative messages that describe what changed and why; include scope (e.g., `upload`, `watermark`, `build`) and mention impacted files or user-facing effects when relevant.
- Reference issue IDs in the body when applicable (e.g., `Refs #123`).

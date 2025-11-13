# Repository Guidelines

## Project Structure & Module Organization
- `src/` hosts the renderer TypeScript app. `src/main.tsx` wires routing, `src/app/` holds the Redux store and services, `src/components/` keeps reusable UI (filenames stay kebab-case), and `src/samples/` stores mock payloads for manual QA.
- `electron/main/` defines the main-process lifecycle; `electron/preload/` exposes guarded bridges to the renderer. Prefer keeping native integrations here.
- `public/` serves static assets through Vite, while `src/assets/` and `build/` contain iconography and macOS entitlements for packaging.
- `patches/` keeps `patch-package` overrides applied during install; update or remove these when dependencies change.

## Build, Test, and Development Commands
```bash
npm install               # Pull dependencies and apply patch-package overrides
npm run dev               # Launch Vite dev server plus Electron shell with hot reload
npm run build             # Type-check and emit renderer production bundles
npm run build:local       # Build renderer, then create unsigned desktop artifacts
npm run release           # Produce platform installers via electron-builder
```
- For platform-specific targets, use `npm run build:mac|win|linux`. The toolchain expects Node 20+.

## Coding Style & Naming Conventions
- Write TypeScript functional components and Redux Toolkit slices (`src/app/slices/`). Export component symbols in `PascalCase` even if the file name is kebab-case.
- TailwindCSS drives styling; group utility classes by layout → color → state to keep diffs readable.
- Prettier (with import-sorting and Tailwind plugins) is canonical: run `npx prettier --check .` before committing.
- Enforce ESLint via `npx eslint "src/**/*.{ts,tsx}"` and treat warnings as blockers. Avoid exposing new IPC channels from preload without validation.

## Testing Guidelines
- An automated suite is not yet configured. Add new tests with Vitest + React Testing Library (`*.test.tsx` beside source) and document manual QA paths in the PR until the suite is established.
- At minimum, smoke-test the renderer with `npm run dev` and validate packaged output via `npm run build:local` on your target OS before requesting review.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) using concise, imperative summaries; keep body lines ≤72 characters when extra context is needed.
- Reference related issues in the PR description, attach before/after screenshots for UI changes, and list manual verification steps (e.g., workspace switch, auth flow).
- Regenerate dependency patches (`npx patch-package`) after modifying `node_modules` and confirm lint/build status before assigning reviewers.

## Release & Configuration Tips
- Electron signing is gated by `CSC_IDENTITY_AUTO_DISCOVERY`; export it as `false` when generating local artifacts, and re-enable for notarized releases.
- Never commit secrets. Store environment-specific keys in `.env.local` and mention required variables in PR notes so reviewers can reproduce the setup.

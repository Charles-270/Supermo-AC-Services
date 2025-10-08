# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript app. Key folders: `components/`, `pages/`, `services/`, `hooks/`, `lib/`, `utils/`, `assets/`.
- `public/` serves static assets untouched by Vite.
- `functions/` hosts Firebase Cloud Functions (`index.js`) with its own `package.json`; run backend scripts there.
- Build artifacts land in `dist/`. Tooling lives at the root (`vite.config.ts`, `tailwind.config.js`, `eslint.config.js`, `tsconfig*.json`).

## Build, Test, and Development Commands
- `npm install` restores dependencies (prefer npm; lockfiles are committed).
- `npm run dev` launches the Vite dev server with HMR on port 5173.
- `npm run build` runs TypeScript project references and emits the production bundle in `dist/`.
- `npm run preview` serves the built app for acceptance checks.
- `npm run lint` applies the shared ESLint config; use before every commit.
- `cd functions && npm run serve` runs the Firebase emulator; `npm run deploy` ships functions (confirm the active `firebase` project).

## Coding Style & Naming Conventions
- Stick to TypeScript ES modules, functional React components, and two-space indentation.
- Components use PascalCase (`AdminDashboard.tsx`), hooks camelCase prefixed with `use`, utilities kebab-case.
- Pair Tailwind classes with JSX; compose via `clsx`/`tailwind-merge`; reserve CSS files for global overrides only.
- Share contracts through `src/types/`; avoid inline `any` and document non-obvious side effects.

## Testing Guidelines
- Ship automated coverage with each feature: front-end tests as `*.test.tsx` beside the module; Firebase logic with `firebase-functions-test` under `functions/__tests__/`.
- Keep tests deterministic: stub network calls and store fixtures near the subject under test.
- Every PR must pass `npm run build` and `npm run lint`; target >=70% coverage on critical flows and call out gaps in the PR body.

## Commit & Pull Request Guidelines
- Follow Conventional Commit prefixes (`feat:`, `fix:`, `chore:`); keep subjects imperative, scoped when helpful (`feat(admin): ...`), and <=72 chars.
- Collapse related work into single commits and rebase rather than merge when syncing branches.
- PRs need a short summary, linked issue or spec, and UI screenshots or Looms. Include manual test notes and emulator output for backend-affecting changes.

## Environment & Secrets
- Copy `.env.example` to `.env.local`; never commit `.env`.
- Firebase configuration lives in `firebase.json`, `firestore.rules`, and `storage.rules`; coordinate changes to security rules before merging.

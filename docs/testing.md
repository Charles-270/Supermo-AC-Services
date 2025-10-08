# Testing Guide

This project now ships with [Vitest](https://vitest.dev) and React Testing Library. Use the commands and guidelines below to develop and run automated tests.

## Commands

- `npm run test` &mdash; runs the full Vitest suite once (CI-friendly).
- `npm run test -- --watch` &mdash; start Vitest in watch mode for local development.

Vitest is configured in `vite.config.ts` to use the `jsdom` environment, load CSS, and execute the shared setup file `vitest.setup.ts` (which registers `@testing-library/jest-dom` matchers).

## Writing Tests

- Place unit tests alongside source under `src/` using the naming convention `*.test.ts` / `*.test.tsx`.
- Prefer testing public APIs (hooks, services, utilities, and UI behaviour) rather than implementation details.
- Use the exported `toast` helper for notification-related assertions by spying on it where needed.
- Mock Firebase or network calls at the module boundary instead of reaching external services.

### Existing Coverage

- `src/lib/utils.test.ts` checks formatting helpers (currency, truncation).
- `src/services/technicianService.test.ts` verifies the technician assignment scoring logic.

### Next Coverage Targets

1. **Checkout Flow:** mock Paystack and Firestore to ensure order creation and error handling behave correctly.
2. **Admin Workflows:** add tests for `ManageOrders` bulk updates (toast feedback) using React Testing Library.
3. **Toast Utilities:** add integration tests that assert the presence of success/error toasts for key actions.
4. **Realtime Hooks:** cover `useRealtimeBookings` with Firestore emulator mocks to prevent regressions.

## Troubleshooting

- If Firebase logs appear during tests, mock `@/lib/firebase` for the specific suite to silence side effects.
- Ensure pop-up blocking logic (invoice printing) is mocked when testing utilities that open windows.

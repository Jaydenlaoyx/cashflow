# CashFlow Launch Checklist

## Automated checks

- [✅] `npm run test:run` passes
- [✅] `npm run lint` passes
- [✅] `npm run build` passes
- [✅] GitHub Actions CI passes
- [✅] Vercel production deployment succeeds

## Authentication

- [✅] Registration works
- [✅] Confirmation email opens the production callback
- [✅] Login works
- [✅] Logout works
- [✅] Protected routes redirect unauthenticated users
- [✅] A second user cannot access the first user’s data

## Transactions

- [✅] Income can be created
- [✅] Expenses can be created
- [✅] Transactions can be edited
- [✅] Transactions can be deleted
- [✅] Search works
- [✅] Filters work
- [✅] Pagination works
- [✅] CSV export works
- [✅] CSV preview validates incorrect rows
- [✅] CSV import works
- [✅] Duplicate CSV import is rejected

## Financial planning

- [✅] Current balance is accurate
- [✅] Monthly totals are accurate
- [✅] Yearly totals are accurate
- [✅] Budget progress is accurate
- [✅] Savings-goal progress is accurate
- [✅] Contributions update goal progress
- [✅] Recurring transactions process correctly
- [✅] Recurring occurrences are not duplicated

## Responsive design

- [✅] 375px mobile layout works
- [✅] 768px tablet layout works
- [✅] 1440px desktop layout works
- [✅] No unwanted horizontal scrolling
- [✅] Mobile navigation remains accessible
- [✅] Tables remain usable on small screens
- [✅] Charts resize without overflowing

## Accessibility

- [✅] Every page has one clear `h1`
- [✅] All inputs have visible labels
- [✅] Icon-only buttons have accessible names
- [✅] Keyboard focus is clearly visible
- [✅] All features can be used with a keyboard
- [✅] Error messages are understandable
- [✅] Status messages use `aria-live` or `role="status"`
- [✅] Text has sufficient contrast
- [✅] Light mode is readable
- [✅] Dark mode is readable
- [✅] Charts have nearby text summaries

## PWA

- [✅] Manifest loads without errors
- [✅] 192px icon loads
- [✅] 512px icon loads
- [✅] Apple touch icon loads
- [✅] Service worker activates
- [✅] App can be installed
- [✅] Installed app opens in standalone mode
- [✅] Offline fallback appears
- [✅] Offline cache contains no financial data

## Production safety

- [✅] `.env.local` is ignored by Git
- [✅] No service-role key is committed
- [✅] RLS is enabled on all user-owned tables
- [✅] Internal functions cannot be called through RPC
- [✅] Production logs contain no financial data
- [✅] Error pages do not expose internal error messages
- [✅] Test accounts contain no genuine personal data

## Documentation

- [✅] README live link works
- [✅] README screenshots render
- [✅] CI badge is green
- [✅] Setup instructions are accurate
- [✅] Environment variables are documented
- [✅] Future bank integration is clearly marked as unimplemented
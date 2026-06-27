/**
 * Clerk configuration helper.
 *
 * To enable Clerk:
 *   1. Open .env.local
 *   2. Set VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
 *   3. Restart the dev server
 *
 * When the key is absent the app falls back to demo-mode auth.
 */

export const CLERK_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

/** True when a valid Clerk publishable key is present */
export const isClerkConfigured = Boolean(
  CLERK_PUBLISHABLE_KEY &&
  CLERK_PUBLISHABLE_KEY.startsWith('pk_'),
);

/** Clerk <SignIn> / <SignUp> appearance — matches MaaRaksha pink theme */
export const clerkAppearance = {
  variables: {
    colorPrimary: '#ec4899',
    colorBackground: '#ffffff',
    colorText: '#111827',
    colorInputBackground: '#f9fafb',
    borderRadius: '0.75rem',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    card: 'shadow-none border-0 p-0',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    socialButtonsBlockButton:
      'border border-gray-200 rounded-2xl hover:border-primary-300 hover:bg-primary-50 transition-all',
    formButtonPrimary:
      'bg-primary-500 hover:bg-primary-600 rounded-2xl text-sm font-semibold',
    footerActionLink: 'text-primary-600 hover:text-primary-700',
    formFieldInput:
      'rounded-xl border-gray-200 focus:border-primary-400 focus:ring-primary-200',
  },
} as const;

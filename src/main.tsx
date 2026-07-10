import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { CLERK_PUBLISHABLE_KEY, isClerkConfigured } from '@/lib/clerk';
import '@/lib/i18n';
import '@/index.css';
import App from './App';

// Clear stale service workers that cause 'Failed to convert value to Response' crashes
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
}

// Wake up Render backend (free tier sleeps after inactivity — takes up to 50s to wake)
// We ping immediately on app load so it's warm before user needs it
const API_BASE = (import.meta.env.VITE_API_URL || 'https://maarakshak.onrender.com/api').replace(/\/$/, '');

async function wakeBackend() {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(20000) });
      if (r.ok) { console.log('[MaaRaksha] Backend ready'); return; }
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 5000));
  }
}
wakeBackend();

const tree = (
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

createRoot(document.getElementById('root')!).render(
  isClerkConfigured
    ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} afterSignOutUrl="/">
        {tree}
      </ClerkProvider>
    )
    : tree,
);

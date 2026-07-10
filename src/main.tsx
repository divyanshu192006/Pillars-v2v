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

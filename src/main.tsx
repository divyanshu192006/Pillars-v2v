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

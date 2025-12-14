import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { AppShell } from '@/shell';

/**
 * App - Root component with authentication boundary
 * 
 * Auth gating happens here and ONLY here.
 * - SignedIn: User is authenticated → show the real app
 * - SignedOut: User is not authenticated → redirect to Clerk sign-in
 * 
 * No auth logic leaks into domains or components.
 */
function App() {
  return (
    <>
      <SignedIn>
        <AppShell />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default App;

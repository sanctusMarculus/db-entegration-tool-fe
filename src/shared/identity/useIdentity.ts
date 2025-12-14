/**
 * Identity utilities for accessing Clerk user data
 * 
 * This module provides type-safe access to the current user's identity.
 * Use these utilities when you need to:
 * - Display user information in the UI
 * - Associate data with the current user
 * - Send user identification to the backend
 * 
 * IMPORTANT: These are identity utilities, not auth logic.
 * Auth gating happens in App.tsx via SignedIn/SignedOut.
 */

import { useUser, useAuth } from '@clerk/clerk-react';

/**
 * Hook to get the current user's identity information
 * 
 * @returns User identity data (read-only)
 * 
 * @example
 * ```tsx
 * const { clerkUserId, email, fullName, imageUrl, isLoaded } = useIdentity();
 * 
 * if (!isLoaded) return <Skeleton />;
 * 
 * return <span>Welcome, {fullName}</span>;
 * ```
 */
export function useIdentity() {
  const { user, isLoaded } = useUser();
  
  return {
    /** Clerk's unique user ID - use this to identify the user in your backend */
    clerkUserId: user?.id ?? null,
    
    /** User's primary email address */
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    
    /** User's full name (first + last) */
    fullName: user?.fullName ?? null,
    
    /** User's first name */
    firstName: user?.firstName ?? null,
    
    /** User's last name */
    lastName: user?.lastName ?? null,
    
    /** URL to user's profile image */
    imageUrl: user?.imageUrl ?? null,
    
    /** Whether the user data has finished loading */
    isLoaded,
    
    /** The raw Clerk user object (for advanced use cases) */
    user,
  };
}

/**
 * Hook to get an authentication token for API requests
 * 
 * Use this when making authenticated requests to your backend.
 * The backend should verify this JWT and extract the user ID.
 * 
 * @returns Token getter function
 * 
 * @example
 * ```tsx
 * const { getToken } = useAuthToken();
 * 
 * async function fetchData() {
 *   const token = await getToken();
 *   const response = await fetch('/api/data', {
 *     headers: {
 *       Authorization: `Bearer ${token}`,
 *     },
 *   });
 * }
 * ```
 */
export function useAuthToken() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  
  return {
    /**
     * Get a fresh JWT token for API requests
     * Returns null if not signed in
     */
    getToken: async () => {
      if (!isSignedIn) return null;
      return getToken();
    },
    
    /** Whether the auth state has finished loading */
    isLoaded,
    
    /** Whether the user is currently signed in */
    isSignedIn: isSignedIn ?? false,
  };
}

/**
 * Type definition for identity data
 */
export interface Identity {
  clerkUserId: string | null;
  email: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isLoaded: boolean;
}

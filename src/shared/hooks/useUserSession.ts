import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Storage keys used by Zustand persist middleware
const STORAGE_KEYS = {
  workspace: 'workspace-store',
  model: 'model-store',
  activity: 'activity-store',
  currentUser: 'current-user-id',
};

/**
 * Clears all user-specific data from localStorage
 * Call this when user logs out or switches accounts
 */
export function clearUserData(): void {
  // Clear Zustand persisted stores
  localStorage.removeItem(STORAGE_KEYS.workspace);
  localStorage.removeItem(STORAGE_KEYS.model);
  localStorage.removeItem(STORAGE_KEYS.activity);
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  
  console.log('[UserSession] Cleared all user data from localStorage');
}

/**
 * Gets the stored user ID from localStorage
 */
export function getStoredUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.currentUser);
}

/**
 * Sets the current user ID in localStorage
 */
export function setStoredUserId(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.currentUser, userId);
}

/**
 * Hook that manages user session data
 * 
 * Automatically clears localStorage when:
 * 1. User logs out (userId becomes null)
 * 2. User switches accounts (userId changes)
 * 
 * This ensures user1's data doesn't leak to user2
 */
export function useUserSession(): { isReady: boolean } {
  const { userId, isLoaded } = useAuth();
  const previousUserIdRef = useRef<string | null | undefined>(undefined);
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    // Wait for auth to load
    if (!isLoaded) return;
    
    const storedUserId = getStoredUserId();
    const currentUserId = userId;
    
    // First load - check if stored user matches current user
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      if (currentUserId) {
        // User is logged in
        if (storedUserId && storedUserId !== currentUserId) {
          // Different user! Clear previous user's data
          console.log('[UserSession] User changed from', storedUserId, 'to', currentUserId);
          clearUserData();
        }
        // Store current user ID
        setStoredUserId(currentUserId);
      } else {
        // User is logged out - clear any stored data
        if (storedUserId) {
          console.log('[UserSession] User logged out, clearing data');
          clearUserData();
        }
      }
      
      previousUserIdRef.current = currentUserId;
      return;
    }
    
    // Subsequent changes - detect logout or user switch
    if (previousUserIdRef.current !== currentUserId) {
      if (!currentUserId) {
        // User logged out
        console.log('[UserSession] User logged out, clearing data');
        clearUserData();
      } else if (previousUserIdRef.current && previousUserIdRef.current !== currentUserId) {
        // User switched accounts
        console.log('[UserSession] User switched accounts, clearing data');
        clearUserData();
        setStoredUserId(currentUserId);
      } else if (!previousUserIdRef.current && currentUserId) {
        // User just logged in
        const stored = getStoredUserId();
        if (stored && stored !== currentUserId) {
          // Different user than what was stored
          clearUserData();
        }
        setStoredUserId(currentUserId);
      }
      
      previousUserIdRef.current = currentUserId;
    }
  }, [userId, isLoaded]);
  
  return {
    isReady: isLoaded,
  };
}

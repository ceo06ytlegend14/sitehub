import { PropsWithChildren, createContext, useEffect, useRef, useState } from 'react';
import {
  getAuthErrorMessage,
  getUserProfile,
  observeAuthState,
  signIn as signInWithEmail,
  signOutCurrentUser,
  signUp as signUpWithEmail,
} from '@/src/services/authService';
import { AuthContextValue, LoginInput, RegisterInput } from '@/src/types/auth';
import { AppUser } from '@/src/types/models';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only use this for guest mode, not real Firebase users
  const managedUser = useRef<AppUser | null>(null);
  const isSigningOut = useRef(false);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (firebaseUser) => {
      if (isSigningOut.current) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Important: only restore managed user if it is guest
      if (managedUser.current?.isGuest) {
        setUser(managedUser.current);
        setIsLoading(false);
        return;
      }

      if (!firebaseUser) {
        managedUser.current = null;
        setUser(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(firebaseUser.uid);

        if (profile?.isActive === false) {
          await signOutCurrentUser();
          managedUser.current = null;
          setUser(null);
          setError('This account is inactive. Contact an admin.');
          setIsLoading(false);
          return;
        }

        if (profile) {
          setUser(profile);
          setError(null);
        } else {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
            role: 'sales',
            language: 'en',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setError(null);
        }
      } catch {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
          role: 'sales',
          language: 'en',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setError(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    error,

    async signIn(input: LoginInput) {
      setError(null);
      setIsLoading(true);
      isSigningOut.current = false;
      managedUser.current = null;

      try {
        const profile = await signInWithEmail(input);
        setUser(profile);
        return profile;
      } catch (err) {
        const msg = getAuthErrorMessage(err);
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },

    async signUp(input: RegisterInput) {
      setError(null);
      setIsLoading(true);
      isSigningOut.current = false;
      managedUser.current = null;

      try {
        const profile = await signUpWithEmail(input);
        setUser(profile);
        return profile;
      } catch (err) {
        const msg = getAuthErrorMessage(err);
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },

    async signInAsGuest() {
      const now = new Date().toISOString();

      const guestUser: AppUser = {
        id: 'guest',
        email: '',
        displayName: 'Guest User',
        role: 'guest',
        language: 'en',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        isGuest: true,
      };

      isSigningOut.current = false;
      managedUser.current = guestUser;
      setUser(guestUser);
      setError(null);
      setIsLoading(false);
    },

    async signOutUser() {
      if (__DEV__) {
        console.debug('[auth/provider] signOutUser start', { email: user?.email, role: user?.role });
      }
      isSigningOut.current = true;
      managedUser.current = null;

      setUser(null);
      setError(null);
      setIsLoading(true);

      try {
        await signOutCurrentUser();
        if (__DEV__) {
          console.debug('[auth/provider] Firebase sign-out resolved');
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[auth/provider] Firebase sign-out failed after local clear', err);
        }
        // already cleared locally
      } finally {
        managedUser.current = null;
        setUser(null);
        setError(null);
        setIsLoading(false);
        if (__DEV__) {
          console.debug('[auth/provider] signOutUser finalized');
        }

        setTimeout(() => {
          isSigningOut.current = false;
        }, 300);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };

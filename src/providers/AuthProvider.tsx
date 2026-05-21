import { PropsWithChildren, createContext, useEffect, useMemo, useRef, useState } from 'react';
import {
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
  // When we're in the middle of signIn/signUp we manage the user ourselves,
  // so we skip the observer update to avoid a race condition.
  const skipObserver = useRef(false);

  useEffect(() => {
    const unsubscribe = observeAuthState(async (firebaseUser) => {
      if (skipObserver.current) return;

      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isLoading,
      async signIn(input: LoginInput) {
        skipObserver.current = true;
        setIsLoading(true);
        try {
          const profile = await signInWithEmail(input);
          setUser(profile);
        } finally {
          skipObserver.current = false;
          setIsLoading(false);
        }
      },
      async signUp(input: RegisterInput) {
        skipObserver.current = true;
        setIsLoading(true);
        try {
          const profile = await signUpWithEmail(input);
          setUser(profile);
        } finally {
          skipObserver.current = false;
          setIsLoading(false);
        }
      },
      async signInAsGuest() {
        setIsLoading(true);
        try {
          const guestUser: AppUser = {
            id: 'guest',
            email: '',
            displayName: 'Guest User',
            role: 'guest',
            language: 'en',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isGuest: true,
          };
          setUser(guestUser);
        } finally {
          setIsLoading(false);
        }
      },
      async signOutUser() {
        setIsLoading(true);
        try {
          await signOutCurrentUser();
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      },
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };

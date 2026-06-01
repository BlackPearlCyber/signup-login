import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, firebaseReady } from '../lib/firebase'

type AuthContextValue = {
  user: User | null
  loading: boolean
  firebaseReady: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function createUnavailableError() {
  return new Error(
    'Firebase is not configured. Set the VITE_FIREBASE_* environment variables before signing in.',
  )
}

function normalizeFirebaseError(error: unknown) {
  if (!(error instanceof Error)) {
    return new Error('Firebase request failed. Please try again.')
  }

  const code = (error as Error & { code?: string }).code

  switch (code) {
    case 'auth/configuration-not-found':
      return new Error(
        'Firebase Auth is not configured for this web app. Check that Email/Password sign-in is enabled and the web app config matches this project.',
      )
    case 'auth/invalid-api-key':
      return new Error(
        'Firebase API key is invalid. Verify the values in your .env file.',
      )
    case 'auth/auth-domain-config-required':
      return new Error(
        'Firebase Auth domain is missing. Add the correct VITE_FIREBASE_AUTH_DOMAIN value.',
      )
    case 'auth/operation-not-allowed':
      return new Error(
        'Email/password sign-in is disabled in Firebase. Enable the Email/Password provider in the Firebase console.',
      )
    case 'auth/unauthorized-domain':
      return new Error(
        'This domain is not allowed by Firebase Auth. Add the current host to the authorized domains list.',
      )
    default:
      return error
  }
}

export function getFirebaseSetupHint() {
  return [
    'Enable Email/Password in Firebase Console > Authentication > Sign-in method.',
    'Confirm the web app config in .env matches the same Firebase project.',
    'Make sure localhost is allowed under Authentication > Settings > Authorized domains.',
  ]
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      firebaseReady,
      signIn: async (email, password) => {
        if (!auth) {
          throw createUnavailableError()
        }

        try {
          await signInWithEmailAndPassword(auth, email, password)
        } catch (error) {
          throw normalizeFirebaseError(error)
        }
      },
      signUp: async (fullName, email, password) => {
        if (!auth || !db) {
          throw createUnavailableError()
        }

        try {
          const credential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
          )

          await updateProfile(credential.user, { displayName: fullName })

          await setDoc(
            doc(db, 'users', credential.user.uid),
            {
              uid: credential.user.uid,
              name: fullName,
              email,
              createdAt: serverTimestamp(),
            },
            { merge: true },
          )
        } catch (error) {
          throw normalizeFirebaseError(error)
        }
      },
      signOutUser: async () => {
        if (!auth) {
          throw createUnavailableError()
        }

        try {
          await signOut(auth)
        } catch (error) {
          throw normalizeFirebaseError(error)
        }
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

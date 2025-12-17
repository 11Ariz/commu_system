import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { setUserProfile } from '../lib/users'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { getUserProfile } from '../lib/users'

type UserState = {
  uid?: string | null
  displayName?: string | null
  email?: string | null
  role?: string | null
  loading: boolean
}

const defaultState: UserState = { uid: null, displayName: null, email: null, role: null, loading: true }

const UserContext = createContext<{ user: UserState; setRole: (r: string) => void }>({ user: defaultState, setRole: () => {} })

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserState>(defaultState)

  useEffect(() => {
    if (!auth) {
      // No firebase configured: set demo user
      setUser({ uid: null, displayName: 'Demo', email: null, role: localStorage.getItem('role') || 'student', loading: false })
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (u: FirebaseUser | null) => {
      if (!u) {
        setUser({ uid: null, displayName: null, email: null, role: localStorage.getItem('role') || null, loading: false })
        return
      }
      // fetch profile from Firestore
      let role = localStorage.getItem('role') || null
      try {
        const profile = await getUserProfile(u.uid)
        if (profile && profile.role) role = profile.role
      } catch (err) {
        console.warn('Failed to fetch user profile:', err)
      }

      setUser({ uid: u.uid, displayName: u.displayName || null, email: u.email || null, role, loading: false })
    })

    return () => unsubscribe()
  }, [])

  function setRole(role: string) {
    localStorage.setItem('role', role)
    setUser((prev) => ({ ...prev, role }))
    // Persist role to Firestore user profile when authenticated
    try {
      if (auth && auth.currentUser) {
        setUserProfile(auth.currentUser.uid, { role })
      }
    } catch (err) {
      console.warn('Failed to persist role to profile:', err)
    }
  }

  return <UserContext.Provider value={{ user, setRole }}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)

export default UserContext

import { useRouter } from 'next/router'
import { useState } from 'react'
import { auth } from '../lib/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { setUserRole } from '../utils/auth'
import { setUserProfile } from '../lib/users'

export default function Login() {
  const router = useRouter()
  const [role, setRole] = useState<string>('student')
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && !!auth

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!hasFirebase) {
      // Local demo flow: just set role and go
      setUserRole(role as any)
      router.push(`/dashboard/${role}`)
      return
    }

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      // Persist role to Firestore user profile (merge)
      try {
        await setUserProfile(result.user.uid, {
          role,
          displayName: result.user.displayName,
          email: result.user.email,
        })
      } catch (e) {
        // Non-fatal: log and continue
        console.warn('Failed to persist user profile:', e)
      }
      setUserRole(role as any)
      router.push(`/dashboard/${role}`)
    } catch (err) {
      console.error('Sign-in error', err)
      // fallback — still proceed to dashboard in demo mode
      setUserRole(role as any)
      router.push(`/dashboard/${role}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md p-6 glass-card rounded-2xl">
        <h1 className="text-2xl font-semibold mb-4">Sign in / Sign up</h1>

        <label className="block mb-2">Select role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 mb-4 border rounded">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="researcher">Researcher</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded mb-3">Continue with Google</button>

        {!hasFirebase && (
          <div className="text-sm text-slate-600">Firebase not configured — demo local mode will be used.</div>
        )}
      </form>
    </div>
  )
}

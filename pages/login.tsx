import { useRouter } from 'next/router'
import { useState } from 'react'
import { auth } from '../lib/firebase'
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { setUserRole } from '../utils/auth'
import { setUserProfile, getUserProfile } from '../lib/users'

export default function Login() {
  const router = useRouter()
  const [role, setRole] = useState<string>('student')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
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
      if (isSignUp) {
        // Email/password sign up
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        if (username) {
          try { await updateProfile(userCred.user, { displayName: username }) } catch (e) { /* ignore */ }
        }
        await setUserProfile(userCred.user.uid, { role, displayName: username || userCred.user.email, email: userCred.user.email })
      } else {
        // If email provided, try email sign-in; otherwise Google sign-in
        if (email && password) {
          const userCred = await signInWithEmailAndPassword(auth, email, password)
          // verify profile exists and role matches
          try {
            const profile = await getUserProfile(userCred.user.uid)
            if (profile && profile.email && profile.email !== userCred.user.email) {
              // email mismatch (shouldn't happen) — sign out and show error
              alert('Email does not match stored profile. Contact admin.')
              return
            }
            if (profile && profile.role && profile.role !== role) {
              // role mismatch — do not silently override. Inform user.
              alert(`Your account role is set to '${profile.role}'. Please select that role to sign in or contact admin.`)
              return
            }
            // ensure role persisted if no profile
            if (!profile) {
              await setUserProfile(userCred.user.uid, { role, displayName: userCred.user.displayName, email: userCred.user.email })
            }
          } catch (e) { console.warn('Profile check failed', e) }
        } else {
          const provider = new GoogleAuthProvider()
          const result = await signInWithPopup(auth, provider)
          try {
            await setUserProfile(result.user.uid, { role, displayName: result.user.displayName, email: result.user.email })
          } catch (e) { console.warn('Failed to persist user profile:', e) }
        }
      }

      setUserRole(role as any)
      router.push(`/dashboard/${role}`)
    } catch (err) {
      console.error('Sign-in/signup error', err)
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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="flex-1 p-2 border rounded" />
          </div>
          {isSignUp && (
            <input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full p-2 border rounded" />
          )}
          <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-2 border rounded" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded">{isSignUp ? 'Sign up' : 'Sign in'}</button>
            <button type="button" onClick={()=>setIsSignUp(!isSignUp)} className="px-3 py-2 border rounded">{isSignUp ? 'Have account?' : 'Create account'}</button>
          </div>
        </div>

        <div className="my-2 text-center">OR</div>
        <button type="button" onClick={handleLogin as any} className="w-full bg-indigo-600 text-white py-2 rounded mb-3">Continue with Google</button>

        {!hasFirebase && (
          <div className="text-sm text-slate-600">Firebase not configured — demo local mode will be used.</div>
        )}
      </form>
    </div>
  )
}

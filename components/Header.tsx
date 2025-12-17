import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useUser } from '../contexts/UserContext'

export default function Header() {
  const { user } = useUser()

  async function handleSignOut() {
    if (!auth) return
    try {
      await signOut(auth)
      // UserContext will handle state change via onAuthStateChanged
    } catch (err) {
      console.error('Sign-out error', err)
    }
  }

  return (
    <header className="w-full p-4 bg-white dark:bg-slate-800 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/"><a className="font-bold text-lg">AcademicCollab</a></Link>
        <nav className="flex items-center gap-3">
          <a className="text-sm">Notifications</a>
          {user && user.uid ? (
            <>
              <div className="text-sm">{user.displayName || user.email || 'User'}</div>
              <button onClick={handleSignOut} className="px-3 py-1 text-sm border rounded">Sign out</button>
            </>
          ) : (
            <Link href="/login"><a className="text-sm">Sign in</a></Link>
          )}
        </nav>
      </div>
    </header>
  )
}

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export type UserProfile = {
  role?: string
  displayName?: string | null
  email?: string | null
  [key: string]: any
}

export async function setUserProfile(uid: string, profile: UserProfile) {
  if (!db) return
  try {
    const ref = doc(db, 'users', uid)
    await setDoc(ref, { ...profile, updatedAt: serverTimestamp() }, { merge: true })
  } catch (err) {
    console.error('setUserProfile error', err)
    throw err
  }
}

export async function getUserProfile(uid: string) {
  if (!db) return null
  try {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as UserProfile) : null
  } catch (err) {
    console.error('getUserProfile error', err)
    return null
  }
}

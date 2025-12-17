// Firebase v9 modular SDK initialization (conditional)
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

let app: FirebaseApp | null = null
let _db: any = null
let _auth: any = null

if (projectId) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: projectId,
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }

  _db = getFirestore(app)
  _auth = getAuth(app)
}

export const db: any = _db
export const auth: any = _auth

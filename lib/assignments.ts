import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore'
import { db, auth } from './firebase'

export type Assignment = {
  id?: string
  title: string
  description?: string
  createdAt?: any
  dueDate?: string | null
  createdBy?: string | null
  courseId?: string | null
}

export type Submission = {
  id?: string
  author?: string | null
  authorUid?: string | null
  text?: string
  createdAt?: any
  grade?: number | null
  feedback?: string | null
  fileUrl?: string | null
}

// Real-time listener for assignments collection
export function listenToAssignments(cb: (items: Assignment[]) => void) {
  if (!db) return () => {}
  try {
    const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      cb(items)
    })
    return unsub
  } catch (err) {
    console.warn('listenToAssignments error', err)
    return () => {}
  }
}

export async function createAssignment(a: Assignment) {
  if (!db) return null
  try {
    // Attach creator info when available
    const createdByUid = auth && auth.currentUser ? auth.currentUser.uid : (a.createdBy || null)
    const createdByName = auth && auth.currentUser ? (auth.currentUser.displayName || auth.currentUser.email) : null
    const payload = { ...a, createdAt: serverTimestamp(), createdByUid, createdByName }
    const ref = await addDoc(collection(db, 'assignments'), payload)
    return ref.id
  } catch (err) {
    console.error('createAssignment error', err)
    throw err
  }
}

export async function getAssignment(id: string) {
  if (!db) return null
  try {
    const d = await getDoc(doc(db, 'assignments', id))
    return d.exists() ? ({ id: d.id, ...(d.data() as any) } as Assignment) : null
  } catch (err) {
    console.error('getAssignment error', err)
    return null
  }
}

export async function submitAssignment(assignmentId: string, s: Submission) {
  if (!db) return null
  try {
    const authorUid = s.authorUid || (auth && auth.currentUser ? auth.currentUser.uid : null)
    const authorName = s.author || (auth && auth.currentUser ? (auth.currentUser.displayName || auth.currentUser.email) : null)
    const payload = { ...s, authorUid, author: authorName, createdAt: serverTimestamp() }
    const ref = await addDoc(collection(db, 'assignments', assignmentId, 'submissions'), payload)
    return ref.id
  } catch (err) {
    console.error('submitAssignment error', err)
    throw err
  }
}

export function listenToSubmissions(assignmentId: string, cb: (subs: Submission[]) => void) {
  if (!db) return () => {}
  try {
    const q = query(collection(db, 'assignments', assignmentId, 'submissions'), orderBy('createdAt'))
    const unsub = onSnapshot(q, (snap) => {
      const subs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      cb(subs)
    })
    return unsub
  } catch (err) {
    console.warn('listenToSubmissions error', err)
    return () => {}
  }
}

export async function gradeSubmission(assignmentId: string, submissionId: string, grade: number, feedback?: string) {
  if (!db) return null
  try {
    const ref = doc(db, 'assignments', assignmentId, 'submissions', submissionId)
    await setDoc(ref, { grade, feedback }, { merge: true })
    return true
  } catch (err) {
    console.error('gradeSubmission error', err)
    throw err
  }
}

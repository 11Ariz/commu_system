import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

export type Message = {
  id: string
  text: string
  author?: string
  createdAt?: any
}

// Listen to messages in a room. Returns unsubscribe function.
export function listenToRoomMessages(roomId: string, cb: (msgs: Message[]) => void) {
  if (!db || !roomId) {
    return () => {}
  }

  try {
    const q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('createdAt'))
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      cb(msgs)
    })
    return unsub
  } catch (err) {
    // If Firestore not configured or error, return no-op
    console.warn('listenToRoomMessages error:', err)
    return () => {}
  }
}

export async function sendMessage(roomId: string, text: string, author = 'Anonymous') {
  if (!db || !roomId) return
  try {
    await addDoc(collection(db, 'rooms', roomId, 'messages'), {
      text,
      author,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.error('sendMessage error:', err)
    throw err
  }
}

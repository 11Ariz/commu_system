import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db, auth } from './firebase'

export type Message = {
  id: string
  text: string
  author?: string
  createdAt?: any
  authorUid?: string | null
  repliedToId?: string | null
  repliedToAuthor?: string | null
  repliedToText?: string | null
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

export async function sendMessage(roomId: string, text: string, author = 'Anonymous', repliedToId?: string | null, repliedToAuthor?: string | null, repliedToText?: string | null) {
  if (!db || !roomId) return
  try {
    const authorUid = auth && auth.currentUser ? auth.currentUser.uid : null
    const authorName = auth && auth.currentUser ? (auth.currentUser.displayName || auth.currentUser.email) : author
    const payload: any = {
      text,
      author: authorName,
      authorUid,
      createdAt: serverTimestamp(),
    }
    if (repliedToId) {
      payload.repliedToId = repliedToId
      if (repliedToAuthor) payload.repliedToAuthor = repliedToAuthor
      if (repliedToText) payload.repliedToText = repliedToText
    }

    await addDoc(collection(db, 'rooms', roomId, 'messages'), payload)
  } catch (err) {
    console.error('sendMessage error:', err)
    throw err
  }
}

import { useEffect, useRef, useState } from 'react'
import type { Message } from '../lib/chat'
import { listenToRoomMessages, sendMessage } from '../lib/chat'
import { auth } from '../lib/firebase'

type Props = { roomId: string }

export default function ChatWindow({ roomId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  // If Firebase not configured, fallback to local mode
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && !!auth

  useEffect(() => {
    if (hasFirebase && auth) {
      const unsubAuth = auth.onAuthStateChanged((u: any) => {
        setUserName(u ? u.displayName || u.email || u.uid : null)
      })
      return () => unsubAuth()
    }
    setUserName('Guest')
  }, [hasFirebase])

  useEffect(() => {
    if (!hasFirebase) {
      // local demo message
      setMessages([{ id: '1', text: 'Welcome to the demo room (local mode)', author: 'System' }])
      return
    }

    const unsub = listenToRoomMessages(roomId, (msgs) => {
      setMessages(msgs)
    })

    return () => unsub()
  }, [roomId, hasFirebase])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!text.trim()) return
    const author = userName || 'You'
    if (!hasFirebase) {
      setMessages((prev) => [...prev, { id: String(prev.length + 1), text, author }])
      setText('')
      return
    }

    try {
      await sendMessage(roomId, text, author)
      setText('')
    } catch (err) {
      // fallback to local append if send fails
      setMessages((prev) => [...prev, { id: String(prev.length + 1), text, author }])
      setText('')
    }
  }

  return (
    <div className="max-w-3xl border rounded p-4 bg-white dark:bg-slate-800">
      <div className="h-64 overflow-y-auto p-2 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
            <div className="text-xs text-slate-500">{m.author}</div>
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
        />
        <button onClick={handleSend} className="px-4 py-2 bg-indigo-600 text-white rounded">
          Send
        </button>
      </div>
    </div>
  )
}

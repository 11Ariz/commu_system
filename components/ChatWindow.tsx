import { useEffect, useRef, useState } from 'react'
import type { Message } from '../lib/chat'
import { listenToRoomMessages, sendMessage } from '../lib/chat'
import { auth } from '../lib/firebase'
import { getUserProfile } from '../lib/users'

type Props = { roomId: string }

export default function ChatWindow({ roomId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; author?: string; text?: string } | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  // If Firebase not configured, fallback to local mode
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && !!auth

  useEffect(() => {
    if (hasFirebase && auth) {
      const unsubAuth = auth.onAuthStateChanged((u: any) => {
        setUserName(u ? u.displayName || u.email || u.uid : 'Guest')
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

  // Resolve unknown or placeholder author names using users profiles
  useEffect(() => {
    if (!messages || messages.length === 0) return
    const needs = messages.filter(m => (!m.author || m.author === 'You') && m.authorUid)
    if (needs.length === 0) return

    let mounted = true
    ;(async () => {
      // collect unique uids
      const uids = Array.from(new Set(needs.map(m => m.authorUid)))
      const nameMap: Record<string, string> = {}
      for (const uid of uids) {
        try {
          const profile = await getUserProfile(uid as string)
          if (profile) nameMap[uid as string] = profile.displayName || profile.email || 'User'
        } catch (err) {
          // ignore
        }
      }
      if (!mounted) return
      if (Object.keys(nameMap).length === 0) return
      setMessages(prev => prev.map(m => {
        if (m.authorUid && nameMap[m.authorUid]) return { ...m, author: nameMap[m.authorUid] }
        return m
      }))
    })()

    return () => { mounted = false }
  }, [messages])

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
      const repliedToId = replyTo?.id || null
      const repliedToAuthor = replyTo?.author || null
      const repliedToText = replyTo?.text || null
      await sendMessage(roomId, text, author, repliedToId, repliedToAuthor, repliedToText)
      setText('')
      setReplyTo(null)
    } catch (err) {
      // fallback to local append if send fails
      setMessages((prev) => [...prev, { id: String(prev.length + 1), text, author }])
      setText('')
    }
  }

  return (
    <div className="max-w-3xl border rounded p-4 bg-white dark:bg-slate-800">
      <div className="h-64 overflow-y-auto p-2 space-y-3">
        {messages.map((m) => {
          const isMine = m.authorUid && auth && auth.currentUser ? m.authorUid === auth.currentUser.uid : false

          return (
            <div key={m.id} className={`max-w-[80%] p-2 rounded ${isMine ? 'ml-auto bg-indigo-600 text-white' : 'mr-auto bg-slate-100 text-slate-900'}`}>
              {!isMine && <div className="text-xs font-medium">{m.author || 'Anonymous'}</div>}
              {m.repliedToAuthor && (
                <div className="mt-1 p-2 bg-white/30 rounded text-xs italic">Reply to <span className="font-medium">{m.repliedToAuthor}</span>: {m.repliedToText}</div>
              )}
              <div className="mt-1 whitespace-pre-wrap">{m.text}</div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                <div>{/* timestamp could be added */}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    setReplyTo({ id: m.id, author: m.author, text: m.text })
                    const el = document.getElementById('chat-input') as HTMLInputElement | null
                    el?.focus()
                  }} className="underline text-xs">Reply</button>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className="mt-3">
        {replyTo && (
          <div className="mb-2 p-2 bg-slate-100 rounded text-sm">
            Replying to <span className="font-medium">{replyTo.author}</span>: <span className="italic">{replyTo.text}</span>
            <button onClick={() => setReplyTo(null)} className="ml-3 text-xs underline">Cancel</button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            id="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
          />
          <button onClick={handleSend} className="px-4 py-2 bg-indigo-600 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  )
}

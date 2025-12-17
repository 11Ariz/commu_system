import Link from 'next/link'
import { Assignment } from '../lib/assignments'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { collection, query, onSnapshot } from 'firebase/firestore'

type Props = { a: Assignment }

export default function AssignmentCard({ a }: Props) {
  const [subCount, setSubCount] = useState<number | null>(null)

  useEffect(() => {
    if (!db || !a.id) return
    try {
      const q = query(collection(db, 'assignments', a.id, 'submissions'))
      const unsub = onSnapshot(q, (snap) => {
        setSubCount(snap.size)
      })
      return () => unsub()
    } catch (err) {
      setSubCount(null)
    }
  }, [a.id])

  return (
    <div className="p-4 glass-card rounded shadow-sm">
      <h3 className="font-semibold">{a.title}</h3>
      <p className="text-sm text-slate-600">{a.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-slate-500">Due: {a.dueDate || '—'}</div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">Subs: {subCount === null ? '—' : subCount}</div>
          <Link href={`/assignments/${a.id}`} className="text-sm px-3 py-1 border rounded">Open</Link>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import AssignmentCard from '../../components/AssignmentCard'
import { listenToAssignments, Assignment } from '../../lib/assignments'
import { useUser } from '../../contexts/UserContext'

export default function AssignmentsPage() {
  const [items, setItems] = useState<Assignment[]>([])

  useEffect(() => {
    const unsub = listenToAssignments((list) => setItems(list))
    return () => unsub()
  }, [])

  const { user } = useUser()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Assignments</h1>
          {user?.role === 'teacher' && (
            <Link href="/assignments/create"><a className="px-3 py-1 rounded border">Create</a></Link>
          )}
        </div>

        <div className="grid gap-4">
          {items.length === 0 && <div className="text-slate-600">No assignments yet.</div>}
          {items.map((a) => (
            <AssignmentCard key={a.id} a={a} />
          ))}
        </div>
      </main>
    </div>
  )
}

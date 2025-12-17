import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { db } from '../../lib/firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'

export default function CourseView() {
  const router = useRouter()
  const { id } = router.query
  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    if (!id || !db) return
    const q = query(collection(db, 'assignments'), where('courseId', '==', id), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = []
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
      setAssignments(arr)
    })
    return () => unsub()
  }, [id])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Course</h2>
        <Link href="/assignments/create" className="px-3 py-1 rounded border">New Assignment</Link>
      </div>

      <ul className="space-y-3">
        {assignments.map(a => (
          <li key={a.id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-slate-600">{a.description}</div>
            </div>
            <Link href={`/assignments/${a.id}`} className="text-sm px-3 py-1 border rounded">Open</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

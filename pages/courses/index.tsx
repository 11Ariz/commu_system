import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '../../lib/firebase'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = []
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
      setCourses(arr)
    })
    return () => unsub()
  }, [])

  async function createCourse(e: any) {
    e.preventDefault()
    if (!db || !title) return
    await addDoc(collection(db, 'courses'), { title, createdAt: serverTimestamp() })
    setTitle('')
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Courses</h2>
        <Link href="/courses/create" className="px-3 py-1 rounded border">New</Link>
      </div>

      <form onSubmit={createCourse} className="mb-4">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Course title" className="border p-2 mr-2" />
        <button className="px-3 py-1 bg-indigo-600 text-white rounded">Create</button>
      </form>

      <ul className="space-y-3">
        {courses.map(c => (
          <li key={c.id} className="border p-3 rounded flex justify-between items-center">
            <div>{c.title}</div>
            <Link href={`/courses/${c.id}`} className="text-sm px-3 py-1 border rounded">Open</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

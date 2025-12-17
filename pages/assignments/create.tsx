import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import { createAssignment } from '../../lib/assignments'
import { db } from '../../lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useUser } from '../../contexts/UserContext'

export default function CreateAssignment() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    // Redirect non-teachers away
    if (user && user.role && user.role !== 'teacher') {
      router.replace('/assignments')
    }
    // load courses
    if (db) {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'))
      const unsub = onSnapshot(q, (snap) => {
        const arr: any[] = []
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
        setCourses(arr)
      })
      return () => unsub()
    }
  }, [user])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      const id = await createAssignment({ title, description, dueDate, courseId })
      if (id) router.push(`/assignments/${id}`)
    } catch (err) {
      console.error('Create failed', err)
    }
  }

  if (user && user.role && user.role !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Header />
        <div className="p-6">Only teachers can create assignments.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Create Assignment</h1>
        <form onSubmit={handleCreate} className="space-y-4">
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
          <input type="date" onChange={(e)=>setDueDate(e.target.value)} className="p-2 border rounded" />
          <select value={courseId || ''} onChange={(e)=>setCourseId(e.target.value || null)} className="p-2 border rounded w-full">
            <option value="">-- Select course (optional) --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
          </div>
        </form>
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db, auth } from '../../lib/firebase'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { uploadFile } from '../../lib/storage'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const items: any[] = []
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }))
      setProjects(items)
    })
    return () => unsub()
  }, [])

  async function createProject(e: any) {
    e.preventDefault()
    if (!db) return
    // attach creator info when available
    const createdByUid = auth && auth.currentUser ? auth.currentUser.uid : null
    const createdByName = auth && auth.currentUser ? (auth.currentUser.displayName || auth.currentUser.email) : null
    const docRef = await addDoc(collection(db, 'projects'), {
      title,
      description: desc,
      createdAt: serverTimestamp(),
      createdByUid,
      createdByName,
    })

    if (file) {
      const url = await uploadFile(`projects/${docRef.id}`, file)
      if (url) {
        await addDoc(collection(db, `projects/${docRef.id}/files`), {
          name: file.name,
          url,
          createdAt: serverTimestamp(),
        })
      }
    }

    setTitle('')
    setDesc('')
    setFile(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <Link href="/projects/create" className="px-3 py-1 rounded border">New Project</Link>
      </div>

      <form onSubmit={createProject} className="mb-6 space-y-2">
        <input className="border p-2 w-full" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="border p-2 w-full" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Create</button>
      </form>

      <ul className="space-y-3">
        {projects.map((p) => (
          <li key={p.id} className="border p-3 rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-slate-600">{p.description}</div>
              </div>
              <Link href={`/projects/${p.id}`} className="text-sm px-3 py-1 border rounded">Open</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

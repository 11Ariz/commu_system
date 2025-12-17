import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '../../lib/firebase'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { uploadFile } from '../../lib/storage'

export default function ResearchPage() {
  const [items, setItems] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'research'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = []
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }))
      setItems(list)
    })
    return () => unsub()
  }, [])

  async function createItem(e: any) {
    e.preventDefault()
    if (!db) return
    const docRef = await addDoc(collection(db, 'research'), {
      title,
      summary,
      createdAt: serverTimestamp(),
    })

    if (file) {
      const url = await uploadFile(`research/${docRef.id}`, file)
      if (url) {
        await addDoc(collection(db, `research/${docRef.id}/files`), {
          name: file.name,
          url,
          createdAt: serverTimestamp(),
        })
      }
    }

    setTitle('')
    setSummary('')
    setFile(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Research</h2>
        <Link href="/research/create" className="px-3 py-1 rounded border">New</Link>
      </div>

      <form onSubmit={createItem} className="mb-6 space-y-2">
        <input className="border p-2 w-full" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="border p-2 w-full" placeholder="Summary" value={summary} onChange={e => setSummary(e.target.value)} />
        <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Create</button>
      </form>

      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id} className="border p-3 rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="text-sm text-slate-600">{r.summary}</div>
              </div>
              <Link href={`/research/${r.id}`} className="text-sm px-3 py-1 border rounded">Open</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

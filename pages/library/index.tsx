import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '../../lib/firebase'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { uploadFile } from '../../lib/storage'

export default function LibraryPage() {
  const [items, setItems] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'library'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = []
      snap.forEach(d => list.push({ id: d.id, ...d.data() }))
      setItems(list)
    })
    return () => unsub()
  }, [])

  async function handleUpload(e: any) {
    e.preventDefault()
    if (!db || !file) return
    const docRef = await addDoc(collection(db, 'library'), { title: title || file.name, createdAt: serverTimestamp() })
    const url = await uploadFile(`library/${docRef.id}`, file)
    if (url) {
      await addDoc(collection(db, `library/${docRef.id}/files`), { name: file.name, url, createdAt: serverTimestamp() })
    }
    setTitle('')
    setFile(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Library</h2>
        <Link href="/library/create" className="px-3 py-1 rounded border">Upload</Link>
      </div>

      <form onSubmit={handleUpload} className="mb-4">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title (optional)" className="border p-2 w-full mb-2" />
        <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
        <div className="mt-2"><button className="px-3 py-1 bg-indigo-600 text-white rounded">Upload</button></div>
      </form>

      <ul className="space-y-3">
        {items.map(i => (
          <li key={i.id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{i.title}</div>
            </div>
            <Link href={`/library/${i.id}`} className="text-sm px-3 py-1 border rounded">Open</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

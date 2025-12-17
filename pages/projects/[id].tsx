import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import { db } from '../../lib/firebase'
import { doc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore'

export default function ProjectView() {
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])

  useEffect(() => {
    if (!id || !db) return
    const ref = doc(db, 'projects', id as string)
    getDoc(ref).then(snap => { if (snap.exists()) setProject({ id: snap.id, ...(snap.data() as any) }) })

    const q = query(collection(db, 'projects', id as string, 'files'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = []
      snap.forEach(d => arr.push({ id: d.id, ...(d.data() as any) }))
      setFiles(arr)
    })
    return () => unsub()
  }, [id])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
        {project ? (
          <div>
            <h1 className="text-2xl font-semibold">{project.title}</h1>
            <div className="text-sm text-slate-600">{project.description}</div>
            <div className="text-xs text-slate-500">Uploaded by: {project.createdByName || 'Unknown'}</div>

            <div className="mt-6">
              <h2 className="font-medium">Files</h2>
              <ul className="mt-2 space-y-2">
                {files.map(f => (
                  <li key={f.id} className="p-2 border rounded flex justify-between items-center">
                    <div>{f.name}</div>
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-indigo-600">Download</a>
                  </li>
                ))}
                {files.length === 0 && <div className="text-slate-600">No files uploaded.</div>}
              </ul>
            </div>
          </div>
        ) : <div>Loading...</div>}
      </main>
    </div>
  )
}

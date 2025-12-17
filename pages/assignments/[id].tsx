import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import { getAssignment, submitAssignment, listenToSubmissions, gradeSubmission } from '../../lib/assignments'
import { uploadSubmissionFile } from '../../lib/storage'
import { useUser } from '../../contexts/UserContext'

export default function AssignmentView() {
  const router = useRouter()
  const { id } = router.query
  const [assignment, setAssignment] = useState<any>(null)
  const [subs, setSubs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const { user } = useUser()

  useEffect(() => {
    if (!id) return
    getAssignment(id as string).then(a => setAssignment(a))
    const unsub = listenToSubmissions(id as string, (s) => setSubs(s))
    return () => unsub()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    try {
      let fileUrl = null
      if (file && user && user.uid) {
        const url = await uploadSubmissionFile(id as string, file)
        fileUrl = url
      }
      const payload: any = { text, author: user?.displayName || user?.email || 'Anonymous', authorUid: user?.uid || null, fileUrl }
      await submitAssignment(id as string, payload)
      setText('')
      setFile(null)
    } catch (err) { console.error(err) }
  }

  async function handleGrade(subId: string) {
    const g = prompt('Enter grade (0-100)')
    if (!g) return
    const grade = Number(g)
    const feedback = prompt('Feedback (optional)') || ''
    try {
      await gradeSubmission(id as string, subId, grade, feedback)
    } catch (err) { console.error(err) }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
        {assignment ? (
          <div>
            <h1 className="text-2xl font-semibold">{assignment.title}</h1>
            <p className="text-slate-600">{assignment.description}</p>
            {user?.role !== 'teacher' && (
              <div className="mt-4">
                <h2 className="font-medium">Submit</h2>
                <form onSubmit={handleSubmit} className="mt-2">
                  <textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full p-2 border rounded" placeholder="Your submission..." />
                    <div className="mt-2">
                      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                  <div className="mt-2"><button className="px-3 py-1 rounded bg-indigo-600 text-white">Submit</button></div>
                </form>
              </div>
            )}

            <div className="mt-6">
              <h2 className="font-medium">Submissions</h2>
              <div className="mt-2 space-y-3">
                {subs.length === 0 && <div className="text-slate-600">No submissions yet.</div>}
                {(() => {
                  // If the current user is a teacher show all submissions, otherwise only show the student's own submission(s)
                  const visible = user?.role === 'teacher' ? subs : subs.filter(s => s.authorUid === user?.uid)
                  return visible.map(s => (
                    <div key={s.id} className="p-3 border rounded">
                      <div className="text-xs text-slate-500">{s.author} • {new Date(s.createdAt?.toDate ? s.createdAt.toDate() : Date.now()).toLocaleString()}</div>
                      <div className="mt-1">{s.text}</div>
                      {s.fileUrl && (
                        <div className="mt-2">
                          <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600">Download attachment</a>
                        </div>
                      )}
                      <div className="mt-2">
                        <div className="text-sm">Grade: {s.grade ?? '—'}</div>
                      </div>

                      {/* Inline grading UI for teachers */}
                      {user?.role === 'teacher' && (
                        <div className="mt-2 flex items-start gap-2">
                          <input defaultValue={s.grade ?? ''} placeholder="Grade" id={`grade-${s.id}`} className="p-1 border rounded w-24" />
                          <input defaultValue={s.feedback ?? ''} placeholder="Feedback" id={`fb-${s.id}`} className="p-1 border rounded flex-1" />
                          <button onClick={async ()=>{
                            const gradeEl = document.getElementById(`grade-${s.id}`) as HTMLInputElement
                            const fbEl = document.getElementById(`fb-${s.id}`) as HTMLInputElement
                            const g = Number(gradeEl?.value || 0)
                            const fb = fbEl?.value || ''
                            try { await gradeSubmission(id as string, s.id, g, fb) } catch(err){ console.error(err) }
                          }} className="px-2 py-1 bg-green-600 text-white rounded">Save</button>
                        </div>
                      )}

                      {s.feedback && <div className="mt-1 text-sm text-slate-600">Feedback: {s.feedback}</div>}
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        ) : <div>Loading...</div>}
      </main>
    </div>
  )
}

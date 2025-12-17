import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'

export default function DashboardRole() {
  const router = useRouter()
  const { role } = router.query

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <div className="flex">
        <Sidebar role={(role as string) || 'student'} />

        <main className="flex-1 p-6">
          <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold">{role} Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Overview of courses, tasks and recent activity.</p>

            <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 glass-card rounded">Next Assignment: Research Proposal</div>
              <div className="p-4 glass-card rounded">Project Board: AI Study Assistant</div>
            </section>

              <section className="mt-6">
                <h2 className="font-medium mb-2">Quick Actions</h2>
                <div className="flex gap-3">
                  <Link href="/chat/general" className="px-3 py-2 rounded border">Open Chat</Link>
                  <Link href="/dashboard/projects" className="px-3 py-2 rounded border">Open Projects</Link>
                </div>
              </section>
          </div>
        </main>
      </div>
    </div>
  )
}

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full glass-card rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-semibold mb-2">Academic Collaboration & Research Platform</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">Collaborate on courses, research, assignments and projects — all in one place.</p>

        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 rounded bg-indigo-600 text-white">Get Started</Link>
          <Link href="/dashboard/student" className="px-4 py-2 rounded border">Demo: Student Dashboard</Link>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-medium mb-2">Core Features</h2>
          <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300">
            <li>Real-time chat & threaded discussions</li>
            <li>Course & project workspaces</li>
            <li>Assignments, submissions & grading</li>
            <li>Research collaboration and dataset sharing</li>
          </ul>
        </section>
      </div>
    </main>
  )
}

import Link from 'next/link'

type Props = { role?: string }

export default function Sidebar({ role = 'student' }: Props) {
  return (
    <aside className="w-64 p-4 border-r hidden md:block bg-indigo-50">
      <div className="mb-6">
        <div className="font-semibold">{role.toUpperCase()}</div>
        <div className="text-sm text-slate-600">Welcome back</div>
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        <Link href="/courses" className="p-2 rounded hover:bg-indigo-100">Courses</Link>
        <Link href="/projects" className="p-2 rounded hover:bg-indigo-100">Projects</Link>
        <Link href="/assignments" className="p-2 rounded hover:bg-indigo-100">Assignments</Link>
        <Link href="/research" className="p-2 rounded hover:bg-indigo-100">Research</Link>
        <Link href="/library" className="p-2 rounded hover:bg-indigo-100">Library</Link>
      </nav>
    </aside>
  )
}

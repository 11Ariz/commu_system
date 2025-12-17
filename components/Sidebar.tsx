type Props = { role?: string }

export default function Sidebar({ role = 'student' }: Props) {
  return (
    <aside className="w-64 p-4 border-r hidden md:block">
      <div className="mb-6">
        <div className="font-semibold">{role.toUpperCase()}</div>
        <div className="text-sm text-slate-600">Welcome back</div>
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        <a className="p-2 rounded hover:bg-slate-100">Courses</a>
        <a className="p-2 rounded hover:bg-slate-100">Projects</a>
        <a className="p-2 rounded hover:bg-slate-100">Assignments</a>
        <a className="p-2 rounded hover:bg-slate-100">Research</a>
        <a className="p-2 rounded hover:bg-slate-100">Library</a>
      </nav>
    </aside>
  )
}

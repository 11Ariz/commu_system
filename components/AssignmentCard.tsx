import Link from 'next/link'
import { Assignment } from '../lib/assignments'

type Props = { a: Assignment }

export default function AssignmentCard({ a }: Props) {
  return (
    <div className="p-4 glass-card rounded shadow-sm">
      <h3 className="font-semibold">{a.title}</h3>
      <p className="text-sm text-slate-600">{a.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-slate-500">Due: {a.dueDate || '—'}</div>
        <Link href={`/assignments/${a.id}`}><a className="text-sm px-3 py-1 border rounded">Open</a></Link>
      </div>
    </div>
  )
}

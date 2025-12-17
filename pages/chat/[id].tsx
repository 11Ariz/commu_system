import { useRouter } from 'next/router'
import ChatWindow from '../../components/ChatWindow'
import Header from '../../components/Header'

export default function ChatPage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="p-4">
        <h1 className="text-xl font-semibold">Chat: {id}</h1>
        <div className="mt-4">
          <ChatWindow roomId={(id as string) || 'general'} />
        </div>
      </main>
    </div>
  )
}

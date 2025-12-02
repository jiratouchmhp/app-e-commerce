import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  return <div className="min-h-screen">{children}</div>
}

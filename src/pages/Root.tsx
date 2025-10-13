import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Root() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-page/70 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-[1600px] px-6 h-14 flex items-center justify-between">
          <div className="font-semibold">ClipBot</div>
          <nav className="flex items-center gap-3 text-sm">
            <Link className={`btn-ghost ${pathname.includes('/dashboard/overview') ? 'bg-white/10' : ''}`} to="/dashboard/overview">Overview</Link>
            <Link className={`btn-ghost ${pathname.includes('/dashboard/library') ? 'bg-white/10' : ''}`} to="/dashboard/library">Library</Link>
            <Link className={`btn-ghost ${pathname.includes('/dashboard/uploads') ? 'bg-white/10' : ''}`} to="/dashboard/uploads">Uploads</Link>
          </nav>
          <div className="flex items-center gap-3">
            <button className="btn-ghost">🔔</button>
            <div className="badge">Credits 90</div>
            <button className="btn-ghost">Add credits</button>
            <div className="w-8 h-8 rounded-full bg-white/10" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <Outlet />
      </main>
      <button className="fixed bottom-4 right-4 btn-ghost shadow-pop">Questions?</button>
    </div>
  )
}

import { Outlet, Link, useLocation } from 'react-router-dom'

const navigationLinks = [
  { label: 'Overview', path: '/dashboard/overview' },
  { label: 'Library', path: '/dashboard/library' },
  { label: 'Uploads', path: '/dashboard/uploads' },
  { label: 'Brand template', path: '/dashboard/brand-template' },
]

export default function Root() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-[1600px] px-6 py-8 flex gap-8">
        <aside className="sticky top-6 h-[calc(100vh-3rem)] w-64 border border-border bg-white/5 rounded-full backdrop-blur shadow-lg flex flex-col p-5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-semibold">CB</div>
            <div className="font-semibold text-lg">ClipBot</div>
          </div>
          <nav className="mt-6 flex-1 flex flex-col gap-2 text-sm">
            {navigationLinks.map((link) => {
              const isActive = pathname.includes(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-full transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex flex-col gap-2">
            <button className="btn-ghost rounded-full justify-center">🔔 Notifications</button>
            <div className="badge justify-center">Credits 90</div>
            <button className="btn-ghost rounded-full justify-center">Add credits</button>
            <div className="w-10 h-10 rounded-full bg-white/10 self-center" />
          </div>
        </aside>
        <div className="flex-1">
          <main className="pb-12">
            <Outlet />
          </main>
        </div>
      </div>
      <button className="fixed bottom-4 right-4 btn-ghost shadow-pop rounded-full px-5">Questions?</button>
    </div>
  )
}

import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  Palette,
  Settings,
  Bell,
} from 'lucide-react'

const mainLinks = [
  { label: 'Dashboard', path: '/dashboard/overview', icon: LayoutDashboard },
  { label: 'Library', path: '/dashboard/library', icon: BookOpen },
  { label: 'Uploads', path: '/dashboard/uploads', icon: UploadCloud },
  { label: 'Brand template', path: '/dashboard/brand-template', icon: Palette },
]

const supportLinks = [{ label: 'Settings', path: '/dashboard/me', icon: Settings }]

export default function Root() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen bg-page">
      <aside className="group/sidebar sticky left-0 top-0 z-20 h-screen w-16 shrink-0 overflow-hidden border-r border-white/10 bg-black/30 px-2 py-6 backdrop-blur-xl transition-[width] duration-300 hover:w-64">
        <div className="flex h-full flex-col items-center gap-6">
          <div className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-white/70 transition hover:bg-white/10 hover:text-white">
            <div className="text-base font-semibold uppercase tracking-[0.08em] text-white">CB</div>
            <div className="hidden flex-1 flex-col leading-tight group-hover/sidebar:flex">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Main</span>
              <span className="text-sm font-semibold text-white">ClipBot</span>
            </div>
            <div className="hidden text-emerald-300 group-hover/sidebar:block">
              <Bell className="h-5 w-5" />
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="flex items-center gap-2 px-2 text-[10px] uppercase tracking-[0.35em] text-white/40">Main</div>
            <nav className="space-y-2">
              {mainLinks.map((link) => {
                const isActive = pathname.startsWith(link.path)
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group/item relative flex w-full items-center gap-3 rounded-full px-3 py-2 text-white/60 transition hover:bg-white/10 hover:text-white ${
                      isActive ? 'bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)]' : ''
                    }`}
                    aria-label={link.label}
                  >
                    <span className="flex h-8 w-8 items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="hidden min-w-0 flex-1 items-center justify-between group-hover/sidebar:flex">
                      <span className="truncate text-sm font-semibold leading-tight">{link.label}</span>
                      {isActive && <span className="text-[11px] text-white/60">Active</span>}
                    </div>
                    {isActive && (
                      <span className="absolute right-[-8px] top-1/2 h-8 w-2 -translate-y-1/2 rounded-full bg-white" aria-hidden />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="w-full space-y-3">
            <div className="flex items-center gap-2 px-2 text-[10px] uppercase tracking-[0.35em] text-white/40">Support</div>
            <nav className="space-y-2">
              {supportLinks.map((link) => {
                const isActive = pathname.startsWith(link.path)
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group/item relative flex w-full items-center gap-3 rounded-full px-3 py-2 text-white/60 transition hover:bg-white/10 hover:text-white ${
                      isActive ? 'bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)]' : ''
                    }`}
                    aria-label={link.label}
                  >
                    <span className="flex h-8 w-8 items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="hidden min-w-0 flex-1 items-center justify-between group-hover/sidebar:flex">
                      <span className="truncate text-sm font-semibold leading-tight">{link.label}</span>
                      {isActive && <span className="text-[11px] text-white/60">Active</span>}
                    </div>
                    {isActive && (
                      <span className="absolute right-[-8px] top-1/2 h-8 w-2 -translate-y-1/2 rounded-full bg-white" aria-hidden />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="mt-auto flex w-full flex-col gap-3 text-sm text-white/60">
            <div className="hidden w-full flex-col gap-1 group-hover/sidebar:flex">
              <span className="text-xs uppercase tracking-[0.2em] text-white/40">Credits</span>
              <span className="text-white">90 available</span>
            </div>

            <div className="hidden w-full group-hover/sidebar:block">
              <button className="w-full text-left text-white transition hover:text-white/80">Need help? Hover for support</button>
            </div>

            <div className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-white/80 transition hover:bg-white/10">
              <div className="h-9 w-9 overflow-hidden rounded-md bg-white/20" />
              <div className="hidden flex-col text-sm group-hover/sidebar:flex">
                <span className="text-white">Nadine Schneider</span>
                <span className="text-white/60">Admin · Clipbot</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="ml-16 flex min-h-screen flex-1 flex-col px-6 py-8 transition-[margin] duration-300 group-hover/sidebar:ml-64">
        <main className="pb-12">
          <Outlet />
        </main>
      </div>

      <button className="fixed bottom-4 right-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:translate-y-0.5">
        Questions?
      </button>
    </div>
  )
}

import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  Palette,
  Settings,
  LifeBuoy,
  Bell,
  CreditCard,
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
      <aside className="group/sidebar sticky left-0 top-0 z-20 h-screen w-[82px] overflow-hidden border-r border-white/10 bg-black/30 backdrop-blur-xl transition-[width] duration-300 hover:w-[300px]">
        <div className="flex h-full flex-col gap-6 px-4 py-6">
          <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-[0_15px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-white/80 to-white/20 text-lg font-semibold text-gray-900 shadow-lg">
                CB
              </div>
              <div className="hidden group-hover/sidebar:block">
                <div className="text-xs uppercase tracking-[0.16em] text-white/60">Main</div>
                <div className="text-base font-semibold text-white">ClipBot</div>
              </div>
            </div>
            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 group-hover/sidebar:flex">
              <Bell className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 group-hover/sidebar:flex">
              <span className="h-px flex-1 bg-white/10" />
              Main
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <nav className="space-y-2">
              {mainLinks.map((link) => {
                const isActive = pathname.startsWith(link.path)
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group/item relative flex items-center gap-3 rounded-full border px-3 py-3 transition-colors duration-200 ${
                      isActive
                        ? 'border-white/15 bg-white/10 text-white shadow-lg'
                        : 'border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                    aria-label={link.label}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm ${
                        isActive
                          ? 'border-white/40 bg-white/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 group-hover/item:border-white/30'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="hidden min-w-0 flex-1 flex-col group-hover/sidebar:flex">
                      <span className="truncate text-sm font-semibold leading-tight">{link.label}</span>
                      <span className="text-[11px] text-white/50">{pathname.startsWith(link.path) ? 'Active' : 'Navigate'}</span>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="space-y-4">
            <div className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 group-hover/sidebar:flex">
              <span className="h-px flex-1 bg-white/10" />
              Support
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <nav className="space-y-2">
              {supportLinks.map((link) => {
                const isActive = pathname.startsWith(link.path)
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group/item relative flex items-center gap-3 rounded-full border px-3 py-3 transition-colors duration-200 ${
                      isActive
                        ? 'border-white/15 bg-white/10 text-white shadow-lg'
                        : 'border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                    aria-label={link.label}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm ${
                        isActive
                          ? 'border-white/40 bg-white/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 group-hover/item:border-white/30'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="hidden min-w-0 flex-1 flex-col group-hover/sidebar:flex">
                      <span className="truncate text-sm font-semibold leading-tight">{link.label}</span>
                      <span className="text-[11px] text-white/50">{pathname.startsWith(link.path) ? 'Active' : 'Stay informed'}</span>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-4">
            <div className="hidden flex-col gap-3 text-sm text-white/70 group-hover/sidebar:flex">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-emerald-200" />
                <div className="leading-tight">
                  <div className="text-white">Credits available</div>
                  <div className="text-white/60">90</div>
                </div>
              </div>
              <button className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40">
                Add credits
              </button>
            </div>

            <button className="hidden items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white group-hover/sidebar:flex">
              <LifeBuoy className="h-5 w-5" />
              <span className="underline decoration-dotted underline-offset-4">Need help? Hover for support</span>
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70">
                <span className="text-sm font-semibold">NS</span>
              </div>
              <div className="hidden flex-col text-sm group-hover/sidebar:flex">
                <span className="text-white">Nadine Schneider</span>
                <span className="text-white/60">Admin · Clipbot</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col px-6 py-8">
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

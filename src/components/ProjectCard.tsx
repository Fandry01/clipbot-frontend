import { Link } from 'react-router-dom'

export type Project = {
  id: string
  title: string
  thumb?: string
  plan?: 'Free' | 'Pro' | string
  status?: 'Demo' | 'Ready' | 'Rendering' | 'Error' | string
  duration?: string
  coherence?: number
  hook?: number
}

function planBadge(plan?: string) {
  const cls = plan === 'Pro' ? 'badge bg-white text-black' : 'badge'
  return <span className={cls}>{plan ?? '—'}</span>
}

function statusBadge(status?: string) {
  const map: Record<string, string> = {
    Ready: 'badge bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Rendering: 'badge bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Error: 'badge bg-red-500/20 text-red-300 border-red-500/30',
    Demo: 'badge',
  }
  const cls = map[status ?? ''] || 'badge'
  return <span className={cls}>{status ?? '—'}</span>
}

export default function ProjectCard({ project }: { project: Project }) {
  const {
    id,
    title,
    thumb,
    plan,
    status,
    duration,
    coherence,
    hook,
  } = project

  const coh = typeof coherence === 'number' ? coherence : 0
  const hk = typeof hook === 'number' ? hook : 0

  return (
    <Link
      to={`/dashboard/project/${id}`}
      className="group block relative card overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/40"
      aria-label={`Open project ${title}`}
    >
      <div className="relative w-full h-40 bg-white/5">
        <img
          src={thumb || '/src/assets/thumb1.jpg'}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/src/assets/thumb-fallback.jpg' }}
        />
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {planBadge(plan)}
          {statusBadge(status)}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <h3 className="text-sm font-medium line-clamp-1" title={title}>{title}</h3>

        <div className="flex items-center gap-1">
          <span className="badge" title={`Coherence ${coh.toFixed(2)}`}>
            Coh {coh.toFixed(2)}
          </span>
          <span className="badge" title={`Hook ${hk.toFixed(2)}`}>
            Hook {hk.toFixed(2)}
          </span>
        </div>

        {duration ? (
          <div className="text-xs text-muted">{duration}</div>
        ) : (
          <div className="text-xs text-muted">—</div>
        )}
      </div>

      {/* Hover hint */}
      <div className="absolute inset-x-0 bottom-0 translate-y-10 group-hover:translate-y-0 transition">
        <div className="bg-black/50 backdrop-blur-sm p-2 flex items-center justify-center gap-2">
          <span className="text-xs text-white/80">Open project</span>
        </div>
      </div>
    </Link>
  )
}

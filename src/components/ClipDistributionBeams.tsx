import type { CSSProperties, ReactNode } from 'react'
import { Film, Instagram, Linkedin, Twitter } from 'lucide-react'

export type PlatformTarget = {
  id: string
  name: string
  accent: string
  icon: ReactNode
}

type ClipDistributionBeamsProps = {
  className?: string
  backgroundClassName?: string
  centralIcon?: ReactNode
  centralLabel?: string
  description?: string
  targets?: PlatformTarget[]
}

const defaultTargets: PlatformTarget[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    accent: '#f58529',
    icon: <Instagram className="h-5 w-5" aria-hidden />,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    accent: '#1da1f2',
    icon: <Twitter className="h-5 w-5" aria-hidden />,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    accent: '#0a66c2',
    icon: <Linkedin className="h-5 w-5" aria-hidden />,
  },
]

export default function ClipDistributionBeams({
  className,
  backgroundClassName,
  centralIcon = <Film className="h-8 w-8" aria-hidden />,
  centralLabel = 'Clip ready to share',
  description = 'Send your rendered clip directly into connected platforms.',
  targets = defaultTargets,
}: ClipDistributionBeamsProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-black/5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.3)] ${
        backgroundClassName ?? 'bg-[#f6f3ed]'
      } ${className ?? ''}`}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.6),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(13,110,253,0.05),transparent_35%)]" />

      <div className="relative flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Distribution</p>
            <h3 className="text-lg font-semibold text-slate-900">Platform beam router</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_15px_30px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-white to-[#f4efe7]" />
              <div className="relative flex items-center justify-center text-slate-900 drop-shadow-[0_6px_16px_rgba(0,0,0,0.15)]">
                {centralIcon}
              </div>
            </div>
            <div className="text-sm text-slate-700">{centralLabel}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-2 md:pt-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-slate-900 shadow-md ring-1 ring-black/5">
              <span className="text-slate-900 drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)]">{centralIcon}</span>
            </div>
            <div className="text-sm font-semibold text-slate-800">Clip output</div>
            <p className="text-xs text-slate-600">Auto-routes to targets</p>
          </div>

          <div className="flex-1 space-y-3">
            {targets.map((target) => {
              const beamStyle: CSSProperties = { ['--beam-color' as '--beam-color']: target.accent }
              return (
                <div key={target.id} className="flex items-center gap-3">
                  <div className="beam-track flex-1" style={beamStyle}>
                    <div className="beam-core" />
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-slate-900 shadow-md ring-1 ring-black/5">
                    <span className="text-[currentColor] opacity-90">{target.icon}</span>
                    <span className="text-sm font-semibold leading-none">{target.name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

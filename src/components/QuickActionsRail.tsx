// src/components/QuickActionsRail.tsx
import { Film, Captions, Video, Sparkles } from 'lucide-react'

const actions = [
  {
    icon: Film,
    label: 'Long → Shorts',
    chipClass: 'from-indigo-500/40 to-sky-500/40',
    iconClass: 'text-indigo-200',
  },
  {
    icon: Captions,
    label: 'AI Captions',
    chipClass: 'from-emerald-500/40 to-teal-500/40',
    iconClass: 'text-emerald-200',
  },
  {
    icon: Video,
    label: 'Video editor',
    chipClass: 'from-fuchsia-500/40 to-pink-500/40',
    iconClass: 'text-fuchsia-200',
  },
  {
    icon: Sparkles,
    label: 'AI Hook',
    chipClass: 'from-amber-500/40 to-orange-500/40',
    iconClass: 'text-amber-200',
  },
]

export default function QuickActionsRail() {
  return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        {actions.map(({ icon: Icon, label, chipClass, iconClass }) => (
            <div
                key={label}
                className="inline-flex items-center rounded-full border border-border/70 bg-white/2 px-3 py-2 text-sm text-text cursor-default select-none"
            >
              <div
                  className={`
              mr-2 h-7 w-7 rounded-full bg-gradient-to-br ${chipClass}
              flex items-center justify-center
            `}
              >
                <Icon size={16} className={iconClass} />
              </div>
              <span>{label}</span>
            </div>
        ))}
      </div>
  )
}

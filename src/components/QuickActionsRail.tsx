import { Scissors, Captions, Video, Waves, ScanFace, Sparkles } from 'lucide-react'

const actions = [
  { icon: Scissors, label: 'Long → Shorts' },
  { icon: Captions, label: 'AI Captions' },
  { icon: Video, label: 'Video editor' },
  { icon: Waves, label: 'Enhance speech' },
  { icon: ScanFace, label: 'AI Reframe' },
  { icon: Sparkles, label: 'AI Hook' },
]

export default function QuickActionsRail() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
      {actions.map(({ icon: Icon, label }) => (
        <button key={label} className="btn-ghost px-3 py-2">
          <Icon size={16} className="mr-2" />
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  )
}

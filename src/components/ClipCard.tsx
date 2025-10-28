import {fileOutUrl} from "../api/file";
import {useMemo} from "react";
import {useLatestClipAsset, useOnScreen} from "../api/hooks";

export type Clip = {
  id: string
  title: string
  thumb?: string
  duration: string // "MM:SS"
  score: number    // 0..100
  captions?: boolean
  scheduled?: boolean
}

type Props = {
  clip: Clip
  selectable?: boolean
  selected?: boolean
  onSelectToggle?: (id: string) => void
  onClick?: (c: Clip) => void
  onApprove?: (c: Clip) => void
  onEdit?: (c: Clip) => void
  onReject?: (c: Clip) => void
}

export default function ClipCard({
  clip,
  selectable = false,
  selected = false,
  onSelectToggle,
  onClick,
  onApprove,
  onEdit,
  onReject,
}: Props) {
  const { ref, inView } = useOnScreen<HTMLDivElement>('200px')
  const thumbQ = useLatestClipAsset(inView ? clip.id : undefined, 'THUMBNAIL')
  const resolvedThumb = useMemo(() => {
    if (thumbQ.data?.objectKey) return fileOutUrl(thumbQ.data.objectKey)
    return clip.thumb || '/thumb-fallback.jpg'
  }, [thumbQ.data, clip.thumb])

  const scoreColor =
    clip.score >= 90 ? 'text-emerald-400' :
    clip.score >= 80 ? 'text-green-400' :
    clip.score >= 70 ? 'text-yellow-300' : 'text-muted'

  return (
    <div
      className="group relative card overflow-hidden cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Clip ${clip.title} ${clip.duration} score ${clip.score}`}
      onClick={(e) => {
        // klik op checkbox of actieknoppen ≠ open preview
        const target = e.target as HTMLElement
        if (target.closest('input[type="checkbox"],[data-action]')) return
        onClick?.(clip)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(clip)
        }
      }}
    >
      <div className="relative w-full h-64 bg-white/5">
        <img
          src={resolvedThumb}
          alt={clip.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/src/assets/thumb1.jpg' }}
        />
        <div className="absolute top-2 right-2 text-xs flex gap-1">
          {clip.captions && <span className="badge">CC</span>}
          {clip.scheduled && <span className="badge">🗓</span>}
        </div>
        <div className="absolute top-2 left-2 text-xs">
          <span className="badge">{clip.duration}</span>
        </div>

        {/* checkbox */}
        {selectable && (
          <label
            className="absolute bottom-2 left-2 flex items-center gap-2 text-xs bg-black/40 rounded-lg px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selected}
              aria-label={`Select ${clip.title}`}
              onChange={() => onSelectToggle?.(clip.id)}
              onClick={(e) => e.stopPropagation()}
            />
            Select
          </label>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium line-clamp-2 pr-2">{clip.title}</h3>
          <div className={`font-semibold text-sm ${scoreColor}`}>{clip.score}</div>
        </div>
      </div>

      {/* Hover actions (desktop). Voor touch kun je deze tonen bij tap via parent state. */}
      <div className="absolute inset-x-0 bottom-0 translate-y-10 group-hover:translate-y-0 transition">
        <div className="bg-black/50 backdrop-blur-sm p-2 flex items-center justify-center gap-2">
          <button
            className="btn-ghost"
            data-action="approve"
            onClick={(e) => { e.stopPropagation(); onApprove?.(clip) }}
          >
            Approve
          </button>
          <button
            className="btn-ghost"
            data-action="edit"
            onClick={(e) => { e.stopPropagation(); onEdit?.(clip) }}
          >
            Edit
          </button>
          <button
            className="btn-ghost"
            data-action="reject"
            onClick={(e) => { e.stopPropagation(); onReject?.(clip) }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

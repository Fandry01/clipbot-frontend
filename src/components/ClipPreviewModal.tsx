// src/pages/ClipPreviewModal.tsx
import { X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import type { Clip } from './ClipCard'
import ClipPlayer from '../components/clipPlayer'

type Props = {
    open: boolean
    clip: Clip | null
    onClose: () => void
    onApprove: (c: Clip) => void
    onReject: (c: Clip) => void
    onEdit: (c: Clip) => void
    onRender?: (c: Clip) => void
}

export default function ClipPreviewModal({
                                             open,
                                             clip,
                                             onClose,
                                             onApprove,
                                             onReject,
                                             onEdit,
                                             onRender = () => {},
                                         }: Props) {
    if (!open || !clip) return null

    const ownerExternalSubject =
        localStorage.getItem('ownerExternalSubject') || 'demo-user-1'

    const scoreLabel =
        typeof (clip as any).score === 'number'
            ? (clip as any).score.toFixed(2)
            : '—'

    const downloadingName = useMemo(() => {
        const cleanTitle =
            (clip.title || 'clip').replace(/[^\w\-\. ]+/g, '').trim() || 'clip'
        return `${cleanTitle}-${clip.id}.mp4`
    }, [clip.id, clip.title])

    // Escape sluiting
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Clip preview"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="card w-full max-w-3xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2 text-xs">
            <span className="badge bg-white/5 text-muted border-border">
              Clip preview
            </span>
                        {clip.duration && (
                            <span className="badge bg-white/5 text-muted border-border">
                {clip.duration}
              </span>
                        )}
                        <span className="badge bg-emerald-500/15 text-emerald-200 border-emerald-500/40">
              Score {scoreLabel}
            </span>
                    </div>
                    <button
                        className="btn-ghost px-2 py-1"
                        onClick={onClose}
                        aria-label="Close preview"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Video – via ClipPlayer zodat assets + subject goed gaan */}
                <div className="relative bg-white/5 aspect-video">
                    <ClipPlayer
                        key={clip.id}
                        clipId={clip.id}
                        ownerExternalSubject={ownerExternalSubject}
                        aspect="16:9"
                        // optioneel kun je hier later startAt / onTime gebruiken
                    />
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                    <h2 className="text-lg font-semibold line-clamp-2" title={clip.title}>
                        {clip.title}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-3">
                        {/* Why this clip */}
                        <div className="card p-3">
                            <div className="text-sm font-medium mb-1">
                                Why this clip
                            </div>
                            <p className="text-sm text-muted">
                                High hook density at start, duidelijke scene boundary en minimale kans op
                                woord-cuts. Ideaal als korte social clip.
                            </p>
                        </div>

                        {/* Transcript – coming soon */}
                        <div className="card p-3 opacity-60">
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-sm font-medium">
                                    Transcript snippet
                                </div>
                                <span className="badge bg-white/5 text-muted border-border">
                  Coming soon
                </span>
                            </div>
                            <p className="text-sm text-muted line-clamp-4">
                                Binnenkort kun je hier de belangrijkste regels van het transcript zien
                                en specifieke momenten snel terugvinden.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <button
                            className="btn-ghost text-sm"
                            onClick={() => onEdit(clip)}
                        >
                            Open editor
                        </button>
                        <button
                            className="btn-ghost text-sm text-muted"
                            onClick={() => onRender(clip)}
                            title="Re-render clip"
                        >
                            Re-render
                        </button>
                        <button
                            className="btn-ghost text-sm text-red-300"
                            onClick={() => onReject(clip)}
                        >
                            Reject
                        </button>
                        <button
                            className="btn-primary text-sm"
                            onClick={() => onApprove(clip)}
                        >
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

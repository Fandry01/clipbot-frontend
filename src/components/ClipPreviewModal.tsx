import { X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import Player from '../components/Player'
import { fileOutUrl } from '../api/file'
import { useLatestClipAsset } from '../api/hooks'
import type { Clip } from './ClipCard'

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

    // Assets (alleen fetchen als open om chatter te voorkomen)
    const mp4Q   = useLatestClipAsset(open ? clip.id : undefined, 'CLIP_MP4')
    const vttQ   = useLatestClipAsset(open ? clip.id : undefined, 'SUB_VTT')
    const thumbQ = useLatestClipAsset(open ? clip.id : undefined, 'THUMBNAIL')

    const mp4Url = mp4Q.data?.objectKey ? fileOutUrl(mp4Q.data.objectKey) : undefined
    const vttUrl = vttQ.data?.objectKey ? fileOutUrl(vttQ.data.objectKey) : undefined
    const poster = thumbQ.data?.objectKey ? fileOutUrl(thumbQ.data.objectKey) : (clip.thumb || '/thumb-fallback.jpg')

    const downloadingName = useMemo(() => {
        const cleanTitle = (clip.title || 'clip').replace(/[^\w\-\. ]+/g, '').trim() || 'clip'
        return `${cleanTitle}-${clip.id}.mp4`
    }, [clip.id, clip.title])

    // Escape sluiting
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const loading = mp4Q.isLoading || thumbQ.isLoading

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Clip preview"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="card w-full max-w-3xl overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-border">
                    <div className="text-sm text-muted">
                        Preview · {clip.duration} · score {clip.score}
                    </div>
                    <button className="btn-ghost" onClick={onClose} aria-label="Close preview">
                        <X size={16} />
                    </button>
                </div>

                <div className="relative bg-white/5 aspect-video">
                    {loading && (
                        <div className="absolute inset-0 animate-pulse bg-white/5" />
                    )}

                    {mp4Url ? (
                        <Player
                            key={clip.id}                 // forceer reset bij clip wissel
                            src={mp4Url}
                            poster={poster}
                            aspect="16:9"
                            captionsVttUrl={vttUrl}
                            captionsLabel={vttUrl ? 'EN' : undefined}
                            downloadName={downloadingName}
                            resolveDownloadUrl={() => mp4Url}
                        />
                    ) : (
                        // Fallback zolang MP4 niet binnen is
                        <img
                            src={poster}
                            alt={clip.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="p-4 space-y-3">
                    <h2 className="text-lg font-semibold">{clip.title}</h2>

                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="card p-3">
                            <div className="text-sm font-medium mb-1">Why this clip</div>
                            <p className="text-sm text-muted">
                                High hook density at start; clear boundary; minimal word-cut risk.
                            </p>
                        </div>
                        <div className="card p-3">
                            <div className="text-sm font-medium mb-1">Transcript (snippet)</div>
                            <p className="text-sm text-muted line-clamp-4">
                                Coming soon…
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button className="btn-ghost" onClick={() => onEdit(clip)}>Open editor</button>
                        <button
                            className="btn-ghost"
                            onClick={() => onRender(clip)}
                            disabled={mp4Q.isPending}
                            title="Re-render clip"
                        >
                            Render
                        </button>
                        <button className="btn-ghost" onClick={() => onReject(clip)}>Reject</button>
                        <button className="btn-primary" onClick={() => onApprove(clip)}>Approve</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

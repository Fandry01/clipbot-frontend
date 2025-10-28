import { X } from 'lucide-react'
import type { Clip } from './ClipCard'
import { useEffect } from 'react'
import Player from './Player'
import { fileOutUrl } from '../api/file'
import { useLatestClipAsset } from '../api/hooks'

type Props = {
    open: boolean
    clip: Clip | null
    onClose: () => void
    onApprove: (c: Clip) => void
    onReject: (c: Clip) => void
    onEdit: (c: Clip) => void
    onRender?: (c: Clip) => void // optional
}

export default function ClipPreviewModal({
                                             open,
                                             clip,
                                             onClose,
                                             onApprove,
                                             onReject,
                                             onEdit,
                                             onRender = () => {}, // default noop
                                         }: Props) {
    if (!open || !clip) return null
    const mp4Q  = useLatestClipAsset(clip?.id, 'CLIP_MP4')
    const vttQ  = useLatestClipAsset(clip?.id, 'SUB_VTT')
    const thumbQ = useLatestClipAsset(clip?.id, 'THUMBNAIL')

    const mp4Url   = mp4Q.data ? fileOutUrl(mp4Q.data.objectKey) : undefined
    const vttUrl   = vttQ.data ? fileOutUrl(vttQ.data.objectKey) : undefined
    const poster   = thumbQ.data ? fileOutUrl(thumbQ.data.objectKey) : clip.thumb

    // Escape to close
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
            onClick={(e) => {
                // close when clicking the scrim (outside card)
                if (e.target === e.currentTarget) onClose()
            }}
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

                {/* media preview (placeholder) */}
                <div className="relative bg-white/5 aspect-video">
                    {/* vervang later door: <video src=... controls /> */}
                    <Player
                        src={mp4Url}                 // of .m3u8 als jij HLS serveert
                        poster={poster}
                        captionsVttUrl={vttUrl}
                        captionsLabel="EN"
                        downloadName={`${(clip.title || 'clip').replace(/[^\w\-\. ]+/g,'')}-${clip.id}.mp4`}
                        resolveDownloadUrl={() => mp4Url || ''} // eenvoudige download; evt. blob-route later
                    />
                </div>

                <div className="p-4 space-y-3">
                    <h2 className="text-lg font-semibold">{clip.title}</h2>

                    {/* Why + transcript snippet (stubs) */}
                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="card p-3">
                            <div className="text-sm font-medium mb-1">Why this clip</div>
                            <p className="text-sm text-muted">
                                High hook density at start; clear semantic boundary; minimal word-cut risk; strong sentiment shift.
                            </p>
                        </div>
                        <div className="card p-3">a
                            <div className="text-sm font-medium mb-1">Transcript (snippet)</div>
                            <p className="text-sm text-muted line-clamp-4">
                                “…and then we decided to go all-in on the ice cream truck. The first day we sold out in an hour…”
                            </p>
                        </div>
                    </div>

                    {/* one-tap fixes (stubs) */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="btn-ghost">Snap to sentence</button>
                        <button className="btn-ghost">+2s context</button>
                        <button className="btn-ghost">Normalize loudness</button>
                    </div>

                    {/* actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button className="btn-ghost" onClick={() => onEdit(clip)}>Open editor</button>
                        <button className="btn-ghost" onClick={() => onRender(clip)}>Render</button>
                        <button className="btn-ghost" onClick={() => onReject(clip)}>Reject</button>
                        <button className="btn-primary" onClick={() => onApprove(clip)}>Approve</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

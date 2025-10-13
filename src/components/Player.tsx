import { useEffect, useRef, useState } from 'react'

export default function Player({
                                   src,
                                   poster,
                                   aspect = '16:9',
                               }: {
    src?: string
    poster?: string
    aspect?: '16:9' | '9:16' | '1:1'
}) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [speed, setSpeed] = useState(1)

    // keyboard: J/K/L
    useEffect(() => {
        const el = videoRef.current
        if (!el) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'k') el.paused ? el.play() : el.pause()
            if (e.key === 'j') el.currentTime = Math.max(el.currentTime - 5, 0)
            if (e.key === 'l') el.currentTime = Math.min(el.currentTime + 5, el.duration || 1e6)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    const aspectClass =
        aspect === '9:16' ? 'aspect-[9/16]' : aspect === '1:1' ? 'aspect-square' : 'aspect-video'

    return (
        <div className="space-y-2">
            <div className={`relative bg-white/5 ${aspectClass} rounded-lg overflow-hidden`}>
                <video
                    ref={videoRef}
                    poster={poster}
                    src={src}
                    controls
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span className="badge">J −5s</span>
                <span className="badge">K Play/Pause</span>
                <span className="badge">L +5s</span>
                <select
                    className="ml-auto bg-transparent border border-border rounded-lg px-2 py-1"
                    value={speed}
                    onChange={(e) => {
                        const s = Number(e.target.value)
                        setSpeed(s)
                        if (videoRef.current) videoRef.current.playbackRate = s
                    }}
                >
                    {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                        <option key={s} value={s}>
                            {s}×
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

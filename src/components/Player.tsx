import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'

export type PlayerHandle = {
  seek: (t: number) => void
  play: () => void
  pause: () => void
  getCurrentTime: () => number
  setPlaybackRate: (r: number) => void
}

type Props = {
  src?: string
  poster?: string
  aspect?: '16:9' | '9:16' | '1:1'
  onTime?: (t: number) => void   // ✅ meld currentTime terug
}

const Player = React.forwardRef<PlayerHandle, Props>(function Player(
  { src, poster, aspect = '16:9', onTime },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [speed, setSpeed] = useState(1)

  // ✅ expose controls via ref
  useImperativeHandle(ref, () => ({
    seek: (t: number) => {
      if (!videoRef.current) return
      const v = videoRef.current
      const safe = Math.max(0, Math.min(t, Number.isFinite(v.duration) ? v.duration : t))
      v.currentTime = safe
    },
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    setPlaybackRate: (r: number) => {
      if (!videoRef.current) return
      videoRef.current.playbackRate = r
      setSpeed(r)
    },
  }), [])

  // keyboard: J/K/L (seek -5 / toggle / +5)
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k') el.paused ? el.play() : el.pause()
      if (e.key.toLowerCase() === 'j') el.currentTime = Math.max(el.currentTime - 5, 0)
      if (e.key.toLowerCase() === 'l') el.currentTime = Math.min(el.currentTime + 5, el.duration || 1e6)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ✅ tijd doorgeven aan parent
  useEffect(() => {
    const v = videoRef.current
    if (!v || !onTime) return
    const handler = () => onTime(v.currentTime || 0)
    v.addEventListener('timeupdate', handler)
    // bij initialisatie een eerste ping (optioneel)
    const meta = () => onTime(v.currentTime || 0)
    v.addEventListener('loadedmetadata', meta)
    return () => {
      v.removeEventListener('timeupdate', handler)
      v.removeEventListener('loadedmetadata', meta)
    }
  }, [onTime, src])

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
          playsInline
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
})

export default Player

import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'

export type PlayerHandle = {
  seek: (t: number) => void
  play: () => void
  pause: () => void
  getCurrentTime: () => number
  setPlaybackRate: (r: number) => void
}

type Props = {
  src?: string                 // MP4 of HLS (.m3u8)
  poster?: string
  aspect?: '16:9' | '9:16' | '1:1'
  captionsVttUrl?: string      // optioneel VTT
  captionsLabel?: string       // bv. "EN"
  downloadName?: string        // bestandsnaam bij download (bv. "clip.mp4")
  startAt?: number

  resolveDownloadUrl?: () => Promise<string> | string
  onTime?: (t: number) => void
}

const Player = forwardRef<PlayerHandle, Props>(function Player(
  { src, poster, aspect = '16:9', 
    captionsVttUrl, 
    captionsLabel = 'CC', 
    downloadName = 'clip.mp4', 
    resolveDownloadUrl, onTime, 
    startAt },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [speed, setSpeed] = useState(1)
  const [downloading, setDownloading] = useState(false)
  const [dlErr, setDlErr] = useState<string | null>(null)

  // Expose controls
  useImperativeHandle(ref, () => ({
    seek: (t: number) => {
      const v = videoRef.current; if (!v) return
      const safe = Math.max(0, Math.min(t, Number.isFinite(v.duration) ? v.duration : t))
      v.currentTime = safe
    },
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    setPlaybackRate: (r: number) => {
      const v = videoRef.current; if (!v) return
      v.playbackRate = r; setSpeed(r)
    },
  }), [])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !src) return

    const applyStartAt = () => {
      if (typeof startAt === 'number' && Number.isFinite(startAt)) {
        v.currentTime = Math.max(0, startAt)
      }
    }

    v.src = src

    if (v.readyState >= 1) {
      applyStartAt()
    } else {
      v.addEventListener('loadedmetadata', applyStartAt, { once: true })
    }

    return () => v.removeEventListener('loadedmetadata', applyStartAt)
  }, [src, startAt])

  // Keyboard J/K/L
  useEffect(() => {
    const v = videoRef.current; if (!v) return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'k') v.paused ? v.play() : v.pause()
      if (k === 'j') v.currentTime = Math.max(v.currentTime - 5, 0)
      if (k === 'l') v.currentTime = Math.min(v.currentTime + 5, v.duration || 1e6)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // onTime callback
  useEffect(() => {
    const v = videoRef.current
    if (!v || !onTime) return
    const tick = () => onTime(v.currentTime || 0)
    const meta = () => onTime(v.currentTime || 0)
    v.addEventListener('timeupdate', tick)
    v.addEventListener('loadedmetadata', meta)
    return () => { v.removeEventListener('timeupdate', tick); v.removeEventListener('loadedmetadata', meta) }
  }, [onTime, src])

  const aspectClass =
    aspect === '9:16' ? 'aspect-[9/16]' : aspect === '1:1' ? 'aspect-square' : 'aspect-video'

    useEffect(() => {
    const v = videoRef.current; if (!v) return
    const onErr = () => console.warn('video error', v.error)
    const onMeta = () => console.log('loadedmetadata', { dur: v.duration })
    const onPlay = () => console.log('play')
    v.addEventListener('error', onErr)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('play', onPlay)
    return () => { v.removeEventListener('error', onErr); v.removeEventListener('loadedmetadata', onMeta); v.removeEventListener('play', onPlay) }
    }, [src])
  // Download handler
  const onDownload = async () => {
    if (!resolveDownloadUrl) return
    setDlErr(null); setDownloading(true)
    try {
      const url = await resolveDownloadUrl()
      // als het een directe link is → gewoon navigeren (respecteert CORS/headers)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadName
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e: any) {
      setDlErr(e?.message || 'Download mislukt')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className={`relative bg-white/5 ${aspectClass} rounded-lg overflow-hidden`}>
        <video
          ref={videoRef}
          poster={poster}
          controls
          className="w-full h-full object-cover"
          playsInline
          crossOrigin="anonymous"
           {...(src && !src.endsWith('.m3u8') ? { src } : {})}
        >
          {captionsVttUrl && (
            <track
              kind="subtitles"
              src={captionsVttUrl}
              srcLang="en"
              label={captionsLabel}
              default
            />
          )}
        </video>
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
            <option key={s} value={s}>{s}×</option>
          ))}
        </select>

        {resolveDownloadUrl && (
          <button
            className="btn-secondary"
            onClick={onDownload}
            disabled={downloading}
            title={downloadName}
          >
            {downloading ? 'Downloading…' : 'Download'}
          </button>
        )}
      </div>

      {dlErr && <div className="text-xs text-red-400">{dlErr}</div>}
    </div>
  )
})

export default Player

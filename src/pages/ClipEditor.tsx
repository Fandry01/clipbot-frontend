import {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import ClipPlayer from '../components/clipPlayer'
import {PlayerHandle} from '../components/Player'
import QualityChecklist from '../components/QualityChecklist'
import {usePatchClip} from '../api/hooks'
import {SUBTITLE_STYLE_PRESETS, SubtitlePresetId, getSubtitlePreset} from "../subtitles/styles";

// ✅ lokaal trim-type + helpers
type Trim = { in: number; out: number }
const TRIM_KEY = (id: string) => `clip.${id}.trim`

function loadTrim(id: string): Trim {
    try {
        return JSON.parse(localStorage.getItem(TRIM_KEY(id)) || '')
    } catch {
    }
    return {in: 0, out: 30}
}

function saveTrimLocal(id: string, v: Trim) {
    try {
        localStorage.setItem(TRIM_KEY(id), JSON.stringify(v))
    } catch {
    }
}

export default function ClipEditor() {
    const {id = ''} = useParams()                 // ← id als string
    const ownerExternalSubject = localStorage.getItem('ownerExternalSubject') || 'demo-user-1'
    const nav = useNavigate()
    const patchClip = usePatchClip()

    const [aspect, setAspect] = useState<'16:9' | '9:16' | '1:1'>('9:16')
    const [tab, setTab] = useState<'trim' | 'sub' | 'brand' | 'export'>('trim')
    const [qc] = useState({boundary: true, noWordCut: true, leadInOut: true, loudness: true, subtitleCps: true})

    const [subtitlePresetId, setSubtitlePresetId] = useState<SubtitlePresetId>('TIKTOK_POP')
    const subtitlePreset = getSubtitlePreset(subtitlePresetId)
    const subtitleStyle = subtitlePreset.style

    // ✅ trim state + undo/redo + current time
    const [trim, setTrim] = useState<Trim>(() => loadTrim(id))
    const [undoStack, setUndo] = useState<Trim[]>([])
    const [redoStack, setRedo] = useState<Trim[]>([])
    const [currentTime, setCurrentTime] = useState(0)

    // ✅ player ref (voor keyboard seek)
    const playerRef = useRef<PlayerHandle>(null)

    const [isExporting, setIsExporting] = useState(false)
    const [lastExportJobId, setLastExportJobId] = useState<string | null>(null)

    // ✅ state change helper
    const push = (next: Trim) => {
        setUndo(u => [...u, trim])
        setRedo([])
        setTrim(next)
        saveTrimLocal(id, next)
    }
    const undo = () => setUndo(u => {
        if (!u.length) return u
        const prev = u[u.length - 1]
        setRedo(r => [trim, ...r])
        setTrim(prev);
        saveTrimLocal(id, prev)
        return u.slice(0, -1)
    })
    const redo = () => setRedo(r => {
        if (!r.length) return r
        const next = r[0]
        setUndo(u => [...u, trim])
        setTrim(next);
        saveTrimLocal(id, next)
        return r.slice(1)
    })

    // ✅ keyboard: I/O + arrows + J/K/L
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const step = e.shiftKey ? 1.0 : e.altKey ? 0.05 : 0.2
            if (e.key === 'ArrowLeft') playerRef.current?.seek(Math.max(0, currentTime - step))
            if (e.key === 'ArrowRight') playerRef.current?.seek(currentTime + step)
            if (e.key.toLowerCase() === 'j') playerRef.current?.seek(Math.max(0, currentTime - 5))
            if (e.key.toLowerCase() === 'l') playerRef.current?.seek(currentTime + 5)
            if (e.key.toLowerCase() === 'k') {
                // play/pause toggle via Player controls werkt al; optioneel
            }
            if (e.key.toLowerCase() === 'i') {
                if (currentTime < trim.out) push({...trim, in: Math.max(0, currentTime)})
            }
            if (e.key.toLowerCase() === 'o') {
                if (currentTime > trim.in) push({...trim, out: Math.max(currentTime, trim.in + 0.05)})
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                e.shiftKey ? redo() : undo()
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [currentTime, trim])

    // ✅ backend save (PATCH /v1/clips/:id)
    const saveTrim = async () => {
        if (!id) return
        await patchClip.mutateAsync({
            id,
            startMs: Math.round(trim.in * 1000),
            endMs: Math.round(trim.out * 1000),
        })
        alert('Saved')
    }

    const handleExport = async () => {
        if (!id) return
        setIsExporting(true)
        try {
            const res = await fetch(`/v1/render/export?ownerExternalSubject=${encodeURIComponent(ownerExternalSubject)}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        clipId: id,
                        subtitleStyle,
                        profile: null,
                    }),
                },)
            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || 'export Failed')
            }
            const jobId = await res.text()
            setLastExportJobId(jobId)
            alert(`export gestart (jobId: ${jobId}`)
        } catch (e: any) {
            console.error('Export Failed', e)
            alert(`Export failed: ${e?.message || e}`)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* LEFT: player + timeline + tabs */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Editing clip {id}</div>
                    <div className="flex items-center gap-2">
                        <button className="btn-ghost" onClick={undo} disabled={!undoStack.length}>↶ Undo</button>
                        <button className="btn-ghost" onClick={redo} disabled={!redoStack.length}>↷ Redo</button>
                        <button className="btn-primary" onClick={saveTrim}>Save</button>
                        <button className="btn-ghost" onClick={() => nav(-1)}>Back</button>
                    </div>
                </div>

                <ClipPlayer
                    ref={playerRef}
                    clipId={id}
                    aspect={aspect}
                    ownerExternalSubject={ownerExternalSubject}
                    onTime={setCurrentTime}         // ← nodig voor active time + I/O
                />

                {/* timeline placeholder (visueel) */}
                <div className="card p-3">
                    <div className="text-sm mb-2">Timeline</div>
                    <div className="h-24 bg-gradient-to-r from-white/10 to-white/5 rounded-lg relative">
                        {/* current time needle */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-white"
                             style={{left: `${Math.min(100, (currentTime / 180) * 100)}%`}}/>
                        {/* geselecteerde range highlight */}
                        <div className="absolute inset-y-0 bg-white/20"
                             style={{
                                 left: `${(trim.in / 180) * 100}%`,
                                 width: `calc(${(trim.out / 180) * 100}% - ${(trim.in / 180) * 100}%)`
                             }}/>
                        <div className="absolute inset-x-0 bottom-0 text-[10px] text-muted px-2 py-1">
                            waveform placeholder · Range {fmt(trim.in)}–{fmt(trim.out)} · Now {fmt(currentTime)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        <button className="btn-ghost" onClick={() => push({...trim, in: Math.max(0, currentTime)})}>I
                            (Set In)
                        </button>
                        <button className="btn-ghost"
                                onClick={() => push({...trim, out: Math.max(currentTime, trim.in + 0.05)})}>O (Set Out)
                        </button>
                        <button className="btn-ghost"
                                onClick={() => push({in: Math.max(0, trim.in - 0.2), out: trim.out})}>-0.2s In
                        </button>
                        <button className="btn-ghost" onClick={() => push({in: trim.in, out: trim.out + 0.2})}>+0.2s
                            Out
                        </button>
                        <div className="ml-auto text-muted">Use J/K/L, arrows, Alt/Shift</div>
                    </div>
                </div>

                {/* tabs */}
                <div className="card p-3">
                    <div className="flex items-center gap-2 mb-3">
                        {(['trim', 'sub', 'brand', 'export'] as const).map(t => (
                            <button
                                key={t}
                                className={`px-3 py-1 rounded-full text-sm border ${tab === t ? 'bg-white text-black border-white' : 'border-border hover:bg-white/5'}`}
                                onClick={() => setTab(t)}
                            >
                                {t === 'trim' ? 'Trim' : t === 'sub' ? 'Subtitles' : t === 'brand' ? 'Brand' : 'Export'}
                            </button>
                        ))}
                    </div>

                    {tab === 'trim' &&
                        <div className="text-sm text-muted">Set in/out met I/O, pijltjes voor seek (Alt = fijn, Shift =
                            grof). Save = PATCH naar backend.</div>}

                    {tab === 'sub' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Subtitle style</div>
                                    <div className="text-xs text-muted">
                                        Kies een preset; later gebruiken we deze bij export.
                                    </div>
                                </div>
                                <div className="text-xs text-muted">
                                    Aspect: {aspect}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {SUBTITLE_STYLE_PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        className={
                                            'px-3 py-1 rounded-full text-xs border ' +
                                            (subtitlePresetId === preset.id
                                                ? 'bg-white text-black border-white'
                                                : 'border-border hover:bg-white/5')
                                        }
                                        onClick={() => setSubtitlePresetId(preset.id)}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            <div className="card p-2 space-y-1">
                                <div className="text-xs font-medium">{subtitlePreset.label}</div>
                                {subtitlePreset.description && (
                                    <div className="text-[11px] text-muted">{subtitlePreset.description}</div>
                                )}
                                <div className="mt-1 text-[11px] text-muted">
                                    {subtitleStyle.fontFamily} · {subtitleStyle.fontSize}px ·
                                    {' '}align {subtitleStyle.alignment} · outline {subtitleStyle.outline}px
                                </div>
                                {/* simpele “preview” tekst */}
                                <div className="mt-2 text-center text-sm">
                                    <span
                                        style={{
                                          fontFamily: subtitleStyle.fontFamily,
                                          fontSize: subtitleStyle.fontSize,
                                          color: subtitleStyle.primaryColor,
                                          textShadow:
                                              subtitleStyle.outline > 0
                                                  ? `0 0 ${subtitleStyle.outline}px ${subtitleStyle.outlineColor}`
                                                  : undefined,
                                        }}
                                    >
                                      Dit is een voorbeeld ondertitel
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'brand' && (
                        <div className="space-y-2 text-sm">
                            <div>Logo: <span className="badge">upload</span></div>
                            <div>Colors: <span className="badge">primary</span> <span className="badge">secondary</span>
                            </div>
                            <div>Font: <span className="badge">Inter</span></div>
                        </div>
                    )}

                    {tab === 'export' && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Preset</span>
                                <button className="btn-ghost">TikTok (9:16)</button>
                                <button className="btn-ghost">YouTube (16:9)</button>
                                <button className="btn-ghost">Square (1:1)</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Resolution</span>
                                <select className="bg-transparent border border-border rounded-lg px-2 py-1 text-sm">
                                    <option>1080x1920</option>
                                    <option>720x1280</option>
                                </select>
                            </div>
                          <div className="text-xs text-muted">
                            Export gebruikt: <span className="font-medium">{subtitlePreset.label}</span> Subtitle Style.
                          </div>
                            <button className="btn-primary mt-2"
                            onClick={handleExport}
                            disabled={isExporting}>{isExporting ? 'Exporting…' : 'Export with current subtitle style'}</button>
                          {lastExportJobId && (<div className="text-[11px] text-muted mt-1"> Job ID{lastExportJobId}</div>
                          )}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: side tools */}
            <div className="space-y-3 lg:sticky lg:top-20 h-fit">
                <div className="card p-3 flex items-center gap-2">
                    <span className="text-sm">Aspect</span>
                    {(['16:9', '1:1', '9:16'] as const).map(a => (
                        <button
                            key={a}
                            className={`px-3 py-1 rounded-full text-sm border ${aspect === a ? 'bg-white text-black border-white' : 'border-border hover:bg-white/5'}`}
                            onClick={() => setAspect(a)}
                        >
                            {a}
                        </button>
                    ))}
                </div>
                <QualityChecklist qc={qc}/>
            </div>
        </div>
    )
}

function fmt(t: number) {
    const m = Math.floor(t / 60), s = Math.floor(t % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

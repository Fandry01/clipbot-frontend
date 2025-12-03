// src/pages/ClipEditor.tsx
import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ClipPlayer from '../components/clipPlayer'
import { PlayerHandle } from '../components/Player'
import QualityChecklist from '../components/QualityChecklist'
import { usePatchClip } from '../api/hooks'
import {
    SUBTITLE_STYLE_PRESETS,
    SubtitlePresetId,
    getSubtitlePreset,
    SubtitleFontId,
    getSubtitleFont,
} from '../subtitles/styles'
import ExportFlowModal from '../components/ExportFlowModal'


// ✅ lokaal trim-type + helpers
type Trim = { in: number; out: number }
const TRIM_KEY = (id: string) => `clip.${id}.trim`

function loadTrim(id: string): Trim {
    try {
        return JSON.parse(localStorage.getItem(TRIM_KEY(id)) || '')
    } catch {}
    return { in: 0, out: 30 }
}

function saveTrimLocal(id: string, v: Trim) {
    try {
        localStorage.setItem(TRIM_KEY(id), JSON.stringify(v))
    } catch {}
}

// 🔗 BrandTemplate localStorage payload (subset; alles optioneel)
type ActiveBrandTemplate = {
    layout?: '9:16' | '16:9' | '1:1'
    brandPrimaryColor?: string
    brandSecondaryColor?: string
    brandLogoDataUrl?: string | null
    subtitleFontId?: SubtitleFontId
    subtitlePrimaryColor?: string
    subtitleOutlineColor?: string
    subtitleOutlineWidth?: number
}

type ActiveBrandStorage = {
    projectId?: string
    tpl?: ActiveBrandTemplate
    at?: number
}

const BRAND_ACTIVE_KEY = 'brandTemplate.active'

export default function ClipEditor() {
    const { id = '' } = useParams() // ← id als string
    const ownerExternalSubject = localStorage.getItem('ownerExternalSubject') || 'demo-user-1'
    const nav = useNavigate()
    const patchClip = usePatchClip()
    const TOTAL_SECONDS = 180 // TODO: vervangen door echte clip duration


    const [aspect, setAspect] = useState<'16:9' | '9:16' | '1:1'>('9:16')
    const [tab, setTab] = useState<'trim' | 'sub' | 'brand' | 'export'>('trim')
    const [qc] = useState({ boundary: true, noWordCut: true, leadInOut: true, loudness: true, subtitleCps: true })

    // 🔗 actieve subtitle preset
    const [subtitlePresetId, setSubtitlePresetId] = useState<SubtitlePresetId>('TIKTOK_POP')
    const subtitlePreset = getSubtitlePreset(subtitlePresetId)

    // 🔗 actieve brand template (uit localStorage)
    const [brandTpl, setBrandTpl] = useState<ActiveBrandTemplate | null>(null)

    // ✅ trim state + undo/redo + current time
    const [trim, setTrim] = useState<Trim>(() => loadTrim(id))
    const [undoStack, setUndo] = useState<Trim[]>([])
    const [redoStack, setRedo] = useState<Trim[]>([])
    const [currentTime, setCurrentTime] = useState(0)

    // ✅ player ref (voor keyboard seek)
    const playerRef = useRef<PlayerHandle>(null)

    const [isExporting, setIsExporting] = useState(false)
    const [lastExportJobId, setLastExportJobId] = useState<string | null>(null)
    const [showExportModal, setShowExportModal] = useState(false)

    const playerWidthClass =
        aspect === '9:16'
            ? 'w-[260px] sm:w-[320px] lg:w-[360px]'              // vertical
            : aspect === '1:1'
                ? 'w-[320px] sm:w-[380px] lg:w-[420px]'              // square
                : 'w-full max-w-4xl'


    // 🔗 Load actieve brand template uit localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(BRAND_ACTIVE_KEY)
            if (!raw) return
            const parsed: ActiveBrandStorage = JSON.parse(raw)
            if (!parsed.tpl) return
            setBrandTpl(parsed.tpl)

            // Als layout in brand aanwezig is, gebruik die als default aspect
            if (parsed.tpl.layout) {
                setAspect(parsed.tpl.layout)
            }
        } catch {
            // ignore
        }
    }, [])

    // 🔗 Brand-aware subtitle style:
    // - basis: preset.style (size, margins, alignment, etc.)
    // - overrides vanuit brand: font + kleuren + outline
    const effectiveSubtitleStyle = useMemo(() => {
        const base = subtitlePreset.style
        if (!brandTpl) return base

        const fontOverride = brandTpl.subtitleFontId
            ? getSubtitleFont(brandTpl.subtitleFontId as SubtitleFontId)
            : null

        return {
            ...base,
            fontFamily: fontOverride?.ass ?? base.fontFamily,
            primaryColor: brandTpl.subtitlePrimaryColor ?? base.primaryColor,
            outlineColor: brandTpl.subtitleOutlineColor ?? base.outlineColor,
            outline:
                typeof brandTpl.subtitleOutlineWidth === 'number'
                    ? brandTpl.subtitleOutlineWidth
                    : base.outline,
        }
    }, [subtitlePreset, brandTpl])

    const previewFont = useMemo(() => {
        if (brandTpl?.subtitleFontId) {
            return getSubtitleFont(brandTpl.subtitleFontId as SubtitleFontId)
        }
        // fallback: font gebaseerd op preset alleen (ass-naam werkt niet perfect in CSS, maar beter dan niets)
        return null
    }, [brandTpl])

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
        setTrim(prev)
        saveTrimLocal(id, prev)
        return u.slice(0, -1)
    })
    const redo = () => setRedo(r => {
        if (!r.length) return r
        const next = r[0]
        setUndo(u => [...u, trim])
        setTrim(next)
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
                if (currentTime < trim.out) push({ ...trim, in: Math.max(0, currentTime) })
            }
            if (e.key.toLowerCase() === 'o') {
                if (currentTime > trim.in) push({ ...trim, out: Math.max(currentTime, trim.in + 0.05) })
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault()
                e.shiftKey ? redo() : undo()
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault()
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
            const res = await fetch(
                `/v1/render/export?ownerExternalSubject=${encodeURIComponent(ownerExternalSubject)}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clipId: id,
                        subtitleStyle: effectiveSubtitleStyle, // 🔗 brand-aware style meegeven
                        profile: null,
                    }),
                },
            )
            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || 'export Failed')
            }
            const jobId = await res.text()
            setLastExportJobId(jobId)
            alert(`export gestart (jobId: ${jobId})`)
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

                <div className="flex justify-center">
                    <div className={playerWidthClass}>
                        <ClipPlayer
                            ref={playerRef}
                            clipId={id}
                            aspect={aspect}
                            ownerExternalSubject={ownerExternalSubject}
                            onTime={setCurrentTime}
                        />
                    </div>
                </div>

                {/* timeline placeholder (visueel) */}
                {/* timeline */}
                <div className="card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Timeline</div>
                        <div className="text-[11px] text-muted">
                            In {fmt(trim.in)} · Out {fmt(trim.out)} · Now {fmt(currentTime)}
                        </div>
                    </div>

                    <div className="relative h-10 flex items-center">
                        {/* achtergrond rail */}
                        <div className="absolute inset-x-0 h-2 bg-white/5 rounded-full overflow-hidden">
                            {/* volledige duratie als lichte bar */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"/>
                            {/* geselecteerde range */}
                            <div
                                className="absolute inset-y-0 bg-white/30"
                                style={{
                                    left: `${(trim.in / TOTAL_SECONDS) * 100}%`,
                                    width: `calc(${(trim.out / TOTAL_SECONDS) * 100}% - ${(trim.in / TOTAL_SECONDS) * 100}%)`,
                                }}
                            />
                        </div>

                        {/* current time needle */}
                        <div
                            className="absolute top-0 bottom-0 flex flex-col items-center"
                            style={{left: `${Math.min(100, (currentTime / TOTAL_SECONDS) * 100)}%`}}
                        >
                            <div className="h-3 w-px bg-white/60"/>
                            <div className="h-4 w-px bg-white/30"/>
                            <div
                                className="mt-1 px-1.5 py-0.5 rounded-full bg-black/70 border border-border text-[10px]">
                                {fmt(currentTime)}
                            </div>
                        </div>

                        {/* IN marker */}
                        <div
                            className="absolute -top-3 flex flex-col items-center"
                            style={{left: `${(trim.in / TOTAL_SECONDS) * 100}%`}}
                        >
                            <div
                                className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-[10px] text-emerald-200">
                                IN
                            </div>
                            <div className="h-3 w-px bg-emerald-400/70"/>
                        </div>

                        {/* OUT marker */}
                        <div
                            className="absolute -top-3 flex flex-col items-center"
                            style={{left: `${(trim.out / TOTAL_SECONDS) * 100}%`}}
                        >
                            <div
                                className="px-1.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-[10px] text-rose-200">
                                OUT
                            </div>
                            <div className="h-3 w-px bg-rose-400/70"/>
                        </div>
                    </div>

                    {/* onderste controls blijven hetzelfde */}
                    <div className="flex items-center gap-2 mt-1 text-sm">
                        <button className="btn-ghost" onClick={() => push({...trim, in: Math.max(0, currentTime)})}>
                            I (Set In)
                        </button>
                        <button
                            className="btn-ghost"
                            onClick={() => push({...trim, out: Math.max(currentTime, trim.in + 0.05)})}
                        >
                            O (Set Out)
                        </button>
                        <button
                            className="btn-ghost"
                            onClick={() => push({in: Math.max(0, trim.in - 0.2), out: trim.out})}
                        >
                            -0.2s In
                        </button>
                        <button
                            className="btn-ghost"
                            onClick={() => push({in: trim.in, out: trim.out + 0.2})}
                        >
                            +0.2s Out
                        </button>
                        <div className="ml-auto text-muted text-xs">
                            Range {fmt(trim.in)}–{fmt(trim.out)} · est. total {fmt(TOTAL_SECONDS)}
                        </div>
                    </div>
                </div>


                {/* tabs */}
                <div className="card p-3">
                    <div className="flex items-center gap-2 mb-3">
                        {(['trim', 'sub', 'brand', 'export'] as const).map(t => (
                            <button
                                key={t}
                                className={`px-3 py-1 rounded-full text-sm border ${
                                    tab === t ? 'bg-white text-black border-white' : 'border-border hover:bg-white/5'
                                }`}
                                onClick={() => setTab(t)}
                            >
                                {t === 'trim' ? 'Trim' : t === 'sub' ? 'Subtitles' : t === 'brand' ? 'Brand' : 'Export'}
                            </button>
                        ))}
                    </div>

                    {tab === 'trim' && (
                        <div className="text-sm text-muted">
                            Set in/out met I/O, pijltjes voor seek (Alt = fijn, Shift = grof). Save = PATCH naar
                            backend.
                        </div>
                    )}

                    {tab === 'sub' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">Subtitle style</div>
                                    <div className="text-xs text-muted">
                                        Kies een preset; export gebruikt deze stijl, gecombineerd met je brand.
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
                                    {effectiveSubtitleStyle.fontFamily} · {effectiveSubtitleStyle.fontSize}px ·
                                    align{' '}
                                    {effectiveSubtitleStyle.alignment} · outline {effectiveSubtitleStyle.outline}px
                                </div>
                                {/* simpele “preview” tekst */}
                                <div className="mt-2 text-center text-sm">
                  <span
                      style={{
                          fontFamily: previewFont?.css ?? effectiveSubtitleStyle.fontFamily,
                          fontSize: effectiveSubtitleStyle.fontSize,
                          color: effectiveSubtitleStyle.primaryColor,
                          textShadow:
                              effectiveSubtitleStyle.outline > 0
                                  ? `0 0 ${effectiveSubtitleStyle.outline}px ${effectiveSubtitleStyle.outlineColor}`
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
                            {brandTpl ? (
                                <>
                                    <div className="text-xs text-muted">
                                        Brand template actief vanuit Brand settings.
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">Primary:</span>
                                        <span
                                            className="inline-block h-4 w-4 rounded border border-border"
                                            style={{backgroundColor: brandTpl.brandPrimaryColor || '#FFB020'}}
                                        />
                                        <span className="text-xs">Secondary:</span>
                                        <span
                                            className="inline-block h-4 w-4 rounded border border-border"
                                            style={{backgroundColor: brandTpl.brandSecondaryColor || '#FFFFFF'}}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">Subtitle font:</span>
                                        <span className="badge">
                      {brandTpl.subtitleFontId || 'preset default'}
                    </span>
                                    </div>
                                    {brandTpl.brandLogoDataUrl && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">Logo:</span>
                                            <img
                                                src={brandTpl.brandLogoDataUrl}
                                                className="h-6 w-auto rounded bg-black/40 px-1"
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="text-xs text-muted mb-1">
                                        Geen actieve brand template gevonden. Stel er één in bij Brand settings.
                                    </div>
                                    <div>Logo: <span className="badge">upload in Brand</span></div>
                                    <div>Colors: <span className="badge">primary</span> <span
                                        className="badge">secondary</span></div>
                                    <div>Font: <span className="badge">preset font</span></div>
                                </>
                            )}
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
                                Export gebruikt: <span className="font-medium">{subtitlePreset.label}</span> subtitle
                                style.
                            </div>

                            <button
                                className="btn-primary mt-2"
                                onClick={() => setShowExportModal(true)}
                            >
                                Export options…
                            </button>

                            {lastExportJobId && (
                                <div className="text-[11px] text-muted mt-1">
                                    Laatste export job ID: {lastExportJobId}
                                </div>
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
                            className={`px-3 py-1 rounded-full text-sm border ${
                                aspect === a ? 'bg-white text-black border-white' : 'border-border hover:bg-white/5'
                            }`}
                            onClick={() => setAspect(a)}
                        >
                            {a}
                        </button>
                    ))}
                </div>
                <QualityChecklist qc={qc} />
            </div>
            <ExportFlowModal
                open={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExportDownload={async () => {
                    await handleExport()
                    // optioneel: modal sluiten na start
                    // setShowExportModal(false)
                }}
                isExporting={isExporting}
                subtitleStyle={effectiveSubtitleStyle}
                aspect={aspect}
            />
        </div>
    )
}

function fmt(t: number) {
    const m = Math.floor(t / 60), s = Math.floor(t % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import UiSwitch from '../components/UiSwitch'
import UiRange from '../components/UiRange'
import UiSelect from '../components/UiSelect'
import { getSubtitleFont } from '../subtitles/styles'
import { SubtitleFontId, SUBTITLE_FONTS } from '../subtitles/styles'

type TemplateState = {
    preset: string
    layout: '9:16' | '16:9' | '1:1'
    captionStyle: string
    captionSize: number
    stroke: number
    overlay: boolean
    intro: boolean
    music: boolean
    removeFiller: boolean
    removePauses: boolean
    keywordsHL: boolean
    aiEmojis: boolean
    autoBroll: boolean
    autoTransitions: boolean

    brandPrimaryColor: string
    brandSecondaryColor: string
    subtitleFontId: SubtitleFontId
    subtitlePrimaryColor: string
    subtitleOutlineColor: string
    subtitleOutlineWidth: number
    brandLogoDataUrl: string | null
}

const STORAGE_KEY = 'brandTemplate.v1'
const ACTIVE_KEY = 'brandTemplate.active' // applied to a project

export default function BrandTemplate() {
    const nav = useNavigate()
    const [sp] = useSearchParams()
    // optioneel: ?project=1 om meteen terug te linken
    const [projectId, setProjectId] = useState(sp.get('project') ?? '1')

    // ---------- state (met defaults) ----------
    const [preset, setPreset] = useState('preset1')
    const [layout, setLayout] = useState<'9:16' | '16:9' | '1:1'>('9:16')
    const [captionStyle, setCaptionStyle] = useState('one-line')
    const [captionSize, setCaptionSize] = useState(54)
    const [stroke, setStroke] = useState(2)
    const [overlay, setOverlay] = useState(true)
    const [intro, setIntro] = useState(false)
    const [music, setMusic] = useState(false)
    const [removeFiller, setRemoveFiller] = useState(false)
    const [removePauses, setRemovePauses] = useState(false)
    const [keywordsHL, setKeywordsHL] = useState(true)
    const [aiEmojis, setAiEmojis] = useState(true)
    const [autoBroll, setAutoBroll] = useState(false)
    const [autoTransitions, setAutoTransitions] = useState(false)
    const [brandPrimaryColor, setBrandPrimaryColor] = useState('#FFB020')
    const [brandSecondaryColor, setBrandSecondaryColor] = useState('#FFFFFF')
    const [subtitleFontId, setSubtitleFontId] = useState<SubtitleFontId>('roboto')
    const [subtitlePrimaryColor, setSubtitlePrimaryColor] = useState('#FFFFFF')
    const [subtitleOutlineColor, setSubtitleOutlineColor] = useState('#000000')
    const [subtitleOutlineWidth, setSubtitleOutlineWidth] = useState(2)

    const subtitleFont = getSubtitleFont(subtitleFontId)
    const [brandLogoDataUrl, setBrandLogoDataUrl] = useState<string | null>(null)
    const logoInputRef = useRef<HTMLInputElement | null>(null)


    // compose tot één object (makkelijker saven)
    const tpl: TemplateState = useMemo(() => ({
        preset, layout, captionStyle, captionSize, stroke,
        overlay, intro, music,
        removeFiller, removePauses, keywordsHL, aiEmojis, autoBroll, autoTransitions,
        brandPrimaryColor, brandSecondaryColor, subtitleFontId, subtitlePrimaryColor, subtitleOutlineColor,
        subtitleOutlineWidth, brandLogoDataUrl,
    }), [preset, layout, captionStyle, captionSize, stroke, overlay, intro, music, removeFiller, removePauses,
        keywordsHL, aiEmojis, autoBroll, autoTransitions,brandPrimaryColor, brandSecondaryColor,
        subtitleFontId, subtitlePrimaryColor, subtitleOutlineColor, subtitleOutlineWidth,  brandLogoDataUrl,  ])

    // ---------- LOAD once ----------
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) return
            const saved: TemplateState = JSON.parse(raw)
            setPreset(saved.preset ?? 'preset1')
            setLayout(saved.layout ?? '9:16')
            setCaptionStyle(saved.captionStyle ?? 'one-line')
            setCaptionSize(saved.captionSize ?? 54)
            setStroke(saved.stroke ?? 2)
            setOverlay(!!saved.overlay)
            setIntro(!!saved.intro)
            setMusic(!!saved.music)
            setRemoveFiller(!!saved.removeFiller)
            setRemovePauses(!!saved.removePauses)
            setKeywordsHL(saved.keywordsHL ?? true)
            setAiEmojis(saved.aiEmojis ?? true)
            setAutoBroll(!!saved.autoBroll)
            setAutoTransitions(!!saved.autoTransitions)
            setBrandPrimaryColor(saved.brandPrimaryColor ?? '#FFB020')
            setBrandSecondaryColor(saved.brandSecondaryColor ?? '#FFFFFF')
            setSubtitleFontId(saved.subtitleFontId ?? 'roboto')
            setSubtitlePrimaryColor(saved.subtitlePrimaryColor ?? '#FFFFFF')
            setSubtitleOutlineColor(saved.subtitleOutlineColor ?? '#000000')
            setSubtitleOutlineWidth(saved.subtitleOutlineWidth ?? 2)
            setBrandLogoDataUrl(saved.brandLogoDataUrl ?? null)
        } catch {}
    }, [])

    // ---------- AUTO-SAVE ----------
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tpl))
        } catch {}
    }, [tpl])

    const save = () => alert('Template saved (local)')
    const undo = () => alert('Undo (stub)')
    const redo = () => alert('Redo (stub)')

    // ---------- APPLY ----------
    const applyToProject = () => {
        try {
            // markeer als ‘actief’; ProjectClips kan dit uitlezen
            localStorage.setItem(ACTIVE_KEY, JSON.stringify({ projectId, tpl, at: Date.now() }))
        } catch {}
        nav(`/dashboard/project/${projectId}?applied=1`)
    }
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setBrandLogoDataUrl(reader.result) // data:image/...;base64,....
            }
        }
        reader.readAsDataURL(file)
    }
    const previewContainerClass =
        layout === '9:16'
            ? 'aspect-[9/16] w-[260px] sm:w-[320px] lg:w-[360px]'
            : layout === '16:9'
                ? 'aspect-[16/9] w-[420px] sm:w-[480px] lg:w-[560px]'
                : 'aspect-[1/1] w-[320px] sm:w-[360px] lg:w-[380px]'

    return (
        <div className="space-y-4">
            {/* Topbar actions */}
            <div className="flex items-center gap-3">
                <div className="text-sm text-muted">Brand template · quickly setup your video template</div>
                <div className="ml-auto flex items-center gap-2">
                    <UiSelect
                        value={preset}
                        onChange={setPreset}
                        options={[
                            { value: 'preset1', label: 'Preset template 1' },
                            { value: 'preset2', label: 'Preset template 2' },
                        ]}
                    />
                    <button className="btn-ghost" onClick={undo}>↶</button>
                    <button className="btn-ghost" onClick={redo}>↷</button>
                    <button className="btn-primary" onClick={save}>Save template</button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
                {/* LEFT: settings panel */}
                <aside className="card p-3 h-fit xl:sticky xl:top-20 space-y-3">
                    <Section title="Style">
                        <Row label="Clip layout settings">
                            <UiSelect
                                value={layout}
                                onChange={(v) => setLayout(v as any)}
                                options={[
                                    {value: '9:16', label: '9:16 fill fit'},
                                    {value: '16:9', label: '16:9'},
                                    {value: '1:1', label: '1:1'},
                                ]}
                            />
                        </Row>
                        <Row label="Caption">
                            <UiSelect
                                value={captionStyle}
                                onChange={setCaptionStyle}
                                options={[
                                    {value: 'one-line', label: 'one-line'},
                                    {value: 'two-line', label: 'two-lines'},
                                    {value: 'karaoke', label: 'karaoke'},
                                ]}
                            />
                        </Row>
                        <Row label="Caption size">
                            <UiRange value={captionSize} onChange={setCaptionSize} min={28} max={72}/>
                        </Row>
                        <Row label="Stroke width">
                            <UiRange value={stroke} onChange={setStroke} min={0} max={8}/>
                        </Row>
                    </Section>

                    <Section title="Brand">
                        <Row label="Overlay (logo, CTA)">
                            <UiSwitch checked={overlay} onChange={setOverlay}/>
                        </Row>
                        <Row label="Intro/Outro">
                            <UiSwitch checked={intro} onChange={setIntro}/>
                        </Row>
                        <Row label="Music">
                            <UiSwitch checked={music} onChange={setMusic}/>
                        </Row>
                        <Row label="Logo">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="btn-ghost text-xs"
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    {brandLogoDataUrl ? 'Change logo' : 'Upload logo'}
                                </button>
                                {brandLogoDataUrl && (
                                    <>
                                        <img
                                            src={brandLogoDataUrl}
                                            alt="Brand logo preview"
                                            className="h-6 w-auto rounded bg-black/40 px-1"
                                        />
                                        <button
                                            type="button"
                                            className="btn-ghost text-xs text-red-300"
                                            onClick={() => setBrandLogoDataUrl(null)}
                                        >
                                            Remove
                                        </button>
                                    </>
                                )}
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                />
                            </div>
                        </Row>
                        <Row label="Primary color">
                            <input
                                type="color"
                                value={brandPrimaryColor}
                                onChange={e => setBrandPrimaryColor(e.target.value)}
                                className="w-10 h-8 rounded border border-border bg-transparent"
                            />
                        </Row>
                        <Row label="Secondary color">
                            <input
                                type="color"
                                value={brandSecondaryColor}
                                onChange={e => setBrandSecondaryColor(e.target.value)}
                                className="w-10 h-8 rounded border border-border bg-transparent"
                            />
                        </Row>

                        <Row label="Subtitle font">
                            <UiSelect
                                value={subtitleFontId}
                                onChange={v => setSubtitleFontId(v as SubtitleFontId)}
                                options={Object.values(SUBTITLE_FONTS).map(f => ({
                                    value: f.id,
                                    label: f.label,
                                }))}
                            />
                        </Row>
                        <Row label="Subtitle color">
                            <input
                                type="color"
                                value={subtitlePrimaryColor}
                                onChange={e => setSubtitlePrimaryColor(e.target.value)}
                                className="w-10 h-8 rounded border border-border bg-transparent"
                            />
                        </Row>
                        <Row label="Outline color">
                            <input
                                type="color"
                                value={subtitleOutlineColor}
                                onChange={e => setSubtitleOutlineColor(e.target.value)}
                                className="w-10 h-8 rounded border border-border bg-transparent"
                            />
                        </Row>
                        <Row label="Outline width">
                            <UiRange
                                value={subtitleOutlineWidth}
                                onChange={setSubtitleOutlineWidth}
                                min={0}
                                max={8}
                            />
                        </Row>
                    </Section>

                    <Section title="AI (coming soon)">
                        <div className="space-y-2 opacity-50 pointer-events-none">
                            <div className="text-xs text-muted mb-1">
                                Deze AI-helpers komen na versie 1. Je kunt ze nu nog niet aanpassen.
                            </div>

                            <Row label="Remove filler words">
                                <UiSwitch checked={removeFiller} onChange={setRemoveFiller}/>
                            </Row>
                            <Row label="Remove pauses">
                                <UiSwitch checked={removePauses} onChange={setRemovePauses}/>
                            </Row>
                            <Row label="AI keywords highlighter">
                                <UiSwitch checked={keywordsHL} onChange={setKeywordsHL}/>
                            </Row>
                            <Row label="AI emojis">
                                <UiSwitch checked={aiEmojis} onChange={setAiEmojis}/>
                            </Row>
                            <Row label="Auto-generate stock B-roll">
                                <UiSwitch checked={autoBroll} onChange={setAutoBroll}/>
                            </Row>
                            <Row label="Auto transitions">
                                <UiSwitch checked={autoTransitions} onChange={setAutoTransitions}/>
                            </Row>
                        </div>
                    </Section>

                    <Section title="Apply to project">
                        <div className="flex items-center gap-2">
                            <input
                                className="bg-transparent border border-border rounded-lg px-3 py-2 text-sm w-24"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                placeholder="project id"
                            />
                            <button className="btn-primary" onClick={applyToProject}>Apply to project</button>
                        </div>
                        <div className="text-xs text-muted">Tip: open via <code>?project=1</code> in de URL om dit veld
                            te prefillen.
                        </div>
                    </Section>
                </aside>

                {/* CENTER: preview */}
                <main className="flex items-start justify-center">
                    <div className="space-y-3">
                        <div
                            className={`
                                relative bg-white/5 rounded-xl overflow-hidden shadow-card
                                ${previewContainerClass}
                              `}
                            >
                            <img
                                src="/src/assets/thumb1.jpg"
                                className="w-full h-full object-cover"
                            />

                            {overlay && (
                                <div className="absolute top-2 left-2 flex items-center gap-2">
                                    {brandLogoDataUrl ? (
                                        <img
                                            src={brandLogoDataUrl}
                                            alt="Brand logo"
                                            className="h-8 w-auto rounded-md bg-black/40 p-1"
                                        />
                                    ) : (
                                        <span
                                            className="badge"
                                            style={{backgroundColor: brandPrimaryColor, color: brandSecondaryColor}}
                                        >
                                      Demo
                                    </span>
                                    )}
                                </div>
                            )}

                            <div
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg"
                                style={{
                                    fontSize: `${captionSize}px`,
                                    fontFamily: subtitleFont.css,
                                    color: subtitlePrimaryColor,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    ...(subtitleOutlineWidth > 0
                                        ? {WebkitTextStroke: `${subtitleOutlineWidth}px ${subtitleOutlineColor}`}
                                        : {}),
                                }}
                            >
                                One line
                            </div>
                        </div>

                        <div className="text-sm text-muted">
                            {layout} · {captionStyle} · size {captionSize}px · outline {subtitleOutlineWidth}px ·
                            {overlay ? ' overlay' : ''}{intro ? ' · intro/outro' : ''}{music ? ' · music' : ''}
                        </div>
                    </div>
                </main>

            </div>
        </div>
    )
}

function Section({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="text-sm font-medium">{title}</div>
            <div className="space-y-2">{children}</div>
        </div>
    )
}

function Row({label, children}: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 border border-border rounded-lg p-2">
            <div className="text-sm flex-1">{label}</div>
            <div className="flex items-center gap-2">{children}</div>
        </div>
    )
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import UiSwitch from '../components/UiSwitch'
import UiRange from '../components/UiRange'
import UiSelect from '../components/UiSelect'
import { getSubtitleFont, SubtitleFontId, SUBTITLE_FONTS } from '../subtitles/styles'

// ✅ Vite-safe asset import
import thumb1 from '../assets/thumb1.jpg'

type TemplateState = {
  preset: string
  layout: '9:16' | '16:9' | '1:1'
  captionStyle: string
  captionSize: number
  overlay: boolean
  intro: boolean
  music: boolean
  removeFiller: boolean
  removePauses: boolean
  keywordsHL: boolean
  aiEmojis: boolean
  autoBroll: boolean
  autoTransitions: boolean
  subtitleBackground:boolean
  brandPrimaryColor: string
  brandSecondaryColor: string
  subtitleFontId: SubtitleFontId
  subtitlePrimaryColor: string
  subtitleOutlineColor: string
  subtitleOutlineWidth: number
  brandLogoDataUrl: string | null
}

const STORAGE_KEY = 'brandTemplate.v1'
const ACTIVE_KEY = 'brandTemplate.active'

// echte export resoluties (dit is wat je render pipeline ook moet gebruiken)
const RESOLUTIONS: Record<'9:16' | '16:9' | '1:1', { w: number; h: number }> = {
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
  '1:1': { w: 1080, h: 1080 },
}

const EXPORT_BASE_H = 1920

function ensureFontLoaded(font: { id: string; href?: string }) {
  if (!font.href) return
  const elId = `subtitle-font-${font.id}`
  if (document.getElementById(elId)) return

  const link = document.createElement('link')
  link.id = elId
  link.rel = 'stylesheet'
  link.href = font.href
  document.head.appendChild(link)
}

export default function BrandTemplate() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const [projectId, setProjectId] = useState(sp.get('project') ?? '1')

  // ---------- state (defaults) ----------
  const [preset, setPreset] = useState('preset1')
  const [layout, setLayout] = useState<'9:16' | '16:9' | '1:1'>('9:16')
  const [captionStyle, setCaptionStyle] = useState('one-line')
  const [captionSize, setCaptionSize] = useState(54)
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
  const [brandLogoDataUrl, setBrandLogoDataUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)

  const subtitleFont = getSubtitleFont(subtitleFontId)
  const [subtitleBackground, setSubtitleBackground] = useState(true)

  // ✅ load browser font when switching
  useEffect(() => {
    ensureFontLoaded(subtitleFont)
  }, [subtitleFontId]) // eslint-disable-line react-hooks/exhaustive-deps

  // compose tot één object (makkelijker saven)
  const tpl: TemplateState = useMemo(
    () => ({
      preset,
      layout,
      captionStyle,
      captionSize,
      overlay,
      intro,
      music,
      removeFiller,
      removePauses,
      keywordsHL,
      aiEmojis,
      autoBroll,
      autoTransitions,
      brandPrimaryColor,
      brandSecondaryColor,
      subtitleFontId,
      subtitlePrimaryColor,
      subtitleOutlineColor,
      subtitleOutlineWidth,
      brandLogoDataUrl,
      subtitleBackground,
    }),
    [
      preset,
      layout,
      captionStyle,
      captionSize,
      overlay,
      intro,
      music,
      removeFiller,
      removePauses,
      keywordsHL,
      aiEmojis,
      autoBroll,
      autoTransitions,
      brandPrimaryColor,
      brandSecondaryColor,
      subtitleFontId,
      subtitlePrimaryColor,
      subtitleOutlineColor,
      subtitleOutlineWidth,
      brandLogoDataUrl,
    ],
  )

  // ---------- LOAD once ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved: Partial<TemplateState> = JSON.parse(raw)

      setPreset(saved.preset ?? 'preset1')
      setLayout((saved.layout as any) ?? '9:16')
      setCaptionStyle(saved.captionStyle ?? 'one-line')
      setCaptionSize(saved.captionSize ?? 54)
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
      setSubtitleFontId((saved.subtitleFontId as any) ?? 'roboto')
      setSubtitlePrimaryColor(saved.subtitlePrimaryColor ?? '#FFFFFF')
      setSubtitleOutlineColor(saved.subtitleOutlineColor ?? '#000000')
      setSubtitleOutlineWidth(saved.subtitleOutlineWidth ?? 2)
      setBrandLogoDataUrl(saved.brandLogoDataUrl ?? null)
      setSubtitleBackground(saved.subtitleBackground ?? true)
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
      localStorage.setItem(ACTIVE_KEY, JSON.stringify({ projectId, tpl, at: Date.now() }))
    } catch {}
    nav(`/dashboard/project/${projectId}?applied=1`)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setBrandLogoDataUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // export resolution for selected layout
  const res = RESOLUTIONS[layout]
  const scaleFactor = res.h / EXPORT_BASE_H // 9:16 => 1.0, 1:1 & 16:9 => 0.5625
  const captionPx = Math.round(captionSize * scaleFactor)
  const outlinePx = Math.round(subtitleOutlineWidth * scaleFactor)

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
          <button className="btn-ghost" onClick={undo}>
            ↶
          </button>
          <button className="btn-ghost" onClick={redo}>
            ↷
          </button>
          <button className="btn-primary" onClick={save}>
            Save template
          </button>
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
                  { value: '9:16', label: '9:16' },
                  { value: '16:9', label: '16:9' },
                  { value: '1:1', label: '1:1' },
                ]}
              />
            </Row>

            <Row label="Caption">
              <UiSelect
                value={captionStyle}
                onChange={setCaptionStyle}
                options={[
                  { value: 'one-line', label: 'one-line' },
                  { value: 'two-line', label: 'two-lines' },
                ]}
              />
            </Row>

            <Row label="Caption size (export-based)">
              <UiRange value={captionSize} onChange={setCaptionSize} min={18} max={88} />
            </Row>

            <Row label="Outline width">
              <UiRange value={subtitleOutlineWidth} onChange={setSubtitleOutlineWidth} min={0} max={8} />
            </Row>
          </Section>

          <Section title="Brand">
            <Row label="Overlay (logo, CTA)">
              <UiSwitch checked={overlay} onChange={setOverlay} />
            </Row>
            <Row label="Intro/Outro">
              <UiSwitch checked={intro} onChange={setIntro} />
            </Row>
            <Row label="Music">
              <UiSwitch checked={music} onChange={setMusic} />
            </Row>

            <Row label="Logo">
              <div className="flex items-center gap-2">
                <button type="button" className="btn-ghost text-xs" onClick={() => logoInputRef.current?.click()}>
                  {brandLogoDataUrl ? 'Change logo' : 'Upload logo'}
                </button>
                {brandLogoDataUrl && (
                  <>
                    <img src={brandLogoDataUrl} alt="Brand logo preview" className="h-6 w-auto rounded bg-black/40 px-1" />
                    <button type="button" className="btn-ghost text-xs text-red-300" onClick={() => setBrandLogoDataUrl(null)}>
                      Remove
                    </button>
                  </>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
            </Row>

            <Row label="Primary color">
              <input
                type="color"
                value={brandPrimaryColor}
                onChange={(e) => setBrandPrimaryColor(e.target.value)}
                className="w-10 h-8 rounded border border-border bg-transparent"
              />
            </Row>

            <Row label="Secondary color">
              <input
                type="color"
                value={brandSecondaryColor}
                onChange={(e) => setBrandSecondaryColor(e.target.value)}
                className="w-10 h-8 rounded border border-border bg-transparent"
              />
            </Row>

            <Row label="Subtitle font">
              <UiSelect
                value={subtitleFontId}
                onChange={(v) => setSubtitleFontId(v as SubtitleFontId)}
                options={Object.values(SUBTITLE_FONTS).map((f) => ({
                  value: f.id,
                  label: f.label,
                }))}
              />
            </Row>

            <Row label="Subtitle color">
              <input
                type="color"
                value={subtitlePrimaryColor}
                onChange={(e) => setSubtitlePrimaryColor(e.target.value)}
                className="w-10 h-8 rounded border border-border bg-transparent"
              />
            </Row>

            <Row label="Outline color">
              <input
                type="color"
                value={subtitleOutlineColor}
                onChange={(e) => setSubtitleOutlineColor(e.target.value)}
                className="w-10 h-8 rounded border border-border bg-transparent"
              />
            </Row>
            <Row label="Subtitle background bar">
                <UiSwitch checked={subtitleBackground} onChange={setSubtitleBackground} />
            </Row>

          </Section>

          <Section title="AI (coming soon)">
            <div className="space-y-2 opacity-50 pointer-events-none">
              <div className="text-xs text-muted mb-1">Deze AI-helpers komen na versie 1. Je kunt ze nu nog niet aanpassen.</div>
              <Row label="Remove filler words">
                <UiSwitch checked={removeFiller} onChange={setRemoveFiller} />
              </Row>
              <Row label="Remove pauses">
                <UiSwitch checked={removePauses} onChange={setRemovePauses} />
              </Row>
              <Row label="AI keywords highlighter">
                <UiSwitch checked={keywordsHL} onChange={setKeywordsHL} />
              </Row>
              <Row label="AI emojis">
                <UiSwitch checked={aiEmojis} onChange={setAiEmojis} />
              </Row>
              <Row label="Auto-generate stock B-roll">
                <UiSwitch checked={autoBroll} onChange={setAutoBroll} />
              </Row>
              <Row label="Auto transitions">
                <UiSwitch checked={autoTransitions} onChange={setAutoTransitions} />
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
              <button className="btn-primary" onClick={applyToProject}>
                Apply to project
              </button>
            </div>
            <div className="text-xs text-muted">
              Tip: open via <code>?project=1</code> in de URL om dit veld te prefillen.
            </div>
          </Section>
        </aside>

        {/* CENTER: preview */}
        <main className="flex items-start justify-center">
          <div className="space-y-3">
            <ScaledPreview layout={layout} exportW={res.w} exportH={res.h}>
              {/* bg */}
              <img src={thumb1} className="absolute inset-0 w-full h-full object-cover" alt="preview" />

              {/* overlay */}
              {overlay && (
                <div className="absolute top-10 left-10 flex items-center gap-2">
                  {brandLogoDataUrl ? (
                    <img src={brandLogoDataUrl} alt="Brand logo" className="h-28 w-auto rounded-xl bg-black/40 p-2" />
                  ) : (
                    <span
                      style={{
                        backgroundColor: brandPrimaryColor,
                        color: brandSecondaryColor,
                        padding: '10px 14px',
                        borderRadius: 14,
                        fontSize: 28,
                        fontWeight: 800,
                      }}
                    >
                      Demo
                    </span>
                  )}
                </div>
              )}

              <CaptionPreview
                captionStyle={captionStyle}
                fontFamily={subtitleFont.css}
                color={subtitlePrimaryColor}
                outlineColor={subtitleOutlineColor}
                outlineWidth={outlinePx}
                fontSize={captionPx}
                exportH={res.h}
                exportW={res.w}
                subtitleBackground={subtitleBackground}
              />
            </ScaledPreview>

            <div className="text-sm text-muted">
              {layout} · {captionStyle} · size {captionSize}px · outline {subtitleOutlineWidth}px ·{overlay ? ' overlay' : ''}
              {intro ? ' · intro/outro' : ''}
              {music ? ' · music' : ''}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ScaledPreview({
  layout,
  exportW,
  exportH,
  children,
}: {
  layout: '9:16' | '16:9' | '1:1'
  exportW: number
  exportH: number
  children: React.ReactNode
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  const previewContainerClass =
    layout === '9:16'
      ? 'aspect-[9/16] w-[260px] sm:w-[320px] lg:w-[360px]'
      : layout === '16:9'
        ? 'aspect-[16/9] w-[420px] sm:w-[480px] lg:w-[560px]'
        : 'aspect-[1/1] w-[320px] sm:w-[360px] lg:w-[380px]'

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const compute = () => {
      const r = el.getBoundingClientRect()
      const s = Math.min(r.width / exportW, r.height / exportH)
      setScale(Number.isFinite(s) && s > 0 ? s : 1)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [exportW, exportH])

  return (
    <div ref={wrapRef} className={`relative bg-white/5 rounded-xl overflow-hidden shadow-card ${previewContainerClass}`}>
      {/* export-stage in echte pixels, dan schalen */}
      <div
        className="absolute left-0 top-0"
        style={{
          width: exportW,
          height: exportH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="relative w-full h-full">{children}</div>
      </div>

      {/* subtle safe-area hint */}
      <div className="pointer-events-none absolute inset-0 border border-white/10" />
    </div>
  )
}

function CaptionPreview({
  captionStyle,
  fontFamily,
  color,
  outlineColor,
  outlineWidth,
  fontSize,
  exportH,
  exportW,
  subtitleBackground,
}: {
  captionStyle: string
  fontFamily: string
  color: string
  outlineColor: string
  outlineWidth: number
  fontSize: number
  exportH: number
  exportW: number
  subtitleBackground: boolean
}) {
  const bottom = Math.round(exportH * 0.050)
  const boxW = Math.round(exportW * 0.97)

  const baseStyle: React.CSSProperties = {
    fontFamily,
    color,
    fontSize,
    fontWeight: 900,
    textAlign: 'center',
    lineHeight: 1.08,
    width:'100%',
    maxWidth: '100%',
    WebkitTextStroke: outlineWidth > 0 ? `${outlineWidth}px ${outlineColor}` : undefined,

    backgroundColor: subtitleBackground ? 'rgba(0,0,0,0.55)' : 'transparent',
    padding: subtitleBackground ? '14px 20px' : '0px',
    borderRadius: subtitleBackground ? 16 : 0,

    // als background uit staat, geef een beetje schaduw voor leesbaarheid
    textShadow: subtitleBackground ? undefined : '0 2px 10px rgba(0,0,0,0.55)',
  }

  if (captionStyle === 'karaoke') {
    const words = ['Karaoke', 'captions', 'should', 'highlight', 'word', 'by', 'word.']
    return (
      <>
        <style>{`
          @keyframes kFill { from { background-size: 0% 100%; } to { background-size: 100% 100%; } }
        `}</style>

        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom }}>
          <div style={{ ...baseStyle, backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {words.map((w, i) => (
                <span
                  key={i}
                  style={{
                    position: 'relative',
                    padding: '2px 6px',
                    borderRadius: 10,
                    backgroundImage: `linear-gradient(${color}, ${color})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '0% 100%',
                    backgroundSize: '0% 100%',
                    animation: `kFill 2.6s linear infinite`,
                    animationDelay: `${i * 0.22}s`,
                  }}
                >
                  {/* "inactive" */}
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>{w}</span>

                  {/* highlight overlay */}
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      padding: '2px 6px',
                      color,
                      WebkitTextStroke: outlineWidth > 0 ? `${outlineWidth}px ${outlineColor}` : undefined,
                      pointerEvents: 'none',
                      mixBlendMode: 'screen',
                    }}
                  >
                    {w}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

if (captionStyle === 'two-line') {
  const side = Math.round(exportW * 0.06) // 6% margins (pas aan)
  return (
    <div
      className="absolute left-0 right-0"
      style={{ bottom, paddingLeft: side, paddingRight: side }}
    >
      <div
        style={{
          ...baseStyle,
          width: '100%',
          whiteSpace: 'pre-line',
          textAlign: 'center',
          borderRadius: 16,
        }}
      >
        {'This is a two line caption example\nthat should wrap nicely.\nAnd stay readable.'}
      </div>
    </div>
  )
}
  // one-line
const side = Math.round(exportW * 0.06)
return (
  <div className="absolute left-0 right-0" style={{ bottom, paddingLeft: side, paddingRight: side }}>
    <div style={{ ...baseStyle, width: '100%', whiteSpace: 'nowrap' }}>
      This is one line.
    </div>
  </div>
)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border border-border rounded-lg p-2">
      <div className="text-sm flex-1">{label}</div>
      <div className="flex items-center gap-2 w-[170px]">{children}</div>
    </div>
  )
}

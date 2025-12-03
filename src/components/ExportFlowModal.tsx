import {Download, X} from 'lucide-react'
import type { SubtitleStyle } from '../subtitles/styles'

type Props = {
    open: boolean
    onClose: () => void
    onExportDownload: () => Promise<void>   // roept jouw backend export aan
    isExporting: boolean
    subtitleStyle: SubtitleStyle
    aspect: '16:9' | '9:16' | '1:1'
}
type PublishButtonProps = {
    label: string
    // icon as ReactNode zodat jij er later Flaticon / SVG in kunt duwen
    icon: React.ReactNode
    brandClass: string
}
function PublishButton({ label, icon, brandClass }: PublishButtonProps) {
    return (
        <button className={`btn-ghost w-full justify-center gap-1 text-xs ${brandClass}`}>
            {icon}
            <span>{label}</span>
        </button>
    )
}

export default function ExportFlowModal({
                                            open,
                                            onClose,
                                            onExportDownload,
                                            isExporting,
                                            subtitleStyle,
                                            aspect,
                                        }: Props) {
    if (!open) return null

    const aspectLabel =
        aspect === '9:16' ? 'Vertical (9:16)' :
            aspect === '1:1'  ? 'Square (1:1)'   :
                'Horizontal (16:9)'

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="card w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div>
                        <div className="text-sm font-medium">Export clip</div>du
                        <div className="text-xs text-muted">
                            Kies hoe je deze clip wilt gebruiken.
                        </div>
                    </div>
                    <button
                        className="btn-ghost px-2 py-1"
                        onClick={onClose}
                        aria-label="Close export flow"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Summary */}
                    <div className="text-xs text-muted border border-border rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center">
            <span className="badge bg-white/5 text-muted border-border">
              {aspectLabel}
            </span>
                        <span className="badge bg-white/5 text-muted border-border">
              {subtitleStyle.fontFamily} · {subtitleStyle.fontSize}px
            </span>
                        <span className="badge bg-white/5 text-muted border-border">
              Outline {subtitleStyle.outline}px
            </span>
                    </div>

                    {/* Download blok */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Download</div>
                        <p className="text-xs text-muted">
                            We renderen een MP4 met jouw huidige subtitle style. Download
                            en upload zelf naar je kanalen.
                        </p>
                        <button
                            className="btn-primary w-full flex items-center justify-center gap-2"
                            onClick={onExportDownload}
                            disabled={isExporting}
                        >
                            <Download size={16} />
                            {isExporting ? 'Exporting…' : 'Export & download MP4'}
                        </button>
                    </div>

                    {/* Direct publish – coming soon */}
                    <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Direct publish</div>
                            <span className="badge bg-white/5 text-muted border-border">
                Coming soon
              </span>
                        </div>
                        <p className="text-xs text-muted">
                            Straks kun je hier direct posten naar je kanalen. Voor nu kun je
                            eerst exporteren en daarna zelf uploaden.
                        </p>

                        <div className="grid grid-cols-3 gap-2 mt-1 opacity-60 pointer-events-none">
                            <PublishButton
                                label="TikTok"
                                icon={<span className="text-lg leading-none">𝅘</span>} // tijdelijke placeholder
                                brandClass="text-pink-500"
                            />
                            <PublishButton
                                label="YouTube"
                                icon={<span className="text-lg leading-none">▶</span>} // placeholder
                                brandClass="text-red-600"
                            />
                            <PublishButton
                                label="X"
                                icon={<span className="text-lg leading-none">𝕏</span>} // placeholder
                                brandClass="text-sky-400"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

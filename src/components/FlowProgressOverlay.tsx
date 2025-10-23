// src/components/FlowProgressOverlay.tsx
import { X } from 'lucide-react'

export default function FlowProgressOverlay({
                                                open,
                                                title,
                                                subtitle,
                                                percent,     // 0..100 voor determinate; undefined = indeterminate
                                                onCancel,    // optioneel
                                            }: {
    open: boolean
    title: string
    subtitle?: string
    percent?: number
    onCancel?: () => void
}) {
    if (!open) return null
    const determinate = typeof percent === 'number'

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card w-full max-w-md p-4 relative">
                {onCancel && (
                    <button className="btn-ghost absolute right-2 top-2" onClick={onCancel} aria-label="Cancel">
                        <X size={16} />
                    </button>
                )}

                <div className="space-y-3">
                    <div>
                        <div className="text-base font-semibold">{title}</div>
                        {subtitle && <div className="text-sm text-muted">{subtitle}</div>}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
                        {determinate ? (
                            <div
                                className="h-full bg-white transition-[width] duration-200"
                                style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
                            />
                        ) : (
                            <div className="h-full bg-white/60 animate-[progress_1.2s_linear_infinite]" />
                        )}
                    </div>

                    {/* % tekst bij determinate */}
                    {determinate && (
                        <div className="text-right text-xs text-muted">{Math.round(percent!)}%</div>
                    )}
                </div>
            </div>

            {/* keyframes voor indeterminate schuif */}
            <style>{`
        @keyframes progress {
          0%   { transform: translateX(-100%); width: 40%; }
          50%  { transform: translateX(20%);   width: 60%; }
          100% { transform: translateX(120%);  width: 40%; }
        }
      `}</style>
        </div>
    )
}

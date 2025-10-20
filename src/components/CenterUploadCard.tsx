import { useState, useRef } from 'react'
import { Upload, Link as LinkIcon, FolderOpen } from 'lucide-react'

type Source =
  | { type: 'url'; value: string; name?: string }
  | { type: 'file'; value: string; name?: string; file: File }

export default function CenterUploadCard({
  onStart,
  onTrySample, // optioneel: demo CTA
}: {
  onStart?: (source: Source) => void
  onTrySample?: () => void
}) {
  const [url, setUrl] = useState('')
  const [autosave, setAutosave] = useState(false)
  const [autoimport, setAutoimport] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const canSubmit = url.trim().length > 0

  const handleUrlSubmit = () => {
    const v = url.trim()
    if (!v) return
    onStart?.({ type: 'url', value: v })
  }

  const handleFileChange = (file?: File) => {
    if (!file) return
    // Object URL voor preview in de UI (optioneel)
    const objUrl = URL.createObjectURL(file)
    onStart?.({ type: 'file', value: objUrl, name: file.name, file })
    // (optioneel) later: URL.revokeObjectURL(objUrl) na gebruik
  }

  return (
    <div className="card w-full max-w-2xl mx-auto p-6 backdrop-blur-md">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Get clips in 1 click</h2>
          <p className="text-sm text-muted">Paste a link or upload to start</p>
        </div>

        {/* Link input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-white/5 border border-border rounded-lg px-3 py-2">
            <LinkIcon size={16} className="text-muted" />
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Drop a link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSubmit) handleUrlSubmit()
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload size={16} className="mr-2" />
              Upload
            </button>

            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                onStart?.({
                  type: 'file',
                  value: URL.createObjectURL(f),
                  name: f.name,
                  file: f,                 // ✅ voeg het echte File object toe
                })
              }}
            />

            <button className="btn-ghost" onClick={() => alert('Coming soon')}>
              <FolderOpen size={16} className="mr-2" />
              Google Drive
            </button>
          </div>

          <button
            className="btn-primary w-full"
            disabled={!canSubmit}
            onClick={handleUrlSubmit}
          >
            Get clips in 1 click
          </button>

          <div className="text-center">
            <a
              className="text-sm underline text-muted"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                // Gebruik eigen handler of start direct met demo-URL
                if (onTrySample) return onTrySample()
                onStart?.({
                  type: 'url',
                  value: 'https://www.youtube.com/watch?v=9urSNqHrCFM', // jouw werkende voorbeeld
                })
              }}
            >
              Click here to try a sample project
            </a>
          </div>
        </div>

        {/* Footer toggles */}
        <div className="flex items-center justify-between text-sm text-muted pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autosave}
              onChange={() => setAutosave(!autosave)}
            />
            Auto-save
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoimport}
              onChange={() => setAutoimport(!autoimport)}
            />
            Auto-import (Beta)
          </label>
          <div className="badge">Usage 0/7</div>
        </div>
      </div>
    </div>
  )
}

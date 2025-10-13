import { useState } from 'react'
import { Upload, Link as LinkIcon, FolderOpen } from 'lucide-react'

export default function CenterUploadCard() {
  const [url, setUrl] = useState('')
  const [autosave, setAutosave] = useState(false)
  const [autoimport, setAutoimport] = useState(false)
  const canSubmit = url.trim().length > 0

  return (
    <div className="card w-full max-w-2xl mx-auto p-6 backdrop-blur-md">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Get clips in 1 click</h2>
          <p className="text-sm text-muted">Paste a link or upload to start</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-white/5 border border-border rounded-lg px-3 py-2">
            <LinkIcon size={16} className="text-muted" />
            <input
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Drop a link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <button className="btn-ghost"><Upload size={16} className="mr-2" />Upload</button>
            <button className="btn-ghost"><FolderOpen size={16} className="mr-2" />Google Drive</button>
          </div>
          <button className="btn-primary w-full" disabled={!canSubmit} onClick={() => alert(`Start pipeline for: ${url}`)}>
            Get clips in 1 click
          </button>
          <div className="text-center">
            <a className="text-sm underline text-muted" href="#">Click here to try a sample project</a>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={autosave} onChange={() => setAutosave(!autosave)} />
            Auto-save
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={autoimport} onChange={() => setAutoimport(!autoimport)} />
            Auto-import (Beta)
          </label>
          <div className="badge">Usage 0/7</div>
        </div>
      </div>
    </div>
  )
}

export default function UiSwitch({
  checked,
  onChange,
}: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full border border-border transition
        ${checked ? 'bg-white' : 'bg-transparent'}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition
        ${checked ? 'right-0.5' : 'left-0.5'}`}
      />
    </button>
  )
}

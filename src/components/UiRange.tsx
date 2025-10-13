export default function UiRange({
                                    value,
                                    onChange,
                                    min = 0,
                                    max = 100,
                                    step = 1,
                                }: {
    value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
    return (
        <input
            type="range"
            className="w-full accent-white"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
        />
    )
}

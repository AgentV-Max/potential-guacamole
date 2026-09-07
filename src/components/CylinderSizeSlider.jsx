import { CYLINDER_SIZES, CYLINDER_SIZE_HINTS } from '../data.js'

export default function CylinderSizeSlider({ value, onChange }) {
  const activeIndex = Math.max(0, CYLINDER_SIZES.indexOf(value))
  const fillPercent = (activeIndex / (CYLINDER_SIZES.length - 1)) * 100

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <span className="text-3xl font-bold text-white tabular-nums">{value}kg</span>
        <span className="text-xs text-slate-500 text-right">{CYLINDER_SIZE_HINTS[value]}</span>
      </div>

      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-2 rounded-full bg-slate-800" />
        <div
          className="absolute h-2 rounded-full bg-brand-orange"
          style={{ width: `${fillPercent}%`, transition: 'width 0.2s ease' }}
        />
        <input
          type="range"
          min={0}
          max={CYLINDER_SIZES.length - 1}
          step={1}
          value={activeIndex}
          onChange={(e) => onChange(CYLINDER_SIZES[Number(e.target.value)])}
          className="gas-slider relative w-full"
          aria-label="Drag to choose cylinder size"
        />
      </div>

      <div className="flex justify-between mt-2">
        {CYLINDER_SIZES.map((size, i) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={`text-xs font-semibold px-1 transition-colors ${
              i === activeIndex ? 'text-brand-orange' : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            {size}kg
          </button>
        ))}
      </div>
    </div>
  )
}

import React from 'react'

const SizeSelector = ({ sizes, selectedSizeId, onChange }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {sizes.map(({ size, id, quantity }) => (
      <button
        key={id}
        type="button"
        className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
          selectedSizeId === id
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-transparent text-slate-400 border-slate-700 hover:border-indigo-500 hover:text-indigo-300'
        } ${quantity === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
        style={{ boxShadow: 'none' }}
        disabled={quantity === 0}
        onClick={() => onChange(id)}
      >
        {size?.size_value}
      </button>
    ))}
  </div>
)

export default SizeSelector

import React from 'react'

const SizeSelector = ({ sizes, selectedSizeId, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {sizes.map(({ size, id, quantity }) => (
        <button
          key={id}
          type="button"
          className={`px-3 py-1 rounded border text-sm font-medium transition
            ${selectedSizeId === id ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-300'}
            ${quantity === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-black'}`}
          disabled={quantity === 0}
          onClick={() => onChange(id)}
        >
          {size?.size_value}
        </button>
      ))}
    </div>
  )
}

export default SizeSelector

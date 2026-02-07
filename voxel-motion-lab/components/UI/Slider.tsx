import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange }) => {
  return (
    <div className="flex items-center space-x-4 p-4 rounded-xl bg-[#0a0a0a] border border-[#222]">
      <span className="text-gray-400 text-sm font-bold w-24">{label}</span>
      <div className="relative w-full h-4 rounded-full bg-[#111] shadow-inner">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="absolute top-0 left-0 h-full rounded-full bg-white opacity-20 pointer-events-none transition-all duration-100 ease-out"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
        <div 
           className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0a0a0a] border border-[#333] pointer-events-none transition-all duration-100 ease-out flex items-center justify-center shadow-lg"
           style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 12px)` }}
        >
             <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
        </div>
      </div>
      <span className="text-white text-sm font-mono w-12 text-right">{value.toFixed(1)}x</span>
    </div>
  );
};
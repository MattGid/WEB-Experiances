import React from 'react';
import { motion } from 'framer-motion';
import { AnimationCardProps } from '../../types';

interface CardProps extends AnimationCardProps {
  onReplay: () => void;
}

export const Card: React.FC<CardProps> = ({ title, description, component: Component, speed, onReplay, trigger }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col p-8 pt-10 rounded-3xl bg-[#0a0a0a] border border-[#222] -skew-x-2 group hover:border-[#333] transition-colors duration-300"
    >
      <div className="flex justify-between items-center mb-10 skew-x-2">
        <div>
          <h3 className="text-white text-xl font-bold tracking-wider">{title}</h3>
          <p className="text-gray-500 text-sm mt-2">{description}</p>
        </div>
        {/* Replay button hidden as animations loop now, but kept in code structure if needed */}
        <div className="w-5 h-5 opacity-0"></div>
      </div>

      {/* The Recessed Well for 3D Content */}
      <div className="flex-1 w-full min-h-[320px] rounded-2xl bg-[#050505] shadow-[inset_0px_0px_30px_#000] border border-[#111] overflow-hidden relative">
        <Component speed={speed} trigger={trigger || 0} isPlaying={true} />
        {/* Fine Grain Overlay */}
        <div className="grain"></div>
      </div>
    </motion.div>
  );
};
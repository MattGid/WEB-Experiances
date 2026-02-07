import React from 'react';

export interface DemoProps {
  speed: number;
  trigger: number; // A counter to trigger replays
  isPlaying: boolean;
}

export interface AnimationCardProps {
  title: string;
  description: string;
  component: React.FC<DemoProps>;
  speed: number;
  trigger?: number;
}
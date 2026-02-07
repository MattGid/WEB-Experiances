import React, { useState } from 'react';
import { Card } from './components/UI/Card';
import { Slider } from './components/UI/Slider';
import { EasingDemo } from './components/demos/EasingDemo';
import { SquashStretchDemo } from './components/demos/SquashStretchDemo';
import { AnticipationDemo } from './components/demos/AnticipationDemo';
import { StaggerDemo } from './components/demos/StaggerDemo';
import { OvershootDemo } from './components/demos/OvershootDemo';
import { FollowThroughDemo } from './components/demos/FollowThroughDemo';
import { ArcDemo } from './components/demos/ArcDemo';
import { SecondaryActionDemo } from './components/demos/SecondaryActionDemo';
import { ExaggerationDemo } from './components/demos/ExaggerationDemo';
import { TimingDemo } from './components/demos/TimingDemo';
import { StagingDemo } from './components/demos/StagingDemo';
import { AppealDemo } from './components/demos/AppealDemo';
import { ActionReactionDemo } from './components/demos/ActionReactionDemo';
import { PoseToPoseDemo } from './components/demos/PoseToPoseDemo';
import { SlowInSlowOutDemo } from './components/demos/SlowInSlowOutDemo';

const App: React.FC = () => {
  const [speed, setSpeed] = useState(1);
  
  // Triggers are no longer needed for looping animations, but kept for interface compatibility if needed
  const [triggers, setTriggers] = useState<Record<string, number>>({});

  const handleReplay = (key: string) => {
    setTriggers(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  const demos = [
    {
      id: 'easing',
      title: 'Easing Functions',
      description: 'Linear vs Cubic Ease-Out.',
      component: EasingDemo
    },
    {
      id: 'squash',
      title: 'Squash & Stretch',
      description: 'Volume preservation during impact.',
      component: SquashStretchDemo
    },
    {
      id: 'anticipation',
      title: 'Anticipation',
      description: 'Backward movement prepares for forward action.',
      component: AnticipationDemo
    },
    {
      id: 'stagger',
      title: 'Stagger / Offset',
      description: 'Offsetting start times creates fluid waves.',
      component: StaggerDemo
    },
    {
      id: 'overshoot',
      title: 'Overshoot',
      description: 'Passing the target before settling.',
      component: OvershootDemo
    },
    {
      id: 'follow',
      title: 'Follow-Through',
      description: 'Parts continue to move after stop.',
      component: FollowThroughDemo
    },
    {
      id: 'arc',
      title: 'Arc',
      description: 'Movement follows a curved path for natural motion.',
      component: ArcDemo
    },
    {
      id: 'secondary',
      title: 'Secondary Action',
      description: 'Minor actions that support the main action.',
      component: SecondaryActionDemo
    },
    {
      id: 'exaggeration',
      title: 'Exaggeration',
      description: 'Pushing movement beyond reality for appeal.',
      component: ExaggerationDemo
    },
    {
      id: 'timing',
      title: 'Timing',
      description: 'Speed and duration define the physical weight.',
      component: TimingDemo
    },
    {
      id: 'staging',
      title: 'Staging',
      description: 'Directing attention to what matters most.',
      component: StagingDemo
    },
    {
      id: 'appeal',
      title: 'Appeal',
      description: 'Giving personality and charisma to the subject.',
      component: AppealDemo
    },
    {
      id: 'actionreaction',
      title: 'Action & Reaction',
      description: 'For every action, there is an equal and opposite reaction.',
      component: ActionReactionDemo
    },
    {
      id: 'posetopose',
      title: 'Step vs Fluid',
      description: 'Mechanical Sequential vs Organic Concurrent movement.',
      component: PoseToPoseDemo
    },
    {
      id: 'slowinout',
      title: 'Slow In & Out',
      description: 'Momentum cycles: slow at edges, fast in center.',
      component: SlowInSlowOutDemo
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] p-4 md:p-12 font-mono relative z-10">
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-end border-b border-[#333] pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 text-white">
            <span className="text-white opacity-50">VOXEL</span> MOTION LAB
          </h1>
          <p className="text-gray-500 max-w-md">
            Interactive study of Animation Principles.
          </p>
        </div>
        
        <div className="mt-8 md:mt-0 w-full md:w-auto">
           <Slider 
             label="Speed" 
             value={speed} 
             min={0.1} 
             max={3} 
             step={0.1} 
             onChange={setSpeed} 
           />
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {demos.map((demo) => (
          <Card
            key={demo.id}
            title={demo.title}
            description={demo.description}
            component={demo.component}
            speed={speed}
            onReplay={() => handleReplay(demo.id)}
            trigger={triggers[demo.id] || 0}
          />
        ))}
      </main>

      <footer className="max-w-7xl mx-auto mt-20 text-center text-gray-600 text-sm">
        <p>Built with React Three Fiber, React Spring & Tailwind.</p>
      </footer>
    </div>
  );
};

export default App;
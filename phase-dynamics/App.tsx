
import React, { useState, useRef, useEffect } from 'react';
import SimulationView from './components/SimulationView';
import { SimulationConfig, ParticleType } from './types';
import { INITIAL_CONFIG, PHASE_COLORS } from './constants';
import { sounds } from './utils/SoundEngine';

type ExperimentId = 'phase' | 'chem' | 'magnet' | 'circuit' | 'filtration' | 'erosion' | 'optics' | 'electricity' | 'osmosis' | 'nuclear';

const SCI_INFO: Record<string, { title: string; desc: string; principle: string }> = {
  heat: { title: 'Thermal Excitation', desc: 'Increases kinetic energy, breaking intermolecular bonds and forcing phase transitions.', principle: 'Kinetic Theory' },
  cold: { title: 'Cryogenic Depletion', desc: 'Removes thermal energy, slowing molecules until they settle into crystalline lattices.', principle: 'Thermodynamics' },
  ice: { title: 'Crystalline H₂O', desc: 'A solid state where hydrogen bonds lock molecules into a rigid, low-density lattice.', principle: 'Solidification' },
  acid: { title: 'Corrosive Reagent', desc: 'A proton-donating liquid that reacts exothermically with basic compounds.', principle: 'Acidity' },
  base: { title: 'Alkaline Solution', desc: 'A hydroxide-rich liquid that neutralizes acids through ionic exchange.', principle: 'Basicity' },
  iron: { title: 'Magnetic Dust', desc: 'Ferromagnetic particles that align their spins with external magnetic field vectors.', principle: 'Ferromagnetism' },
  magnet: { title: 'Magnetic Dipole', desc: 'An effector creating flux lines that exert force on ferromagnetic matter.', principle: 'Lorentz Force' },
  graphite: { title: 'Conductive Carbon', desc: 'An allotrope of carbon with delocalized electrons, allowing current flow.', principle: 'Electron Mobility' },
  power: { title: 'Voltage Source', desc: 'An electrode that injects potential energy, driving electrons through conductors.', principle: 'Ohm’s Law' },
  gold: { title: 'Dense Aurum', desc: 'High-mass particles that fall rapidly and displace lighter fluids.', principle: 'Gravitational Inertia' },
  silt: { title: 'Fine Sediment', desc: 'Low-mass particulates that are easily suspended in fluids and diffuse through pores.', principle: 'Diffusion' },
  membrane: { title: 'Semi-Permeable Barrier', desc: 'A microscopic filter that allows small solvent molecules (Water) to pass but blocks larger solute particles (Salt).', principle: 'Osmosis' },
  water: { title: 'Universal Solvent', desc: 'A polar liquid that flows over strata, potentially causing particle displacement or erasure.', principle: 'Hydrological Erosion' },
  clay: { title: 'Soft Clay Strata', desc: 'Unconsolidated geological material that erodes quickly when exposed to flowing water.', principle: 'Weathering' },
  granite: { title: 'Hard Granite Bedrock', desc: 'Dense igneous rock with high cohesive strength, resisting erosion for long periods.', principle: 'Geomorphology' },
  glass: { title: 'Glass Insulator', desc: 'A transparent medium that blocks electrical charge while permitting optical transmission.', principle: 'High Resistance' },
  mirror: { title: 'Reflective Mirror', desc: 'A polished surface that reflects photons perfectly, with angle of incidence equaling angle of reflection.', principle: 'Law of Reflection' },
  photon: { title: 'Photon Beam', desc: 'Elementary particles of light moving in straight lines. They refract in glass and reflect on mirrors.', principle: 'Snell’s Law' },
  copper: { title: 'Copper Conductor', desc: 'A metal with extremely low resistance, allowing electrons to move with high velocity.', principle: 'Conductivity' },
  silicon: { title: 'Semiconductor', desc: 'A material whose conductivity is between a conductor and an insulator, often used in chips.', principle: 'Band Gap Physics' },
  electron: { title: 'Electron Flow', desc: 'Negative charge carriers that travel through conductive paths. They pile up at insulators.', principle: 'Electric Current' },
  salt: { title: 'Ionic Solute (NaCl)', desc: 'Large crystalline particles that cannot pass through semi-permeable membranes, creating osmotic potential.', principle: 'Solute Concentration' },
  isotope: { title: 'Radioisotope', desc: 'Unstable atomic nuclei that spontaneously decay into more stable forms over time.', principle: 'Radioactive Decay' },
  lead: { title: 'Stable Lead', desc: 'The dense, non-radioactive byproduct of nuclear decay. Blocks most radiation.', principle: 'Stability' },
  neutron: { title: 'Neutron Particle', desc: 'Fast, uncharged subatomic particles that can trigger decay in unstable atoms via impact.', principle: 'Chain Reaction' },
  radiation: { title: 'Radiation Field', desc: 'A region of high-energy flux that increases the probability of nuclear transitions.', principle: 'Quantum Tunneling' },
  eraser: { title: 'Mass Erasure', desc: 'Total spatial removal of particulate matter from the observation grid.', principle: 'Void Creation' }
};

const App: React.FC = () => {
  const [activeExperiment, setActiveExperiment] = useState<ExperimentId>('phase');
  const [config, setConfig] = useState<SimulationConfig>(INITIAL_CONFIG);
  const [activeTool, setActiveTool] = useState<string>('ice');
  const [hoveredSci, setHoveredSci] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [counts, setCounts] = useState({ isotope: 0, lead: 0, water: 0, salt: 0 });

  const [activeSheet, setActiveSheet] = useState<'none' | 'modules' | 'tools' | 'settings'>('none');

  const clearSystem = () => { 
    sounds.playClear();
    setResetKey(prev => prev + 1); 
    setCounts({ isotope: 0, lead: 0, water: 0, salt: 0 }); 
  };

  const handleModuleChange = (id: ExperimentId) => {
    sounds.playSwitch(true);
    setActiveExperiment(id);
  };

  const handleToolChange = (id: string) => {
    setActiveTool(id);
  };

  const toggleSimulating = () => {
    sounds.playSwitch(!isSimulating);
    setIsSimulating(!isSimulating);
  };

  const handleSheetChange = (sheet: any) => {
    setActiveSheet(sheet);
  };

  const activeTelemetry = hoveredSci ? SCI_INFO[hoveredSci] : (activeTool in SCI_INFO ? SCI_INFO[activeTool] : null);

  useEffect(() => {
    const defaults = { 
      phase: 'ice', 
      chem: 'acid', 
      magnet: 'iron', 
      circuit: 'graphite', 
      filtration: 'gold', 
      erosion: 'clay',
      optics: 'photon',
      electricity: 'copper',
      osmosis: 'water',
      nuclear: 'isotope'
    };
    setActiveTool(defaults[activeExperiment]);
    setActiveSheet('none');
  }, [activeExperiment]);

  const renderTools = () => {
    const common = [{ id: 'wall', label: 'Static Wall', color: PHASE_COLORS[ParticleType.WALL] }, { id: 'eraser', label: 'Eraser', color: '#000' }];
    switch(activeExperiment) {
      case 'phase': return [{ id: 'ice', label: 'H₂O Seeder', color: PHASE_COLORS[ParticleType.ICE] }, { id: 'heat', label: 'Heat Brush', color: '#FF4F00' }, { id: 'cold', label: 'Cold Brush', color: '#00B0FF' }, ...common];
      case 'chem': return [{ id: 'acid', label: 'Acid (HCl)', color: PHASE_COLORS[ParticleType.ACID] }, { id: 'base', label: 'Base (NaOH)', color: PHASE_COLORS[ParticleType.BASE] }, { id: 'neutralize', label: 'Neutralizer', color: '#00E676' }, ...common];
      case 'magnet': return [{ id: 'iron', label: 'Iron Filings', color: PHASE_COLORS[ParticleType.IRON] }, { id: 'magnet', label: 'Dipole Magnet', color: '#D32F2F' }, ...common];
      case 'circuit': return [{ id: 'graphite', label: 'Graphite', color: PHASE_COLORS[ParticleType.GRAPHITE] }, { id: 'power', label: 'Power Probe', color: '#FFEB3B' }, ...common];
      case 'filtration': return [{ id: 'gold', label: 'Gold (Heavy)', color: PHASE_COLORS[ParticleType.GOLD] }, { id: 'silt', label: 'Silt (Light)', color: PHASE_COLORS[ParticleType.SILT] }, { id: 'membrane', label: 'Membrane', color: PHASE_COLORS[ParticleType.MEMBRANE] }, { id: 'water', label: 'Solvent', color: PHASE_COLORS[ParticleType.WATER] }, ...common];
      case 'erosion': return [{ id: 'clay', label: 'Soft Clay', color: PHASE_COLORS[ParticleType.CLAY] }, { id: 'granite', label: 'Hard Granite', color: PHASE_COLORS[ParticleType.GRANITE] }, { id: 'water', label: 'Water Source', color: PHASE_COLORS[ParticleType.WATER] }, ...common];
      case 'optics': return [{ id: 'photon', label: 'Light Source', color: '#FFF' }, { id: 'glass', label: 'Prism/Glass', color: PHASE_COLORS[ParticleType.GLASS] }, { id: 'mirror', label: 'Mirror', color: PHASE_COLORS[ParticleType.MIRROR] }, ...common];
      case 'electricity': return [{ id: 'copper', label: 'Copper', color: PHASE_COLORS[ParticleType.COPPER] }, { id: 'silicon', label: 'Silicon', color: PHASE_COLORS[ParticleType.SILICON] }, { id: 'electron', label: 'Electron Seeder', color: PHASE_COLORS[ParticleType.ELECTRON] }, { id: 'power', label: 'Battery/Source', color: '#FFEB3B' }, { id: 'glass', label: 'Glass Insulator', color: PHASE_COLORS[ParticleType.GLASS] }, ...common];
      case 'osmosis': return [{ id: 'water', label: 'Water (Solvent)', color: PHASE_COLORS[ParticleType.WATER] }, { id: 'salt', label: 'Salt (Solute)', color: PHASE_COLORS[ParticleType.SALT] }, { id: 'membrane', label: 'Membrane', color: PHASE_COLORS[ParticleType.MEMBRANE] }, ...common];
      case 'nuclear': return [{ id: 'isotope', label: 'Isotope-235', color: PHASE_COLORS[ParticleType.ISOTOPE] }, { id: 'radiation', label: 'Radiation Field', color: '#E91E63' }, { id: 'neutron', label: 'Neutron Source', color: PHASE_COLORS[ParticleType.NEUTRON] }, { id: 'lead', label: 'Stable Lead', color: PHASE_COLORS[ParticleType.LEAD] }, ...common];
    }
  };

  const totalNuclear = counts.isotope + counts.lead;
  const isotopePercent = totalNuclear > 0 ? (counts.isotope / totalNuclear) * 100 : 0;
  const leadPercent = totalNuclear > 0 ? (counts.lead / totalNuclear) * 100 : 0;

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-[#EAEAEA] overflow-hidden font-sans text-black relative">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-[280px] rams-panel rounded flex-col p-6 shrink-0 border-black/10 overflow-y-auto m-4">
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-tighter text-black leading-none uppercase">Simulator</h1>
          <div className="label-caps opacity-90 text-black mt-1">Science Core v2.8</div>
          <div className="h-[2px] bg-black/20 mt-4"></div>
        </header>

        <section className="mb-6">
          <label className="label-caps block mb-4 text-black/90 text-center">Module Select</label>
          <div className="grid grid-cols-2 gap-1 bg-black/5 rounded p-1">
            {['phase', 'chem', 'magnet', 'circuit', 'filtration', 'erosion', 'optics', 'electricity', 'osmosis', 'nuclear'].map(id => (
              <button key={id} onClick={() => handleModuleChange(id as any)} className={`py-2 px-3 text-[7px] font-black uppercase rounded transition-all flex items-center justify-start gap-2 ${activeExperiment === id ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black/60'}`}>
                <div className={`led flex-shrink-0 ${activeExperiment === id ? 'led-active text-rams-accent' : 'text-black/20'}`}></div>
                <span className="truncate">{id === 'osmosis' ? 'Osmosis' : id.charAt(0).toUpperCase() + id.slice(1)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8 flex flex-col items-center">
          <button onClick={toggleSimulating} className={`w-20 h-20 rounded-full rams-btn flex flex-col items-center justify-center gap-2 ${isSimulating ? 'active border-black/30 bg-[#F0F0F0]' : ''}`}>
            <div className={`led ${isSimulating ? 'led-active text-rams-accent' : 'text-black/20'}`}></div>
            <span className="text-[9px] font-black text-black tracking-widest uppercase">{isSimulating ? 'Active' : 'Paused'}</span>
          </button>
        </section>

        <section className="mb-8">
          <label className="label-caps block mb-4 text-black/90 text-center">Active Tools</label>
          <div className="grid grid-cols-2 gap-3">
            {renderTools().map(tool => (
              <button key={tool.id} onClick={() => handleToolChange(tool.id)} onMouseEnter={() => setHoveredSci(tool.id)} onMouseLeave={() => setHoveredSci(null)} className={`flex flex-row items-center justify-start px-3 py-3 rounded rams-btn gap-2 ${activeTool === tool.id ? 'active border-black/30 bg-[#F0F0F0]' : ''}`}>
                <div className={`led flex-shrink-0 ${activeTool === tool.id ? 'led-active' : ''}`} style={{ color: tool.color }}></div>
                <span className="text-[9px] font-bold text-black uppercase truncate">{tool.label}</span>
              </button>
            ))}
          </div>
        </section>

        {activeExperiment === 'nuclear' && totalNuclear > 0 && (
          <section className="mb-8 rams-inset p-4">
            <label className="label-caps block mb-4 text-black">Half-Life Analysis</label>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-[10px] font-bold">
                 <span>ISOTOPE-235</span>
                 <span className="mono text-[#4AF626]">{isotopePercent.toFixed(1)}%</span>
               </div>
               <div className="h-2 bg-black/10 rounded overflow-hidden flex">
                  <div className="h-full bg-[#4AF626] transition-all duration-500" style={{ width: `${isotopePercent}%` }}></div>
                  <div className="h-full bg-[#546E7A] transition-all duration-500" style={{ width: `${leadPercent}%` }}></div>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold">
                 <span>STABLE LEAD</span>
                 <span className="mono text-[#546E7A]">{leadPercent.toFixed(1)}%</span>
               </div>
            </div>
          </section>
        )}

        <section className="mb-8 rams-inset p-5">
          <label className="label-caps block mb-5 text-black">Control Panel</label>
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center"><label className="label-caps text-black/90">Brush Radius</label><span className="mono font-bold text-black">{config.brushSize}px</span></div>
              <input type="range" className="w-full" min="4" max="50" value={config.brushSize} onChange={e => {
                setConfig({...config, brushSize: parseInt(e.target.value)});
              }} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="label-caps text-black/90">Background</label>
                <div className="flex items-center gap-2">
                  <span className="mono font-bold text-black uppercase">{config.backgroundColor}</span>
                  <input 
                    type="color" 
                    className="w-6 h-6 rounded border-none bg-transparent cursor-pointer" 
                    value={config.backgroundColor} 
                    onChange={e => {
                      setConfig({...config, backgroundColor: e.target.value});
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-auto rams-inset p-4 bg-black/5 border-black/10">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[8px] font-black uppercase text-black/70">Observatory Status</span>
             <div className={`led text-rams-accent ${isSimulating ? 'led-active' : ''}`}></div>
          </div>
          <p className="text-[9px] text-black italic font-medium leading-snug">Atomic transitions and neutron flux monitored.</p>
        </footer>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex h-14 w-full bg-[#F4F4F4] border-b border-black/10 items-center px-4 justify-between shrink-0 shadow-sm z-30">
        <div className="flex flex-col">
          <h1 className="text-lg font-black tracking-tighter leading-none uppercase">Simulator</h1>
          <span className="text-[8px] font-bold mono text-black/60 uppercase tracking-tight">Experiment: {activeExperiment}</span>
        </div>
        <button onClick={clearSystem} className="h-9 px-4 rams-btn rounded text-[10px] font-black uppercase flex items-center gap-2">
          <div className="led text-red-500"></div>
          Clear
        </button>
      </header>

      {/* MAIN VIEWPORT - Removed md:p-4 md:gap-4 for edge-to-edge layout */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* DESKTOP TOP BAR - Kept original padding inside the bar */}
        <div className="hidden md:flex h-16 rams-panel rounded-none items-center px-6 justify-between shrink-0 border-black/20 shadow-sm">
           <div className="flex items-center gap-10">
              <div className="flex flex-col">
                 <label className="label-caps mb-1 text-black font-black">Analysis Deck</label>
                 <span className="text-sm font-bold mono text-black uppercase tracking-tight">Experiment: {activeExperiment}</span>
              </div>
           </div>
           <button onClick={clearSystem} className="px-5 py-2 rams-btn rounded text-[10px] font-black text-black uppercase hover:bg-white hover:border-black/40 transition-colors flex items-center gap-2">
              <div className="led text-red-500"></div>
              Clear Field
           </button>
        </div>

        {/* SIMULATION CANVAS AREA */}
        <div className="flex-1 relative overflow-hidden flex flex-col" style={{ backgroundColor: config.backgroundColor }}>
           {/* Telemetry Display */}
           {activeTelemetry && (
             <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20 w-48 md:w-60 pointer-events-none animate-in fade-in slide-in-from-top-4">
               <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-white/20"></div>
               <div className="flex flex-col mb-2 md:mb-4 border-b border-white/20 pb-2">
                  <span className="label-caps text-white/50 mb-1 font-bold text-[6px] md:text-[8px]">Scientific Record</span>
                  <h3 className="text-[10px] md:text-sm font-black text-white uppercase leading-tight">{activeTelemetry.title}</h3>
               </div>
               <p className="text-[9px] md:text-[11px] text-white/90 leading-[1.4] md:leading-[1.6] mb-2 md:mb-4 font-medium drop-shadow-md">{activeTelemetry.desc}</p>
               <span className="text-[8px] md:text-[10px] font-bold text-[#FFEB3B] uppercase tracking-widest">{activeTelemetry.principle}</span>
             </div>
           )}

           <div className="flex-1 relative h-full w-full">
             <SimulationView 
               key={`${resetKey}-${activeExperiment}`} 
               config={config} 
               isSimulating={isSimulating} 
               activeTool={activeTool as any} 
               onCountsUpdate={setCounts} 
             />
           </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden h-20 w-full mobile-nav-blur border-t border-black/10 flex items-center justify-around px-2 z-40 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <button onClick={() => handleSheetChange('modules')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeSheet === 'modules' ? 'scale-110 text-rams-accent' : 'text-black/60'}`}>
          <div className={`led mb-1 ${activeSheet === 'modules' ? 'led-active' : ''}`}></div>
          <span className="text-[8px] font-black uppercase">Modules</span>
        </button>

        <button onClick={() => handleSheetChange('tools')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeSheet === 'tools' ? 'scale-110 text-rams-accent' : 'text-black/60'}`}>
          <div className={`led mb-1 ${activeSheet === 'tools' ? 'led-active' : ''}`} style={{ color: PHASE_COLORS[activeTool as any] || '#000' }}></div>
          <span className="text-[8px] font-black uppercase">Tools</span>
        </button>

        <button onClick={toggleSimulating} className={`w-14 h-14 rams-btn rounded-full -mt-8 border-2 border-black/10 bg-white shadow-xl flex flex-col items-center justify-center ${isSimulating ? 'active' : ''}`}>
           <div className={`led mb-1 text-rams-accent ${isSimulating ? 'led-active' : ''}`}></div>
           <span className="text-[8px] font-black uppercase">{isSimulating ? 'ON' : 'OFF'}</span>
        </button>

        <button onClick={() => handleSheetChange('settings')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeSheet === 'settings' ? 'scale-110 text-rams-accent' : 'text-black/60'}`}>
          <div className={`led mb-1 ${activeSheet === 'settings' ? 'led-active text-black' : ''}`}></div>
          <span className="text-[8px] font-black uppercase">Setup</span>
        </button>
      </nav>

      {/* MOBILE SHEETS */}
      <div className={`scrim ${activeSheet !== 'none' ? 'open' : ''}`} onClick={() => handleSheetChange('none')}></div>
      
      {/* Modules Sheet */}
      <div className={`mobile-sheet p-6 ${activeSheet === 'modules' ? 'open' : ''}`}>
        <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-6"></div>
        <label className="label-caps block mb-6 text-center text-[10px]">Scientific Modules</label>
        <div className="grid grid-cols-2 gap-3">
          {['phase', 'chem', 'magnet', 'circuit', 'filtration', 'erosion', 'optics', 'electricity', 'osmosis', 'nuclear'].map(id => (
            <button key={id} onClick={() => handleModuleChange(id as any)} className={`p-4 rounded rams-btn flex flex-row items-center justify-start gap-3 px-6 ${activeExperiment === id ? 'active' : ''}`}>
               <div className={`led flex-shrink-0 ${activeExperiment === id ? 'led-active text-rams-accent' : 'text-black/20'}`}></div>
               <span className="text-[10px] font-black uppercase">{id === 'osmosis' ? 'Osmosis' : id}</span>
            </button>
          ))}
        </div>
        <div className="h-12"></div>
      </div>

      {/* Tools Sheet */}
      <div className={`mobile-sheet p-6 ${activeSheet === 'tools' ? 'open' : ''}`}>
        <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-6"></div>
        <label className="label-caps block mb-6 text-center text-[10px]">Active Reagents</label>
        <div className="grid grid-cols-2 gap-3">
          {renderTools().map(tool => (
            <button key={tool.id} onClick={() => handleToolChange(tool.id)} className={`p-3 rounded rams-btn flex flex-row items-center justify-start gap-3 px-6 ${activeTool === tool.id ? 'active' : ''}`}>
               <div className={`led flex-shrink-0 ${activeTool === tool.id ? 'led-active' : ''}`} style={{ color: tool.color }}></div>
               <span className="text-[8px] font-bold uppercase text-center">{tool.label}</span>
            </button>
          ))}
        </div>
        <div className="h-12"></div>
      </div>

      {/* Settings Sheet */}
      <div className={`mobile-sheet p-6 ${activeSheet === 'settings' ? 'open' : ''}`}>
        <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-6"></div>
        <label className="label-caps block mb-6 text-center text-[10px]">System Tuning</label>
        <div className="space-y-8 rams-inset p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="led led-active text-black"></div>
                <label className="label-caps text-black font-black text-[10px]">Brush Size</label>
              </div>
              <span className="mono font-bold text-black">{config.brushSize}px</span>
            </div>
            <input type="range" className="w-full" min="4" max="50" value={config.brushSize} onChange={e => setConfig({...config, brushSize: parseInt(e.target.value)})} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="led led-active text-black"></div>
                <label className="label-caps text-black font-black text-[10px]">Environment Color</label>
              </div>
              <input 
                type="color" 
                className="w-10 h-10 rounded border-2 border-black/10" 
                value={config.backgroundColor} 
                onChange={e => {
                  setConfig({...config, backgroundColor: e.target.value});
                }} 
              />
            </div>
          </div>
        </div>
        <div className="h-12"></div>
      </div>
    </div>
  );
};

export default App;


import { ParticleType, SimulationConfig } from '../types';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants';

export class SimulationEngine {
  private grid: Uint8Array;
  private nextGrid: Uint8Array;
  private chargeGrid: Float32Array;
  private directionGrid: Float32Array;
  private width: number;
  private height: number;
  private magnetPos: { x: number, y: number } | null = null;

  constructor() {
    this.width = GRID_WIDTH;
    this.height = GRID_HEIGHT;
    this.grid = new Uint8Array(this.width * this.height);
    this.nextGrid = new Uint8Array(this.width * this.height);
    this.chargeGrid = new Float32Array(this.width * this.height);
    this.directionGrid = new Float32Array(this.width * this.height);
  }

  public reset(): void {
    this.grid.fill(0);
    this.nextGrid.fill(0);
    this.chargeGrid.fill(0);
    this.directionGrid.fill(0);
    this.magnetPos = null;
  }

  public setMagnet(x: number, y: number | null): void {
    if (y === null) this.magnetPos = null;
    else this.magnetPos = { x, y };
  }

  public getGrid(): Uint8Array { return this.grid; }
  public getChargeGrid(): Float32Array { return this.chargeGrid; }

  public getCounts(): { isotope: number, lead: number, water: number, salt: number } {
    let counts = { isotope: 0, lead: 0, water: 0, salt: 0 };
    for (let i = 0; i < this.grid.length; i++) {
      const p = this.grid[i];
      if (p === ParticleType.ISOTOPE) counts.isotope++;
      else if (p === ParticleType.LEAD) counts.lead++;
      else if (p === ParticleType.WATER) counts.water++;
      else if (p === ParticleType.SALT) counts.salt++;
    }
    return counts;
  }

  public setParticle(x: number, y: number, type: number, angle: number = 0): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      const idx = Math.floor(y) * this.width + Math.floor(x);
      this.grid[idx] = type;
      if (type === ParticleType.PHOTON || type === ParticleType.ELECTRON || type === ParticleType.NEUTRON) {
        this.directionGrid[idx] = angle;
      }
    }
  }

  public applyThermodynamics(x: number, y: number, radius: number, effect: string): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const tx = Math.floor(x + dx);
          const ty = Math.floor(y + dy);
          if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
            const idx = ty * this.width + tx;
            const p = this.grid[idx];
            if (effect === 'neutralize') {
              if (p === ParticleType.ACID || p === ParticleType.BASE) {
                this.grid[idx] = Math.random() > 0.5 ? ParticleType.SALT : ParticleType.WATER;
              }
            } else if (effect === 'power') {
              if (this.grid[idx] === ParticleType.GRAPHITE || this.grid[idx] === ParticleType.COPPER || this.grid[idx] === ParticleType.SILICON) {
                this.chargeGrid[idx] = 1.0;
                if (Math.random() < 0.2) {
                   this.setParticle(tx, ty, ParticleType.ELECTRON, Math.random() * Math.PI * 2);
                }
              }
            } else if (effect === 'radiation') {
              if (p === ParticleType.ISOTOPE && Math.random() < 0.1) {
                this.decayIsotope(tx, ty, idx);
              }
            } else if (effect === 'heat') {
              if (p === ParticleType.ICE) this.grid[idx] = ParticleType.WATER;
              else if (p === ParticleType.WATER) this.grid[idx] = ParticleType.STEAM;
            } else if (effect === 'cold') {
              if (p === ParticleType.STEAM) this.grid[idx] = ParticleType.WATER;
              else if (p === ParticleType.WATER) this.grid[idx] = ParticleType.ICE;
            }
          }
        }
      }
    }
  }

  private decayIsotope(x: number, y: number, idx: number): void {
    this.grid[idx] = ParticleType.LEAD;
    this.nextGrid[idx] = ParticleType.LEAD;
    // Emit 1-2 Neutrons
    const count = Math.random() > 0.7 ? 2 : 1;
    for (let i = 0; i < count; i++) {
       const angle = Math.random() * Math.PI * 2;
       this.setParticle(x, y, ParticleType.NEUTRON, angle);
    }
  }

  private getSaltDensity(x: number, y: number, radius: number): number {
    let count = 0;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const tx = Math.floor(x + dx), ty = Math.floor(y + dy);
        if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
          if (this.grid[ty * this.width + tx] === ParticleType.SALT) count++;
        }
      }
    }
    return count;
  }

  public update(config: SimulationConfig, isSimulating: boolean): void {
    if (!isSimulating) return;
    this.nextGrid.fill(0);
    const nextChargeGrid = new Float32Array(this.width * this.height);
    const nextDirectionGrid = new Float32Array(this.width * this.height);

    const staticTypes = [
      ParticleType.WALL, ParticleType.MEMBRANE, ParticleType.CLAY, 
      ParticleType.GRANITE, ParticleType.GLASS, ParticleType.MIRROR,
      ParticleType.COPPER, ParticleType.SILICON
    ];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const p = this.grid[idx];
        if (this.chargeGrid[idx] > 0.05) {
          nextChargeGrid[idx] = this.chargeGrid[idx] * 0.92;
          const conductive = p === ParticleType.GRAPHITE || p === ParticleType.COPPER || p === ParticleType.SILICON;
          if (conductive) {
            const ns = [{dx:1, dy:0}, {dx:-1, dy:0}, {dx:0, dy:1}, {dx:0, dy:-1}];
            for (const n of ns) {
              const nx = x + n.dx, ny = y + n.dy;
              if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                const nidx = ny * this.width + nx;
                const np = this.grid[nidx];
                if (np === ParticleType.GRAPHITE || np === ParticleType.COPPER || np === ParticleType.SILICON) {
                  const loss = np === ParticleType.SILICON ? 0.6 : config.electricalConductivity;
                  nextChargeGrid[nidx] = Math.max(nextChargeGrid[nidx], this.chargeGrid[idx] * loss);
                }
              }
            }
          }
        }
      }
    }
    this.chargeGrid.set(nextChargeGrid);

    for (let i = 0; i < this.grid.length; i++) {
      if (staticTypes.includes(this.grid[i])) {
        this.nextGrid[i] = this.grid[i];
      }
    }

    for (let y = this.height - 1; y >= 0; y--) {
      const leftToRight = Math.random() > 0.5;
      for (let i = 0; i < this.width; i++) {
        const x = leftToRight ? i : this.width - 1 - i;
        const idx = y * this.width + x;
        const p = this.grid[idx];
        
        if (p === ParticleType.EMPTY || staticTypes.includes(p)) continue;
        if (this.nextGrid[idx] !== ParticleType.EMPTY && this.nextGrid[idx] !== p) continue;

        switch (p) {
          case ParticleType.ELECTRON: this.moveElectron(x, y, idx, nextDirectionGrid); break;
          case ParticleType.PHOTON: this.movePhoton(x, y, idx, p, nextDirectionGrid); break;
          case ParticleType.NEUTRON: this.moveNeutron(x, y, idx, p, nextDirectionGrid); break;
          case ParticleType.ISOTOPE:
            // Natural decay probability
            if (Math.random() < 0.0001) {
              this.decayIsotope(x, y, idx);
              break;
            }
            this.moveFalling(x, y, idx, p, config);
            break;
          case ParticleType.LEAD:
          case ParticleType.GOLD: this.moveGold(x, y, idx, p, config); break;
          case ParticleType.SILT: this.moveSilt(x, y, idx, p, config); break;
          case ParticleType.IRON: this.moveMagnetic(x, y, idx, p, config); break;
          case ParticleType.ICE:
          case ParticleType.SALT:
          case ParticleType.GRAPHITE: this.moveFalling(x, y, idx, p, config); break;
          case ParticleType.WATER:
          case ParticleType.ACID:
          case ParticleType.BASE: 
            this.updateChemicalReaction(x, y, idx, p);
            this.handleErosion(x, y, p);
            this.moveLiquid(x, y, idx, p, config); 
            break;
          case ParticleType.STEAM: this.moveGas(x, y, idx, p, config); break;
          default: 
            if (this.nextGrid[idx] === ParticleType.EMPTY) this.nextGrid[idx] = p;
        }
      }
    }
    this.grid.set(this.nextGrid);
    this.directionGrid.set(nextDirectionGrid);
  }

  private moveNeutron(x: number, y: number, idx: number, p: ParticleType, nextDirs: Float32Array): void {
    let angle = this.directionGrid[idx];
    const speed = 6; // Neutrons are faster than photons in this sim
    let curX = x, curY = y;
    for (let step = 0; step < speed; step++) {
      const nextX = curX + Math.cos(angle), nextY = curY + Math.sin(angle);
      const nx = Math.round(nextX), ny = Math.round(nextY);
      if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) return;
      
      const nidx = ny * this.width + nx;
      const target = this.grid[nidx];
      
      if (target === ParticleType.ISOTOPE && Math.random() < 0.05) {
        // Impact-induced decay (Chain reaction)
        this.decayIsotope(nx, ny, nidx);
        return; // Neutron absorbed
      } else if (target === ParticleType.LEAD || target === ParticleType.GRANITE) {
        // Bounces off dense matter
        if (nx !== curX) angle = Math.PI - angle; else angle = -angle;
        continue;
      } else if (target !== ParticleType.EMPTY && target !== ParticleType.WATER && target !== ParticleType.STEAM) {
        // Absorbed by other matter
        return;
      }
      curX = nextX; curY = nextY;
    }
    const finalX = Math.round(curX), finalY = Math.round(curY);
    const finalIdx = finalY * this.width + finalX;
    if (finalIdx >= 0 && finalIdx < this.grid.length && this.nextGrid[finalIdx] === ParticleType.EMPTY) {
      this.nextGrid[finalIdx] = p; nextDirs[finalIdx] = angle;
    }
  }

  private moveElectron(x: number, y: number, idx: number, nextDirs: Float32Array): void {
    const neighbors = [{dx:1, dy:0}, {dx:-1, dy:0}, {dx:0, dy:1}, {dx:0, dy:-1}, {dx:1, dy:1}, {dx:-1, dy:1}, {dx:1, dy:-1}, {dx:-1, dy:-1}];
    neighbors.sort(() => Math.random() - 0.5);
    let moved = false;
    for (const n of neighbors) {
      const nx = x + n.dx, ny = y + n.dy;
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        const nidx = ny * this.width + nx;
        const targetMat = this.grid[nidx];
        if (this.nextGrid[nidx] === ParticleType.EMPTY || this.nextGrid[nidx] === ParticleType.COPPER || this.nextGrid[nidx] === ParticleType.SILICON) {
          if (targetMat === ParticleType.SILICON && Math.random() > 0.4) continue;
          const isPath = targetMat === ParticleType.COPPER || targetMat === ParticleType.SILICON;
          const chance = isPath ? 1.0 : 0.05;
          if (Math.random() < chance) {
            this.nextGrid[nidx] = ParticleType.ELECTRON; moved = true; break;
          }
        }
      }
    }
    if (!moved && this.nextGrid[idx] === ParticleType.EMPTY) this.nextGrid[idx] = ParticleType.ELECTRON;
  }

  private movePhoton(x: number, y: number, idx: number, p: ParticleType, nextDirs: Float32Array): void {
    let angle = this.directionGrid[idx];
    const speed = 4;
    let curX = x, curY = y;
    for (let step = 0; step < speed; step++) {
      const nextX = curX + Math.cos(angle), nextY = curY + Math.sin(angle);
      const nx = Math.round(nextX), ny = Math.round(nextY);
      if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) return;
      const nidx = ny * this.width + nx;
      const target = this.grid[nidx];
      if (target === ParticleType.MIRROR) {
        if (nx !== curX) angle = Math.PI - angle; else angle = -angle;
        continue;
      } else if (target === ParticleType.GLASS) {
        const n1 = this.grid[idx] === ParticleType.GLASS ? 1.5 : 1.0;
        const n2 = target === ParticleType.GLASS ? 1.5 : 1.0;
        if (n1 !== n2) angle = angle * (n1 / n2);
      } else if (target !== ParticleType.EMPTY && target !== ParticleType.PHOTON && target !== ParticleType.WATER) return;
      curX = nextX; curY = nextY;
    }
    const finalX = Math.round(curX), finalY = Math.round(curY);
    const finalIdx = finalY * this.width + finalX;
    if (finalIdx >= 0 && finalIdx < this.grid.length && (this.nextGrid[finalIdx] === ParticleType.EMPTY || this.nextGrid[finalIdx] === ParticleType.PHOTON)) {
      this.nextGrid[finalIdx] = p; nextDirs[finalIdx] = angle;
    }
  }

  private handleErosion(x: number, y: number, p: ParticleType): void {
    if (p !== ParticleType.WATER) return;
    const ns = [{dx:1, dy:0}, {dx:-1, dy:0}, {dx:0, dy:1}, {dx:0, dy:-1}];
    for (const n of ns) {
      const nx = x + n.dx, ny = y + n.dy;
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        const nidx = ny * this.width + nx;
        const neighbor = this.grid[nidx];
        if (neighbor === ParticleType.CLAY && Math.random() < 0.02) {
          this.grid[nidx] = ParticleType.EMPTY; this.nextGrid[nidx] = ParticleType.EMPTY;
        } else if (neighbor === ParticleType.GRANITE && Math.random() < 0.0005) {
          this.grid[nidx] = ParticleType.EMPTY; this.nextGrid[nidx] = ParticleType.EMPTY;
        }
      }
    }
  }

  private tryPercolate(x: number, y: number, p: ParticleType, maxDepth: number, chance: number): boolean {
    const directions = [{dx:0, dy:1}, {dx:1, dy:0}, {dx:-1, dy:0}, {dx:0, dy:-1}];
    for (const dir of directions) {
      const checkX = x + dir.dx, checkY = y + dir.dy;
      if (checkX >= 0 && checkX < this.width && checkY >= 0 && checkY < this.height) {
        const nidx = checkY * this.width + checkX;
        if (this.grid[nidx] === ParticleType.MEMBRANE) {
          if (Math.random() < chance) {
             for (let d = 2; d <= maxDepth; d++) {
                const px = x + dir.dx * d, py = y + dir.dy * d;
                if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                   const pidx = py * this.width + px;
                   if (this.grid[pidx] === ParticleType.EMPTY && this.nextGrid[pidx] === ParticleType.EMPTY) {
                      this.nextGrid[pidx] = p; return true;
                   }
                   if (this.grid[pidx] !== ParticleType.MEMBRANE) break;
                }
             }
          }
        }
      }
    }
    return false;
  }

  private moveGold(x: number, y: number, idx: number, p: ParticleType, config: SimulationConfig): void {
    const below = (y + 1) * this.width + x;
    if (y < this.height - 1) {
      const target = this.grid[below];
      if (target === ParticleType.EMPTY && this.nextGrid[below] === ParticleType.EMPTY) {
        this.nextGrid[below] = p; return;
      } else if (target === ParticleType.WATER || target === ParticleType.ACID || target === ParticleType.BASE) {
        if (Math.random() < 0.3 && this.nextGrid[below] === ParticleType.EMPTY) {
          this.nextGrid[below] = p; this.grid[idx] = target; return;
        }
      }
    }
    this.nextGrid[idx] = p;
  }

  private moveSilt(x: number, y: number, idx: number, p: ParticleType, config: SimulationConfig): void {
    const solventPresent = (x > 0 && this.grid[idx - 1] === ParticleType.WATER) || 
                           (x < this.width - 1 && this.grid[idx + 1] === ParticleType.WATER);
    const passChance = solventPresent ? 0.7 : 0.3;
    if (this.tryPercolate(x, y, p, 4, passChance)) return;
    this.moveFalling(x, y, idx, p, config);
  }

  private moveMagnetic(x: number, y: number, idx: number, p: ParticleType, config: SimulationConfig): void {
    if (this.magnetPos) {
      const dxN = x - this.magnetPos.x, dyN = y - (this.magnetPos.y - 15);
      const dxS = x - this.magnetPos.x, dyS = y - (this.magnetPos.y + 15);
      const distN = Math.sqrt(dxN*dxN + dyN*dyN), distS = Math.sqrt(dxS*dxS + dyS*dyS);
      if (distN < 180 || distS < 180) {
        const pol = config.magneticPolarity;
        const vx = (pol * (x - this.magnetPos.x) / Math.pow(distN, 2.5)) - (pol * (x - this.magnetPos.x) / Math.pow(distS, 2.5));
        const vy = (pol * (y - (this.magnetPos.y-15)) / Math.pow(distN, 2.5)) - (pol * (y - (this.magnetPos.y+15)) / Math.pow(distS, 2.5));
        const tx = Math.max(0, Math.min(this.width-1, x + Math.round(vx * 2000 * config.molecularMotion)));
        const ty = Math.max(0, Math.min(this.height-1, y + Math.round(vy * 2000 * config.molecularMotion)));
        const tidx = ty * this.width + tx;
        if (this.grid[tidx] === ParticleType.EMPTY && this.nextGrid[tidx] === ParticleType.EMPTY) {
          this.nextGrid[tidx] = p; return;
        }
      }
    }
    this.moveFalling(x, y, idx, p, config);
  }

  private updateChemicalReaction(x: number, y: number, idx: number, p: ParticleType): void {
    const ns = [{dx:1, dy:0}, {dx:-1, dy:0}, {dx:0, dy:1}, {dx:0, dy:-1}];
    for (const n of ns) {
      const nx = x + n.dx, ny = y + n.dy;
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        const nidx = ny * this.width + nx;
        const np = this.grid[nidx];
        if ((p === ParticleType.ACID && np === ParticleType.BASE) || (p === ParticleType.BASE && np === ParticleType.ACID)) {
          this.grid[idx] = ParticleType.SALT; this.grid[nidx] = ParticleType.WATER; break;
        }
      }
    }
  }

  private moveFalling(x: number, y: number, idx: number, p: ParticleType, config: SimulationConfig): void {
    const below = (y + 1) * this.width + x;
    if (y >= this.height - 1) {
       if (this.nextGrid[idx] === ParticleType.EMPTY) this.nextGrid[idx] = p;
       return;
    }

    const target = this.grid[below];
    const isLiquid = target === ParticleType.WATER || target === ParticleType.ACID || target === ParticleType.BASE;

    if (target === ParticleType.EMPTY && this.nextGrid[below] === ParticleType.EMPTY) {
      this.nextGrid[below] = p;
    } else if (p === ParticleType.SALT && isLiquid && Math.random() < 0.2 && this.nextGrid[below] === ParticleType.EMPTY) {
      this.nextGrid[below] = p;
      this.grid[idx] = target; 
    } else {
      const dir = Math.random() > 0.5 ? 1 : -1;
      const diag = (y + 1) * this.width + (x + dir);
      if (x + dir >= 0 && x + dir < this.width && this.grid[diag] === ParticleType.EMPTY && this.nextGrid[diag] === ParticleType.EMPTY) {
        this.nextGrid[diag] = p;
      } else if (this.nextGrid[idx] === ParticleType.EMPTY) {
        this.nextGrid[idx] = p; 
      }
    }
  }

  private moveLiquid(x: number, y: number, idx: number, p: ParticleType, config: SimulationConfig): void {
    let osmoticBias = 0.4;
    const ns = [{dx:0, dy:1}, {dx:0, dy:-1}, {dx:1, dy:0}, {dx:-1, dy:0}];
    for (const n of ns) {
      const mx = x + n.dx, my = y + n.dy;
      if (mx >= 0 && mx < this.width && my >= 0 && my < this.height && this.grid[my * this.width + mx] === ParticleType.MEMBRANE) {
        const localConcentration = this.getSaltDensity(x, y, 6);
        const targetConcentration = this.getSaltDensity(x + n.dx * 3, y + n.dy * 3, 6);
        if (targetConcentration > localConcentration) osmoticBias = 0.98;
        break;
      }
    }

    if (this.tryPercolate(x, y, p, 3, osmoticBias)) return;

    const below = (y + 1) * this.width + x;
    const targetBelow = this.grid[below];

    if (y < this.height - 1 && targetBelow === ParticleType.EMPTY && this.nextGrid[below] === ParticleType.EMPTY) {
      this.nextGrid[below] = p;
    } else if (y < this.height - 1 && targetBelow === ParticleType.SALT && Math.random() < 0.1 && this.nextGrid[below] === ParticleType.EMPTY) {
      this.nextGrid[below] = p;
      this.grid[idx] = ParticleType.SALT; 
    } else {
      const dir = Math.random() > 0.5 ? 1 : -1;
      let moved = false;
      for (let d = 3; d > 0; d--) {
        const tx = x + (dir * d);
        if (tx >= 0 && tx < this.width) {
          const tidx = y * this.width + tx;
          if (this.grid[tidx] === ParticleType.EMPTY && this.nextGrid[tidx] === ParticleType.EMPTY) {
            this.nextGrid[tidx] = p; moved = true; break;
          }
        }
      }
      if (!moved && this.nextGrid[idx] === ParticleType.EMPTY) this.nextGrid[idx] = p;
    }
  }

  private moveGas(x: number, y: number, idx: number, p: ParticleType, config: SimulationConfig): void {
    const motion = Math.max(1, Math.floor(config.molecularMotion * 2));
    const tx = Math.max(0, Math.min(this.width-1, x + Math.floor((Math.random()-0.5)*motion)));
    const ty = Math.max(0, Math.min(this.height-1, y - Math.floor(Math.random()*motion) - 1));
    const tidx = ty * this.width + tx;
    if (this.grid[tidx] === ParticleType.EMPTY && this.nextGrid[tidx] === ParticleType.EMPTY) this.nextGrid[tidx] = p;
    else if (this.nextGrid[idx] === ParticleType.EMPTY) this.nextGrid[idx] = p;
  }
}

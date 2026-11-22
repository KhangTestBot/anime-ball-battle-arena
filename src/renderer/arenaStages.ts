import type { ArenaThemeId } from '../types/game';

export interface ArenaStageDef {
  id: ArenaThemeId;
  name: string;
  series: string;
  accentColor: string;
  floorColor: string;
  borderStroke: string;
  borderGlow: string;
}

export const ARENA_STAGES: readonly ArenaStageDef[] = [
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    series: 'Classic',
    accentColor: '#38bdf8',
    floorColor: '#0b1224',
    borderStroke: '#e2e8f0',
    borderGlow: 'rgba(226, 232, 240, 0.65)',
  },
  {
    id: 'tournament-of-power',
    name: 'Tournament of Power',
    series: 'Dragon Ball',
    accentColor: '#a855f7',
    floorColor: '#131024',
    borderStroke: '#c084fc',
    borderGlow: 'rgba(192, 132, 252, 0.68)',
  },
  {
    id: 'final-valley',
    name: 'Final Valley',
    series: 'Naruto',
    accentColor: '#3b82f6',
    floorColor: '#0f172a',
    borderStroke: '#60a5fa',
    borderGlow: 'rgba(96, 165, 250, 0.65)',
  },
  {
    id: 'shibuya-crossing',
    name: 'Shibuya Crossing',
    series: 'Jujutsu Kaisen',
    accentColor: '#f43f5e',
    floorColor: '#11131c',
    borderStroke: '#fb7185',
    borderGlow: 'rgba(251, 113, 133, 0.68)',
  },
  {
    id: 'marineford-bay',
    name: 'Marineford Bay',
    series: 'One Piece',
    accentColor: '#06b6d4',
    floorColor: '#0c1a2a',
    borderStroke: '#67e8f9',
    borderGlow: 'rgba(103, 232, 249, 0.65)',
  },
  {
    id: 'summoners-rift',
    name: "Summoner's Rift",
    series: 'League of Legends',
    accentColor: '#eab308',
    floorColor: '#0d1a1c',
    borderStroke: '#facc15',
    borderGlow: 'rgba(250, 204, 21, 0.65)',
  },
  {
    id: 'nether-fortress',
    name: 'Nether Fortress',
    series: 'Minecraft',
    accentColor: '#f97316',
    floorColor: '#1c1012',
    borderStroke: '#fb923c',
    borderGlow: 'rgba(251, 146, 60, 0.72)',
  },
  {
    id: 'hueco-mundo',
    name: 'Hueco Mundo',
    series: 'Bleach',
    accentColor: '#e2e8f0',
    floorColor: '#11141d',
    borderStroke: '#cbd5e1',
    borderGlow: 'rgba(203, 213, 225, 0.65)',
  },
];

export function getArenaStageById(id?: ArenaThemeId): ArenaStageDef {
  return ARENA_STAGES.find((s) => s.id === id) ?? ARENA_STAGES[0];
}

/**
 * Renders the selected Battle Arena floor, architecture, and subtle ambient details
 * inside the clipped arena rounded-rect while keeping fighter & VFX readability high.
 */
export function drawArenaStageFloor(
  ctx: CanvasRenderingContext2D,
  themeId: ArenaThemeId | undefined,
  fullSize: number,
  timeSec: number,
): void {
  const stage = getArenaStageById(themeId);
  const half = fullSize * 0.5;

  ctx.save();
  ctx.fillStyle = stage.floorColor;
  ctx.fillRect(0, 0, fullSize, fullSize);

  switch (stage.id) {
    case 'tournament-of-power': {
      // Null Realm deep violet starfield rim
      ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
      for (let i = 0; i < 24; i++) {
        const sx = ((i * 137) % (fullSize - 24)) + 12;
        const sy = ((i * 89) % (fullSize - 24)) + 12;
        ctx.fillRect(sx, sy, 2.5, 2.5);
      }

      // Octagonal Kachi Katchin fighting dais
      const daisR = fullSize * 0.44;
      ctx.fillStyle = '#1b1730';
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        const px = half + Math.cos(a) * daisR;
        const py = half + Math.sin(a) * daisR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Radial stone tile seams & cracked battle ring
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.09)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(half + Math.cos(a) * (fullSize * 0.09), half + Math.sin(a) * (fullSize * 0.09));
        ctx.lineTo(half + Math.cos(a) * daisR, half + Math.sin(a) * daisR);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(half, half, fullSize * 0.26, 0, Math.PI * 2);
      ctx.stroke();

      // Central Time Pillar emblem
      const pulse = 0.22 + Math.sin(timeSec * 3) * 0.06;
      ctx.fillStyle = `rgba(192, 132, 252, ${pulse})`;
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(half, half, fullSize * 0.075, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'final-valley': {
      // Dark basalt cliffs on left and right banks
      ctx.fillStyle = '#161b26';
      ctx.fillRect(0, 0, fullSize * 0.26, fullSize);
      ctx.fillRect(fullSize * 0.74, 0, fullSize * 0.26, fullSize);

      // Rushing indigo river down the middle
      const riverGrad = ctx.createLinearGradient(fullSize * 0.26, 0, fullSize * 0.74, 0);
      riverGrad.addColorStop(0, '#0f213d');
      riverGrad.addColorStop(0.5, '#13315c');
      riverGrad.addColorStop(1, '#0f213d');
      ctx.fillStyle = riverGrad;
      ctx.fillRect(fullSize * 0.26, 0, fullSize * 0.48, fullSize);

      // Animated water current lines flowing downward
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.16)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const rx = fullSize * 0.3 + ((i * 53) % (fullSize * 0.4));
        const ry = ((timeSec * 42 + i * 71) % (fullSize + 60)) - 30;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx, ry + 34);
        ctx.stroke();
      }

      // Twin statue plinth stone circles (Left: Senju / Right: Uchiha)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fullSize * 0.13, half, fullSize * 0.085, 0, Math.PI * 2);
      ctx.arc(fullSize * 0.87, half, fullSize * 0.085, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'shibuya-crossing': {
      // Dark rain-slicked asphalt & sidewalk corners
      ctx.fillStyle = '#1b1f2e';
      const corner = fullSize * 0.2;
      ctx.fillRect(0, 0, corner, corner);
      ctx.fillRect(fullSize - corner, 0, corner, corner);
      ctx.fillRect(0, fullSize - corner, corner, corner);
      ctx.fillRect(fullSize - corner, fullSize - corner, corner, corner);

      // Crisp Shibuya Scramble crosswalk zebra stripes
      ctx.fillStyle = 'rgba(226, 232, 240, 0.13)';
      const stripeW = 14;
      const stripeLen = fullSize * 0.11;
      for (let i = -3; i <= 3; i++) {
        const offset = i * 28;
        // Top & bottom crosswalks
        ctx.fillRect(half + offset - stripeW * 0.5, corner * 0.55, stripeW, stripeLen);
        ctx.fillRect(
          half + offset - stripeW * 0.5,
          fullSize - corner * 0.55 - stripeLen,
          stripeW,
          stripeLen,
        );
        // Left & right crosswalks
        ctx.fillRect(corner * 0.55, half + offset - stripeW * 0.5, stripeLen, stripeW);
        ctx.fillRect(
          fullSize - corner * 0.55 - stripeLen,
          half + offset - stripeW * 0.5,
          stripeLen,
          stripeW,
        );
      }

      // Diagonal scramble crossing stripes
      ctx.save();
      ctx.translate(half, half);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
      for (let i = -3; i <= 3; i++) {
        ctx.fillRect(-stripeLen * 0.5, i * 28 - 5, stripeLen, 10);
      }
      ctx.restore();

      // Subtle cursed Veil perimeter ring
      ctx.strokeStyle = `rgba(244, 63, 94, ${0.18 + Math.sin(timeSec * 3.5) * 0.05})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(half, half, fullSize * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'marineford-bay': {
      // Deep crescent ocean bay on bottom half
      ctx.fillStyle = '#0a2239';
      ctx.beginPath();
      ctx.arc(half, fullSize * 0.88, fullSize * 0.56, Math.PI, 0);
      ctx.lineTo(fullSize, fullSize);
      ctx.lineTo(0, fullSize);
      ctx.closePath();
      ctx.fill();

      // Fortress plaza stone grid on upper half
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 48; x < fullSize; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, fullSize * 0.5);
        ctx.stroke();
      }
      for (let y = 48; y < fullSize * 0.5; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(fullSize, y);
        ctx.stroke();
      }

      // Marine Crescent Harbor Wall arc
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.28)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(half, fullSize * 0.88, fullSize * 0.56, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();

      // Subtle compass rose emblem at center
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.16)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(half, half, fullSize * 0.13, 0, Math.PI * 2);
      ctx.moveTo(half - fullSize * 0.16, half);
      ctx.lineTo(half + fullSize * 0.16, half);
      ctx.moveTo(half, half - fullSize * 0.16);
      ctx.lineTo(half, half + fullSize * 0.16);
      ctx.stroke();
      break;
    }

    case 'summoners-rift': {
      // Diagonal mid-lane stone path (bottom-left to top-right)
      ctx.strokeStyle = 'rgba(202, 138, 4, 0.14)';
      ctx.lineWidth = fullSize * 0.16;
      ctx.beginPath();
      ctx.moveTo(0, fullSize);
      ctx.lineTo(fullSize, 0);
      ctx.stroke();

      // Diagonal Summoner's Rift river (top-left to bottom-right)
      ctx.strokeStyle = 'rgba(14, 116, 144, 0.26)';
      ctx.lineWidth = fullSize * 0.14;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(fullSize, fullSize);
      ctx.stroke();

      // Baron Pit (top-left river) & Dragon Pit (bottom-right river) stone rings
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fullSize * 0.24, fullSize * 0.24, fullSize * 0.085, 0, Math.PI * 2);
      ctx.arc(fullSize * 0.76, fullSize * 0.76, fullSize * 0.085, 0, Math.PI * 2);
      ctx.stroke();

      // Center Hextech diamond rune
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(half, half - fullSize * 0.12);
      ctx.lineTo(half + fullSize * 0.12, half);
      ctx.lineTo(half, half + fullSize * 0.12);
      ctx.lineTo(half - fullSize * 0.12, half);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'nether-fortress': {
      // Pixelated Nether Brick masonry grid
      const tile = 32;
      ctx.strokeStyle = 'rgba(127, 29, 29, 0.32)';
      ctx.lineWidth = 1.5;
      for (let y = 0; y < fullSize; y += tile) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(fullSize, y);
        ctx.stroke();
        const offset = (Math.floor(y / tile) % 2) * (tile * 0.5);
        for (let x = offset; x < fullSize; x += tile) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + tile);
          ctx.stroke();
        }
      }

      // Glowing molten lava border trenches
      const lavaPulse = 0.22 + Math.sin(timeSec * 4) * 0.06;
      ctx.strokeStyle = `rgba(249, 115, 22, ${lavaPulse})`;
      ctx.lineWidth = 12;
      ctx.strokeRect(12, 12, fullSize - 24, fullSize - 24);

      // 4 Obsidian corner bastion pillars
      ctx.fillStyle = '#2e1065';
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 1.5;
      const pSize = 26;
      for (const [px, py] of [
        [24, 24],
        [fullSize - 24 - pSize, 24],
        [24, fullSize - 24 - pSize],
        [fullSize - 24 - pSize, fullSize - 24 - pSize],
      ]) {
        ctx.fillRect(px, py, pSize, pSize);
        ctx.strokeRect(px, py, pSize, pSize);
      }

      // Floating pixel embers
      ctx.fillStyle = 'rgba(251, 146, 60, 0.35)';
      for (let i = 0; i < 14; i++) {
        const ex = ((i * 97) % (fullSize - 40)) + 20;
        const ey = (fullSize - ((timeSec * 28 + i * 67) % fullSize) + fullSize) % fullSize;
        ctx.fillRect(ex, ey, 3.5, 3.5);
      }
      break;
    }

    case 'hueco-mundo': {
      // Subtle moonlit sand dune wave contours
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.1)';
      ctx.lineWidth = 2;
      for (let row = 1; row <= 5; row++) {
        const yBase = (fullSize / 6) * row;
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        ctx.bezierCurveTo(
          fullSize * 0.33,
          yBase - 18,
          fullSize * 0.66,
          yBase + 18,
          fullSize,
          yBase,
        );
        ctx.stroke();
      }

      // Giant pale crescent moon reflection at center
      ctx.fillStyle = 'rgba(226, 232, 240, 0.08)';
      ctx.beginPath();
      ctx.arc(half, half, fullSize * 0.19, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = stage.floorColor;
      ctx.beginPath();
      ctx.arc(half + fullSize * 0.06, half - fullSize * 0.04, fullSize * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // Las Noches geometric pillars at corners
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.18)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, fullSize - 48, fullSize - 48);
      break;
    }

    case 'cyber-grid':
    default: {
      const step = 40;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let pos = step; pos < fullSize; pos += step) {
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, fullSize);
        ctx.moveTo(0, pos);
        ctx.lineTo(fullSize, pos);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.13)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(half, half, fullSize * 0.16, 0, Math.PI * 2);
      ctx.moveTo(half - 16, half);
      ctx.lineTo(half + 16, half);
      ctx.moveTo(half, half - 16);
      ctx.lineTo(half, half + 16);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

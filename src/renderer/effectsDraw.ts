import type { BattleEngine } from '../physics/engine';
import type {
  Beam,
  Bomb,
  FighterState,
  FloatingText,
  LightningBolt,
  Minion,
  Particle,
  Projectile,
  RicochetArm,
  Shockwave,
  SkyPillar,
  SlashEffect,
  TrailNode,
} from '../types/game';
import { hexWithAlpha } from './characterDraw';
import { drawCharacterUniqueCrest, getCharacterVfxDNA } from './vfxIdentity';

export function drawTrails(ctx: CanvasRenderingContext2D, trails: TrailNode[], t: number): void {
  for (const tr of trails) {
    const ratio = Math.max(0, tr.life / tr.maxLife);
    const dna = getCharacterVfxDNA(tr.ownerCharId, tr.ownerSeries);
    const baseColor = tr.color || '#f97316';
    const secColor = tr.secondaryColor || '#ffffff';

    ctx.save();
    ctx.globalAlpha = Math.min(0.9, ratio * 1.15);
    const r = tr.radius * (0.72 + 0.28 * ratio);

    // 1. Preserve signature specialized trails (Steve's Ender Dragon Breath, Warden's Sculk, Tanjiro's Water, Sasuke's Amaterasu)
    if (tr.element === 'dragon-breath') {
      const grad = ctx.createRadialGradient(tr.x, tr.y, 2, tr.x, tr.y, r);
      grad.addColorStop(0, 'rgba(240, 171, 252, 0.92)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.78)');
      grad.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, r, 0, Math.PI * 2);
      ctx.fill();
      for (let b = 0; b < 3; b++) {
        const a = t * 3.5 + b * 2.1;
        const bx = tr.x + Math.cos(a) * r * 0.45;
        const by = tr.y + Math.sin(a) * r * 0.45 - ((t * 20 + b * 7) % 10);
        ctx.fillStyle = b === 0 ? 'rgba(240, 171, 252, 0.88)' : 'rgba(192, 132, 252, 0.72)';
        ctx.beginPath();
        ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      continue;
    }

    if (tr.element === 'sculk') {
      const grad = ctx.createRadialGradient(tr.x, tr.y, 2, tr.x, tr.y, r);
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.85)');
      grad.addColorStop(0.45, 'rgba(15, 41, 51, 0.92)');
      grad.addColorStop(1, 'rgba(4, 47, 46, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22d3ee';
      for (let k = 0; k < 4; k++) {
        const a = k * 1.57 + t * 1.2;
        ctx.fillRect(tr.x + Math.cos(a) * r * 0.42 - 2, tr.y + Math.sin(a) * r * 0.42 - 2, 4, 4);
      }
      ctx.restore();
      continue;
    }

    // 2. Franchise-Native Trail Styles (14 distinct anime/game floor hazard aesthetics!)
    ctx.translate(tr.x, tr.y);
    switch (dna.trailStyle) {
      case 'minecraft-voxel': {
        // Blocky pixelated Minecraft lava / fire / magic tile!
        ctx.fillStyle = hexWithAlpha(baseColor, 0.72);
        ctx.fillRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7);
        ctx.fillStyle = hexWithAlpha(secColor, 0.75);
        ctx.fillRect(-r * 0.45, -r * 0.45, r * 0.45, r * 0.45);
        ctx.fillRect(r * 0.05, r * 0.05, r * 0.45, r * 0.45);
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7);
        break;
      }

      case 'ukiyo-breath': {
        // Demon Slayer Ukiyo-e Woodblock Wave / Sun Flame Scroll Curls!
        const isWater = tr.element === 'water';
        const c1 = isWater ? '#0ea5e9' : tr.element === 'sun' ? '#facc15' : baseColor;
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
        grad.addColorStop(0, hexWithAlpha('#ffffff', 0.88));
        grad.addColorStop(0.5, hexWithAlpha(c1, 0.76));
        grad.addColorStop(1, hexWithAlpha(c1, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.62, t * 4, t * 4 + Math.PI * 1.25);
        ctx.stroke();
        break;
      }

      case 'fma-transmute':
      case 'fairy-magic-rune': {
        // Glowing Alchemical Transmutation / Fairy Tail Magic Floor Seal!
        ctx.fillStyle = hexWithAlpha(baseColor, 0.25);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'naruto-shinobi': {
        // Amaterasu pitch-black flames or Chakra sealing pool!
        const isAma =
          tr.element === 'amaterasu' || tr.ownerCharId === 'sasuke' || tr.ownerCharId === 'itachi';
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
        grad.addColorStop(0, isAma ? 'rgba(9, 9, 11, 0.96)' : hexWithAlpha('#ffffff', 0.85));
        grad.addColorStop(0.55, hexWithAlpha(isAma ? '#9333ea' : baseColor, 0.78));
        grad.addColorStop(1, hexWithAlpha(baseColor, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'jjk-cursed':
      case 'bleach-reiatsu':
      case 'solo-shadow-mist': {
        // Dark-core Cursed Energy / Sumi-e Reiatsu / Rising Shadow Monarch Mist!
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
        grad.addColorStop(0, 'rgba(9, 9, 11, 0.94)');
        grad.addColorStop(0.6, hexWithAlpha(baseColor, 0.78));
        grad.addColorStop(1, hexWithAlpha(baseColor, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = secColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.72, t * 3, t * 3 + Math.PI * 1.1);
        ctx.stroke();
        break;
      }

      case 'undertale-pixel': {
        // Monochrome Pixel Karma Floor Tile!
        ctx.fillStyle = hexWithAlpha(baseColor, 0.42);
        ctx.fillRect(-r * 0.78, -r * 0.78, r * 1.56, r * 1.56);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-r * 0.78, -r * 0.78, r * 1.56, r * 1.56);
        break;
      }

      case 'jojo-menacing': {
        // JoJo Distorted Menacing Floor Aura + Tiny "ゴ"!
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
        grad.addColorStop(0, hexWithAlpha(baseColor, 0.85));
        grad.addColorStop(1, hexWithAlpha(baseColor, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.font = '900 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ゴ', 0, 0);
        break;
      }

      default: {
        // One Piece Fruit / LoL Arcane Zone / AoT Steam / Chainsaw Blood
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
        grad.addColorStop(0, hexWithAlpha(secColor, 0.9));
        grad.addColorStop(0.55, hexWithAlpha(baseColor, 0.76));
        grad.addColorStop(1, hexWithAlpha(baseColor, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    // Personal character crest inside floor trail
    drawCharacterUniqueCrest(ctx, dna, r * 0.75, baseColor, secColor, t);
    ctx.restore();
  }
}

export function drawBombs(ctx: CanvasRenderingContext2D, bombs: Bomb[], t: number): void {
  for (const b of bombs) {
    const progress = 1 - b.fuseTimer / Math.max(0.01, b.maxFuse);
    const flash = Math.floor(t * (10 + progress * 18)) % 2 === 0;
    const s = b.radius * (1 + progress * 0.14);
    const dna = getCharacterVfxDNA(b.ownerCharId, b.ownerSeries);
    const secColor = b.secondaryColor || '#ffffff';

    ctx.save();
    ctx.translate(b.x, b.y);

    // Character-specific iconic bombs stay exclusive to their true owners / franchise!
    if (b.kind === 'obsidian-block' && dna.seriesId === 'minecraft') {
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.4;
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(-s * 0.72, -s * 0.72, s * 0.52, s * 0.48);
      ctx.fillRect(s * 0.15, s * 0.1, s * 0.56, s * 0.56);
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(-s * 0.12, -s * 0.42, s * 0.36, s * 0.32);
      ctx.strokeStyle = flash ? '#ffffff' : 'rgba(192, 132, 252, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-s + 3, -s + 3, s * 2 - 6, s * 2 - 6);
      drawCharacterUniqueCrest(ctx, dna, s * 0.8, b.color, secColor, t);
      ctx.restore();
      continue;
    }

    if (b.kind === 'chomper' && b.ownerCharId === 'jinx') {
      const snap = Math.abs(Math.sin(t * 20)) * 0.28;
      ctx.strokeStyle = `rgba(236, 72, 153, ${0.25 + progress * 0.45})`;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, b.blastRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -s * snap, s * 0.95, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, s * snap, s * 0.95, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      for (let k = -2; k <= 2; k++) {
        ctx.fillRect(k * (s * 0.32) - 2, -s * snap - 2, 4, 5);
      }
      ctx.fillStyle = flash ? '#facc15' : '#ec4899';
      ctx.beginPath();
      ctx.arc(-s * 0.34, -s * (0.42 + snap), 3, 0, Math.PI * 2);
      ctx.arc(s * 0.34, -s * (0.42 + snap), 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (b.kind === 'glitch-bomb' && b.ownerCharId === 'entity303') {
      ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.fillStyle = flash ? '#ef4444' : '#d946ef';
      ctx.fillRect(-s, -s, s, s);
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('303', 0, 0.5);
      ctx.restore();
      continue;
    }

    if (b.kind === 'mushroom' && b.ownerCharId === 'teemo') {
      ctx.fillStyle = '#fde68a';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-s * 0.42, 0, s * 0.84, s * 0.85, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = flash ? '#4ade80' : '#9333ea';
      ctx.beginPath();
      ctx.arc(0, 2, s * 0.98, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(-s * 0.42, -s * 0.35, s * 0.19, 0, Math.PI * 2);
      ctx.arc(s * 0.38, -s * 0.38, s * 0.17, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (b.kind === 'tnt' && dna.seriesId === 'minecraft') {
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.22 + progress * 0.45})`;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, b.blastRadius * (0.4 + 0.6 * progress), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = flash ? '#ffffff' : '#dc2626';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.2;
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      if (!flash) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-s + 1, -s * 0.34, s * 2 - 2, s * 0.68);
        ctx.fillStyle = '#09090b';
        ctx.font = '900 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TNT', 0, 0.5);
      }
      ctx.restore();
      continue;
    }

    // Franchise-Native Trap/Bomb Sculptures (14+ distinct anime & game trap models!)
    ctx.strokeStyle = hexWithAlpha(b.color, 0.25 + progress * 0.5);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, b.blastRadius * (0.45 + 0.45 * progress), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.shadowColor = b.color;
    ctx.shadowBlur = 12;

    switch (dna.bombStyle) {
      case 'naruto-paper-bomb': {
        // Shinobi Explosive Tag (Kibaku Fuda) paper talisman with "爆" kanji!
        ctx.rotate(Math.sin(t * 9) * 0.14);
        ctx.fillStyle = flash ? '#fef08a' : '#f8fafc';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.fillRect(-s * 0.65, -s * 1.05, s * 1.3, s * 2.1);
        ctx.strokeRect(-s * 0.65, -s * 1.05, s * 1.3, s * 2.1);
        ctx.fillStyle = '#dc2626';
        ctx.font = '900 13px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('爆', 0, 1);
        break;
      }

      case 'fma-alchemy-mine': {
        // Fullmetal Alchemist Glowing Explosive Transmutation Circle!
        ctx.rotate(t * 3);
        ctx.fillStyle = hexWithAlpha('#38bdf8', 0.28);
        ctx.beginPath();
        ctx.arc(0, 0, s * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = flash ? '#ffffff' : b.color;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3;
          if (i === 0) ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s);
          else ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
        }
        ctx.closePath();
        ctx.stroke();
        break;
      }

      case 'fairy-rune-mine': {
        // Fairy Tail / Black Clover Magic Rune Seal Mine!
        ctx.rotate(-t * 3.2);
        ctx.fillStyle = hexWithAlpha(b.color, 0.35);
        ctx.strokeStyle = flash ? '#ffffff' : b.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, s * 1.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = secColor;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const nextA = ((i + 2) * Math.PI) / 3;
          ctx.moveTo(Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.9);
          ctx.lineTo(Math.cos(nextA) * s * 0.9, Math.sin(nextA) * s * 0.9);
        }
        ctx.stroke();
        break;
      }

      case 'fate-planted-sword': {
        // Fate Noble Phantasm Sword planted vertically in arena floor!
        ctx.fillStyle = flash ? '#ffffff' : '#facc15';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, s * 1.1);
        ctx.lineTo(-s * 0.28, -s * 0.55);
        ctx.lineTo(s * 0.28, -s * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = b.color;
        ctx.fillRect(-s * 0.72, -s * 0.72, s * 1.44, s * 0.24);
        ctx.fillRect(-s * 0.14, -s * 1.2, s * 0.28, s * 0.5);
        break;
      }

      case 'jojo-sheer-heart': {
        // JoJo Killer Queen / Stand Skull Tank Bomb!
        ctx.fillStyle = flash ? '#facc15' : '#1e1b4b';
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-s, -s * 0.75, s * 2, s * 1.5, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(-s * 0.35, -s * 0.1, 3.5, 0, Math.PI * 2);
        ctx.arc(s * 0.35, -s * 0.1, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'chainsaw-grenade': {
        // Chainsaw Man / MHA Grenade Core with Pulling Pin!
        ctx.fillStyle = flash ? '#ffffff' : '#18181b';
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(0, s * 0.12, s * 0.8, s * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s * 0.45, -s * 0.85, s * 0.32, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'jjk-cursed-talisman': {
        // JJK / Bleach Dark Cursed Seal Barrier Stake!
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = flash ? '#ffffff' : b.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.15);
        ctx.lineTo(s * 0.85, 0);
        ctx.lineTo(0, s * 1.15);
        ctx.lineTo(-s * 0.85, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'undertale-pixel-trap': {
        // Undertale White Battle-Frame Pixel Bomb!
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = flash ? b.color : '#ffffff';
        ctx.lineWidth = 2.6;
        ctx.fillRect(-s * 0.88, -s * 0.88, s * 1.76, s * 1.76);
        ctx.strokeRect(-s * 0.88, -s * 0.88, s * 1.76, s * 1.76);
        ctx.fillStyle = b.color;
        ctx.fillRect(-s * 0.34, -s * 0.34, s * 0.68, s * 0.68);
        break;
      }

      case 'onepiece-quake-bubble': {
        // One Piece Cracking Air-Quake / Devil Fruit Bubble!
        ctx.fillStyle = hexWithAlpha(b.color, 0.32);
        ctx.strokeStyle = flash ? '#ffffff' : '#e2e8f0';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        for (let k = 0; k < 5; k++) {
          const a = k * 1.25;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
          ctx.stroke();
        }
        break;
      }

      case 'demon-blood-lotus': {
        // Demon Slayer Ice Crystal / Blood Demon Lotus!
        ctx.rotate(t * 2.5);
        for (let k = 0; k < 6; k++) {
          ctx.rotate(Math.PI / 3);
          ctx.fillStyle = flash ? '#ffffff' : b.color;
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(s * 0.55, -s * 0.42, s * 1.05, 0);
          ctx.quadraticCurveTo(s * 0.55, s * 0.42, 0, 0);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }

      default: {
        // LoL Hextech Mine / Solo Leveling Shadow Mine / Obsidian Crystal
        ctx.fillStyle = flash ? '#ffffff' : '#0f172a';
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          if (i === 0) ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s);
          else ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
    }

    // Overlay character's personal crest so even two bombs from the same series look distinct!
    drawCharacterUniqueCrest(ctx, dna, s * 0.72, b.color, secColor, t);
    ctx.restore();
  }
}

export function drawSkyPillars(
  ctx: CanvasRenderingContext2D,
  pillars: SkyPillar[],
  boundsTop: number,
  t: number,
): void {
  for (const pil of pillars) {
    const dna = getCharacterVfxDNA(pil.ownerCharId, pil.ownerSeries);
    const secColor = pil.secondaryColor || '#ffffff';

    ctx.save();
    if (pil.telegraphTimer > 0) {
      ctx.strokeStyle = hexWithAlpha(pil.color, 0.72);
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(pil.x, boundsTop);
      ctx.lineTo(pil.x, pil.targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.translate(pil.x, pil.targetY);
      ctx.strokeStyle = pil.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, pil.width * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      drawCharacterUniqueCrest(ctx, dna, pil.width * 0.55, pil.color, secColor, t);
    } else {
      const alpha = Math.max(0, pil.activeTimer / Math.max(0.01, pil.maxActive));
      const w = pil.width * (0.65 + 0.55 * alpha);
      ctx.globalAlpha = Math.min(1, alpha * 1.25);

      ctx.shadowColor = pil.color;
      ctx.shadowBlur = 24;
      const grad = ctx.createLinearGradient(pil.x - w * 0.65, 0, pil.x + w * 0.65, 0);
      grad.addColorStop(0, hexWithAlpha(pil.color, 0));
      grad.addColorStop(0.28, hexWithAlpha(pil.color, 0.68));
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.96)');
      grad.addColorStop(0.72, hexWithAlpha(pil.color, 0.68));
      grad.addColorStop(1, hexWithAlpha(pil.color, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(pil.x - w * 0.65, boundsTop, w * 1.3, pil.targetY - boundsTop + 16);

      // Franchise-Specific Sky Judgment Sculpture plunging into targetY!
      switch (dna.pillarStyle) {
        case 'mc-herobrine-bolt': {
          // Stepped blocky pixel lightning column + Minecraft bedrock crack!
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(4, w * 0.2);
          ctx.beginPath();
          let cy = boundsTop;
          let cx = pil.x;
          ctx.moveTo(cx, cy);
          while (cy < pil.targetY) {
            cy = Math.min(pil.targetY, cy + 36);
            cx = pil.x + (Math.floor(cy / 36) % 2 === 0 ? w * 0.25 : -w * 0.25);
            ctx.lineTo(cx, cy);
            ctx.lineTo(pil.x, cy);
          }
          ctx.stroke();
          break;
        }

        case 'fate-sky-sword':
        case 'lol-demacia-sword':
        case 'bleach-bankai-blade': {
          // Colossal Radiant Greatsword / Noble Phantasm / Bankai Blade plunging straight down!
          ctx.fillStyle = dna.pillarStyle === 'bleach-bankai-blade' ? '#09090b' : pil.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(pil.x, pil.targetY + 6);
          ctx.lineTo(pil.x - w * 0.44, pil.targetY - 102);
          ctx.lineTo(pil.x + w * 0.44, pil.targetY - 102);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = secColor;
          ctx.fillRect(pil.x - w * 0.85, pil.targetY - 112, w * 1.7, 12);
          break;
        }

        case 'naruto-chibaku-meteor':
        case 'fma-stone-spire':
        case 'onepiece-meteor-fist': {
          // Crashing Chibaku Meteor / Erupting Alchemy Stone Spire / Giant Haki Fist!
          ctx.fillStyle = dna.pillarStyle === 'fma-stone-spire' ? '#57534e' : '#292524';
          ctx.strokeStyle = pil.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(pil.x, pil.targetY - 125);
          ctx.lineTo(pil.x + w * 0.62, pil.targetY - 22);
          ctx.lineTo(pil.x, pil.targetY + 8);
          ctx.lineTo(pil.x - w * 0.62, pil.targetY - 22);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'dragonball-spirit-drop':
        case 'fairy-starfall': {
          // Descending Blazing Spirit Sphere / Urano Metria Star!
          ctx.fillStyle = pil.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(pil.x, pil.targetY - 42, w * 0.62, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'solo-monarch-lance':
        case 'jjk-fuga-pillar': {
          // Dark-core Cursed Fire Arrow / Shadow Monarch Spear plunging down!
          ctx.fillStyle = '#09090b';
          ctx.strokeStyle = pil.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(pil.x, pil.targetY + 8);
          ctx.lineTo(pil.x - w * 0.38, pil.targetY - 88);
          ctx.lineTo(pil.x, pil.targetY - 125);
          ctx.lineTo(pil.x + w * 0.38, pil.targetY - 88);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        default: {
          // AoT Golden Titan Lightning Column!
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = Math.max(3, w * 0.18);
          ctx.beginPath();
          ctx.moveTo(pil.x, boundsTop);
          for (let i = 1; i < 7; i++) {
            const y = boundsTop + ((pil.targetY - boundsTop) * i) / 7;
            ctx.lineTo(pil.x + Math.sin(t * 70 + i * 9 + pil.x) * (w * 0.28), y);
          }
          ctx.lineTo(pil.x, pil.targetY);
          ctx.stroke();
          break;
        }
      }

      // Impact crater + character's personal crest at targetY
      ctx.translate(pil.x, pil.targetY);
      ctx.fillStyle = hexWithAlpha(pil.color, 0.45);
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.78, w * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      drawCharacterUniqueCrest(ctx, dna, w * 0.52, pil.color, secColor, t);
    }
    ctx.restore();
  }
}

export function drawLightningBolts(ctx: CanvasRenderingContext2D, bolts: LightningBolt[]): void {
  for (const bolt of bolts) {
    if (bolt.points.length < 2) continue;
    const alpha = Math.max(0, bolt.life / bolt.maxLife);
    const dna = getCharacterVfxDNA(bolt.ownerCharId, bolt.ownerSeries);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = dna.lightningStyle === 'mc-stepped-voxel' ? 'square' : 'round';
    ctx.lineJoin = dna.lightningStyle === 'mc-stepped-voxel' ? 'miter' : 'round';

    ctx.shadowColor = bolt.color;
    ctx.shadowBlur = 18;

    if (dna.lightningStyle === 'jjk-black-flash' || dna.lightningStyle === 'onepiece-conqueror') {
      // Iconic Black-Core Crimson-Edge JJK Black Flash / One Piece Conqueror's Haki Lightning!
      ctx.strokeStyle = bolt.color;
      ctx.lineWidth = bolt.width * 1.45;
      ctx.beginPath();
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
      for (let i = 1; i < bolt.points.length; i++) ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = Math.max(2.6, bolt.width * 0.65);
      ctx.stroke();
    } else if (dna.lightningStyle === 'mc-stepped-voxel') {
      // Stepped 90-degree blocky Minecraft Pixel Lightning!
      ctx.strokeStyle = bolt.color;
      ctx.lineWidth = bolt.width * 1.1;
      ctx.beginPath();
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
      for (let i = 1; i < bolt.points.length; i++) {
        ctx.lineTo(bolt.points[i].x, bolt.points[i - 1].y);
        ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      }
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, bolt.width * 0.42);
      ctx.stroke();
    } else {
      ctx.strokeStyle = bolt.color;
      ctx.lineWidth = bolt.width;
      ctx.beginPath();
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
      for (let i = 1; i < bolt.points.length; i++) ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = bolt.coreColor;
      ctx.lineWidth = Math.max(1.8, bolt.width * 0.42);
      ctx.stroke();

      // Secondary parallel electric filament for Godspeed / Thunderclap / Alchemy arcs
      if (
        dna.lightningStyle === 'hxh-godspeed-nerve' ||
        dna.lightningStyle === 'demon-thunderclap' ||
        dna.lightningStyle === 'fma-alchemy-spark'
      ) {
        ctx.strokeStyle = hexWithAlpha(bolt.color, 0.72);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bolt.points[0].x + 5, bolt.points[0].y - 5);
        for (let i = 1; i < bolt.points.length; i++) {
          ctx.lineTo(bolt.points[i].x - 5, bolt.points[i].y + 5);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

export function drawOdmLines(ctx: CanvasRenderingContext2D, engine: BattleEngine): void {
  for (const f of engine.fighters) {
    if (!f.alive || f.odmActiveTimer <= 0) continue;
    const form = engine.getForm(f);
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(f.x - 4, f.y - 4);
    ctx.lineTo(f.odmAnchorX, f.odmAnchorY);
    ctx.moveTo(f.x + 4, f.y + 4);
    ctx.lineTo(f.odmAnchorX, f.odmAnchorY);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(f.odmAnchorX, f.odmAnchorY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = form.auraColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = form.auraColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius + 15, f.spinAngle, f.spinAngle + Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawRicochetArms(
  ctx: CanvasRenderingContext2D,
  arms: RicochetArm[],
  t: number,
): void {
  for (const arm of arms) {
    if (arm.points.length < 2) continue;
    const fade = Math.min(1, arm.life / 0.25);
    const dna = getCharacterVfxDNA(arm.ownerCharId, arm.ownerSeries);

    ctx.save();
    ctx.globalAlpha = fade;
    ctx.lineCap = dna.armStyle === 'minecraft-voxel-hook' ? 'square' : 'round';
    ctx.lineJoin = dna.armStyle === 'minecraft-voxel-hook' ? 'miter' : 'round';

    ctx.shadowColor = arm.glowColor;
    ctx.shadowBlur = arm.isGear5 ? 20 : 12;

    if (dna.armStyle === 'chain-linked') {
      // Metallic Linked Chains (Kurapika / Thresh / Scorpion / Makima / Kratos)!
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 8;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(arm.points[0].x, arm.points[0].y);
      for (let i = 1; i < arm.points.length; i++) ctx.lineTo(arm.points[i].x, arm.points[i].y);
      ctx.stroke();
      ctx.strokeStyle = arm.glowColor;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (dna.armStyle === 'onepiece-string') {
      // Razor-thin glowing multi-strand Puppet Strings (Doflamingo / Rui)!
      for (const off of [-4, 0, 4]) {
        ctx.strokeStyle = off === 0 ? '#ffffff' : arm.glowColor;
        ctx.lineWidth = off === 0 ? 1.8 : 1.2;
        ctx.beginPath();
        ctx.moveTo(arm.points[0].x + off, arm.points[0].y + off);
        for (let i = 1; i < arm.points.length; i++) {
          ctx.lineTo(arm.points[i].x + off, arm.points[i].y + off);
        }
        ctx.stroke();
      }
    } else if (
      dna.armStyle === 'mha-blackwhip' ||
      dna.armStyle === 'chainsaw-tendril' ||
      dna.armStyle === 'solo-shadow-tether'
    ) {
      // Jagged crackling Blackwhip / Blood Tendril / Shadow Whip!
      ctx.strokeStyle = arm.glowColor;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(arm.points[0].x, arm.points[0].y);
      for (let i = 1; i < arm.points.length; i++) {
        const prev = arm.points[i - 1];
        const curr = arm.points[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const len = Math.hypot(dx, dy);
        const nx = len > 1 ? -dy / len : 0;
        const ny = len > 1 ? dx / len : 0;
        for (let s = 1; s < 4; s++) {
          const frac = s / 4;
          const jitter = Math.sin(t * 42 + i * 9 + s * 11) * 8;
          ctx.lineTo(prev.x + dx * frac + nx * jitter, prev.y + dy * frac + ny * jitter);
        }
        ctx.lineTo(curr.x, curr.y);
      }
      ctx.stroke();
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 4.2;
      ctx.stroke();
    } else if (dna.armStyle === 'hxh-bungee-gum') {
      // Translucent elastic Pink Bungee Gum ribbon!
      ctx.strokeStyle = hexWithAlpha(arm.glowColor, 0.72);
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(arm.points[0].x, arm.points[0].y);
      for (let i = 1; i < arm.points.length; i++) ctx.lineTo(arm.points[i].x, arm.points[i].y);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.6;
      ctx.stroke();
    } else if (dna.armStyle === 'bleach-segmented-blade') {
      // Segmented Fang Sword-Whip (Renji Zabimaru / Bleach)!
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(arm.points[0].x, arm.points[0].y);
      for (let i = 1; i < arm.points.length; i++) ctx.lineTo(arm.points[i].x, arm.points[i].y);
      ctx.stroke();
      ctx.strokeStyle = arm.glowColor;
      ctx.lineWidth = 10;
      ctx.setLineDash([7, 9]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // Luffy Elastic Arm (Gear 5 cartoon coil if isGear5) / Stand Rush / Naruto Wood-Chakra / LoL Tether
      ctx.strokeStyle = arm.isGear5 ? '#ffffff' : arm.glowColor;
      ctx.lineWidth = arm.isGear5 ? 11 : 9.5;
      ctx.beginPath();
      ctx.moveTo(arm.points[0].x, arm.points[0].y);
      for (let i = 1; i < arm.points.length; i++) {
        const prev = arm.points[i - 1];
        const curr = arm.points[i];
        if (arm.isGear5) {
          const steps = 4;
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const len = Math.hypot(dx, dy);
          const nx = len > 1 ? -dy / len : 0;
          const ny = len > 1 ? dx / len : 0;
          for (let s = 1; s < steps; s++) {
            const frac = s / steps;
            const jitter = Math.sin(t * 48 + i * 7 + s * 13) * 10;
            ctx.lineTo(prev.x + dx * frac + nx * jitter, prev.y + dy * frac + ny * jitter);
          }
        }
        ctx.lineTo(curr.x, curr.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = arm.isGear5 ? '#f5f3ff' : arm.color;
      ctx.lineWidth = arm.isGear5 ? 5.5 : 5.5;
      ctx.stroke();
    }

    // Character-specific head weapon tip!
    const fistR = arm.isGear5 ? 15 : 13;
    ctx.translate(arm.headX, arm.headY);
    if (dna.armStyle === 'chain-linked' || dna.armStyle === 'bleach-segmented-blade') {
      // Spear / Kunai / Judgment Blade tip!
      const headAng = Math.atan2(arm.vy, arm.vx);
      ctx.rotate(headAng);
      ctx.fillStyle = arm.glowColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fistR * 1.4, 0);
      ctx.lineTo(-fistR * 0.7, -fistR * 0.65);
      ctx.lineTo(-fistR * 0.3, 0);
      ctx.lineTo(-fistR * 0.7, fistR * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (dna.armStyle === 'minecraft-voxel-hook') {
      ctx.fillStyle = arm.glowColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.2;
      ctx.fillRect(-fistR * 0.85, -fistR * 0.85, fistR * 1.7, fistR * 1.7);
      ctx.strokeRect(-fistR * 0.85, -fistR * 0.85, fistR * 1.7, fistR * 1.7);
    } else {
      ctx.fillStyle = arm.isGear5 ? '#ffffff' : arm.color;
      ctx.strokeStyle = '#070b14';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = arm.glowColor;
      ctx.shadowBlur = arm.isGear5 ? 18 : 10;
      ctx.beginPath();
      ctx.arc(0, 0, fistR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    drawCharacterUniqueCrest(ctx, dna, fistR * 0.9, arm.color, '#ffffff', t);
    ctx.restore();
  }
}

export function drawBeams(
  ctx: CanvasRenderingContext2D,
  beams: Beam[],
  fullSize: number,
  t: number,
): void {
  const len = fullSize * 1.65;
  for (const b of beams) {
    const ratio = Math.max(0, Math.min(1, b.life / Math.min(0.22, b.maxLife)));
    const pulse = 1 + Math.sin(t * 55) * 0.1;
    const w = b.width * ratio * pulse;
    const dna = getCharacterVfxDNA(b.ownerCharId, b.ownerSeries);
    const secColor = b.secondaryColor || '#ffffff';
    const bStyle =
      b.style === 'gaster' || b.ownerCharId === 'sans'
        ? 'gaster-skull'
        : b.style === 'zoltraak' || b.ownerCharId === 'frieren'
          ? 'zoltraak-hex'
          : dna.beamStyle;

    ctx.save();
    ctx.translate(b.originX, b.originY);
    ctx.rotate(b.angle);

    ctx.shadowColor = b.color;
    ctx.shadowBlur = 22;

    if (bStyle === 'minecraft-beacon') {
      // Crisp Stepped Blocky Minecraft Beacon Laser (zero rounded corners!)
      ctx.fillStyle = hexWithAlpha(b.color, 0.48);
      ctx.fillRect(0, -w * 0.88, len, w * 1.76);
      ctx.fillStyle = b.color;
      ctx.fillRect(0, -w * 0.56, len, w * 1.12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -w * 0.24, len, w * 0.48);
      // Square pixel beacon pulses traveling down beam
      const pOff = (t * 650) % 64;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let x = 24 + pOff; x < fullSize * 1.1; x += 64) {
        ctx.strokeRect(x - 6, -w * 0.72, 12, w * 1.44);
      }
    } else if (bStyle === 'fate-excalibur') {
      // Radiant Golden Excalibur Sword-Light Column with Crossguard Muzzle!
      ctx.fillStyle = hexWithAlpha('#facc15', 0.45);
      ctx.beginPath();
      ctx.roundRect(0, -w * 0.95, len, w * 1.9, w);
      ctx.fill();
      ctx.fillStyle = b.color;
      ctx.fillRect(0, -w * 0.55, len, w * 1.1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -w * 0.28, len, w * 0.56);
      // Excalibur crossguard flare at origin
      ctx.fillStyle = '#facc15';
      ctx.fillRect(6, -w * 1.25, 10, w * 2.5);
    } else if (
      bStyle === 'jjk-cursed-flame' ||
      bStyle === 'solo-monarch-void' ||
      bStyle === 'onepiece-haki-cannon'
    ) {
      // Dark-Core Pitch-Black Interior + Blazing Colored Outer Halo!
      ctx.fillStyle = hexWithAlpha(b.color, 0.65);
      ctx.beginPath();
      ctx.roundRect(0, -w * 0.9, len, w * 1.8, w);
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.roundRect(0, -w * 0.42, len, w * 0.84, w * 0.4);
      ctx.fill();
      // Crackling exterior jagged arcs along beam
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let x = 20; x < fullSize * 1.1; x += 38) {
        const yOff = Math.sin(t * 40 + x * 0.08) * w * 0.92;
        if (x === 20) ctx.moveTo(x, yOff);
        else ctx.lineTo(x, yOff);
      }
      ctx.stroke();
    } else if (bStyle === 'lol-hextech' || bStyle === 'zoltraak-hex') {
      // Precision Hextech / Elven Zoltraak Sniper Ray with Rotating Lock-On Diamonds!
      ctx.fillStyle = hexWithAlpha(b.color, 0.5);
      ctx.fillRect(0, -w * 0.72, len, w * 1.44);
      ctx.fillStyle = b.color;
      ctx.fillRect(0, -w * 0.42, len, w * 0.84);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -w * 0.18, len, w * 0.36);
      const dOff = (t * 760) % 80;
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 2;
      for (let x = 35 + dOff; x < fullSize * 1.1; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x + 12, 0);
        ctx.lineTo(x, -w * 0.82);
        ctx.lineTo(x - 12, 0);
        ctx.lineTo(x, w * 0.82);
        ctx.closePath();
        ctx.stroke();
      }
    } else if (bStyle === 'fairy-dragon-roar' || bStyle === 'fma-alchemy-arc') {
      // Expanding Elemental Dragon Roar / Alchemy Transmutation Beam with Spinning Origin Magic Circle!
      ctx.fillStyle = hexWithAlpha(b.color, 0.55);
      ctx.beginPath();
      ctx.moveTo(0, -w * 0.45);
      ctx.lineTo(len, -w * 1.05);
      ctx.lineTo(len, w * 1.05);
      ctx.lineTo(0, w * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = b.coreColor;
      ctx.beginPath();
      ctx.moveTo(0, -w * 0.22);
      ctx.lineTo(len, -w * 0.42);
      ctx.lineTo(len, w * 0.42);
      ctx.lineTo(0, w * 0.22);
      ctx.closePath();
      ctx.fill();
      // Vertical magic circle ring at muzzle
      ctx.strokeStyle = secColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(16, 0, 8, w * 1.15, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Classic Dragon Ball Ki Cannon / Bleach Cero / Naruto Bijuu Ray / Gaster Blaster!
      ctx.fillStyle = hexWithAlpha(b.color, 0.55);
      ctx.beginPath();
      ctx.roundRect(0, -w * 0.85, len, w * 1.7, w);
      ctx.fill();
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(0, -w * 0.55, len, w * 1.1, w * 0.5);
      ctx.fill();
      ctx.fillStyle = b.coreColor;
      ctx.beginPath();
      ctx.roundRect(0, -w * 0.28, len, w * 0.56, w * 0.3);
      ctx.fill();

      if (bStyle === 'gaster-skull') {
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-8, -w * 0.72, 26, w * 1.44, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(4, -w * 0.32, 3.5, 0, Math.PI * 2);
        ctx.arc(4, w * 0.32, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(14, 0, w * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = b.coreColor;
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 2.2;
      const ringStep = 72 + (dna.crestShape % 4) * 14;
      const ringOffset = (t * 900) % ringStep;
      for (let x = 40 + ringOffset; x < fullSize * 1.2; x += ringStep) {
        ctx.beginPath();
        ctx.ellipse(x, 0, 6, w * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Personal character crest flashing at beam origin!
    ctx.translate(16, 0);
    drawCharacterUniqueCrest(ctx, dna, w * 0.92, b.color, secColor, t);
    ctx.restore();
  }
}

export function drawProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: Projectile[],
  t: number,
  fighters?: FighterState[],
): void {
  for (const p of projectiles) {
    // Killua Yo-Yo, Hisoka Bungee Gum, Thresh/Scorpion/Sylas/Toji/Doomguy Chain Hook tether in world space!
    if ((p.kind === 'yoyo' || p.tetherToOwner) && fighters) {
      const owner = fighters.find((f) => f.uid === p.ownerUid && f.alive);
      if (owner) {
        ctx.save();
        const isGum = p.ownerCharId === 'hisoka' || p.ownerCharId === 'buu';
        const isChain =
          p.ownerCharId === 'thresh' ||
          p.ownerCharId === 'scorpion' ||
          p.ownerCharId === 'sylas' ||
          p.ownerCharId === 'toji' ||
          p.ownerCharId === 'doomguy';
        ctx.strokeStyle = isGum ? '#f472b6' : isChain ? '#cbd5e1' : p.color || '#7dd3fc';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = isChain ? 3 : 2.4;
        if (isChain) ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(owner.x, owner.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    const r = p.radius;

    switch (p.kind) {
      case 'purple':
      case 'red':
      case 'boomerang': {
        const isPurple = p.kind === 'purple';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isPurple ? 26 : 16;

        const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.35);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, p.secondaryColor);
        grad.addColorStop(0.75, p.color);
        grad.addColorStop(1, hexWithAlpha(p.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isPurple ? '#581c87' : '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.48, 0, Math.PI * 2);
        ctx.fill();

        if (isPurple || p.kind === 'boomerang') {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.rotate(t * 10);
          for (let k = 0; k < 3; k++) {
            ctx.rotate((Math.PI * 2) / 3);
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.9, 0, Math.PI * 0.65);
            ctx.stroke();
          }
        }
        break;
      }

      case 'foxfire': {
        // Tapered flickering spirit wisp flame!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(r * 1.1, 0);
        ctx.quadraticCurveTo(0, -r * 0.95, -r * 1.55, Math.sin(t * 25) * r * 0.25);
        ctx.quadraticCurveTo(0, r * 0.95, r * 1.1, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(r * 0.2, 0, r * 0.45, r * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'tornado': {
        // Yasuo swirling Steel Tempest whirlwind!
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.rotate(t * 16);
        for (let ring = 0; ring < 3; ring++) {
          ctx.strokeStyle = ring === 0 ? '#ffffff' : p.color;
          ctx.lineWidth = 3.5 - ring * 0.6;
          ctx.beginPath();
          ctx.arc(0, 0, r * (0.45 + ring * 0.28), ring * 1.2, ring * 1.2 + Math.PI * 1.35);
          ctx.stroke();
        }
        break;
      }

      case 'rocket': {
        // Jinx Super Mega Death Rocket!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(-r * 1.65, 0);
        ctx.lineTo(-r * 0.7, -r * 0.55);
        ctx.lineTo(-r * 0.7, r * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ec4899';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-r * 0.85, -r * 0.55, r * 1.7, r * 1.1, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(r * 0.75, -r * 0.52);
        ctx.lineTo(r * 1.38, 0);
        ctx.lineTo(r * 0.75, r * 0.52);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'meteor': {
        // Craggy magma rock with glowing orange fissures!
        ctx.rotate(t * 5);
        ctx.shadowColor = p.secondaryColor;
        ctx.shadowBlur = 22;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.secondaryColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI * 2) / 8;
          const rad = r * (i % 2 === 0 ? 1.06 : 0.86);
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.3);
        ctx.lineTo(r * 0.4, r * 0.25);
        ctx.moveTo(r * 0.3, -r * 0.55);
        ctx.lineTo(-r * 0.25, r * 0.5);
        ctx.stroke();
        break;
      }

      case 'zoltraak-orb': {
        // Frieren geometric golden/cyan magic rune circle!
        ctx.rotate(t * 6);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        // Two overlapping rotated squares = 8-point magic seal
        for (const rot of [0, Math.PI / 4]) {
          ctx.save();
          ctx.rotate(rot);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.6;
          ctx.strokeRect(-r * 0.62, -r * 0.62, r * 1.24, r * 1.24);
          ctx.restore();
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'arrow-trident': {
        // Minecraft Enchanted Cyan Trident (high power/radius) or Wooden Arrow!
        ctx.rotate(p.angle);
        if (p.powerLevel >= 3 || r >= 16) {
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 14;
          // Trident shaft
          ctx.fillStyle = '#0e7490';
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 1.5;
          ctx.fillRect(-r * 1.35, -2.6, r * 1.95, 5.2);
          ctx.strokeRect(-r * 1.35, -2.6, r * 1.95, 5.2);
          // 3 iconic Minecraft cyan trident prongs!
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(r * 0.35, -r * 0.62, 4.5, r * 1.24);
          ctx.fillRect(r * 0.35, -r * 0.62, r * 0.92, 4.2);
          ctx.fillRect(r * 0.35, -2.2, r * 1.15, 4.4);
          ctx.fillRect(r * 0.35, r * 0.62 - 4.2, r * 0.92, 4.2);
        } else {
          // Minecraft Arrow: wooden shaft + grey flint tip + white feather fletching!
          ctx.fillStyle = '#92400e';
          ctx.fillRect(-r * 1.25, -2, r * 2.1, 4);
          // Flint tip
          ctx.fillStyle = '#cbd5e1';
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(r * 1.35, 0);
          ctx.lineTo(r * 0.55, -5.5);
          ctx.lineTo(r * 0.55, 5.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Feather tail
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(-r * 1.35, -5.5, r * 0.45, 3.5);
          ctx.fillRect(-r * 1.35, 2, r * 0.45, 3.5);
        }
        break;
      }

      case 'dragon-acid': {
        // Ender Dragon purple acid fireball with orbiting bubbles!
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#3b0764';
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f0abfc';
        for (let k = 0; k < 4; k++) {
          const a = t * 12 + k * 1.57;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'wither-skull': {
        // Flying blocky Minecraft Wither Skeleton Skull (Black or Dangerous Blue)!
        ctx.rotate(p.angle);
        const isBlue = p.color === '#38bdf8' || p.color === '#22d3ee';
        ctx.shadowColor = isBlue ? '#38bdf8' : '#a855f7';
        ctx.shadowBlur = isBlue ? 20 : 12;
        const s = r * 0.88;
        ctx.fillStyle = isBlue ? '#0c4a6e' : '#18181b';
        ctx.strokeStyle = isBlue ? '#38bdf8' : '#71717a';
        ctx.lineWidth = 2.2;
        ctx.fillRect(-s, -s, s * 2, s * 2);
        ctx.strokeRect(-s, -s, s * 2, s * 2);
        // Glowing pixel eyes facing forward
        ctx.fillStyle = isBlue ? '#bae6fd' : '#f8fafc';
        ctx.fillRect(s * 0.12, -s * 0.56, s * 0.55, s * 0.34);
        ctx.fillRect(s * 0.12, s * 0.22, s * 0.55, s * 0.34);
        // Trailing dark smoke puff
        ctx.fillStyle = isBlue ? 'rgba(56,189,248,0.55)' : 'rgba(113,113,122,0.55)';
        ctx.fillRect(-s * 1.6, -s * 0.45, s * 0.55, s * 0.9);
        break;
      }

      case 'scythe': {
        // Entity 303 spinning crimson pixel reaper scythe!
        ctx.rotate(t * 22);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        // Dark steel handle
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.2;
        ctx.fillRect(-r * 1.1, -2.8, r * 2.2, 5.6);
        // Huge curved crimson scythe blade!
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(r * 0.65, -2);
        ctx.quadraticCurveTo(r * 1.25, -r * 1.15, -r * 0.45, -r * 1.05);
        ctx.quadraticCurveTo(r * 0.55, -r * 0.55, r * 0.3, -2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Opposite mirror blade for deadly double-spin silhouette
        ctx.beginPath();
        ctx.moveTo(-r * 0.65, 2);
        ctx.quadraticCurveTo(-r * 1.25, r * 1.15, r * 0.45, r * 1.05);
        ctx.quadraticCurveTo(-r * 0.55, r * 0.55, -r * 0.3, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'axe': {
        // Kratos spinning Frost Leviathan Viking Battle Axe!
        ctx.rotate(t * 20);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        // Wooden haft
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.6;
        ctx.fillRect(-3.2, -r * 1.15, 6.4, r * 2.3);
        ctx.strokeRect(-3.2, -r * 1.15, 6.4, r * 2.3);
        // Heavy icy steel bearded axe head!
        ctx.fillStyle = '#e0f2fe';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(2, -r * 0.85);
        ctx.quadraticCurveTo(r * 1.25, -r * 1.05, r * 1.15, r * 0.25);
        ctx.quadraticCurveTo(r * 0.55, r * 0.1, 2, -r * 0.18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Glowing blue Norse frost rune on blade
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(r * 0.45, -r * 0.52, 4, r * 0.42);
        break;
      }

      case 'yoyo': {
        // Killua heavy metallic electric Yo-Yo disc!
        ctx.rotate(t * 24);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Glowing blue star emblem inside metallic disc
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.48, 0, Math.PI * 2);
        ctx.moveTo(-r * 0.78, 0);
        ctx.lineTo(r * 0.78, 0);
        ctx.moveTo(0, -r * 0.78);
        ctx.lineTo(0, r * 0.78);
        ctx.stroke();
        break;
      }

      case 'rasenshuriken': {
        // Naruto spinning 4-blade Wind Style Rasenshuriken!
        ctx.rotate(t * 26);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 20;
        // 4 translucent wind blades
        ctx.fillStyle = hexWithAlpha(p.color, 0.88);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, -r * 0.28);
          ctx.quadraticCurveTo(r * 0.85, -r * 0.75, r * 1.48, -r * 0.1);
          ctx.quadraticCurveTo(r * 0.7, r * 0.32, 0, r * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        // Bright glowing Rasengan core sphere
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'ki-blast': {
        // Dragon Ball elongated teardrop Ki comet!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(r * 1.15, 0);
        ctx.quadraticCurveTo(r * 0.4, -r * 0.72, -r * 1.75, 0);
        ctx.quadraticCurveTo(r * 0.4, r * 0.72, r * 1.15, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(r * 0.32, 0, r * 0.56, r * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'fireball': {
        // Jagged roaring flame fireball!
        ctx.rotate(p.angle);
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 18;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(r * 0.15, 0, r * 0.86, -Math.PI * 0.55, Math.PI * 0.55);
        ctx.lineTo(-r * 1.45, r * 0.45);
        ctx.lineTo(-r * 0.9, r * 0.12);
        ctx.lineTo(-r * 1.65, 0);
        ctx.lineTo(-r * 0.9, -r * 0.16);
        ctx.lineTo(-r * 1.4, -r * 0.48);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(r * 0.22, 0, r * 0.46, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'bone': {
        // Sans spinning Undertale pixel/cartoon white bone!
        ctx.rotate(t * 16 + p.angle);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.8;
        const len = r * 1.05;
        ctx.fillRect(-len, -3.5, len * 2, 7);
        ctx.strokeRect(-len, -3.5, len * 2, 7);
        for (const sx of [-len, len]) {
          ctx.beginPath();
          ctx.arc(sx, -4.5, 4.5, 0, Math.PI * 2);
          ctx.arc(sx, 4.5, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }

      case 'bullet': {
        // Jinx Pow-Pow high-speed minigun tracer round!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = hexWithAlpha(p.color, 0.45);
        ctx.fillRect(-r * 2.2, -2.5, r * 2.2, 5);
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-r * 0.65, -3.6, r * 1.55, 7.2, 3.5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(r * 0.15, -1.6, r * 0.55, 3.2);
        break;
      }

      case 'spear': {
        // Piercing energy javelin spear!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-r * 1.6, 0);
        ctx.lineTo(r * 1.2, 0);
        ctx.stroke();
        // Diamond spearhead
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(r * 1.6, 0);
        ctx.lineTo(r * 0.55, -r * 0.48);
        ctx.lineTo(r * 0.85, 0);
        ctx.lineTo(r * 0.55, r * 0.48);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'dagger-blade': {
        // Vergil / Jinwoo razor-thin summoned spectral blade!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(r * 1.55, 0);
        ctx.lineTo(-r * 0.75, -r * 0.34);
        ctx.lineTo(-r * 1.15, 0);
        ctx.lineTo(-r * 0.75, r * 0.34);
        ctx.closePath();
        ctx.fill();
        // White inner edge & guard
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-r * 0.55, -1.3, r * 1.65, 2.6);
        ctx.fillRect(-r * 0.75, -r * 0.48, 3, r * 0.96);
        break;
      }

      case 'heart': {
        // Ahri glowing pink Charm heart!
        const pulse = 1 + Math.sin(t * 16) * 0.1;
        ctx.scale(pulse, pulse);
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#f472b6';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, r * 0.75);
        ctx.bezierCurveTo(-r * 1.25, r * 0.05, -r * 1.0, -r * 0.98, 0, -r * 0.32);
        ctx.bezierCurveTo(r * 1.0, -r * 0.98, r * 1.25, r * 0.05, 0, r * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'fist-wave': {
        // Flying shockwave punch fist silhouette!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        // Curved white sonic wind-break shock cone in front
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(r * 0.15, 0, r * 1.05, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
        // Stylized cartoon clenched fist block
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-r * 0.72, -r * 0.58, r * 1.38, r * 1.16, 6);
        ctx.fill();
        ctx.stroke();
        // Knuckle ridge ticks
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.6;
        for (const ky of [-r * 0.25, 0, r * 0.25]) {
          ctx.beginPath();
          ctx.moveTo(r * 0.3, ky);
          ctx.lineTo(r * 0.66, ky);
          ctx.stroke();
        }
        break;
      }

      case 'glitch-cube': {
        // Herobrine Command Block / Entity 303 Glitch Block projectile!
        ctx.rotate(t * 14);
        const s = r * 0.85;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-s, -s, s * 2, s * 2);
        ctx.fillStyle = p.color;
        ctx.fillRect(-s, -s, s, s);
        ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = p.secondaryColor;
        ctx.fillRect(-s * 0.35, -s * 0.35, s * 0.7, s * 0.7);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-s, -s, s * 2, s * 2);
        break;
      }

      case 'sonic-boom': {
        // Warden unmistakable expanding concentric glowing cyan Sonic Boom rings!
        ctx.rotate(p.angle);
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 22;
        for (let ring = 0; ring < 3; ring++) {
          const offsetX = (ring - 1) * r * 0.42;
          const ry = r * (1.08 - ring * 0.16);
          const rx = ry * 0.34;
          ctx.strokeStyle = ring === 2 ? '#ffffff' : ring === 1 ? '#67e8f9' : '#06b6d4';
          ctx.lineWidth = 4.5 - ring * 0.7;
          ctx.beginPath();
          ctx.ellipse(offsetX, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case 'shuriken-star': {
        // Zed / Itachi / Kakashi / Akali 4-point spinning ninja shuriken with hollow center ring!
        ctx.rotate(t * 28);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const rad = i % 2 === 0 ? r * 1.25 : r * 0.34;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'kunai-knife': {
        // Minato Flying Raijin 3-prong kunai / Katarina dagger!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        // Ring pommel + wrapped grip
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-r * 1.15, 0, r * 0.24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-r * 0.9, -2.5, r * 0.55, 5);
        // Leaf-shaped kunai blade + side prongs
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(r * 1.45, 0);
        ctx.lineTo(-r * 0.25, -r * 0.46);
        ctx.lineTo(-r * 0.38, 0);
        ctx.lineTo(-r * 0.25, r * 0.46);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'card-spade': {
        // Hisoka Bungee Gum / Jevil spinning poker playing card!
        ctx.rotate(t * 16 + p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-r * 0.85, -r * 0.62, r * 1.7, r * 1.24, 3);
        ctx.fill();
        ctx.stroke();
        // Central diamond/heart pip on card
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.36);
        ctx.lineTo(r * 0.36, 0);
        ctx.lineTo(0, r * 0.36);
        ctx.lineTo(-r * 0.36, 0);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'petal-sakura': {
        // Byakuya Senbonzakura swirling pink cherry-blossom blade cluster!
        ctx.rotate(t * 14);
        ctx.shadowColor = '#f472b6';
        ctx.shadowBlur = 14;
        for (let k = 0; k < 3; k++) {
          ctx.rotate((Math.PI * 2) / 3);
          ctx.fillStyle = k === 0 ? '#fbcfe8' : '#f472b6';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(r * 0.75, -r * 0.45, r * 1.18, 0);
          ctx.quadraticCurveTo(r * 0.75, r * 0.45, 0, 0);
          ctx.fill();
        }
        break;
      }

      case 'magma-orb': {
        // Akainu / Ace / Rengoku / Blaze / Ghast volcanic magma fist & dripping lava!
        ctx.rotate(p.angle);
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#7c2d12';
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Glowing yellow-orange lava cracks
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(r * 0.22, -r * 0.18, r * 0.32, 0, Math.PI * 2);
        ctx.arc(-r * 0.28, r * 0.22, r * 0.24, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'ice-crystal': {
        // Todoroki / Sub-Zero / Toshiro 6-point hexagonal frost crystal snowflake!
        ctx.rotate(t * 10);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#e0f2fe';
        ctx.fillStyle = '#38bdf8';
        ctx.lineWidth = 2.4;
        for (let k = 0; k < 3; k++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(-r * 1.15, 0);
          ctx.lineTo(r * 1.15, 0);
          ctx.stroke();
        }
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const rad = r * 0.72;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'sand-wave': {
        // Gaara / Crocodile jagged golden desert sand wave & spikes!
        ctx.rotate(p.angle);
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#eab308';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r * 1.25, 0);
        ctx.lineTo(r * 0.15, -r * 0.95);
        ctx.lineTo(-r * 0.35, -r * 0.38);
        ctx.lineTo(-r * 0.95, -r * 0.85);
        ctx.lineTo(-r * 0.65, 0);
        ctx.lineTo(-r * 0.95, r * 0.85);
        ctx.lineTo(-r * 0.35, r * 0.38);
        ctx.lineTo(r * 0.15, r * 0.95);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'anchor-hook': {
        // Thresh Death Sentence / Scorpion Kunai curved chain hook!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        // Trailing chain links
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.4;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(-r * 1.8, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.setLineDash([]);
        // Curved sickle hook head
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(r * 0.25, 0, r * 0.78, -Math.PI * 0.65, Math.PI * 0.55);
        ctx.stroke();
        break;
      }

      case 'music-note': {
        // Tengen / Jevil / Brook glowing beamed eighth music note!
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        // Note heads
        ctx.beginPath();
        ctx.ellipse(-r * 0.42, r * 0.42, r * 0.34, r * 0.24, -0.3, 0, Math.PI * 2);
        ctx.ellipse(r * 0.38, r * 0.26, r * 0.34, r * 0.24, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Stems & top beam
        ctx.fillRect(-r * 0.2, -r * 0.68, 3.2, r * 1.05);
        ctx.fillRect(r * 0.58, -r * 0.82, 3.2, r * 1.05);
        ctx.beginPath();
        ctx.moveTo(-r * 0.2, -r * 0.68);
        ctx.lineTo(r * 0.62, -r * 0.84);
        ctx.lineTo(r * 0.62, -r * 0.58);
        ctx.lineTo(-r * 0.2, -r * 0.42);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'holy-cross': {
        // Yuta / Aizen / Lux / Paladins radiant 4-point star cross prism!
        ctx.rotate(t * 8);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const rad = i % 2 === 0 ? r * 1.3 : r * 0.28;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'string-thread': {
        // Doflamingo / Katakuri 5-line razor string fan!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(-r * 1.1, k * 2.5);
          ctx.lineTo(r * 1.25, k * 5.5);
          ctx.stroke();
        }
        break;
      }

      case 'buster-greatsword': {
        // Cloud / Sephiroth / Garen / Darius / Aatrox spinning colossal broadsword!
        ctx.rotate(t * 18);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        // Heavy dark-steel broadsword blade
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(r * 1.5, 0);
        ctx.lineTo(r * 0.85, -r * 0.45);
        ctx.lineTo(-r * 0.65, -r * 0.45);
        ctx.lineTo(-r * 0.65, r * 0.45);
        ctx.lineTo(r * 0.85, r * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Materia slots + gold crossguard
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(-r * 0.15, 0, 2.6, 0, Math.PI * 2);
        ctx.arc(r * 0.25, 0, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-r * 0.78, -r * 0.68, 4.5, r * 1.36);
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-r * 1.3, -2.8, r * 0.52, 5.6);
        break;
      }

      case 'ender-pearl': {
        // Minecraft Enderman / Shulker dark-teal & magenta glowing Ender Pearl!
        ctx.shadowColor = '#d946ef';
        ctx.shadowBlur = 16;
        const g = ctx.createRadialGradient(-r * 0.25, -r * 0.25, 2, 0, 0, r);
        g.addColorStop(0, '#67e8f9');
        g.addColorStop(0.5, '#0f766e');
        g.addColorStop(1, '#134e4a');
        ctx.fillStyle = g;
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'master-shield': {
        // Link Hylian Shield / Braum crest shield!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#1d4ed8';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(r * 1.1, 0);
        ctx.quadraticCurveTo(r * 0.6, -r * 0.95, -r * 0.85, -r * 0.85);
        ctx.lineTo(-r * 0.85, r * 0.85);
        ctx.quadraticCurveTo(r * 0.6, r * 0.95, r * 1.1, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Golden Triforce triangle
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(r * 0.45, 0);
        ctx.lineTo(-r * 0.25, -r * 0.38);
        ctx.lineTo(-r * 0.25, r * 0.38);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'star-rod': {
        // Kirby Warp Star / Mario Super Star 5-point golden star!
        ctx.rotate(t * 14);
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          const rad = i % 2 === 0 ? r * 1.18 : r * 0.52;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'blood-scythe': {
        // Kokushibo Crescent Moon blades / Muzan crimson biowhip / Kayn Rhaast!
        ctx.rotate(p.angle + Math.sin(t * 18) * 0.35);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#fecaca';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(-r * 0.15, 0, r * 1.1, -Math.PI * 0.58, Math.PI * 0.58);
        ctx.quadraticCurveTo(r * 0.2, 0, -r * 0.15, -r * 1.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Mini crescent moon particles alongside main blade
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(-r * 0.55, -r * 0.45, 3, 0, Math.PI * 2);
        ctx.arc(-r * 0.55, r * 0.45, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'stand-fist': {
        // Jotaro Star Platinum / DIO The World / All Might multi-fist barrage!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 16;
        for (const [ox, oy, sc] of [
          [r * 0.35, 0, 0.72],
          [-r * 0.35, -r * 0.48, 0.56],
          [-r * 0.35, r * 0.48, 0.56],
        ] as const) {
          ctx.fillStyle = p.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.roundRect(ox - r * sc, oy - r * sc * 0.8, r * sc * 1.8, r * sc * 1.6, 4);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }

      case 'chakram-ring': {
        // Spinning bladed golden/pink ring chakram!
        ctx.rotate(t * 20);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'void-eye': {
        // Obito Kamui / Frieza / Aizen dark gravity singularity eye!
        ctx.rotate(t * 10);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.22, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'totem-golem': {
        // Iron Golem / Zhongli / Hashirama heavy stone/gold pillar block!
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#57534e';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.4;
        ctx.fillRect(-r * 0.95, -r * 0.72, r * 1.9, r * 1.44);
        ctx.strokeRect(-r * 0.95, -r * 0.72, r * 1.9, r * 1.44);
        ctx.fillStyle = p.color;
        ctx.fillRect(-r * 0.45, -r * 0.25, r * 0.9, r * 0.5);
        break;
      }

      default: {
        // Crescent energy waves (Ichigo Getsuga Tensho, Zoro Sword Wave, Asta Black Slash)
        ctx.rotate(p.angle);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(-r * 0.25, 0, r * 1.15, -Math.PI * 0.48, Math.PI * 0.48);
        ctx.quadraticCurveTo(
          r * 0.35,
          0,
          -r * 0.25 + Math.cos(-Math.PI * 0.48) * r * 1.15,
          Math.sin(-Math.PI * 0.48) * r * 1.15,
        );
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle =
          p.kind === 'getsuga' && p.powerLevel >= 2 && p.powerLevel < 5 ? '#09090b' : '#ffffff';
        ctx.beginPath();
        ctx.arc(-r * 0.12, 0, r * 0.85, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.quadraticCurveTo(
          r * 0.32,
          0,
          -r * 0.12 + Math.cos(-Math.PI * 0.4) * r * 0.85,
          Math.sin(-Math.PI * 0.4) * r * 0.85,
        );
        ctx.closePath();
        ctx.fill();
        break;
      }
    }

    // Per-Character Bespoke Visual Emblem Overlay so no two characters' projectiles look identical!
    if (p.ownerCharId) {
      drawCharacterProjectileEmblem(ctx, p, t);
    }

    ctx.restore();
  }
}

function drawCharacterProjectileEmblem(
  ctx: CanvasRenderingContext2D,
  p: Projectile,
  t: number,
): void {
  const dna = getCharacterVfxDNA(p.ownerCharId, p.ownerSeries);
  const r = p.radius;
  const sec = p.secondaryColor || '#ffffff';

  ctx.save();
  // 1. Franchise-specific outer motif on the projectile!
  if (dna.seriesId === 'one-piece') {
    // Conqueror's Haki black-crimson jagged arcs
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, -r * 0.45);
    ctx.lineTo(-r * 0.25, 0);
    ctx.lineTo(-r * 0.78, r * 0.52);
    ctx.stroke();
    ctx.strokeStyle = '#ff1f5a';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  } else if (dna.seriesId === 'minecraft' || dna.seriesId === 'undertale') {
    // Crisp voxel square aura frame
    ctx.strokeStyle = sec;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-r * 0.95, -r * 0.95, r * 1.9, r * 1.9);
  } else if (
    dna.seriesId === 'fairy-tail' ||
    dna.seriesId === 'fma' ||
    dna.seriesId === 'black-clover'
  ) {
    // Mini rotating magic/transmutation rune halo
    ctx.strokeStyle = sec;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.12, 0, Math.PI * 2);
    ctx.stroke();
  } else if (dna.seriesId === 'jjk' || dna.seriesId === 'bleach') {
    // Dark ink / cursed energy outer outline
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.04, 0, Math.PI * 2);
    ctx.stroke();
  } else if (dna.seriesId === 'demon-slayer') {
    // Ukiyo-e swirling curl accent
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.06, t * 5, t * 5 + Math.PI * 1.15);
    ctx.stroke();
  } else if (dna.seriesId === 'solo-leveling') {
    // Cyan system corner ticks
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    const b = r * 1.05;
    ctx.beginPath();
    ctx.moveTo(-b, -b + 5);
    ctx.lineTo(-b, -b);
    ctx.lineTo(-b + 5, -b);
    ctx.moveTo(b - 5, b);
    ctx.lineTo(b, b);
    ctx.lineTo(b, b - 5);
    ctx.stroke();
  } else if (dna.seriesId === 'lol') {
    // Runeterra Hextech directional aiming chevron
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r * 0.72, -r * 0.55);
    ctx.lineTo(r * 1.25, 0);
    ctx.lineTo(r * 0.72, r * 0.55);
    ctx.stroke();
  } else if (dna.seriesId === 'jojo') {
    // Mini floating menacing katakana tag
    ctx.fillStyle = '#facc15';
    ctx.font = '900 9px sans-serif';
    ctx.fillText('ゴ', r * 0.65, -r * 0.55);
  } else if (dna.seriesId === 'fate') {
    // Golden Gate of Babylon ripple ring
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 2. Guaranteed-Unique Per-Character Geometric Crest (336 unique fingerprints!)
  drawCharacterUniqueCrest(ctx, dna, r * 0.92, p.color, sec, t);
  ctx.restore();
}

export function drawMinions(ctx: CanvasRenderingContext2D, minions: Minion[], t: number): void {
  for (const m of minions) {
    ctx.save();
    ctx.translate(m.x, m.y);
    const r = m.radius;

    if (m.kind === 'ender-dragon') {
      // Iconic flapping-wing blocky Minecraft Ender Dragon summoned by Steve!
      const heading = Math.atan2(m.vy, m.vx);
      const flap = Math.sin(m.wingPhase ?? t * 11);
      ctx.rotate(heading);

      // Subtle purple boss glow under the dragon
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 20;

      // Sweeping blocky dragon wings (left & right, animated flap!)
      const wingSpan = r * (1.75 + flap * 0.42);
      const wingBack = -r * (0.45 + flap * 0.25);
      for (const side of [-1, 1]) {
        // Wing membrane
        ctx.fillStyle = 'rgba(24, 24, 32, 0.94)';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(r * 0.2, side * r * 0.28);
        ctx.lineTo(wingBack + r * 0.3, side * wingSpan);
        ctx.lineTo(wingBack - r * 0.72, side * wingSpan * 0.72);
        ctx.lineTo(-r * 0.52, side * r * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Charcoal bone wing strut
        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(r * 0.18, side * r * 0.26);
        ctx.lineTo(wingBack + r * 0.28, side * wingSpan * 0.95);
        ctx.stroke();
      }

      // Segmented swaying blocky tail behind body
      for (let seg = 1; seg <= 3; seg++) {
        const sway = Math.sin((m.wingPhase ?? t * 11) - seg * 0.9) * (3.5 * seg);
        const ts = r * (0.42 - seg * 0.08);
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 1.4;
        ctx.fillRect(-r * 0.65 - seg * r * 0.36, sway - ts * 0.65, ts * 1.15, ts * 1.3);
        ctx.strokeRect(-r * 0.65 - seg * r * 0.36, sway - ts * 0.65, ts * 1.15, ts * 1.3);
      }

      // Blocky obsidian-black torso
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.fillRect(-r * 0.72, -r * 0.42, r * 1.35, r * 0.84);
      ctx.strokeRect(-r * 0.72, -r * 0.42, r * 1.35, r * 0.84);
      // Spine ridge plates
      ctx.fillStyle = '#71717a';
      ctx.fillRect(-r * 0.48, -3, r * 0.26, 6);
      ctx.fillRect(-r * 0.08, -3, r * 0.26, 6);

      // Blocky Ender Dragon horned head & snout
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.8;
      ctx.fillRect(r * 0.48, -r * 0.36, r * 0.84, r * 0.72);
      ctx.strokeRect(r * 0.48, -r * 0.36, r * 0.84, r * 0.72);
      // Extended snout
      ctx.fillRect(r * 1.18, -r * 0.24, r * 0.42, r * 0.48);
      ctx.strokeRect(r * 1.18, -r * 0.24, r * 0.42, r * 0.48);

      // Glowing bright magenta Ender Dragon eyes!
      ctx.shadowColor = '#e879f9';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#e879f9';
      ctx.fillRect(r * 0.82, -r * 0.32, r * 0.26, r * 0.16);
      ctx.fillRect(r * 0.82, r * 0.16, r * 0.26, r * 0.16);

      ctx.restore();
      continue;
    }

    if (m.kind === 'clone') {
      const cid = m.ownerCharId ?? 'naruto';
      ctx.shadowColor = m.accentColor;
      ctx.shadowBlur = 10;

      if (cid === 'zed') {
        // Zed Living Shadow Ninja Clone (pitch-black shadow body + glowing red eye slits!)
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-r * 0.55, -r * 0.15, r * 0.42, 3.5);
        ctx.fillRect(r * 0.13, -r * 0.15, r * 0.42, 3.5);
      } else if (cid === 'technoblade') {
        // Technoblade Minecraft Tamed Wolf Hound!
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.fillRect(-r * 0.85, -r * 0.75, r * 1.7, r * 1.5);
        ctx.strokeRect(-r * 0.85, -r * 0.75, r * 1.7, r * 1.5);
        // Pointy wolf ears & red tamed collar
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-r * 0.85, -r * 1.15, r * 0.45, r * 0.4);
        ctx.fillRect(r * 0.4, -r * 1.15, r * 0.45, r * 0.4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-r * 0.85, r * 0.48, r * 1.7, r * 0.28);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-r * 0.48, -r * 0.2, 3.5, 3.5);
        ctx.fillRect(r * 0.2, -r * 0.2, 3.5, 3.5);
      } else if (cid === 'skeleton' || cid === 'zombie' || cid === 'evoker') {
        // Minecraft Blocky Undead / Vex Minion!
        ctx.fillStyle = cid === 'zombie' ? '#22c55e' : cid === 'evoker' ? '#7dd3fc' : '#f1f5f9';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.fillRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7);
        ctx.strokeRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7);
        ctx.fillStyle = cid === 'evoker' ? '#ef4444' : '#09090b';
        ctx.fillRect(-r * 0.55, -r * 0.2, r * 0.38, r * 0.28);
        ctx.fillRect(r * 0.17, -r * 0.2, r * 0.38, r * 0.28);
      } else if (cid === 'yuta' || cid === 'megumi') {
        // Cursed Spirit Rika / Ten Shadows Divine Dog Shikigami!
        ctx.fillStyle = cid === 'yuta' ? '#f8fafc' : '#1e1b4b';
        ctx.strokeStyle = m.accentColor;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Fierce shikigami ears/horns & glowing curse eye
        ctx.fillStyle = m.accentColor;
        ctx.beginPath();
        ctx.arc(0, -r * 0.1, r * 0.34, 0, Math.PI * 2);
        ctx.fill();
      } else if (cid === 'naruto') {
        // Naruto Shadow Clone
        ctx.fillStyle = '#f7d3ae';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, -1, r, Math.PI * 1.05, Math.PI * 1.95);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-r * 0.9, -r * 0.55, r * 1.8, r * 0.32);
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(-r * 0.32, r * 0.08, 2.2, 0, Math.PI * 2);
        ctx.arc(r * 0.32, r * 0.08, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Franchise-Native Summon Construct (JoJo Stand / Fate Phantom / Fairy Spirit / HxH Nen Beast / FMA Construct / LoL Construct)
        const dna = getCharacterVfxDNA(m.ownerCharId, m.ownerSeries);
        if (dna.seriesId === 'minecraft' || dna.seriesId === 'undertale') {
          ctx.fillStyle = m.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.fillRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7);
          ctx.strokeRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7);
        } else if (
          dna.seriesId === 'jojo' ||
          dna.seriesId === 'fate' ||
          dna.seriesId === 'fairy-tail'
        ) {
          // Radiant Ethereal Stand / Heroic Spirit / Celestial Avatar with glowing shoulders & crown!
          ctx.fillStyle = hexWithAlpha(m.color, 0.82);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.25);
          ctx.lineTo(r * 1.05, -r * 0.2);
          ctx.lineTo(r * 0.7, r * 0.95);
          ctx.lineTo(-r * 0.7, r * 0.95);
          ctx.lineTo(-r * 1.05, -r * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = m.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-r * 0.45, -r * 0.18, r * 0.32, 3.2);
        ctx.fillRect(r * 0.13, -r * 0.18, r * 0.32, 3.2);
        drawCharacterUniqueCrest(ctx, dna, r * 1.15, m.color, m.accentColor, t);
      }
    } else {
      const dna = getCharacterVfxDNA(m.ownerCharId, m.ownerSeries);
      ctx.shadowColor = m.accentColor;
      ctx.shadowBlur = 14;
      ctx.fillStyle = hexWithAlpha(m.accentColor, 0.35);
      ctx.beginPath();
      ctx.arc(0, 0, r + 4 + Math.sin(t * 12) * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#090717';
      ctx.strokeStyle = m.accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = m.accentColor;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.7);
      ctx.lineTo(0, -r * 1.45);
      ctx.lineTo(r * 0.5, -r * 0.7);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#e9d5ff';
      ctx.beginPath();
      ctx.ellipse(-r * 0.32, 0, 3.2, 1.8, 0.25, 0, Math.PI * 2);
      ctx.ellipse(r * 0.32, 0, 3.2, 1.8, -0.25, 0, Math.PI * 2);
      ctx.fill();
      drawCharacterUniqueCrest(ctx, dna, r * 1.18, m.color, m.accentColor, t);
    }

    ctx.restore();
  }
}

export function drawSlashes(ctx: CanvasRenderingContext2D, slashes: SlashEffect[]): void {
  for (const sl of slashes) {
    const dna = getCharacterVfxDNA(sl.ownerCharId, sl.ownerSeries);
    const sec = sl.secondaryColor || '#ffffff';
    ctx.save();
    if (sl.telegraphTimer > 0) {
      ctx.strokeStyle = hexWithAlpha(sl.color, 0.62);
      ctx.lineWidth = dna.slashStyle === 'lol-skillshot' ? 2.6 : 1.6;
      ctx.setLineDash(dna.slashStyle === 'minecraft-voxel' ? [6, 4] : [8, 6]);
      ctx.beginPath();
      ctx.moveTo(sl.x1, sl.y1);
      ctx.lineTo(sl.x2, sl.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      const alpha = sl.activeTimer > 0 ? 1 : Math.max(0, sl.fadeTimer / Math.max(0.01, sl.maxFade));
      ctx.globalAlpha = alpha;
      ctx.lineCap = dna.slashStyle === 'minecraft-voxel' ? 'square' : 'round';
      ctx.shadowColor = sl.color;
      ctx.shadowBlur = 16;

      const dx = sl.x2 - sl.x1;
      const dy = sl.y2 - sl.y1;
      const len = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;
      const mx = (sl.x1 + sl.x2) / 2;
      const my = (sl.y1 + sl.y2) / 2;

      switch (dna.slashStyle) {
        case 'ukiyo-wave': {
          // Demon Slayer Ukiyo-e Curved Wave / Flame Calligraphy Ribbon Slash!
          ctx.strokeStyle = sl.color;
          ctx.lineWidth = sl.width * 1.35 * (0.7 + 0.5 * alpha);
          ctx.beginPath();
          ctx.moveTo(sl.x1, sl.y1);
          ctx.quadraticCurveTo(mx + nx * 24, my + ny * 24, sl.x2, sl.y2);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1.8, sl.width * 0.45 * alpha);
          ctx.stroke();
          break;
        }

        case 'jjk-blackflash':
        case 'onepiece-haki': {
          // Pitch-Black Core + Jagged Crimson/Colored Spatial Lightning Edge!
          ctx.strokeStyle = sl.color;
          ctx.lineWidth = sl.width * 1.55 * alpha;
          ctx.beginPath();
          ctx.moveTo(sl.x1, sl.y1);
          for (let s = 1; s < 6; s++) {
            const frac = s / 6;
            const jit = (s % 2 === 0 ? 1 : -1) * 9;
            ctx.lineTo(sl.x1 + dx * frac + nx * jit, sl.y1 + dy * frac + ny * jit);
          }
          ctx.lineTo(sl.x2, sl.y2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = Math.max(2.4, sl.width * 0.68 * alpha);
          ctx.stroke();
          break;
        }

        case 'bleach-ink': {
          // Sumi-e Black-Ink Tapered Brushstroke + Spiritual Edge!
          ctx.fillStyle = '#09090b';
          ctx.strokeStyle = sl.color;
          ctx.lineWidth = 2.2;
          const halfW = sl.width * 0.85 * alpha;
          ctx.beginPath();
          ctx.moveTo(sl.x1, sl.y1);
          ctx.quadraticCurveTo(mx + nx * halfW, my + ny * halfW, sl.x2, sl.y2);
          ctx.quadraticCurveTo(mx - nx * halfW, my - ny * halfW, sl.x1, sl.y1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'chainsaw-sawtooth': {
          // Serrated Sawblade Blood Tear!
          ctx.strokeStyle = sl.color;
          ctx.lineWidth = sl.width * 1.2 * alpha;
          ctx.beginPath();
          ctx.moveTo(sl.x1, sl.y1);
          for (let s = 1; s < 10; s++) {
            const frac = s / 10;
            const tooth = s % 2 === 0 ? 8 : -2;
            ctx.lineTo(sl.x1 + dx * frac + nx * tooth, sl.y1 + dy * frac + ny * tooth);
          }
          ctx.lineTo(sl.x2, sl.y2);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.stroke();
          break;
        }

        case 'aot-twin-steam':
        case 'solo-shadow-claw': {
          // Parallel Twin Blade / Triple Shadow Claw Rakes!
          const offsets = dna.slashStyle === 'solo-shadow-claw' ? [-10, 0, 10] : [-6, 6];
          for (const off of offsets) {
            ctx.strokeStyle = off === 0 ? sec : sl.color;
            ctx.lineWidth = sl.width * 0.68 * alpha;
            ctx.beginPath();
            ctx.moveTo(sl.x1 + nx * off, sl.y1 + ny * off);
            ctx.lineTo(sl.x2 + nx * off, sl.y2 + ny * off);
            ctx.stroke();
          }
          break;
        }

        case 'dmc-glass-shatter':
        case 'fma-alchemy-crack': {
          // Crystalline Dimensional Shatter / Alchemy Crack Fissure!
          ctx.strokeStyle = sl.color;
          ctx.lineWidth = sl.width * alpha;
          ctx.beginPath();
          ctx.moveTo(sl.x1, sl.y1);
          ctx.lineTo(sl.x2, sl.y2);
          ctx.stroke();
          // Branching fracture shards off center
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          for (const side of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx + nx * side * 20 + dx * 0.12, my + ny * side * 20 + dy * 0.12);
            ctx.stroke();
          }
          break;
        }

        case 'minecraft-voxel': {
          // Stepped Pixel Voxel Sword Cut!
          ctx.strokeStyle = sl.color;
          ctx.lineWidth = sl.width * 1.15 * alpha;
          ctx.beginPath();
          ctx.moveTo(sl.x1, sl.y1);
          for (let s = 1; s <= 5; s++) {
            const f1 = (s - 1) / 5;
            const f2 = s / 5;
            ctx.lineTo(sl.x1 + dx * f2, sl.y1 + dy * f1);
            ctx.lineTo(sl.x1 + dx * f2, sl.y1 + dy * f2);
          }
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }

        default: {
          // Fate Golden Cut / LoL Skillshot / Fairy Tail Rune Arc / JoJo Stand Rush
          ctx.strokeStyle = sl.color;
          ctx.lineWidth = sl.width * (0.7 + 0.5 * alpha);
          ctx.beginPath();
          ctx.moveTo(sl.x1, sl.y1);
          ctx.lineTo(sl.x2, sl.y2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = sl.coreColor;
          ctx.lineWidth = Math.max(1.5, sl.width * 0.42 * alpha);
          ctx.stroke();
          break;
        }
      }

      // Personal crest flash at slash midpoint!
      ctx.translate(mx, my);
      drawCharacterUniqueCrest(ctx, dna, Math.max(12, sl.width * 2.2), sl.color, sec, alpha * 5);
    }
    ctx.restore();
  }
}

export function drawShockwaves(ctx: CanvasRenderingContext2D, shockwaves: Shockwave[]): void {
  for (const sw of shockwaves) {
    ctx.save();
    ctx.globalAlpha = sw.alpha;
    ctx.strokeStyle = sw.color;
    ctx.lineWidth = sw.lineWidth * sw.alpha;
    ctx.shadowColor = sw.color;
    ctx.shadowBlur = 12;

    if (!sw.ownerCharId) {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    const dna = getCharacterVfxDNA(sw.ownerCharId, sw.ownerSeries);
    const sec = sw.secondaryColor || '#ffffff';
    ctx.translate(sw.x, sw.y);

    // 1. Franchise-native outer boundary (square for Minecraft/Undertale, circle/ink/domain for Anime/LoL!)
    if (
      dna.domainStyle === 'minecraft-beacon-grid' ||
      dna.domainStyle === 'undertale-pixel-frame'
    ) {
      ctx.strokeRect(-sw.radius, -sw.radius, sw.radius * 2, sw.radius * 2);
      ctx.strokeStyle = sec;
      ctx.lineWidth = Math.max(1.2, sw.lineWidth * 0.45 * sw.alpha);
      ctx.strokeRect(-sw.radius * 0.78, -sw.radius * 0.78, sw.radius * 1.56, sw.radius * 1.56);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
      ctx.stroke();

      if (dna.domainStyle === 'demon-compass-ukiyo') {
        for (let k = 0; k < 12; k++) {
          const a = (k * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * sw.radius, Math.sin(a) * sw.radius);
          ctx.stroke();
        }
      } else if (dna.domainStyle === 'jojo-time-clock') {
        for (let k = 0; k < 12; k++) {
          const a = (k * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * sw.radius * 0.8, Math.sin(a) * sw.radius * 0.8);
          ctx.lineTo(Math.cos(a) * sw.radius, Math.sin(a) * sw.radius);
          ctx.stroke();
        }
      } else if (dna.domainStyle === 'onepiece-quake-room') {
        if (sw.ownerCharId === 'law') {
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(-sw.radius, 0);
          ctx.lineTo(sw.radius, 0);
          ctx.moveTo(0, -sw.radius);
          ctx.lineTo(0, sw.radius);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          for (let k = 0; k < 7; k++) {
            const a = k * 0.9;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * sw.radius * 0.55, Math.sin(a) * sw.radius * 0.55);
            ctx.lineTo(Math.cos(a + 0.22) * sw.radius, Math.sin(a + 0.22) * sw.radius);
            ctx.stroke();
          }
        }
      } else if (dna.domainStyle === 'fma-transmute-hex' || dna.domainStyle === 'fairy-mahoujin') {
        for (const flip of [1, -1]) {
          ctx.beginPath();
          for (let k = 0; k < 3; k++) {
            const a = (k * Math.PI * 2) / 3 + (flip < 0 ? Math.PI : 0);
            if (k === 0) ctx.moveTo(Math.cos(a) * sw.radius * 0.9, Math.sin(a) * sw.radius * 0.9);
            else ctx.lineTo(Math.cos(a) * sw.radius * 0.9, Math.sin(a) * sw.radius * 0.9);
          }
          ctx.closePath();
          ctx.stroke();
        }
      } else if (dna.domainStyle === 'solo-monarch-zone') {
        const b = sw.radius * 0.85;
        ctx.strokeStyle = '#22d3ee';
        ctx.strokeRect(-b, -b, b * 2, b * 2);
      } else if (
        dna.domainStyle === 'jjk-domain-sigil' ||
        dna.domainStyle === 'bleach-bankai-ink'
      ) {
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = sw.lineWidth * 1.4 * sw.alpha;
        ctx.beginPath();
        ctx.arc(0, 0, sw.radius * 0.86, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 2. Guaranteed-Unique Per-Character Geometric Mandala inside the shockwave!
    drawCharacterUniqueCrest(ctx, dna, sw.radius * 0.72, sw.color, sec, (1 - sw.alpha) * 4);
    ctx.restore();
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.fillStyle = p.color;

    if (p.shape === 'glyph' && p.glyph) {
      ctx.font = `900 ${Math.round(p.size * 1.6)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.2;
      ctx.strokeText(p.glyph, 0, 0);
      ctx.fillText(p.glyph, 0, 0);
      ctx.restore();
      continue;
    }

    ctx.rotate(p.rotation);

    if (p.shape === 'spark') {
      ctx.fillRect(-p.size * 1.4, -p.size * 0.4, p.size * 2.8, p.size * 0.8);
    } else if (p.shape === 'square' || p.shape === 'pixel') {
      ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
    } else if (p.shape === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.3);
      ctx.lineTo(p.size * 0.9, 0);
      ctx.lineTo(0, p.size * 1.3);
      ctx.lineTo(-p.size * 0.9, 0);
      ctx.closePath();
      ctx.fill();
    } else if (p.shape === 'petal') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.35, p.size * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'star') {
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        const rad = k % 2 === 0 ? p.size * 1.4 : p.size * 0.5;
        if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
    } else if (p.shape === 'cross') {
      ctx.fillRect(-p.size * 1.2, -p.size * 0.35, p.size * 2.4, p.size * 0.7);
      ctx.fillRect(-p.size * 0.35, -p.size * 1.2, p.size * 0.7, p.size * 2.4);
    } else if (p.shape === 'shard') {
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.25);
      ctx.lineTo(p.size * 0.9, p.size * 0.7);
      ctx.lineTo(-p.size * 0.85, p.size * 0.9);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]): void {
  for (const ft of texts) {
    // Keep the arena clean: hide skill/callout/powerup text banners, render only numeric damage/heal popups
    if (ft.kind === 'callout' || ft.kind === 'powerup') continue;
    if (ft.kind === 'crit' && !/^[+-]?\d/.test(ft.text.trim())) continue;

    const progress = 1 - ft.life / ft.maxLife;
    const alpha = ft.life < 0.25 ? ft.life / 0.25 : 1;
    const popScale =
      progress < 0.14 ? 0.75 + (progress / 0.14) * 0.4 : 1.0 + (progress < 0.24 ? 0.08 : 0);

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.translate(ft.x, ft.y);
    ctx.scale(popScale, popScale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const weight = ft.kind === 'crit' ? '900' : '800';
    ctx.font = `${weight} ${ft.size}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;

    ctx.lineWidth = ft.kind === 'crit' ? 5.5 : 4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ft.strokeColor;
    ctx.strokeText(ft.text, 0, 0);

    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, 0, 0);

    if (ft.subtext) {
      ctx.font = `900 ${Math.round(ft.size * 0.72)}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.lineWidth = 4;
      ctx.strokeText(ft.subtext, 0, ft.size * 0.95);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(ft.subtext, 0, ft.size * 0.95);
    }

    ctx.restore();
  }
}

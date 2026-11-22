import { getCharacterById } from '../characters/roster';
import type { BattleEngine } from '../physics/engine';
import { drawArenaStageFloor, getArenaStageById } from './arenaStages';
import { drawFighterBall, drawUltimateShowcaseCharacter, hexWithAlpha } from './characterDraw';
import { drawDomainBackdrops } from './domainDraw';
import {
  drawBeams,
  drawBombs,
  drawFloatingTexts,
  drawLightningBolts,
  drawMinions,
  drawOdmLines,
  drawParticles,
  drawProjectiles,
  drawRicochetArms,
  drawShockwaves,
  drawSkyPillars,
  drawSlashes,
  drawTrails,
} from './effectsDraw';
import {
  drawArenaObstacles,
  drawCustomUltimateBackdrops,
  drawCustomUltimateForegrounds,
} from './ultimates/registry';
import { drawCastSeals } from './vfxIdentity';

const BORDER_COLORS: Record<number, { stroke: string; glow: string }> = {
  0: { stroke: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.65)' },
  1: { stroke: '#fb923c', glow: 'rgba(251, 146, 60, 0.78)' },
  2: { stroke: '#fb3765', glow: 'rgba(251, 55, 101, 0.88)' },
};

export class ArenaRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentDanger = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not initialize Canvas 2D context');
    }
    this.ctx = context;
  }

  public render(engine: BattleEngine, timeSec: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const cssSize = Math.max(240, Math.floor(Math.min(rect.width, rect.height)));
    const targetPx = Math.floor(cssSize * dpr);

    if (this.canvas.width !== targetPx || this.canvas.height !== targetPx) {
      this.canvas.width = targetPx;
      this.canvas.height = targetPx;
    }

    const ctx = this.ctx;
    const fullSize = engine.bounds.fullSize;
    const pad = 20; // logical padding for outer arena glow & shake
    const logicalTotal = fullSize + pad * 2;
    const scale = targetPx / logicalTotal;

    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    // Clear full canvas with deep navy backdrop (#080d1a)
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, logicalTotal, logicalTotal);

    // Smoothly track arena border state (danger 0 uses the selected arena stage's signature border color)
    const stage = getArenaStageById(engine.config.arenaTheme);
    const targetDanger = engine.getArenaDangerLevel();
    this.currentDanger = targetDanger;
    const borderPalette =
      this.currentDanger === 0
        ? { stroke: stage.borderStroke, glow: stage.borderGlow }
        : (BORDER_COLORS[this.currentDanger] ?? BORDER_COLORS[0]);

    // Translate into arena origin + screen shake + subtle Entity 303 RGB glitch jitter
    const glitchShiftX =
      engine.cameraGlitchTimer > 0 ? Math.sin(timeSec * 140) * 5.5 * engine.cameraGlitchTimer : 0;
    ctx.translate(pad + engine.shakeX + glitchShiftX, pad + engine.shakeY);

    // 1. Arena floor rounded square + selected Battle Arena Stage theme
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, fullSize, fullSize, 18);
    ctx.fillStyle = stage.floorColor;
    ctx.fill();
    ctx.clip();

    drawArenaStageFloor(ctx, engine.config.arenaTheme, fullSize, timeSec);

    // 1b. Active Anime/Game Domain Expansion & Modular Custom Ultimate Backdrops
    drawDomainBackdrops(ctx, engine.domains, engine.bounds, engine.fighters, timeSec);
    drawCustomUltimateBackdrops(
      ctx,
      engine.activeUltimates,
      engine.bounds,
      engine.fighters,
      timeSec,
    );

    // Sudden Death danger zone (outside shrinking inner bounds)
    if (engine.suddenDeathActive) {
      this.drawSuddenDeathOverlay(ctx, engine, timeSec);
    }

    // 2. Franchise & Per-Character Cast Seals + Floor Trails + Physical Obstacles + Bombs/Traps
    drawCastSeals(ctx, engine.castSeals, timeSec);
    drawTrails(ctx, engine.trails, timeSec);
    drawArenaObstacles(ctx, engine.obstacles, timeSec);
    drawBombs(ctx, engine.bombs, timeSec);

    // 3. Shockwaves
    drawShockwaves(ctx, engine.shockwaves);

    // 4. Levi ODM wires
    drawOdmLines(ctx, engine);

    // 5. Luffy / Deku elastic arms
    drawRicochetArms(ctx, engine.ricochetArms, timeSec);

    // 6. Minions (Naruto clones, Jinwoo shadow soldiers)
    drawMinions(ctx, engine.minions, timeSec);

    // 7. Fighters
    for (const fighter of engine.fighters) {
      drawFighterBall(ctx, fighter, timeSec);
    }

    // 8. Beams, Projectiles, Chain Lightning Bolts & Herobrine Sky Pillars
    drawBeams(ctx, engine.beams, fullSize, timeSec);
    drawProjectiles(ctx, engine.projectiles, timeSec, engine.fighters);
    drawLightningBolts(ctx, engine.lightningBolts);
    drawSkyPillars(ctx, engine.skyPillars, engine.bounds.top, timeSec);

    // 9. Slashes (Sukuna Cleave/Dismantle, Levi cross cuts)
    drawSlashes(ctx, engine.slashes);

    // 10. Particles & Custom Ultimate Foreground Layers (Anvils, Fog/Darkness Masks, Decoys, Scythes, Vibration Waves!)
    drawParticles(ctx, engine.particles);
    drawCustomUltimateForegrounds(
      ctx,
      engine.activeUltimates,
      engine.bounds,
      engine.fighters,
      timeSec,
    );

    // 11. Floating numbers & POWER UP callouts (clipped cleanly inside arena)
    drawFloatingTexts(ctx, engine.floatingTexts);

    // 11b. Center-Screen Ultimate Cut-In Cinematic Highlight!
    if (engine.activeCutIn) {
      this.drawUltimateCutInOverlay(ctx, engine, timeSec);
    }

    ctx.restore(); // end arena floor clip

    // 12. Glowing outer arena border (white -> orange -> crimson-pink)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, fullSize, fullSize, 18);
    ctx.strokeStyle = borderPalette.stroke;
    ctx.lineWidth = this.currentDanger === 2 ? 4.2 : 3.4;
    ctx.shadowColor = borderPalette.glow;
    ctx.shadowBlur = this.currentDanger === 2 ? 22 : this.currentDanger === 1 ? 16 : 12;
    ctx.stroke();

    // Inner subtle crisp highlight border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(2.5, 2.5, fullSize - 5, fullSize - 5, 16);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private drawSuddenDeathOverlay(
    ctx: CanvasRenderingContext2D,
    engine: BattleEngine,
    timeSec: number,
  ): void {
    const { left, top, right, bottom, fullSize } = engine.bounds;
    const pulse = 0.18 + Math.sin(timeSec * 8) * 0.06;

    ctx.save();
    ctx.fillStyle = `rgba(251, 55, 101, ${pulse})`;
    // Top, bottom, left, right danger strips
    ctx.fillRect(0, 0, fullSize, top);
    ctx.fillRect(0, bottom, fullSize, fullSize - bottom);
    ctx.fillRect(0, top, left, bottom - top);
    ctx.fillRect(right, top, fullSize - right, bottom - top);

    // Inner glowing crimson boundary wall
    ctx.strokeStyle = '#fb3765';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = '#fb3765';
    ctx.shadowBlur = 14;
    ctx.strokeRect(left, top, right - left, bottom - top);
    ctx.restore();
  }

  private drawUltimateCutInOverlay(
    ctx: CanvasRenderingContext2D,
    engine: BattleEngine,
    timeSec: number,
  ): void {
    const cutIn = engine.activeCutIn;
    if (!cutIn) return;

    const fullSize = engine.bounds.fullSize;
    const cx = fullSize / 2;
    const cy = fullSize / 2;
    const progress = Math.max(0, Math.min(1, 1 - cutIn.timer / Math.max(0.01, cutIn.duration)));
    const accent = cutIn.ultimate.color;
    const char = getCharacterById(cutIn.characterId);

    // Snappy anime spring pop-in & quick fade-out on release
    const introAlpha =
      progress < 0.12 ? progress / 0.12 : progress > 0.9 ? (1 - progress) / 0.1 : 1;
    const heroScale =
      progress < 0.16
        ? 0.55 + (progress / 0.16) * 0.55
        : progress < 0.28
          ? 1.1 - ((progress - 0.16) / 0.12) * 0.1
          : 1.0 + Math.sin(progress * Math.PI) * 0.04;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, introAlpha));

    // 1. Dark theatrical dim over frozen arena
    ctx.fillStyle = 'rgba(4, 7, 16, 0.8)';
    ctx.fillRect(0, 0, fullSize, fullSize);

    // 2. Diagonal glowing cinema spotlight band behind fighter
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.14);
    const bandH = fullSize * 0.48;
    const bandGrad = ctx.createLinearGradient(0, -bandH / 2, 0, bandH / 2);
    bandGrad.addColorStop(0, hexWithAlpha(accent, 0.06));
    bandGrad.addColorStop(0.5, hexWithAlpha(accent, 0.32));
    bandGrad.addColorStop(1, hexWithAlpha(accent, 0.06));
    ctx.fillStyle = bandGrad;
    ctx.fillRect(-fullSize, -bandH / 2, fullSize * 2, bandH);

    // Crisp bright speed-borders top & bottom of cinema band
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3.2;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(-fullSize, -bandH / 2);
    ctx.lineTo(fullSize, -bandH / 2);
    ctx.moveTo(-fullSize, bandH / 2);
    ctx.lineTo(fullSize, bandH / 2);
    ctx.stroke();
    ctx.restore();

    // 3. Spinning anime radial speed-lines!
    ctx.save();
    ctx.translate(cx, cy - fullSize * 0.03);
    const rays = 24;
    for (let i = 0; i < rays; i++) {
      const a = (i * Math.PI * 2) / rays + timeSec * 1.4;
      const rInner = fullSize * 0.18 + (i % 3) * 14;
      const rOuter = fullSize * 0.68;
      ctx.strokeStyle = i % 2 === 0 ? hexWithAlpha(accent, 0.45) : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = i % 3 === 0 ? 3 : 1.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * rInner, Math.sin(a) * rInner);
      ctx.lineTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
      ctx.stroke();
    }

    // Concentric pulsing ultimate rings
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(0, 0, fullSize * (0.19 + progress * 0.05), 0, Math.PI * 2);
    ctx.stroke();

    // 4. Giant Zoomed-In Vector Showcase of the Character right in center!
    ctx.shadowBlur = 0;
    ctx.scale(heroScale, heroScale);
    drawUltimateShowcaseCharacter(ctx, char, cutIn.formIndex, fullSize * 0.135, timeSec);
    ctx.restore();

    // 5. Crisp Top Tag: ULTIMATE SKILL · CHARACTER · FORM
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const tagText = `ULTIMATE · ${cutIn.displayName.toUpperCase()} (${cutIn.formName.toUpperCase()})`;
    const tagY = cy - fullSize * 0.28;
    ctx.font = `900 ${Math.round(fullSize * 0.028)}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
    const tagW = Math.min(fullSize * 0.86, ctx.measureText(tagText).width + 32);
    ctx.fillStyle = '#070c18';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(cx - tagW / 2, tagY - 17, tagW, 34, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagText, cx, tagY + 0.5, fullSize * 0.82);

    // 6. Bold Giant Ultimate Skill Name below character!
    const titleY = cy + fullSize * 0.24;
    const baseTitleSize = Math.round(fullSize * 0.055);
    ctx.font = `900 ${baseTitleSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#040711';
    ctx.shadowColor = accent;
    ctx.shadowBlur = 20;
    ctx.strokeText(cutIn.ultimate.name, cx, titleY, fullSize * 0.9);
    ctx.fillStyle = accent;
    ctx.fillText(cutIn.ultimate.name, cx, titleY, fullSize * 0.9);

    // 7. Spoken Character Voice Line Quote underneath!
    ctx.shadowBlur = 0;
    const quoteY = titleY + fullSize * 0.068;
    ctx.font = `italic 700 ${Math.round(fullSize * 0.029)}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#040711';
    const quoteText = `"${cutIn.ultimate.voiceLine}"`;
    ctx.strokeText(quoteText, cx, quoteY, fullSize * 0.88);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(quoteText, cx, quoteY, fullSize * 0.88);
    ctx.restore();

    // 8. Brief cinematic flash on entry & launch!
    if (progress < 0.09) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(1 - progress / 0.09) * 0.55})`;
      ctx.fillRect(0, 0, fullSize, fullSize);
    } else if (progress > 0.92) {
      ctx.fillStyle = `rgba(255, 255, 255, ${((progress - 0.92) / 0.08) * 0.45})`;
      ctx.fillRect(0, 0, fullSize, fullSize);
    }

    ctx.restore();
  }
}

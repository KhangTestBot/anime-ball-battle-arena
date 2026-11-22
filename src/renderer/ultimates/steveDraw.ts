import type { SteveUltimateData } from '../../physics/ultimates/steve';
import type { ArenaObstacle } from '../../types/game';
import type { UltimateRenderer } from './types';

/** Renders pixelated Minecraft Obsidian / Bedrock obstacles with progressive block-breaking cracks! */
export function drawMinecraftObstacle(
  ctx: CanvasRenderingContext2D,
  obs: ArenaObstacle,
  t: number,
): void {
  const halfW = obs.w * 0.5;
  const halfH = obs.h * 0.5;
  const fade = Math.min(1, obs.life / 0.35);
  const damageRatio = 1 - Math.max(0, obs.hp / Math.max(1, obs.maxHp));

  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(obs.x, obs.y);

  const isBedrock = obs.kind === 'bedrock-block';
  ctx.shadowColor = isBedrock ? '#94a3b8' : '#a855f7';
  ctx.shadowBlur = 10;

  // Base voxel block fill
  ctx.fillStyle = isBedrock ? '#334155' : '#1e1038';
  ctx.fillRect(-halfW, -halfH, obs.w, obs.h);

  // Pixelated Minecraft block texture patches
  if (isBedrock) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfW + 4, -halfH + 4, 10, 8);
    ctx.fillRect(2, -halfH + 12, 12, 10);
    ctx.fillRect(-halfW + 8, 4, 12, 10);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-4, -halfH + 6, 8, 8);
    ctx.fillRect(-halfW + 4, -2, 8, 8);
  } else {
    // Obsidian purple crystalline pixel patches
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(-halfW + 4, -halfH + 4, 11, 9);
    ctx.fillRect(3, 2, 11, 11);
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(-4, -halfH + 10, 9, 8);
    ctx.fillRect(-halfW + 6, 6, 8, 8);
    // Subtle shimmering purple enchantment glint line
    const glintX = -halfW + ((t * 45 + obs.x) % (obs.w + 12)) - 6;
    ctx.fillStyle = 'rgba(216, 180, 254, 0.25)';
    ctx.fillRect(Math.max(-halfW, glintX), -halfH, 5, obs.h);
  }

  // Crisp blocky black outline
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(-halfW, -halfH, obs.w, obs.h);

  // Progressive Minecraft pixel break cracks when damaged!
  if (damageRatio > 0.15) {
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.lineTo(6, -12);
    ctx.moveTo(-4, -4);
    ctx.lineTo(-12, 8);
    if (damageRatio > 0.5) {
      ctx.moveTo(0, 0);
      ctx.lineTo(13, 10);
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, -13);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/** Draws iconic golden Totem of Undying with emerald eyes! */
function drawTotemIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 16;
  // Golden outstretched wings / arms
  ctx.fillStyle = '#eab308';
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 1.6;
  ctx.fillRect(-14, -4, 28, 7);
  ctx.strokeRect(-14, -4, 28, 7);
  // Golden head & torso
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-8, -13, 16, 22);
  ctx.strokeRect(-8, -13, 16, 22);
  // Lower pedestal
  ctx.fillRect(-5, 9, 10, 5);
  ctx.strokeRect(-5, 9, 10, 5);
  // Iconic bright Emerald Green eyes!
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(-5, -9, 3.5, 3.5);
  ctx.fillRect(1.5, -9, 3.5, 3.5);
  // Nose ridge
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(-1.5, -6, 3, 5);
  ctx.restore();
}

export const steveUltimateRenderer: UltimateRenderer = {
  characterId: 'steve',

  drawBackdrop(ctx, state, bounds, _fighters, t) {
    const fadeIn = Math.min(1, state.elapsed / 0.3);
    const fadeOut = Math.min(1, (state.duration - state.elapsed) / 0.45);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
    const full = bounds.fullSize;

    // Subtle End-Stone / Enchanting Table voxel border aura
    ctx.save();
    ctx.globalAlpha = alpha * 0.32;
    ctx.fillStyle = '#1e1038';
    ctx.fillRect(0, 0, full, full);

    // Floating pixel Enchantment glyphs rising gently across background
    ctx.globalAlpha = alpha * 0.45;
    ctx.fillStyle = '#c084fc';
    for (let i = 0; i < 16; i++) {
      const gx = ((i * 89) % (full - 40)) + 20;
      const gy = (full - ((t * 40 + i * 53) % full) + full) % full;
      ctx.fillRect(gx, gy, 4, 4);
      ctx.fillRect(gx + 5, gy + 2, 3, 3);
    }
    ctx.restore();
  },

  drawForeground(ctx, state, bounds, fighters, t) {
    const data = state.data as unknown as SteveUltimateData;
    const owner = fighters.find((f) => f.uid === state.ownerUid);

    // 1. Enchanted Netherite Shimmer + Armed Totem Badge on Steve!
    if (owner && owner.alive) {
      if (owner.enchantArmorTimer > 0) {
        ctx.save();
        ctx.translate(owner.x, owner.y);
        ctx.beginPath();
        ctx.arc(0, 0, owner.radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 14;
        ctx.stroke();

        // Diagonal moving purple Enchantment Glint band clipped to Steve's ball
        ctx.beginPath();
        ctx.arc(0, 0, owner.radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.rotate(-Math.PI / 4);
        const sweep = ((t * 95) % (owner.radius * 4)) - owner.radius * 2;
        ctx.fillStyle = 'rgba(216, 180, 254, 0.36)';
        ctx.fillRect(sweep, -owner.radius * 1.4, 11, owner.radius * 2.8);
        ctx.restore();
      }

      if (owner.totemActive) {
        // Floating golden Totem of Undying hovering beside Steve!
        const bob = Math.sin(t * 7) * 3;
        drawTotemIcon(ctx, owner.x + owner.radius + 14, owner.y - 8 + bob, 0.72, 0.96);
      }

      // Dramatic giant spinning Golden Totem pop when Steve revives from fatal damage!
      if (owner.totemPopTimer > 0) {
        const popProg = 1 - owner.totemPopTimer / 1.1;
        const sc = 1.2 + Math.sin(popProg * Math.PI) * 1.15;
        ctx.save();
        ctx.translate(owner.x, owner.y);
        ctx.rotate(Math.sin(popProg * Math.PI * 4) * 0.25);
        drawTotemIcon(ctx, 0, 0, sc, Math.min(1, owner.totemPopTimer * 1.6));
        ctx.restore();
      }
    }

    // 2. Falling Iron Anvils (Classic T-shaped pixelated Minecraft Anvil + shrinking drop shadow!)
    for (const anvil of data.anvils) {
      const p = Math.min(1, anvil.progress);
      const shadowScale = 0.35 + p * 0.65;
      const dropY = bounds.top - 30 + (anvil.targetY - (bounds.top - 30)) * (p * p);

      ctx.save();
      // Ground warning shadow ellipse
      ctx.fillStyle = `rgba(15, 23, 42, ${0.28 + p * 0.55})`;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(anvil.x, anvil.targetY, 26 * shadowScale, 11 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      if (!anvil.landed) ctx.stroke();

      // Pixelated Iron Anvil body (fades quickly after landing)
      const anvilAlpha = anvil.landed ? Math.max(0, 1 - (anvil.progress - 1) / 0.45) : 1;
      ctx.globalAlpha = anvilAlpha;
      ctx.translate(anvil.x, dropY);
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.4;
      // Top wide anvil face
      ctx.fillRect(-20, -18, 40, 12);
      ctx.strokeRect(-20, -18, 40, 12);
      // Narrow waist
      ctx.fillRect(-9, -6, 18, 9);
      ctx.strokeRect(-9, -6, 18, 9);
      // Heavy base foot
      ctx.fillRect(-16, 3, 32, 9);
      ctx.strokeRect(-16, 3, 32, 9);
      // Metallic pixel top highlight
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-17, -16, 34, 4);
      ctx.restore();
    }
  },
};

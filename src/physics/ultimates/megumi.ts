import { getHealMultiplier } from '../domains';
import type { UltimateHandler } from './types';

export interface MegumiUltimateData {
  mahoragaId: string;
  wheelAngle: number;
  wheelTurns: number;
  adaptTick: number;
  poolRadius: number;
}

export const megumiUltimateHandler: UltimateHandler = {
  characterId: 'megumi',
  title: 'CHIMERA SHADOW GARDEN & ADAPTIVE MAHORAGA',
  subtitle:
    'Floods the arena with Chimera Shadow Garden slowing foes → Summons Divine General MAHORAGA AI whose 8-spoke Wheel spins to adapt, heal & refresh shields!',
  bannerColor: '#1e3a8a',
  castDuration: 0.25,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const mId = ctx.nextId('mahoraga');
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    // Summon AI Shikigami Divine General MAHORAGA into ctx.minions!
    ctx.minions.push({
      id: mId,
      ownerUid: owner.uid,
      ownerCharId: owner.character.id,
      ownerSeries: owner.character.series,
      skillMotif: 'mahoraga',
      teamId: owner.teamId,
      kind: 'shadow',
      x: Math.max(
        ctx.bounds.left + 32,
        Math.min(ctx.bounds.right - 32, owner.x + Math.cos(ang) * 44),
      ),
      y: Math.max(
        ctx.bounds.top + 32,
        Math.min(ctx.bounds.bottom - 32, owner.y + Math.sin(ang) * 44),
      ),
      vx: Math.cos(ang) * 320,
      vy: Math.sin(ang) * 320,
      radius: 22,
      hp: 140,
      maxHp: 140,
      damage: ctx.getEffectiveDamage(owner, 6.2),
      life: 4.4,
      maxLife: 4.4,
      color: '#f8fafc',
      accentColor: '#facc15',
      wingPhase: 0,
      hitCooldowns: {},
    });

    owner.shieldTimer = Math.max(owner.shieldTimer, 1.5);
    owner.shieldColor = '#38bdf8';

    const data: MegumiUltimateData = {
      mahoragaId: mId,
      wheelAngle: 0,
      wheelTurns: 0,
      adaptTick: 0,
      poolRadius: 215,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#1d4ed8', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      220,
      '#1e3a8a',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'WITH THIS TREASURE... MAHORAGA!',
      '#93c5fd',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 22, '#09090b', 75, 240, 3, 6.5, 'star');
    ctx.addScreenShake(11);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MegumiUltimateData;
    const enemies = ctx.getEnemies(owner);

    // Enemies inside Chimera Shadow Garden ink pool sink slowly
    for (const e of enemies) {
      if (Math.hypot(e.x - owner.x, e.y - owner.y) <= data.poolRadius) {
        e.vx *= Math.pow(0.55, dt * 2.6);
        e.vy *= Math.pow(0.55, dt * 2.6);
      }
    }

    // Rotate 8-Handled Dharma Adaptation Wheel every 1.1s -> ADAPTED!! heal + refreshed shield!
    data.adaptTick += dt;
    if (data.adaptTick >= 1.1) {
      data.adaptTick -= 1.1;
      data.wheelTurns++;
      data.wheelAngle += Math.PI / 4; // 1 spoke = 45 degrees *CLANK*
      owner.shieldTimer = Math.max(owner.shieldTimer, 1.45);
      owner.shieldColor = '#facc15';
      const healAmt = owner.maxHp * 0.04 * getHealMultiplier(owner);
      if (healAmt > 0.5) {
        owner.hp = Math.min(owner.maxHp, owner.hp + healAmt);
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 16,
        'ADAPTED! *CLANK*',
        '#fde047',
        'callout',
      );
      ctx.emitSfx({ type: 'powerup', intensity: 0.9 });
    }
  },
};

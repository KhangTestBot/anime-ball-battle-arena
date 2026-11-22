import type { UltimateHandler } from './types';

export interface StarrkUltimateData {
  salvosDone: number;
  salvoCd: number;
  wolvesFired: boolean;
  flash: number;
}

export const starrkUltimateHandler: UltimateHandler = {
  characterId: 'starrk',
  title: 'LOS LOBOS: CERO METRALLETA!',
  subtitle:
    'Primera Espada dual-pistol blitz (Auto-Dodge), unleashes 4 rapid Cero Metralleta barrages, and detonates a pack of Spirit Wolves!',
  bannerColor: '#0ea5e9',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);
    owner.dmgBonusPct += 18;

    const data: StarrkUltimateData = {
      salvosDone: 0,
      salvoCd: 0.26,
      wolvesFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#0ea5e9', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'CERO METRALLETA!!',
      '#0ea5e9',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as StarrkUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.wolvesFired && data.salvosDone < 4) {
      data.salvoCd -= dt;
      if (data.salvoCd <= 0) {
        data.salvoCd = 0.34;
        data.salvosDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, -0.07, 0.07, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('starrk_cero'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 6.2),
            knockback: 185,
            color: '#0ea5e9',
            secondaryColor: '#e2e8f0',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.wolvesFired && state.elapsed >= 2.0) {
      data.wolvesFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 590,
          Math.sin(ang) * 590,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#0ea5e9',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'LOS LOBOS PACK DETONATION!!',
        '#0ea5e9',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

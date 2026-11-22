import type { UltimateHandler } from './types';

export interface ChosoUltimateData {
  streamsDone: number;
  streamCd: number;
  supernovaFired: boolean;
  flash: number;
}

export const chosoUltimateHandler: UltimateHandler = {
  characterId: 'choso',
  title: 'BLOOD MANIPULATION: PIERCING BLOOD & SUPERNOVA!',
  subtitle:
    'Compresses toxic crimson blood (+18% DMG), fires 3 supersonic Piercing Blood streams inflicting Anti-Heal, and detonates Supernova!',
  bannerColor: '#dc2626',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);

    const data: ChosoUltimateData = {
      streamsDone: 0,
      streamCd: 0.3,
      supernovaFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'CONVERGENCE: PIERCING BLOOD!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ChosoUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.supernovaFired && data.streamsDone < 3) {
      data.streamCd -= dt;
      if (data.streamCd <= 0) {
        data.streamCd = 0.44;
        data.streamsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        ctx.projectiles.push({
          id: ctx.nextId('choso_blood'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'arrow-trident',
          x: owner.x + Math.cos(ang) * (owner.radius + 10),
          y: owner.y + Math.sin(ang) * (owner.radius + 10),
          vx: Math.cos(ang) * 780,
          vy: Math.sin(ang) * 780,
          radius: 11,
          damage: ctx.getEffectiveDamage(owner, 9.6),
          knockback: 230,
          color: '#dc2626',
          secondaryColor: '#991b1b',
          angle: ang,
          life: 1.45,
          maxLife: 1.45,
          piercing: true,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.supernovaFired && state.elapsed >= 2.0) {
      data.supernovaFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.antiHealTimer = Math.max(e.antiHealTimer, 4.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        315,
        '#dc2626',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(owner.x, owner.y - owner.radius - 26, 'SUPERNOVA!!', '#dc2626', 'crit');
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

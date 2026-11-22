import type { UltimateHandler } from './types';

export interface AntaresUltimateData {
  wavesDone: number;
  waveCd: number;
  breathFired: boolean;
  breathAngle: number;
  breathFlash: number;
}

export const antaresUltimateHandler: UltimateHandler = {
  characterId: 'antares',
  title: 'MONARCH OF DESTRUCTION: BREATH OF DESTRUCTION!',
  subtitle:
    'Dragon Monarch form (+24% DMG, Enchanted Armor & Unstoppable), scorches foes with 3 Dragon Flame waves, and unleashes the existence-erasing Breath of Destruction!',
  bannerColor: '#dc2626',
  castDuration: 0.26,
  duration: 4.2,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 24;
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.8);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: AntaresUltimateData = {
      wavesDone: 0,
      waveCd: 0.34,
      breathFired: false,
      breathAngle: ang,
      breathFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'MONARCH OF DESTRUCTION!!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AntaresUltimateData;
    if (data.breathFlash > 0) data.breathFlash = Math.max(0, data.breathFlash - dt);

    if (!data.breathFired && data.wavesDone < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.44;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.breathAngle = ang;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('antares_fire'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 640,
            vy: Math.sin(a) * 640,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 230,
            color: '#dc2626',
            secondaryColor: '#f97316',
            angle: a,
            life: 1.55,
            maxLife: 1.55,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.breathFired && state.elapsed >= 2.1) {
      data.breathFired = true;
      data.breathFlash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.5);
        e.burnTimer = Math.max(e.burnTimer, 5.0);
        e.burnDps = Math.max(e.burnDps, 10.5);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.0),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        360,
        '#dc2626',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'BREATH OF DESTRUCTION!!',
        '#f97316',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.5 });
    }
  },
};

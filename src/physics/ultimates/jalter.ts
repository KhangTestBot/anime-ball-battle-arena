import type { UltimateHandler } from './types';

export interface JalterUltimateData {
  flamesDone: number;
  flameCd: number;
  haineFired: boolean;
  flash: number;
}

export const jalterUltimateHandler: UltimateHandler = {
  characterId: 'jalter',
  title: 'LA GRONDEMENT DU HAINE!!',
  subtitle:
    'Ignites Dragon Witch Fury (Unstoppable + +24% DMG), launches 3 Cursed Flame volleys, and impales all with LA GRONDEMENT DU HAINE!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    owner.dmgBonusPct += 24;

    const data: JalterUltimateData = {
      flamesDone: 0,
      flameCd: 0.28,
      haineFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'BURN IN THE FLAMES OF VENGEANCE!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JalterUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.haineFired && data.flamesDone < 3) {
      data.flameCd -= dt;
      if (data.flameCd <= 0) {
        data.flameCd = 0.44;
        data.flamesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('jalter_fire'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 9.0),
            knockback: 235,
            color: '#a855f7',
            secondaryColor: '#ef4444',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
      }
    }

    if (!data.haineFired && state.elapsed >= 2.05) {
      data.haineFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.5),
          Math.cos(ang) * 680,
          Math.sin(ang) * 680,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        370,
        '#a855f7',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'LA GRONDEMENT DU HAINE!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};

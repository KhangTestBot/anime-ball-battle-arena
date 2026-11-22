import type { UltimateHandler } from './types';

export interface JeanUltimateData {
  salvosDone: number;
  salvoCd: number;
  flankFired: boolean;
  flash: number;
}

export const jeanUltimateHandler: UltimateHandler = {
  characterId: 'jean',
  title: 'SURVEY CORPS CAPTAIN: TACTICAL STRIKE!',
  subtitle:
    'Tactical ODM maneuver (+16% DMG & Auto-Dodge), launches 3 Thunder Spear salvos, and finishes with an armor-shredding Tactical Flank Cleave!',
  bannerColor: '#f59e0b',
  castDuration: 0.2,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 16;
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.8);

    const data: JeanUltimateData = {
      salvosDone: 0,
      salvoCd: 0.3,
      flankFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f59e0b', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'TACTICAL MANEUVER!',
      '#f59e0b',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'dodge', intensity: 1.15 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JeanUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.flankFired && data.salvosDone < 3) {
      data.salvoCd -= dt;
      if (data.salvoCd <= 0) {
        data.salvoCd = 0.44;
        data.salvosDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.14, 0.14]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('jean_rocket'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'rocket',
            x: owner.x + Math.cos(a) * (owner.radius + 8),
            y: owner.y + Math.sin(a) * (owner.radius + 8),
            vx: Math.cos(a) * 650,
            vy: Math.sin(a) * 650,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 200,
            color: '#f59e0b',
            secondaryColor: '#15803d',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.1 });
      }
    }

    if (!data.flankFired && state.elapsed >= 1.95) {
      data.flankFired = true;
      data.flash = 1.25;
      for (const e of ctx.getEnemies(owner)) {
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 21.5),
          Math.cos(ang) * 510,
          Math.sin(ang) * 510,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        280,
        '#f59e0b',
        9,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'TACTICAL FLANK CLEAVE!',
        '#15803d',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'slash', intensity: 1.35 });
    }
  },
};

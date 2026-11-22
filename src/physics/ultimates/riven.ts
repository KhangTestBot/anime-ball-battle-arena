import type { UltimateHandler } from './types';

export interface RivenUltimateData {
  wingsDone: number;
  wingCd: number;
  windSlashFired: boolean;
  flash: number;
}

export const rivenUltimateHandler: UltimateHandler = {
  characterId: 'riven',
  title: 'BLADE OF THE EXILE (R): WIND SLASH!',
  subtitle:
    'Reforges the Runic Blade (+20% DMG, Valor Shield & Unstoppable), chains 3 Broken Wings dashes, and executes with Wind Slash!',
  bannerColor: '#10b981',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.4);
    owner.shieldColor = '#10b981';
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);

    const data: RivenUltimateData = {
      wingsDone: 0,
      wingCd: 0.3,
      windSlashFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#10b981', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'BLADE OF THE EXILE!',
      '#10b981',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RivenUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.windSlashFired && data.wingsDone < 3) {
      data.wingCd -= dt;
      if (data.wingCd <= 0) {
        data.wingCd = 0.44;
        data.wingsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        if (target) {
          const ang = Math.atan2(target.y - owner.y, target.x - owner.x);
          owner.vx = Math.cos(ang) * 650;
          owner.vy = Math.sin(ang) * 650;
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, 9.2),
            Math.cos(ang) * 320,
            Math.sin(ang) * 320,
            { isCrit: true, sourceKind: 'ability' },
          );
          ctx.spawnShockwave(
            target.x,
            target.y,
            125,
            '#10b981',
            6,
            owner.character.id,
            owner.character.series,
          );
          ctx.emitSfx({ type: 'slash', intensity: 1.2 });
        }
      }
    }

    if (!data.windSlashFired && state.elapsed >= 2.0) {
      data.windSlashFired = true;
      data.flash = 1.35;
      const target = ctx.getNearestEnemy(owner);
      const baseAng = target
        ? Math.atan2(target.y - owner.y, target.x - owner.x)
        : owner.facingAngle;
      for (const offset of [-0.22, 0, 0.22]) {
        const a = baseAng + offset;
        ctx.projectiles.push({
          id: ctx.nextId('riven_wind'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'sword-wave',
          x: owner.x + Math.cos(a) * (owner.radius + 10),
          y: owner.y + Math.sin(a) * (owner.radius + 10),
          vx: Math.cos(a) * 720,
          vy: Math.sin(a) * 720,
          radius: 16,
          damage: ctx.getEffectiveDamage(owner, 14.0),
          knockback: 260,
          color: '#10b981',
          secondaryColor: '#cbd5e1',
          angle: a,
          life: 1.4,
          maxLife: 1.4,
          piercing: true,
          hitCooldowns: {},
          powerLevel: ctx.getForm(owner).powerLevel,
        });
      }
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 22.5),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#10b981',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'WIND SLASH!!',
        '#10b981',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });
    }
  },
};

import type { UltimateHandler } from './types';

export interface AllForOneUltimateData {
  cannonsDone: number;
  cannonCd: number;
  comboFired: boolean;
  flash: number;
}

export const allForOneUltimateHandler: UltimateHandler = {
  characterId: 'allforone',
  title: 'ALL FOR ONE: ULTIMATE QUIRK COMBINATION!',
  subtitle:
    'Demon Lord Rewind (Totem Revive + +24% DMG + Quirk Steal Silence), blasts 3 Air Cannon volleys, and obliterates with Ultimate Quirk Combination!',
  bannerColor: '#a855f7',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.dmgBonusPct += 24;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.8);
    for (const e of ctx.getEnemies(owner)) {
      e.silenceTimer = Math.max(e.silenceTimer, 3.0);
    }

    const data: AllForOneUltimateData = {
      cannonsDone: 0,
      cannonCd: 0.32,
      comboFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 28,
      'YOUR QUIRK IS MINE!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(13);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as AllForOneUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.comboFired && data.cannonsDone < 3) {
      data.cannonCd -= dt;
      if (data.cannonCd <= 0) {
        data.cannonCd = 0.44;
        data.cannonsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('afo_air'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 670,
            vy: Math.sin(a) * 670,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 230,
            color: '#a855f7',
            secondaryColor: '#ef4444',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
      }
    }

    if (!data.comboFired && state.elapsed >= 2.05) {
      data.comboFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.0),
          Math.cos(ang) * 680,
          Math.sin(ang) * 680,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        365,
        '#ef4444',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'ULTIMATE QUIRK COMBINATION!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};

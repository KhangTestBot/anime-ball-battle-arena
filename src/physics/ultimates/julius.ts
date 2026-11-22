import type { UltimateHandler } from './types';

export interface JuliusUltimateData {
  orbsDone: number;
  orbCd: number;
  anastasisFired: boolean;
  flash: number;
}

export const juliusUltimateHandler: UltimateHandler = {
  characterId: 'julius',
  title: 'TIME MAGIC: CHRONO ANASTASIS!',
  subtitle:
    'Activates Swallowtail Time Rewind (Totem Revive + Time-Stop Stun), fires 3 Chrono Stasis volleys, and unleashes Chrono Anastasis!',
  bannerColor: '#38bdf8',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.dmgBonusPct += 22;
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.4);
      e.stunKind = 'time-stop';
    }

    const data: JuliusUltimateData = {
      orbsDone: 0,
      orbCd: 0.3,
      anastasisFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'TIME MAGIC: CHRONO STASIS!!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.35 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as JuliusUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.anastasisFired && data.orbsDone < 3) {
      data.orbCd -= dt;
      if (data.orbCd <= 0) {
        data.orbCd = 0.44;
        data.orbsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('julius_time'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 225,
            color: '#38bdf8',
            secondaryColor: '#facc15',
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

    if (!data.anastasisFired && state.elapsed >= 2.05) {
      data.anastasisFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.2);
        e.stunKind = 'time-stop';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        365,
        '#facc15',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'CHRONO ANASTASIS!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};

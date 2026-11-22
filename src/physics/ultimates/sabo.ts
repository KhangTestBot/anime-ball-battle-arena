import type { UltimateHandler } from './types';

export interface SaboUltimateData {
  fistsDone: number;
  fistCd: number;
  breathFired: boolean;
  flash: number;
}

export const saboUltimateHandler: UltimateHandler = {
  characterId: 'sabo',
  title: "MERA MERA NO MI: DRAGON'S BREATH & HIKEN!",
  subtitle:
    "Ignites Revolutionary Flame (+20% DMG & Unstoppable), blasts 3 Fire Fist volleys, and shatters the battlefield with Dragon's Breath!",
  bannerColor: '#f97316',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: SaboUltimateData = {
      fistsDone: 0,
      fistCd: 0.3,
      breathFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#f97316', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'FIRE FIST: HIKEN!!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SaboUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.breathFired && data.fistsDone < 3) {
      data.fistCd -= dt;
      if (data.fistCd <= 0) {
        data.fistCd = 0.44;
        data.fistsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('sabo_hiken'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 650,
            vy: Math.sin(a) * 650,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.2),
            knockback: 220,
            color: '#f97316',
            secondaryColor: '#2563eb',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.breathFired && state.elapsed >= 2.0) {
      data.breathFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.5);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#f97316',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        "DRAGON'S BREATH SHATTER!!",
        '#f97316',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

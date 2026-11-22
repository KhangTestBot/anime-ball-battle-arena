import type { UltimateHandler } from './types';

export interface BingChillingUltimateData {
  conesDone: number;
  coneCd: number;
  creditFired: boolean;
  flash: number;
}

export const bingChillingUltimateHandler: UltimateHandler = {
  characterId: 'bing_chilling',
  title: 'BING CHILLING: -9999 SOCIAL CREDIT!',
  subtitle:
    'Turns invisible (Invulnerable + Auto-Dodge), freezes all foes with Bing Chilling, and drops -9999 SOCIAL CREDIT!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.invulnTimer = Math.max(owner.invulnTimer, 2.2);
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.dmgBonusPct += 22;
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.3);
      e.stunKind = 'frozen';
    }

    const data: BingChillingUltimateData = {
      conesDone: 0,
      coneCd: 0.28,
      creditFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      "YOU CAN'T SEE ME!! BING CHILLING!!",
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'dodge', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BingChillingUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.creditFired && data.conesDone < 3) {
      data.coneCd -= dt;
      if (data.coneCd <= 0) {
        data.coneCd = 0.44;
        data.conesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('bing_cone'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 230,
            color: '#38bdf8',
            secondaryColor: '#facc15',
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

    if (!data.creditFired && state.elapsed >= 2.05) {
      data.creditFired = true;
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
        370,
        '#facc15',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        '-9999 SOCIAL CREDIT!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};

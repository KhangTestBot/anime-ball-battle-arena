import type { UltimateHandler } from './types';

export interface LinkUltimateData {
  arrowsDone: number;
  arrowCd: number;
  spinFired: boolean;
  flash: number;
}

export const linkUltimateHandler: UltimateHandler = {
  characterId: 'link',
  title: 'TRIFORCE OF COURAGE: ANCIENT ARROW & SPIN!',
  subtitle:
    'Raises Hylian Shield (Shield + Auto-Dodge), fires 3 Ancient Arrow volleys, and unleashes a golden Master Sword Hurricane Spin!',
  bannerColor: '#22c55e',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.4);
    owner.shieldColor = '#eab308';
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.6);
    owner.dmgBonusPct += 18;

    const data: LinkUltimateData = {
      arrowsDone: 0,
      arrowCd: 0.3,
      spinFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'TRIFORCE OF COURAGE!',
      '#eab308',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LinkUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.spinFired && data.arrowsDone < 3) {
      data.arrowCd -= dt;
      if (data.arrowCd <= 0) {
        data.arrowCd = 0.44;
        data.arrowsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.16, 0, 0.16]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('link_ancient'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 720,
            vy: Math.sin(a) * 720,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 8.0),
            knockback: 210,
            color: '#38bdf8',
            secondaryColor: '#eab308',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.spinFired && state.elapsed >= 2.0) {
      data.spinFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
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
        310,
        '#22c55e',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'TRIFORCE HURRICANE SPIN!!',
        '#eab308',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'slash', intensity: 1.4 });
    }
  },
};

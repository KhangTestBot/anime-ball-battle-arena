import type { UltimateHandler } from './types';

export interface RinTohsakaUltimateData {
  gemsDone: number;
  gemCd: number;
  zelretchFired: boolean;
  flash: number;
}

export const rinTohsakaUltimateHandler: UltimateHandler = {
  characterId: 'rin_tohsaka',
  title: 'JEWEL MAGECRAFT: ZELRETCH SWORD!',
  subtitle:
    'Raises a Prismatic Jewel Barrier (Shield), fires 3 Gandr & Elemental Gem volleys, and unleashes Jeweled Sword of Zelretch!',
  bannerColor: '#ef4444',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.0);
    owner.dmgBonusPct += 18;

    const data: RinTohsakaUltimateData = {
      gemsDone: 0,
      gemCd: 0.28,
      zelretchFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'JEWEL MAGECRAFT: FULL RELEASE!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RinTohsakaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.zelretchFired && data.gemsDone < 3) {
      data.gemCd -= dt;
      if (data.gemCd <= 0) {
        data.gemCd = 0.44;
        data.gemsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.24, -0.08, 0.08, 0.24]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('rin_gem'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 730,
            vy: Math.sin(a) * 730,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.0),
            knockback: 195,
            color: '#ef4444',
            secondaryColor: '#38bdf8',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.zelretchFired && state.elapsed >= 2.0) {
      data.zelretchFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#38bdf8',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'JEWELED SWORD OF ZELRETCH!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};

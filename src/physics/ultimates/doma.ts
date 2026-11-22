import type { UltimateHandler } from './types';

export interface DomaUltimateData {
  lotusVolleys: number;
  lotusCd: number;
  bodhisattvaFired: boolean;
  flash: number;
}

export const domaUltimateHandler: UltimateHandler = {
  characterId: 'doma',
  title: 'CRYOKINESIS: RIME WATER LILY BODHISATTVA!',
  subtitle:
    'Summons the colossal Ice Bodhisattva (Frost + Anti-Heal), fires 4 volleys of Freezing Lotus Shards, and flash-freezes the entire arena!',
  bannerColor: '#38bdf8',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.4);
    owner.shieldColor = '#38bdf8';
    for (const e of ctx.getEnemies(owner)) {
      e.frostTimer = Math.max(e.frostTimer, 4.0);
      e.antiHealTimer = Math.max(e.antiHealTimer, 4.0);
    }

    const data: DomaUltimateData = {
      lotusVolleys: 0,
      lotusCd: 0.28,
      bodhisattvaFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'RIME WATER LILY BODHISATTVA!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DomaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.bodhisattvaFired && data.lotusVolleys < 4) {
      data.lotusCd -= dt;
      if (data.lotusCd <= 0) {
        data.lotusCd = 0.36;
        data.lotusVolleys += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('doma_ice'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 670,
            vy: Math.sin(a) * 670,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 205,
            color: '#38bdf8',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.bodhisattvaFired && state.elapsed >= 2.05) {
      data.bodhisattvaFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.3);
        e.stunKind = 'frozen';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 600,
          Math.sin(ang) * 600,
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
        owner.y - owner.radius - 28,
        'CRYSTALLINE DIVINE CHILD!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(19);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};

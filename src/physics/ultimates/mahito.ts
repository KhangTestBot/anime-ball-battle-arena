import type { UltimateHandler } from './types';

export interface MahitoUltimateData {
  humanoidIds: string[];
  transfigureCd: number;
  perfectionEvolved: boolean;
  palmFlash: number;
}

export const mahitoUltimateHandler: UltimateHandler = {
  characterId: 'mahito',
  title: 'SELF-EMBODIMENT OF PERFECTION',
  subtitle:
    'Deploys the Thousand-Hand Domain summoning 2 AI Transfigured Humans → Idle Transfiguration tears at souls (Shield Pierce + Anti-Heal + Armor Shred + Karma drain)!',
  bannerColor: '#60a5fa',
  castDuration: 0.25,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    const { left, right, top, bottom } = ctx.bounds;

    const humanoidIds: string[] = [];
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI;
      const cid = ctx.nextId('transfigured_soul');
      humanoidIds.push(cid);
      ctx.minions.push({
        id: cid,
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        skillMotif: 'curse',
        teamId: owner.teamId,
        kind: 'shadow',
        x: Math.max(left + 26, Math.min(right - 26, owner.x + Math.cos(a) * 52)),
        y: Math.max(top + 26, Math.min(bottom - 26, owner.y + Math.sin(a) * 52)),
        vx: Math.cos(a) * 280,
        vy: Math.sin(a) * 280,
        radius: 14,
        hp: 42,
        maxHp: 42,
        damage: ctx.getEffectiveDamage(owner, 4.4),
        life: 3.2,
        maxLife: 3.2,
        color: '#60a5fa',
        accentColor: '#a855f7',
        hitCooldowns: {},
      });
    }

    const data: MahitoUltimateData = {
      humanoidIds,
      transfigureCd: 0.45,
      perfectionEvolved: false,
      palmFlash: 0.75,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      215,
      '#60a5fa',
      6.5,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      'SELF-EMBODIMENT OF PERFECTION!',
      '#c4b5fd',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MahitoUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.palmFlash > 0) data.palmFlash = Math.max(0, data.palmFlash - dt);

    // Periodic Idle Transfiguration soul touches tearing healing & armor
    if (state.elapsed < 2.2) {
      data.transfigureCd -= dt;
      if (data.transfigureCd <= 0) {
        data.transfigureCd = 0.65;
        for (const e of enemies) {
          if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 235 + e.radius) {
            e.antiHealTimer = Math.max(e.antiHealTimer, 3.2);
            e.armorShredTimer = Math.max(e.armorShredTimer, 3.0);
            e.karmaTimer = Math.max(e.karmaTimer, 2.8);
            e.karmaDps = Math.max(e.karmaDps, 8);
            e.karmaOwnerUid = owner.uid;
            e.karmaKind = 'kr';
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.4), 0, 0, {
              bypassInvuln: true,
              sourceKind: 'ability',
            });
            ctx.spawnFloatingText(e.x, e.y - e.radius - 12, 'SOUL TWIST!', '#a855f7', 'callout');
          }
        }
      }
      return;
    }

    // Climax (2.2s): Instant Spirit Body of Distorted Killing Soul Shatter!
    if (!data.perfectionEvolved && state.elapsed >= 2.2) {
      data.perfectionEvolved = true;
      data.palmFlash = 1.15;

      for (const e of enemies) {
        if (Math.hypot(e.x - owner.x, e.y - owner.y) <= 255 + e.radius) {
          e.shieldTimer = 0;
          e.antiHealTimer = Math.max(e.antiHealTimer, 3.4);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 14.0), 0, 0, {
            bypassInvuln: true,
            isCrit: true,
            sourceKind: 'ability',
          });
        }
      }

      ctx.spawnShockwave(
        owner.x,
        owner.y,
        260,
        '#a855f7',
        8.5,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        'IDLE TRANSFIGURATION!!',
        '#ddd6fe',
        'powerup',
      );
      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};

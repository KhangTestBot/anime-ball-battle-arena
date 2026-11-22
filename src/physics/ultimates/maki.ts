import type { UltimateHandler } from './types';

export interface MakiUltimateData {
  whipAngle: number;
  strikesLeft: number;
  strikeCd: number;
  soulSlashFlash: number;
  slashX1: number;
  slashY1: number;
  slashX2: number;
  slashY2: number;
}

export const makiUltimateHandler: UltimateHandler = {
  characterId: 'maki',
  title: 'SPLIT SOUL KATANA & PLAYFUL CLOUD RAMPAGE',
  subtitle:
    'Peak Heavenly Restriction (60% Dodge + Haste) · Swings 3-section Playful Cloud smashing obstacles → Cleaves with Split Soul Katana PIERCING INVULNERABILITY & blocking soul healing!',
  bannerColor: '#16a34a',
  castDuration: 0.22,
  duration: 3.6,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 1.6);
    owner.getExcitedTimer = Math.max(owner.getExcitedTimer, 3.5);
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);

    const data: MakiUltimateData = {
      whipAngle: owner.facingAngle,
      strikesLeft: 2,
      strikeCd: 0.35,
      soulSlashFlash: 0,
      slashX1: owner.x,
      slashY1: owner.y,
      slashX2: owner.x,
      slashY2: owner.y,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#16a34a', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#22c55e',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'PLAYFUL CLOUD & SPLIT SOUL!',
      '#4ade80',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#16a34a', 85, 280, 3, 6, 'shard');
    ctx.addScreenShake(10);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MakiUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    data.whipAngle += dt * 13;

    if (data.soulSlashFlash > 0) data.soulSlashFlash = Math.max(0, data.soulSlashFlash - dt);

    if (data.strikesLeft > 0) {
      data.strikeCd -= dt;
      if (data.strikeCd <= 0) {
        data.strikeCd = 1.05;
        data.strikesLeft--;
        const isSoulCut = data.strikesLeft === 0;
        const target = ctx.getNearestEnemy(owner);

        // Shatter obstacles via Playful Cloud / Split Soul impact!
        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          if (Math.hypot(ctx.obstacles[i].x - owner.x, ctx.obstacles[i].y - owner.y) <= 200) {
            ctx.obstacles.splice(i, 1);
          }
        }

        if (target) {
          const dx = target.x - owner.x;
          const dy = target.y - owner.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          const ux = dx / d;
          const uy = dy / d;
          data.slashX1 = owner.x;
          data.slashY1 = owner.y;
          owner.x = Math.max(
            left + owner.radius + 8,
            Math.min(right - owner.radius - 8, target.x + ux * 28),
          );
          owner.y = Math.max(
            top + owner.radius + 8,
            Math.min(bottom - owner.radius - 8, target.y + uy * 28),
          );
          data.slashX2 = owner.x;
          data.slashY2 = owner.y;

          if (isSoulCut) {
            data.soulSlashFlash = 0.9;
            target.shieldTimer = 0;
            target.antiHealTimer = Math.max(target.antiHealTimer, 2.8);
          }
          ctx.applyDamage(
            owner,
            target,
            ctx.getEffectiveDamage(owner, isSoulCut ? 15.5 : 8.5),
            ux * 420,
            uy * 420,
            { isCrit: true, bypassInvuln: isSoulCut, sourceKind: 'ability' },
          );
          ctx.spawnFloatingText(
            target.x,
            target.y - target.radius - 16,
            isSoulCut ? 'SPLIT SOUL CUT!!' : 'PLAYFUL CLOUD SMASH!',
            '#86efac',
            'crit',
          );
          ctx.addScreenShake(isSoulCut ? 18 : 11);
          ctx.emitSfx({ type: 'slash', intensity: isSoulCut ? 1.4 : 1.15 });
        }
      }
    }
  },
};

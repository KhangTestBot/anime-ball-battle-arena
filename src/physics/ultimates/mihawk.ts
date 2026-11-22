import type { UltimateHandler } from './types';

export interface MihawkUltimateData {
  stage: 'hawk-focus' | 'yoru-slash';
  aimAngle: number;
  slashed: boolean;
  slashX1: number;
  slashY1: number;
  slashX2: number;
  slashY2: number;
  slashFlash: number;
}

export const mihawkUltimateHandler: UltimateHandler = {
  characterId: 'mihawk',
  title: 'BLACK BLADE YORU: WORLD’S STRONGEST SLASH',
  subtitle:
    'Hawk Eyes lock onto targets (Dodge Lock) & deflect all incoming projectiles → Unleashes an emerald Yoru slash bisecting the arena, splitting obstacles, shields & armor!',
  bannerColor: '#10b981',
  castDuration: 0.24,
  duration: 3.4,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.2);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    for (const e of ctx.getEnemies(owner)) {
      e.dodgeLockedTimer = Math.max(e.dodgeLockedTimer, 2.5);
    }

    const data: MihawkUltimateData = {
      stage: 'hawk-focus',
      aimAngle: ang,
      slashed: false,
      slashX1: owner.x,
      slashY1: owner.y,
      slashX2: owner.x + Math.cos(ang) * 900,
      slashY2: owner.y + Math.sin(ang) * 900,
      slashFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#10b981', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      175,
      '#34d399',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'HAWK EYE: DUEL LOCKED!',
      '#6ee7b7',
      'powerup',
    );
    ctx.addScreenShake(8);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'slash', intensity: 1.1 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MihawkUltimateData;
    const enemies = ctx.getEnemies(owner);

    if (data.slashFlash > 0) data.slashFlash = Math.max(0, data.slashFlash - dt);

    if (data.stage === 'hawk-focus') {
      const target = ctx.getNearestEnemy(owner);
      if (target) {
        data.aimAngle = Math.atan2(target.y - owner.y, target.x - owner.x);
      }

      // Precision Yoru parry cleans projectiles approaching Mihawk during stance
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (
          p.ownerUid !== owner.uid &&
          Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 55
        ) {
          ctx.spawnParticles(p.x, p.y, 6, '#34d399', 45, 130, 2.5, 4.5, 'shard');
          ctx.projectiles.splice(i, 1);
        }
      }

      // Climax (1.2s): COLOSSAL YORU EMERALD SLASH CUTTING THE ENTIRE ARENA!!
      if (!data.slashed && state.elapsed >= 1.2) {
        data.slashed = true;
        data.stage = 'yoru-slash';
        data.slashFlash = 1.3;

        const lx = Math.cos(data.aimAngle);
        const ly = Math.sin(data.aimAngle);
        data.slashX1 = owner.x - lx * 120;
        data.slashY1 = owner.y - ly * 120;
        data.slashX2 = owner.x + lx * 950;
        data.slashY2 = owner.y + ly * 950;

        // Bisect ALL obstacles & enemy projectiles along Yoru's green wave trench!
        for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
          const obs = ctx.obstacles[i];
          const px = obs.x - owner.x;
          const py = obs.y - owner.y;
          const proj = px * lx + py * ly;
          const perp = Math.abs(px * ly - py * lx);
          if (proj >= -40 && perp <= 62) {
            ctx.obstacles.splice(i, 1);
          }
        }
        for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
          const p = ctx.projectiles[i];
          if (p.ownerUid === owner.uid) continue;
          const px = p.x - owner.x;
          const py = p.y - owner.y;
          const proj = px * lx + py * ly;
          const perp = Math.abs(px * ly - py * lx);
          if (proj >= -40 && perp <= 62) {
            ctx.projectiles.splice(i, 1);
          }
        }

        for (const e of enemies) {
          const px = e.x - owner.x;
          const py = e.y - owner.y;
          const proj = px * lx + py * ly;
          const perp = Math.abs(px * ly - py * lx);
          if (proj >= -e.radius - 30 && perp <= e.radius + 64) {
            e.shieldTimer = 0;
            e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 19.5), lx * 480, ly * 480, {
              bypassInvuln: true,
              isCrit: true,
              sourceKind: 'ability',
            });
            ctx.spawnFloatingText(e.x, e.y - e.radius - 16, 'YORU CLEAVE!!', '#6ee7b7', 'crit');
          }
        }

        ctx.addHitstop(0.085);
        ctx.addScreenShake(22);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          240,
          '#10b981',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnFloatingText(
          owner.x,
          owner.y - owner.radius - 22,
          'BLACK BLADE YORU!!',
          '#a7f3d0',
          'powerup',
        );
        ctx.emitSfx({ type: 'slash', intensity: 1.5 });
      }
    }
  },
};

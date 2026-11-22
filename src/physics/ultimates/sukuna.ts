import type { UltimateHandler } from './types';

export interface ShrineFloorScar {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface FugaFlameArrow {
  active: boolean;
  fired: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
  chargeTimer: number;
  blastTimer: number;
}

export interface SukunaUltimateData {
  slashCd: number;
  slashesDone: number;
  scars: ShrineFloorScar[];
  fuga: FugaFlameArrow;
}

export const sukunaUltimateHandler: UltimateHandler = {
  characterId: 'sukuna',
  title: 'MALEVOLENT SHRINE · FUGA (OPEN)',
  subtitle:
    'Crimson Torii Shrine unleashes a Cleave & Dismantle storm scarring the floor → Draws the Flame Arrow FUGA incinerating the entire arena!',
  bannerColor: '#ff1f5a',
  castDuration: 0.25,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const data: SukunaUltimateData = {
      slashCd: 0.14,
      slashesDone: 0,
      scars: [],
      fuga: {
        active: false,
        fired: false,
        x1: owner.x,
        y1: owner.y,
        x2: owner.x + 600,
        y2: owner.y,
        angle: owner.facingAngle,
        chargeTimer: 0.52,
        blastTimer: 0,
      },
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ff1f5a', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      280,
      '#dc2626',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      (ctx.bounds.left + ctx.bounds.right) / 2,
      ctx.bounds.top + 64,
      'MALEVOLENT SHRINE!',
      '#ff1f5a',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.addHitstop(0.055);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SukunaUltimateData;
    const enemies = ctx.getEnemies(owner);

    // 1. Relentless Cleave & Dismantle cuts carving persistent red floor scars!
    if (data.slashesDone < 14 && state.elapsed < 3.05) {
      data.slashCd -= dt;
      if (data.slashCd <= 0 && enemies.length > 0) {
        data.slashCd = 0.2;
        data.slashesDone += 1;
        for (const e of enemies) {
          const ang = Math.random() * Math.PI;
          const half = 78;
          const x1 = e.x - Math.cos(ang) * half;
          const y1 = e.y - Math.sin(ang) * half;
          const x2 = e.x + Math.cos(ang) * half;
          const y2 = e.y + Math.sin(ang) * half;
          if (data.scars.length < 24) data.scars.push({ x1, y1, x2, y2 });

          ctx.slashes.push({
            id: ctx.nextId('shrine_cut'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            x1,
            y1,
            x2,
            y2,
            color: '#dc2626',
            secondaryColor: '#09090b',
            coreColor: '#ffffff',
            width: 6,
            telegraphTimer: 0.04,
            activeTimer: 0.08,
            fadeTimer: 0.22,
            maxFade: 0.22,
            damage: ctx.getEffectiveDamage(owner, 2.5),
            hasStruck: false,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 0.9 });
      }
    }

    // 2. Divine Flame Climax: FUGA ("■ Open") at ~3.05s!
    if (!data.fuga.active && state.elapsed >= 3.05) {
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.fuga.active = true;
      data.fuga.angle = ang;
      data.fuga.x1 = owner.x;
      data.fuga.y1 = owner.y;
      data.fuga.x2 = owner.x + Math.cos(ang) * 720;
      data.fuga.y2 = owner.y + Math.sin(ang) * 720;
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 18,
        '■ FUGA (OPEN)!',
        '#f97316',
        'powerup',
      );
      ctx.emitSfx({ type: 'beam-charge' });
    } else if (data.fuga.active && !data.fuga.fired) {
      data.fuga.chargeTimer -= dt;
      // Track target softly during initial bow draw (first ~0.32s), locking final lane for 0.2s telegraph!
      if (data.fuga.chargeTimer > 0.2) {
        const nearest = ctx.getNearestEnemy(owner);
        if (nearest) {
          data.fuga.angle = Math.atan2(nearest.y - owner.y, nearest.x - owner.x);
        }
      }
      data.fuga.x1 = owner.x;
      data.fuga.y1 = owner.y;
      data.fuga.x2 = owner.x + Math.cos(data.fuga.angle) * 720;
      data.fuga.y2 = owner.y + Math.sin(data.fuga.angle) * 720;

      if (data.fuga.chargeTimer <= 0) {
        data.fuga.fired = true;
        data.fuga.blastTimer = 0.85;
        ctx.addHitstop(0.075);
        ctx.addScreenShake(18);
        ctx.spawnShockwave(
          owner.x,
          owner.y,
          260,
          '#f97316',
          8,
          owner.character.id,
          owner.character.series,
        );
        ctx.emitSfx({ type: 'ko', intensity: 1.35 });

        const dxL = Math.cos(data.fuga.angle);
        const dyL = Math.sin(data.fuga.angle);
        for (const e of enemies) {
          const rx = e.x - data.fuga.x1;
          const ry = e.y - data.fuga.y1;
          const along = rx * dxL + ry * dyL;
          const perp = Math.abs(-rx * dyL + ry * dxL);
          if (along >= -e.radius && perp <= e.radius + 78) {
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 15.5), dxL * 540, dyL * 540, {
              isCrit: true,
              sourceKind: 'ability',
            });
            e.burnTimer = Math.max(e.burnTimer, 3.6);
            e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 2.8));
            e.burnOwnerUid = owner.uid;
            ctx.spawnParticles(e.x, e.y, 20, '#f97316', 90, 320, 3, 6.5, 'circle');
          }
        }
      }
    } else if (data.fuga.fired && data.fuga.blastTimer > 0) {
      data.fuga.blastTimer = Math.max(0, data.fuga.blastTimer - dt);
    }
  },
};

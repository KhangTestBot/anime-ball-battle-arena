import type { UltimateHandler } from './types';

export interface GetoUltimateData {
  stage: 'curse-swarm' | 'uzumaki-beam' | 'done';
  curseIds: string[];
  condensedCount: number;
  beamTimer: number;
  beamAngle: number;
  beamX1: number;
  beamY1: number;
  beamX2: number;
  beamY2: number;
  spiralRot: number;
}

export const getoUltimateHandler: UltimateHandler = {
  characterId: 'geto',
  title: 'MAXIMUM: UZUMAKI',
  subtitle:
    'Summons 4 AI Cursed Spirits to surround the arena → Condenses all Cursed Spirits into a colossal Uzumaki spiral firing a dense cursed-energy blast!',
  bannerColor: '#7e22ce',
  castDuration: 0.25,
  duration: 4.2,

  onCast(ctx, owner, state) {
    const curseIds: string[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI * 2) / 4;
      const cid = ctx.nextId('geto_curse');
      curseIds.push(cid);
      ctx.minions.push({
        id: cid,
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        skillMotif: 'curse',
        teamId: owner.teamId,
        kind: 'shadow',
        x: Math.max(
          ctx.bounds.left + 26,
          Math.min(ctx.bounds.right - 26, owner.x + Math.cos(a) * 42),
        ),
        y: Math.max(
          ctx.bounds.top + 26,
          Math.min(ctx.bounds.bottom - 26, owner.y + Math.sin(a) * 42),
        ),
        vx: Math.cos(a) * 280,
        vy: Math.sin(a) * 280,
        radius: 15,
        hp: 45,
        maxHp: 45,
        damage: ctx.getEffectiveDamage(owner, 3.8),
        life: 2.3,
        maxLife: 2.3,
        color: '#581c87',
        accentColor: '#c084fc',
        hitCooldowns: {},
      });
    }

    const data: GetoUltimateData = {
      stage: 'curse-swarm',
      curseIds,
      condensedCount: 0,
      beamTimer: 0,
      beamAngle: owner.facingAngle,
      beamX1: owner.x,
      beamY1: owner.y,
      beamX2: owner.x + 600,
      beamY2: owner.y,
      spiralRot: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#7e22ce', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      190,
      '#9333ea',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'CURSE SPIRIT MANIPULATION!',
      '#d8b4fe',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#6b21a8', 75, 240, 3, 6, 'circle');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GetoUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.spiralRot += dt * 7;

    if (data.stage === 'curse-swarm' && state.elapsed >= 2.1) {
      // Condense all surviving summoned curses into MAXIMUM: UZUMAKI spiral cannon!
      data.stage = 'uzumaki-beam';
      let condensed = 1;
      for (let i = ctx.minions.length - 1; i >= 0; i--) {
        if (ctx.minions[i].ownerUid === owner.uid) {
          condensed++;
          ctx.spawnParticles(
            ctx.minions[i].x,
            ctx.minions[i].y,
            8,
            '#a855f7',
            50,
            170,
            2.5,
            5,
            'circle',
          );
          ctx.minions.splice(i, 1);
        }
      }
      data.condensedCount = condensed;
      data.beamTimer = 1.05;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      data.beamAngle = ang;
      data.beamX1 = owner.x;
      data.beamY1 = owner.y;
      data.beamX2 = owner.x + Math.cos(ang) * 740;
      data.beamY2 = owner.y + Math.sin(ang) * 740;

      ctx.addHitstop(0.08);
      ctx.addScreenShake(20);
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        240,
        '#7e22ce',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 22,
        `MAXIMUM: UZUMAKI x${condensed}!!`,
        '#e9d5ff',
        'powerup',
      );
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.4 });

      const dxL = Math.cos(ang);
      const dyL = Math.sin(ang);
      const mult = 1 + Math.min(1.0, (condensed - 1) * 0.22);
      for (const e of enemies) {
        const rx = e.x - data.beamX1;
        const ry = e.y - data.beamY1;
        const along = rx * dxL + ry * dyL;
        const perp = Math.abs(-rx * dyL + ry * dxL);
        if (along >= -e.radius && perp <= e.radius + 54) {
          ctx.applyDamage(
            owner,
            e,
            ctx.getEffectiveDamage(owner, 13.5 * mult),
            dxL * 540,
            dyL * 540,
            {
              isCrit: true,
              sourceKind: 'ability',
            },
          );
          ctx.spawnParticles(e.x, e.y, 20, '#9333ea', 90, 320, 3, 6.5, 'star');
        }
      }
      return;
    }

    if (data.stage === 'uzumaki-beam') {
      if (data.beamTimer > 0) data.beamTimer = Math.max(0, data.beamTimer - dt);
      else data.stage = 'done';
    }
  },
};

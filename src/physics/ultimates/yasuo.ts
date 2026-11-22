import type { UltimateHandler } from './types';

export interface YasuoWindWall {
  x: number;
  y: number;
  angle: number;
  halfLen: number;
  life: number;
  maxLife: number;
}

export interface YasuoAirSlash {
  x: number;
  y: number;
  angle: number;
  life: number;
}

export interface YasuoUltimateData {
  stage: 'tornado' | 'airborne-combo' | 'finished';
  tornadoX: number;
  tornadoY: number;
  tornadoVx: number;
  tornadoVy: number;
  tornadoAngle: number;
  tornadoRadius: number;
  tornadoLife: number;
  caughtUids: string[];
  comboTimer: number;
  slashesDone: number;
  slashVisuals: YasuoAirSlash[];
  windWall: YasuoWindWall;
}

export const yasuoUltimateHandler: UltimateHandler = {
  characterId: 'yasuo',
  title: 'SORYE GE TON — LAST BREATH',
  subtitle:
    'Q3 Tornado Knockup → Blinks for 3 mid-air slashes → Shreds 50% Armor + Wind Wall blocks projectiles!',
  bannerColor: '#38bdf8',
  castDuration: 0.25,
  duration: 4.5,

  onCast(ctx, owner, state) {
    const target = ctx.getNearestEnemy(owner);
    const angle = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
    owner.facingAngle = angle;

    // Erect a wide Ionian Wind Wall slightly in front of Yasuo (blocks enemy projectiles for 3.8s!)
    const wallDist = owner.radius + 36;
    const wx = Math.max(
      ctx.bounds.left + 40,
      Math.min(ctx.bounds.right - 40, owner.x + Math.cos(angle) * wallDist),
    );
    const wy = Math.max(
      ctx.bounds.top + 40,
      Math.min(ctx.bounds.bottom - 40, owner.y + Math.sin(angle) * wallDist),
    );

    const data: YasuoUltimateData = {
      stage: 'tornado',
      tornadoX: owner.x + Math.cos(angle) * (owner.radius + 14),
      tornadoY: owner.y + Math.sin(angle) * (owner.radius + 14),
      tornadoVx: Math.cos(angle) * 520,
      tornadoVy: Math.sin(angle) * 520,
      tornadoAngle: angle,
      tornadoRadius: 34,
      tornadoLife: 1.15,
      caughtUids: [],
      comboTimer: 0,
      slashesDone: 0,
      slashVisuals: [],
      windWall: {
        x: wx,
        y: wy,
        angle: angle + Math.PI / 2,
        halfLen: 72,
        life: 3.8,
        maxLife: 3.8,
      },
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, angle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'HASAGI! Q3 TORNADO!',
      '#38bdf8',
      'callout',
    );
    ctx.spawnParticles(owner.x, owner.y, 18, '#bae6fd', 70, 240, 2.5, 5.5, 'petal');
    ctx.addScreenShake(7);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'slash', intensity: 1.1 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as YasuoUltimateData;
    const enemies = ctx.getEnemies(owner);

    // Decay slash visuals
    for (let i = data.slashVisuals.length - 1; i >= 0; i--) {
      data.slashVisuals[i].life -= dt;
      if (data.slashVisuals[i].life <= 0) data.slashVisuals.splice(i, 1);
    }

    // 1. Ionian Wind Wall actively intercepts & vaporizes ALL enemy projectiles touching its line!
    if (data.windWall.life > 0) {
      data.windWall.life = Math.max(0, data.windWall.life - dt);
      const ww = data.windWall;
      const dxW = Math.cos(ww.angle);
      const dyW = Math.sin(ww.angle);
      for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
        const p = ctx.projectiles[i];
        if (p.ownerUid === owner.uid) continue;
        if (owner.teamId !== null && p.teamId === owner.teamId) continue;
        const rx = p.x - ww.x;
        const ry = p.y - ww.y;
        const along = rx * dxW + ry * dyW;
        const perp = Math.abs(-rx * dyW + ry * dxW);
        if (Math.abs(along) <= ww.halfLen + p.radius && perp <= 16 + p.radius) {
          ctx.spawnParticles(p.x, p.y, 8, '#7dd3fc', 50, 170, 2, 4.5, 'petal');
          ctx.projectiles.splice(i, 1);
        }
      }
    }

    // 2. Stage 1: Expanding Q3 Tornado skillshot!
    if (data.stage === 'tornado') {
      data.tornadoLife -= dt;
      data.tornadoX += data.tornadoVx * dt;
      data.tornadoY += data.tornadoVy * dt;
      data.tornadoRadius = Math.min(58, data.tornadoRadius + dt * 26);

      // Check enemies knocked up by Q3 tornado
      for (const e of enemies) {
        if (e.unstoppableTimer > 0) continue;
        if (Math.hypot(e.x - data.tornadoX, e.y - data.tornadoY) <= data.tornadoRadius + e.radius) {
          if (!data.caughtUids.includes(e.uid)) {
            data.caughtUids.push(e.uid);
            e.airborneTimer = 1.35;
            ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 6), 0, 0, {
              sourceKind: 'ability',
            });
          }
        }
      }

      if (data.caughtUids.length > 0) {
        // Trigger LAST BREATH (R) immediately on airborne targets!
        data.stage = 'airborne-combo';
        data.comboTimer = 0.22;
        data.slashesDone = 0;
        const primary = enemies.find((e) => e.uid === data.caughtUids[0]);
        if (primary) {
          owner.x = Math.max(
            ctx.bounds.left + owner.radius + 8,
            Math.min(ctx.bounds.right - owner.radius - 8, primary.x - 24),
          );
          owner.y = Math.max(
            ctx.bounds.top + owner.radius + 8,
            Math.min(ctx.bounds.bottom - owner.radius - 8, primary.y - 16),
          );
          owner.airborneTimer = 1.25;
          owner.invulnTimer = Math.max(owner.invulnTimer, 0.9);
          ctx.spawnFloatingText(
            primary.x,
            primary.y - primary.radius - 26,
            'SORYE GE TON!!',
            '#38bdf8',
            'powerup',
          );
          ctx.addScreenShake(10);
          ctx.addHitstop(0.05);
        }
      } else if (
        data.tornadoLife <= 0 ||
        data.tornadoX < ctx.bounds.left - 20 ||
        data.tornadoX > ctx.bounds.right + 20 ||
        data.tornadoY < ctx.bounds.top - 20 ||
        data.tornadoY > ctx.bounds.bottom + 20
      ) {
        // Missed tornado -> Yasuo only keeps Wind Wall (fair counterplay!)
        data.stage = 'finished';
      }
      return;
    }

    // 3. Stage 2: 3 rapid mid-air spinning slashes + ground slam + 50% Armor Shred!
    if (data.stage === 'airborne-combo') {
      data.comboTimer -= dt;
      if (data.comboTimer <= 0) {
        data.slashesDone += 1;
        const isSlam = data.slashesDone >= 3;
        const targets = enemies.filter((e) => data.caughtUids.includes(e.uid));

        for (const t of targets) {
          const ang = data.slashesDone * 1.15 + Math.random() * 0.4;
          data.slashVisuals.push({ x: t.x, y: t.y, angle: ang, life: 0.45 });
          ctx.spawnParticles(t.x, t.y, isSlam ? 22 : 10, '#7dd3fc', 90, 290, 2.5, 5.5, 'petal');

          const raw = isSlam ? 14.5 : 6.5;
          ctx.applyDamage(
            owner,
            t,
            ctx.getEffectiveDamage(owner, raw),
            isSlam ? Math.cos(ang) * 380 : 0,
            isSlam ? Math.sin(ang) * 380 : 0,
            { isCrit: isSlam, sourceKind: 'ability' },
          );

          if (isSlam) {
            t.airborneTimer = 0;
            t.armorShredTimer = Math.max(t.armorShredTimer, 5.0);
            ctx.spawnShockwave(
              t.x,
              t.y,
              165,
              '#38bdf8',
              6,
              owner.character.id,
              owner.character.series,
            );
            ctx.spawnFloatingText(t.x, t.y - t.radius - 16, 'ARMOR -50%!', '#fb923c', 'callout');
          }
        }

        // Yasuo zips around the primary target
        if (targets[0]) {
          const orbit = data.slashesDone * 2.1;
          owner.x = Math.max(
            ctx.bounds.left + owner.radius + 8,
            Math.min(ctx.bounds.right - owner.radius - 8, targets[0].x + Math.cos(orbit) * 34),
          );
          owner.y = Math.max(
            ctx.bounds.top + owner.radius + 8,
            Math.min(ctx.bounds.bottom - owner.radius - 8, targets[0].y + Math.sin(orbit) * 34),
          );
        }

        ctx.addScreenShake(isSlam ? 13 : 6);
        ctx.emitSfx({ type: isSlam ? 'crit' : 'slash', intensity: 1.2 });

        if (isSlam) {
          owner.airborneTimer = 0;
          data.stage = 'finished';
        } else {
          data.comboTimer = 0.28;
        }
      }
    }
  },
};

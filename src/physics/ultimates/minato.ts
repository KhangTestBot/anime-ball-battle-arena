import type { UltimateHandler } from './types';

export interface RaijinKunai {
  id: string;
  x: number;
  y: number;
  sealedUid: string | null;
}

export interface FlashWarpLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}

export interface MinatoUltimateData {
  kunais: RaijinKunai[];
  warpsLeft: number;
  warpCd: number;
  markedUids: Record<string, number>;
  warpLines: FlashWarpLine[];
}

export const minatoUltimateHandler: UltimateHandler = {
  characterId: 'minato',
  title: 'FLYING RAIJIN: LEVEL 2 FLASH SWAP',
  subtitle:
    'Plants 6 Flying Raijin Kunai · 5 instant 0ms teleports with Giant Rasengan · Marks foes with Flying Raijin seals for remote follow-ups!',
  bannerColor: '#facc15',
  castDuration: 0.22,
  duration: 4.1,

  onCast(ctx, owner, state) {
    const { left, right, top, bottom } = ctx.bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const enemies = ctx.getEnemies(owner);
    const kunais: RaijinKunai[] = [];

    // 1. Throw 6 3-Pronged Flying Raijin Kunai around the arena & near enemies!
    for (let i = 0; i < 6; i++) {
      const target = i < enemies.length ? enemies[i] : null;
      const ang = (i * Math.PI * 2) / 6;
      const kx = target
        ? Math.max(left + 32, Math.min(right - 32, target.x + Math.cos(ang) * 44))
        : Math.max(left + 40, Math.min(right - 40, cx + Math.cos(ang) * 165));
      const ky = target
        ? Math.max(top + 32, Math.min(bottom - 32, target.y + Math.sin(ang) * 44))
        : Math.max(top + 40, Math.min(bottom - 40, cy + Math.sin(ang) * 165));
      kunais.push({ id: ctx.nextId('rkunai'), x: kx, y: ky, sealedUid: null });
    }

    const data: MinatoUltimateData = {
      kunais,
      warpsLeft: 5,
      warpCd: 0.25,
      markedUids: {},
      warpLines: [],
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 18,
      'YELLOW FLASH · HIRAISHIN!',
      '#facc15',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#facc15', 90, 280, 3, 6, 'star');
    ctx.addScreenShake(7);
    ctx.addHitstop(0.045);
    ctx.emitSfx({ type: 'dodge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MinatoUltimateData;
    const { left, right, top, bottom } = ctx.bounds;
    const enemies = ctx.getEnemies(owner);

    for (let i = data.warpLines.length - 1; i >= 0; i--) {
      data.warpLines[i].life -= dt;
      if (data.warpLines[i].life <= 0) data.warpLines.splice(i, 1);
    }

    for (const uid of Object.keys(data.markedUids)) {
      data.markedUids[uid] -= dt;
      if (data.markedUids[uid] <= 0) delete data.markedUids[uid];
    }

    // Any enemy brushing a planted Raijin Kunai receives a Permanent Hiraishin Formula Seal!
    for (const kunai of data.kunais) {
      for (const e of enemies) {
        if (Math.hypot(e.x - kunai.x, e.y - kunai.y) <= e.radius + 18) {
          if (!data.markedUids[e.uid]) {
            ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'RAIJIN MARKED!', '#facc15', 'callout');
          }
          data.markedUids[e.uid] = 3.5;
        }
      }
    }

    // 2. Execute 5 Instantaneous Yellow-Flash Teleports across Kunai or Marked Enemies!
    if (data.warpsLeft > 0) {
      data.warpCd -= dt;
      if (data.warpCd <= 0) {
        data.warpsLeft -= 1;
        data.warpCd = 0.56;

        const oldX = owner.x;
        const oldY = owner.y;
        owner.afterimages.push({
          x: oldX,
          y: oldY,
          alpha: 0.85,
          color: '#facc15',
          formIndex: owner.formIndex,
        });

        // Final warp prioritizes any Raijin-Marked target directly, otherwise pick nearest Kunai to enemy!
        const markedEnemy = enemies.find((e) => (data.markedUids[e.uid] ?? 0) > 0);
        let nextX = oldX;
        let nextY = oldY;
        if (markedEnemy && data.warpsLeft === 0) {
          nextX = Math.max(
            left + owner.radius + 10,
            Math.min(right - owner.radius - 10, markedEnemy.x - 24),
          );
          nextY = Math.max(
            top + owner.radius + 10,
            Math.min(bottom - owner.radius - 10, markedEnemy.y),
          );
        } else {
          const target = ctx.getNearestEnemy(owner);
          let bestKunai = data.kunais[data.warpsLeft % data.kunais.length];
          if (target) {
            let bestDist = Infinity;
            for (const k of data.kunais) {
              const d = Math.hypot(k.x - target.x, k.y - target.y);
              if (d < bestDist && Math.hypot(k.x - oldX, k.y - oldY) > 28) {
                bestDist = d;
                bestKunai = k;
              }
            }
          }
          nextX = Math.max(
            left + owner.radius + 10,
            Math.min(right - owner.radius - 10, bestKunai.x),
          );
          nextY = Math.max(
            top + owner.radius + 10,
            Math.min(bottom - owner.radius - 10, bestKunai.y),
          );
        }

        owner.x = nextX;
        owner.y = nextY;
        owner.invulnTimer = Math.max(owner.invulnTimer, 0.2);
        data.warpLines.push({ x1: oldX, y1: oldY, x2: nextX, y2: nextY, life: 0.55 });

        ctx.spawnShockwave(
          nextX,
          nextY,
          85,
          '#38bdf8',
          4.5,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(nextX, nextY, 14, '#facc15', 80, 260, 2.5, 5, 'star');
        ctx.emitSfx({ type: 'dodge' });

        // Instant Level-2 Rasengan Strike around arrival coordinates!
        for (const e of enemies) {
          if (Math.hypot(e.x - nextX, e.y - nextY) <= owner.radius + e.radius + 48) {
            data.markedUids[e.uid] = 3.5;
            const dx = e.x - nextX;
            const dy = e.y - nextY;
            const d = Math.max(1, Math.hypot(dx, dy));
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 6.2),
              (dx / d) * 320,
              (dy / d) * 320,
              { isCrit: data.warpsLeft === 0, sourceKind: 'ability' },
            );
            ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'RASENGAN!', '#38bdf8', 'callout');
            ctx.emitSfx({ type: 'hit', intensity: 1.1 });
          }
        }
      }
    }
  },
};

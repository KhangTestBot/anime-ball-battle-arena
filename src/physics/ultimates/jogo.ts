import type { UltimateHandler } from './types';

export interface JogoUltimateData {
  meteorX: number;
  meteorY: number;
  meteorProgress: number; // 0 -> 1 falling
  meteorImpacted: boolean;
  meteorObsId: string | null;
  burnTickCd: number;
}

export const jogoUltimateHandler: UltimateHandler = {
  characterId: 'jogo',
  title: 'COFFIN OF THE IRON MOUNTAIN · MAXIMUM: METEOR',
  subtitle:
    'Erupts a volcanic Domain scorching all enemies and melting bullets, then drops a colossal Maximum: Meteor crushing the arena!',
  bannerColor: '#ea580c',
  castDuration: 0.26,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.5);
    const target = ctx.getNearestEnemy(owner);
    const mx = target
      ? Math.max(ctx.bounds.left + 70, Math.min(ctx.bounds.right - 70, target.x))
      : (ctx.bounds.left + ctx.bounds.right) * 0.5;
    const my = target
      ? Math.max(ctx.bounds.top + 70, Math.min(ctx.bounds.bottom - 70, target.y))
      : (ctx.bounds.top + ctx.bounds.bottom) * 0.5;

    for (const e of ctx.getEnemies(owner)) {
      e.burnTimer = Math.max(e.burnTimer, 4.0);
      e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 4.2));
      e.burnOwnerUid = owner.uid;
    }

    const data: JogoUltimateData = {
      meteorX: mx,
      meteorY: my,
      meteorProgress: 0,
      meteorImpacted: false,
      meteorObsId: null,
      burnTickCd: 0.4,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, mx, my, 0, '#ea580c', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      240,
      '#f97316',
      7,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'MAXIMUM: METEOR!',
      '#fb923c',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state) {
    const data = state.data as unknown as JogoUltimateData;

    // 1. Volcanic Domain heat melts approaching enemy projectiles near Jogo!
    for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
      const p = ctx.projectiles[i];
      if (
        p.ownerUid !== owner.uid &&
        Math.hypot(p.x - owner.x, p.y - owner.y) <= owner.radius + 70
      ) {
        ctx.spawnParticles(p.x, p.y, 6, '#f97316', 40, 120, 2, 4.5, 'circle');
        ctx.projectiles.splice(i, 1);
      }
    }

    // 2. Colossal Maximum: Meteor descends over 1.75s -> Impact!
    if (!data.meteorImpacted) {
      data.meteorProgress = Math.min(1, state.elapsed / 1.75);
      if (data.meteorProgress >= 1) {
        data.meteorImpacted = true;

        // Spawn physical smoking volcanic meteor obstacle!
        const obsId = ctx.nextId('jogo_meteor');
        data.meteorObsId = obsId;
        ctx.obstacles.push({
          id: obsId,
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          teamId: owner.teamId,
          kind: 'stone-meteor',
          x: data.meteorX,
          y: data.meteorY,
          w: 72,
          h: 72,
          hp: 4,
          maxHp: 4,
          life: 2.3,
          maxLife: 2.3,
          blocksProjectiles: true,
          restitution: 1.2,
          color: '#44403c',
          secondaryColor: '#ea580c',
        });

        for (const e of ctx.getEnemies(owner)) {
          const d = Math.hypot(e.x - data.meteorX, e.y - data.meteorY);
          if (d <= 245 + e.radius) {
            e.shieldTimer = 0;
            e.burnTimer = Math.max(e.burnTimer, 4.0);
            e.burnDps = Math.max(e.burnDps, ctx.getEffectiveDamage(owner, 5.2));
            e.burnOwnerUid = owner.uid;
            const ang = Math.atan2(e.y - data.meteorY, e.x - data.meteorX);
            ctx.applyDamage(
              owner,
              e,
              ctx.getEffectiveDamage(owner, 22.0),
              Math.cos(ang) * 520,
              Math.sin(ang) * 520,
              {
                isCrit: true,
                bypassInvuln: true,
                sourceKind: 'ability',
              },
            );
          }
        }
        ctx.spawnShockwave(
          data.meteorX,
          data.meteorY,
          260,
          '#ea580c',
          9,
          owner.character.id,
          owner.character.series,
        );
        ctx.spawnParticles(data.meteorX, data.meteorY, 36, '#f97316', 100, 360, 3.5, 7.5, 'circle');
        ctx.spawnFloatingText(data.meteorX, data.meteorY - 30, 'METEOR IMPACT!', '#facc15', 'crit');
        ctx.addScreenShake(18);
        ctx.addHitstop(0.075);
        ctx.emitSfx({ type: 'ko', intensity: 1.35 });
      }
    }
  },
};

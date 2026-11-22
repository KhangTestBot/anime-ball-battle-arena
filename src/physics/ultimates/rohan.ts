import type { UltimateHandler } from './types';

export interface RohanUltimateData {
  pagesDone: number;
  pageCd: number;
  commandFired: boolean;
  flash: number;
}

export const rohanUltimateHandler: UltimateHandler = {
  characterId: 'rohan',
  title: "HEAVEN'S DOOR: LIVING BOOK!",
  subtitle:
    'Opens enemies into living manga pages (Genjutsu Stun + Silence), slashes 3 ink drafts, and writes "FLY BACK AT 70 KM/H!"',
  bannerColor: '#22c55e',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    for (const e of ctx.getEnemies(owner)) {
      e.stunTimer = Math.max(e.stunTimer, 1.3);
      e.stunKind = 'genjutsu';
      e.silenceTimer = Math.max(e.silenceTimer, 2.8);
    }

    const data: RohanUltimateData = {
      pagesDone: 0,
      pageCd: 0.28,
      commandFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#22c55e', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      "HEAVEN'S DOOR!! I REFUSE!!",
      '#22c55e',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RohanUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.commandFired && data.pagesDone < 3) {
      data.pageCd -= dt;
      if (data.pageCd <= 0) {
        data.pageCd = 0.44;
        data.pagesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('rohan_page'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 700,
            vy: Math.sin(a) * 700,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 220,
            color: '#f8fafc',
            secondaryColor: '#22c55e',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.commandFired && state.elapsed >= 2.0) {
      data.commandFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 760,
          Math.sin(ang) * 760,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        325,
        '#22c55e',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'FLY BACKWARDS AT 70 KM/H!!',
        '#f8fafc',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

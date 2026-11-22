import type { UltimateHandler } from './types';

export interface RezeUltimateData {
  bombsDone: number;
  bombCd: number;
  blastFired: boolean;
  flash: number;
}

export const rezeUltimateHandler: UltimateHandler = {
  characterId: 'reze',
  title: 'BOMB DEVIL: CARPET BOMBING!',
  subtitle:
    'Pulls the neck pin (+22% DMG & Unstoppable), dashes 3 times launching explosive Bomb salvos, and detonates a nuclear Bomb Devil Blast!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);

    const data: RezeUltimateData = {
      bombsDone: 0,
      bombCd: 0.3,
      blastFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'BOOM!! BOMB DEVIL!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RezeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.blastFired && data.bombsDone < 3) {
      data.bombCd -= dt;
      if (data.bombCd <= 0) {
        data.bombCd = 0.44;
        data.bombsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        owner.vx = Math.cos(ang) * 620;
        owner.vy = Math.sin(ang) * 620;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('reze_bomb'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'rocket',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 650,
            vy: Math.sin(a) * 650,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.2),
            knockback: 230,
            color: '#f97316',
            secondaryColor: '#a855f7',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.blastFired && state.elapsed >= 2.05) {
      data.blastFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.5);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.5),
          Math.cos(ang) * 650,
          Math.sin(ang) * 650,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        355,
        '#f97316',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'BOMB DEVIL DETONATION!!',
        '#f97316',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};

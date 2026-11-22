import type { UltimateHandler } from './types';

export interface KiraUltimateData {
  bombsDone: number;
  bombCd: number;
  btdFired: boolean;
  flash: number;
}

export const kiraUltimateHandler: UltimateHandler = {
  characterId: 'kira',
  title: 'KILLER QUEEN: BITES THE DUST!',
  subtitle:
    'Activates Third Bomb Time Rewind (Totem Revive), deploys 3 Sheer Heart Attack volleys, and detonates BITES THE DUST!',
  bannerColor: '#c084fc',
  castDuration: 0.24,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);

    const data: KiraUltimateData = {
      bombsDone: 0,
      bombCd: 0.32,
      btdFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#c084fc', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'KILLER QUEEN: THIRD BOMB!!',
      '#c084fc',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as KiraUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.btdFired && data.bombsDone < 3) {
      data.bombCd -= dt;
      if (data.bombCd <= 0) {
        data.bombCd = 0.44;
        data.bombsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('kira_sha'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'fireball',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 640,
            vy: Math.sin(a) * 640,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 235,
            color: '#c084fc',
            secondaryColor: '#facc15',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'wall', intensity: 1.25 });
      }
    }

    if (!data.btdFired && state.elapsed >= 2.05) {
      data.btdFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.15);
        e.stunKind = 'time-stop';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.5),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        360,
        '#c084fc',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'BITES THE DUST!! *CLICK*',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};

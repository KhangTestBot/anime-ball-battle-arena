import { applyFighterStun } from '../domains';
import type { UltimateHandler } from './types';

export interface GojoUltimateData {
  purpleLaunched: boolean;
  overloadUids: string[];
  overloadTickCd: number;
  postLockApplied: Record<string, boolean>;
  dataWaveOffset: number;
}

export const gojoUltimateHandler: UltimateHandler = {
  characterId: 'gojo',
  title: 'UNLIMITED VOID · HOLLOW PURPLE 200%',
  subtitle:
    'Information Overload Domain (∞) · Two-finger sign + launches 200% Hollow Purple · Silences skills for 0.6s after recovery!',
  bannerColor: '#c084fc',
  castDuration: 0.28,
  duration: 4.4,

  onCast(ctx, owner, state) {
    const cx = (ctx.bounds.left + ctx.bounds.right) / 2;
    const cy = (ctx.bounds.top + ctx.bounds.bottom) / 2;
    const enemies = ctx.getEnemies(owner);
    const stunnedUids: string[] = [];

    for (const e of enemies) {
      if (applyFighterStun(ctx, owner, e, 2.55, 'void-overload', '∞ UNLIMITED VOID!')) {
        stunnedUids.push(e.uid);
      }
    }

    const data: GojoUltimateData = {
      purpleLaunched: false,
      overloadUids: stunnedUids,
      overloadTickCd: 0.48,
      postLockApplied: {},
      dataWaveOffset: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#7dd3fc', 'ULT', true);
    ctx.spawnShockwave(cx, cy, 320, '#c084fc', 7, owner.character.id, owner.character.series);
    ctx.spawnFloatingText(
      cx,
      ctx.bounds.top + 64,
      'DOMAIN EXPANSION: ∞ VOID',
      '#7dd3fc',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 24, '#e0f2fe', 80, 290, 2.5, 5.5, 'star');
    ctx.addScreenShake(12);
    ctx.addHitstop(0.06);
    ctx.emitSfx({ type: 'beam-charge' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GojoUltimateData;
    const enemies = ctx.getEnemies(owner);
    data.dataWaveOffset += dt * 160;

    // Sure-hit Cosmic Information Overload damage ticks while enemies are frozen in Unlimited Void
    data.overloadTickCd -= dt;
    if (data.overloadTickCd <= 0) {
      data.overloadTickCd = 0.52;
      for (const e of enemies) {
        if (e.stunKind === 'void-overload') {
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 4.2), 0, 0, {
            bypassInvuln: true,
            sourceKind: 'ability',
          });
          ctx.spawnParticles(e.x, e.y, 6, '#e0f2fe', 30, 120, 2, 4.5, 'star');
        }
      }
    }

    // 1. Grant post-stun 0.6s skill-silence cooldown lock right as enemies recover from Infinity Overload!
    for (const e of enemies) {
      if (data.overloadUids.includes(e.uid) && e.stunTimer <= 0 && !data.postLockApplied[e.uid]) {
        data.postLockApplied[e.uid] = true;
        e.silenceTimer = Math.max(e.silenceTimer, 0.65);
        ctx.spawnFloatingText(e.x, e.y - e.radius - 14, 'INFO OVERLOAD -CD!', '#c084fc', 'callout');
      }
    }

    // 2. At 1.05s inside domain, launch colossal 200% Hollow Purple sphere piercing everything!
    if (!data.purpleLaunched && state.elapsed >= 1.05) {
      data.purpleLaunched = true;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
      ctx.projectiles.push({
        id: ctx.nextId('gojo_hp'),
        ownerUid: owner.uid,
        ownerCharId: owner.character.id,
        ownerSeries: owner.character.series,
        teamId: owner.teamId,
        kind: 'purple',
        x: owner.x + Math.cos(ang) * (owner.radius + 24),
        y: owner.y + Math.sin(ang) * (owner.radius + 24),
        vx: Math.cos(ang) * 350,
        vy: Math.sin(ang) * 350,
        radius: 54,
        damage: ctx.getEffectiveDamage(owner, 18.5),
        knockback: 540,
        color: '#a855f7',
        secondaryColor: '#e0f2fe',
        angle: ang,
        life: 2.8,
        maxLife: 2.8,
        piercing: true,
        blocksProjectiles: true,
        hitCooldowns: {},
        powerLevel: 6,
      });
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 20,
        'HOLLOW PURPLE 200%!!',
        '#c084fc',
        'powerup',
      );
      ctx.addScreenShake(15);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.3 });
    }
  },
};

import type { UltimateHandler } from './types';

export interface GowtherUltimateData {
  arrowsDone: number;
  arrowCd: number;
  killSwitchFired: boolean;
  flash: number;
}

export const gowtherUltimateHandler: UltimateHandler = {
  characterId: 'gowther',
  title: 'INVASION: HIJACK & BLACKOUT!',
  subtitle:
    'Mind-controls all enemies (Confusion + Silence + Charm), fires 4 Rewrite Light spirit arrows, and triggers Kill Switch!',
  bannerColor: '#ec4899',
  castDuration: 0.2,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.6);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.8);
      e.silenceTimer = Math.max(e.silenceTimer, 2.0);
      e.charmTimer = Math.max(e.charmTimer, 1.8);
      e.charmOwnerUid = owner.uid;
    }

    const data: GowtherUltimateData = {
      arrowsDone: 0,
      arrowCd: 0.28,
      killSwitchFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'INVASION: BLACKOUT!!',
      '#ec4899',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as GowtherUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.killSwitchFired && data.arrowsDone < 4) {
      data.arrowCd -= dt;
      if (data.arrowCd <= 0) {
        data.arrowCd = 0.36;
        data.arrowsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.16, 0.16]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('gowther_arrow'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 700,
            vy: Math.sin(a) * 700,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 185,
            color: '#ec4899',
            secondaryColor: '#a855f7',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.15 });
      }
    }

    if (!data.killSwitchFired && state.elapsed >= 2.0) {
      data.killSwitchFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.1);
        e.stunKind = 'genjutsu';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 23.5),
          Math.cos(ang) * 530,
          Math.sin(ang) * 530,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        305,
        '#ec4899',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'KILL SWITCH!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};

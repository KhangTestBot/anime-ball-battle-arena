import type { UltimateHandler } from './types';

export interface MayuriUltimateData {
  cloudsDone: number;
  cloudCd: number;
  toxinFired: boolean;
  flash: number;
}

export const mayuriUltimateHandler: UltimateHandler = {
  characterId: 'mayuri',
  title: 'BANKAI: KONJIKI ASHISOGI JIZO!',
  subtitle:
    'Releases Modified Bankai Neurotoxin (Confusion + Silence + Anti-Heal), fires 4 Poison Cloud volleys, and floods the arena in lethal golden venom!',
  bannerColor: '#eab308',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.8);
      e.silenceTimer = Math.max(e.silenceTimer, 2.2);
      e.antiHealTimer = Math.max(e.antiHealTimer, 4.5);
    }

    const data: MayuriUltimateData = {
      cloudsDone: 0,
      cloudCd: 0.28,
      toxinFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#eab308', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'KONJIKI ASHISOGI JIZO!!',
      '#eab308',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as MayuriUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.toxinFired && data.cloudsDone < 4) {
      data.cloudCd -= dt;
      if (data.cloudCd <= 0) {
        data.cloudCd = 0.36;
        data.cloudsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('mayuri_poison'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'dragon-acid',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 600,
            vy: Math.sin(a) * 600,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 7.2),
            knockback: 190,
            color: '#a855f7',
            secondaryColor: '#eab308',
            angle: a,
            life: 1.55,
            maxLife: 1.55,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'powerup', intensity: 1.1 });
      }
    }

    if (!data.toxinFired && state.elapsed >= 2.0) {
      data.toxinFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.5);
        e.burnOwnerUid = owner.uid;
        e.paralyzeTimer = Math.max(e.paralyzeTimer, 2.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.5),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#a855f7',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'MATAIFUKUIN NEUROTOXIN!!',
        '#eab308',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

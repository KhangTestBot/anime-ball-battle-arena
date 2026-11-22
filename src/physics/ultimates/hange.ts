import type { UltimateHandler } from './types';

export interface HangeUltimateData {
  spearsFired: number;
  spearCd: number;
  lastStandFired: boolean;
  flash: number;
}

export const hangeUltimateHandler: UltimateHandler = {
  characterId: 'hange',
  title: 'THUNDER SPEAR VOLLEY: TITAN RESEARCHER!',
  subtitle:
    'Fires 4 rapid Thunder Spear rocket salvos with scorching fire and detonates a blazing Wall-Top Last Stand inferno!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 16;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.0);

    const data: HangeUltimateData = {
      spearsFired: 0,
      spearCd: 0.28,
      lastStandFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'TITANS ARE AWESOME!!',
      '#f97316',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as HangeUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.lastStandFired && data.spearsFired < 4) {
      data.spearCd -= dt;
      if (data.spearCd <= 0) {
        data.spearCd = 0.36;
        data.spearsFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.15, 0.15]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('hange_spear'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'rocket',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 660,
            vy: Math.sin(a) * 660,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 220,
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
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.1 });
      }
    }

    if (!data.lastStandFired && state.elapsed >= 2.0) {
      data.lastStandFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.burnTimer = Math.max(e.burnTimer, 4.5);
        e.burnDps = Math.max(e.burnDps, 9.0);
        e.burnOwnerUid = owner.uid;
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 23.0),
          Math.cos(ang) * 560,
          Math.sin(ang) * 560,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        300,
        '#f97316',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'BLAZING LAST STAND!!',
        '#f97316',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};

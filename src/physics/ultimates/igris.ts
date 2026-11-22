import type { UltimateHandler } from './types';

export interface IgrisUltimateData {
  wavesDone: number;
  waveCd: number;
  execFired: boolean;
  flash: number;
}

export const igrisUltimateHandler: UltimateHandler = {
  characterId: 'igris',
  title: 'BLOOD-RED COMMANDER: TELEKINETIC GREATBLADE!',
  subtitle:
    'Wields Shadow Greatblade (+18% DMG & Unstoppable), launches 4 crimson-violet sword waves, and finishes with Blood-Red Execution!',
  bannerColor: '#dc2626',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 18;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);

    const data: IgrisUltimateData = {
      wavesDone: 0,
      waveCd: 0.3,
      execFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#dc2626', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'BLOOD-RED IGRIS!',
      '#dc2626',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as IgrisUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.execFired && data.wavesDone < 4) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.36;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.16, 0.16]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('igris_blade'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 660,
            vy: Math.sin(a) * 660,
            radius: 14,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 210,
            color: '#dc2626',
            secondaryColor: '#a855f7',
            angle: a,
            life: 1.35,
            maxLife: 1.35,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.2 });
      }
    }

    if (!data.execFired && state.elapsed >= 2.0) {
      data.execFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 3.8);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 24.0),
          Math.cos(ang) * 550,
          Math.sin(ang) * 550,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        300,
        '#dc2626',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'BLOOD-RED EXECUTION!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(17);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

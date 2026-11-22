import type { UltimateHandler } from './types';

export interface LichtUltimateData {
  wavesDone: number;
  waveCd: number;
  eonFired: boolean;
  flash: number;
}

export const lichtUltimateHandler: UltimateHandler = {
  characterId: 'licht',
  title: 'ULTIMATE SWORD MAGIC: CONQUERING EON!',
  subtitle:
    'Channels the Elf Tribe magic (Unstoppable + +22% DMG), fires 3 Demon-Dweller sword waves, and obliterates with Conquering Eon!',
  bannerColor: '#fde047',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    owner.dmgBonusPct += 22;

    const data: LichtUltimateData = {
      wavesDone: 0,
      waveCd: 0.28,
      eonFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#fde047', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'ULTIMATE SWORD MAGIC!!',
      '#fde047',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as LichtUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.eonFired && data.wavesDone < 3) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.44;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('licht_sword'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 750,
            vy: Math.sin(a) * 750,
            radius: 13,
            damage: ctx.getEffectiveDamage(owner, 8.6),
            knockback: 230,
            color: '#fde047',
            secondaryColor: '#f8fafc',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.25 });
      }
    }

    if (!data.eonFired && state.elapsed >= 2.0) {
      data.eonFired = true;
      data.flash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.0),
          Math.cos(ang) * 660,
          Math.sin(ang) * 660,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        355,
        '#fde047',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'CONQUERING EON!!',
        '#f8fafc',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};

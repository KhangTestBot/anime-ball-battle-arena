import type { UltimateHandler } from './types';

export interface PapyrusUltimateData {
  wavesDone: number;
  waveCd: number;
  specialFired: boolean;
  flash: number;
}

export const papyrusUltimateHandler: UltimateHandler = {
  characterId: 'papyrus',
  title: 'BLUE ATTACK: SPECIAL BONE ZONE!',
  subtitle:
    'Turns enemy souls BLUE (slow + gravity), launches 4 Cool Dude bone volleys, and unleashes The Great Papyrus Special Attack!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    for (const e of ctx.getEnemies(owner)) {
      e.frostTimer = Math.max(e.frostTimer, 3.0);
    }

    const data: PapyrusUltimateData = {
      wavesDone: 0,
      waveCd: 0.28,
      specialFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'NYEH HEH HEH!!',
      '#ef4444',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'powerup', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as PapyrusUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.specialFired && data.wavesDone < 4) {
      data.waveCd -= dt;
      if (data.waveCd <= 0) {
        data.waveCd = 0.36;
        data.wavesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('papyrus_bone'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 650,
            vy: Math.sin(a) * 650,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 6.8),
            knockback: 185,
            color: '#f8fafc',
            secondaryColor: '#38bdf8',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.1 });
      }
    }

    if (!data.specialFired && state.elapsed >= 2.0) {
      data.specialFired = true;
      data.flash = 1.3;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.0);
        e.stunKind = 'airborne';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 21.5),
          Math.cos(ang) * 530,
          Math.sin(ang) * 530,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        290,
        '#38bdf8',
        10,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'SPECIAL BLUE ATTACK!!',
        '#38bdf8',
        'crit',
      );
      ctx.addScreenShake(15);
      ctx.addHitstop(0.06);
      ctx.emitSfx({ type: 'ko', intensity: 1.25 });
    }
  },
};

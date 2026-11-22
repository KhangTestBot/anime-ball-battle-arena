import type { UltimateHandler } from './types';

export interface DeidaraUltimateData {
  clayVolleys: number;
  clayCd: number;
  c0Fired: boolean;
  flash: number;
}

export const deidaraUltimateHandler: UltimateHandler = {
  characterId: 'deidara',
  title: 'ART IS AN EXPLOSION!: C0 ULTIMATE ART!',
  subtitle:
    'Launches 4 barrages of C2 Clay Dragon missiles and detonates the blinding C0 Ultimate Art across the entire arena!',
  bannerColor: '#facc15',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.2);

    const data: DeidaraUltimateData = {
      clayVolleys: 0,
      clayCd: 0.28,
      c0Fired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#facc15', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'KATSU!! ART IS AN EXPLOSION!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as DeidaraUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.c0Fired && data.clayVolleys < 4) {
      data.clayCd -= dt;
      if (data.clayCd <= 0) {
        data.clayCd = 0.36;
        data.clayVolleys += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.2, 0, 0.2]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('deidara_c2'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'rocket',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 640,
            vy: Math.sin(a) * 640,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 7.6),
            knockback: 220,
            color: '#facc15',
            secondaryColor: '#ef4444',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      }
    }

    if (!data.c0Fired && state.elapsed >= 2.05) {
      data.c0Fired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
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
        365,
        '#facc15',
        14,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'C0 ULTIMATE ART: KATSU!!',
        '#ef4444',
        'crit',
      );
      ctx.addScreenShake(22);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};

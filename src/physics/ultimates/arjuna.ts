import type { UltimateHandler } from './types';

export interface ArjunaUltimateData {
  arrowsDone: number;
  arrowCd: number;
  pashupataFired: boolean;
  flash: number;
}

export const arjunaUltimateHandler: UltimateHandler = {
  characterId: 'arjuna',
  title: 'PASHUPATA: HAND OF DESTRUCTION!',
  subtitle:
    'Clairvoyance (Auto-Dodge + +22% DMG), fires 3 Agni Gandiva arrow volleys, and judges the unworthy with PASHUPATA!',
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 3.0);
    owner.dmgBonusPct += 22;

    const data: ArjunaUltimateData = {
      arrowsDone: 0,
      arrowCd: 0.28,
      pashupataFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'RAISED HAND OF THE DESTRUCTION GOD!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'powerup', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ArjunaUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.pashupataFired && data.arrowsDone < 3) {
      data.arrowCd -= dt;
      if (data.arrowCd <= 0) {
        data.arrowCd = 0.44;
        data.arrowsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('arjuna_arrow'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 780,
            vy: Math.sin(a) * 780,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.8),
            knockback: 230,
            color: '#38bdf8',
            secondaryColor: '#f8fafc',
            angle: a,
            life: 1.45,
            maxLife: 1.45,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.25 });
      }
    }

    if (!data.pashupataFired && state.elapsed >= 2.05) {
      data.pashupataFired = true;
      data.flash = 1.5;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 28.0),
          Math.cos(ang) * 670,
          Math.sin(ang) * 670,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        365,
        '#38bdf8',
        13,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'PASHUPATA: DIVINE ERASURE!!',
        '#f8fafc',
        'crit',
      );
      ctx.addScreenShake(21);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.5 });
    }
  },
};

import type { UltimateHandler } from './types';

export interface BellionUltimateData {
  lashesDone: number;
  lashCd: number;
  judgementFired: boolean;
  flash: number;
}

export const bellionUltimateHandler: UltimateHandler = {
  characterId: 'bellion',
  title: 'GRAND MARSHAL BELLION: CENTIPEDE WHIP-BLADE!',
  subtitle:
    'Unfurls 4 Shadow Wings (+20% DMG & Unstoppable), lashes 4 shield-shredding whip-blade waves, and finishes with Grand Marshal Judgement!',
  bannerColor: '#9333ea',
  castDuration: 0.24,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 20;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);

    const data: BellionUltimateData = {
      lashesDone: 0,
      lashCd: 0.3,
      judgementFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#9333ea', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'GRAND MARSHAL BELLION!',
      '#facc15',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as BellionUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.judgementFired && data.lashesDone < 4) {
      data.lashCd -= dt;
      if (data.lashCd <= 0) {
        data.lashCd = 0.36;
        data.lashesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('bellion_whip'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 690,
            vy: Math.sin(a) * 690,
            radius: 15,
            damage: ctx.getEffectiveDamage(owner, 7.2),
            knockback: 220,
            color: '#9333ea',
            secondaryColor: '#facc15',
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

    if (!data.judgementFired && state.elapsed >= 2.05) {
      data.judgementFired = true;
      data.flash = 1.35;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.armorShredTimer = Math.max(e.armorShredTimer, 4.0);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.5),
          Math.cos(ang) * 590,
          Math.sin(ang) * 590,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#facc15',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'GRAND MARSHAL JUDGEMENT!!',
        '#facc15',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },
};

import type { UltimateHandler } from './types';

export interface RaidenUltimateData {
  slashesDone: number;
  slashCd: number;
  musouFired: boolean;
  musouAngle: number;
  musouFlash: number;
}

export const raidenUltimateHandler: UltimateHandler = {
  characterId: 'raiden',
  title: 'MUSOU NO HITOTACHI: PLANE OF EUTHYMIA!',
  subtitle:
    'Unsheathes the Electro Archon blade (+22% DMG & Unstoppable), unleashes 3 paralyzing Baleful Omen waves, and cleaves space with Musou no Hitotachi!',
  bannerColor: '#a855f7',
  castDuration: 0.25,
  duration: 4.1,

  onCast(ctx, owner, state) {
    owner.dmgBonusPct += 22;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.6);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: RaidenUltimateData = {
      slashesDone: 0,
      slashCd: 0.34,
      musouFired: false,
      musouAngle: ang,
      musouFlash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'INAZUMA SHINES ETERNAL!!',
      '#c084fc',
      'powerup',
    );
    ctx.addScreenShake(12);
    ctx.emitSfx({ type: 'slash', intensity: 1.3 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as RaidenUltimateData;
    if (data.musouFlash > 0) data.musouFlash = Math.max(0, data.musouFlash - dt);

    if (!data.musouFired && data.slashesDone < 3) {
      data.slashCd -= dt;
      if (data.slashCd <= 0) {
        data.slashCd = 0.44;
        data.slashesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        data.musouAngle = ang;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('raiden_electro'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 700,
            vy: Math.sin(a) * 700,
            radius: 15,
            damage: ctx.getEffectiveDamage(owner, 8.2),
            knockback: 220,
            color: '#a855f7',
            secondaryColor: '#e9d5ff',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.25 });
      }
    }

    if (!data.musouFired && state.elapsed >= 2.05) {
      data.musouFired = true;
      data.musouFlash = 1.45;
      for (const e of ctx.getEnemies(owner)) {
        e.shieldTimer = 0;
        e.paralyzeTimer = Math.max(e.paralyzeTimer, 2.5);
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 27.0),
          Math.cos(ang) * 620,
          Math.sin(ang) * 620,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        350,
        '#c084fc',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 28,
        'TORN TO OBLIVION!!',
        '#c084fc',
        'crit',
      );
      ctx.addScreenShake(20);
      ctx.addHitstop(0.08);
      ctx.emitSfx({ type: 'ko', intensity: 1.45 });
    }
  },
};

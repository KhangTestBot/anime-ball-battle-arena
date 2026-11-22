import type { UltimateHandler } from './types';

export interface NoelleUltimateData {
  lancesDone: number;
  lanceCd: number;
  dragonFired: boolean;
  flash: number;
}

export const noelleUltimateHandler: UltimateHandler = {
  characterId: 'noelle',
  title: "SAINT VALKYRIE: SEA DRAGON'S ROAR!",
  subtitle:
    "Dons Saint Valkyrie Armor (Shield + Auto-Dodge), launches 3 water lance volleys, and unleashes Sea Dragon's Roar!",
  bannerColor: '#38bdf8',
  castDuration: 0.22,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.shieldTimer = Math.max(owner.shieldTimer, 3.2);
    owner.uiDodgeTimer = Math.max(owner.uiDodgeTimer, 2.6);
    owner.dmgBonusPct += 18;

    const data: NoelleUltimateData = {
      lancesDone: 0,
      lanceCd: 0.28,
      dragonFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#38bdf8', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 24,
      'SAINT VALKYRIE DRESS!!',
      '#38bdf8',
      'powerup',
    );
    ctx.addScreenShake(10);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as NoelleUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.dragonFired && data.lancesDone < 3) {
      data.lanceCd -= dt;
      if (data.lanceCd <= 0) {
        data.lanceCd = 0.44;
        data.lancesDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.18, 0, 0.18]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('noelle_lance'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'arrow-trident',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 710,
            vy: Math.sin(a) * 710,
            radius: 12,
            damage: ctx.getEffectiveDamage(owner, 8.2),
            knockback: 220,
            color: '#38bdf8',
            secondaryColor: '#e0f2fe',
            angle: a,
            life: 1.4,
            maxLife: 1.4,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'beam-fire', intensity: 1.2 });
      }
    }

    if (!data.dragonFired && state.elapsed >= 2.0) {
      data.dragonFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 26.0),
          Math.cos(ang) * 640,
          Math.sin(ang) * 640,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        340,
        '#38bdf8',
        12,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        "SEA DRAGON'S ROAR!!",
        '#e0f2fe',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.4 });
    }
  },
};

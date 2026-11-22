import type { UltimateHandler } from './types';

export interface ErzaUltimateData {
  wheelAngle: number;
  volleysFired: number;
  volleyCd: number;
  nakagamiFired: boolean;
  slashAngle: number;
  flash: number;
}

export const erzaUltimateHandler: UltimateHandler = {
  characterId: 'erza',
  title: "HEAVEN'S WHEEL · NAKAGAMI STARLIGHT",
  subtitle:
    "Surrounds Erza with orbiting Heaven's Wheel swords firing 3 blade barrages, then equips Nakagami Armor cleaving obstacles & shields!",
  bannerColor: '#ef4444',
  castDuration: 0.24,
  duration: 3.9,

  onCast(ctx, owner, state) {
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 2.8);
    owner.enchantArmorTimer = Math.max(owner.enchantArmorTimer, 3.0);
    const target = ctx.getNearestEnemy(owner);
    const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;

    const data: ErzaUltimateData = {
      wheelAngle: 0,
      volleysFired: 0,
      volleyCd: 0.35,
      nakagamiFired: false,
      slashAngle: ang,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, ang, '#ef4444', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 22,
      "REQUIP: HEAVEN'S WHEEL!",
      '#fca5a5',
      'powerup',
    );
    ctx.addScreenShake(9);
    ctx.emitSfx({ type: 'slash', intensity: 1.2 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as ErzaUltimateData;
    data.wheelAngle += dt * 7.5;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.nakagamiFired && data.volleysFired < 3) {
      data.volleyCd -= dt;
      if (data.volleyCd <= 0) {
        data.volleyCd = 0.48;
        data.volleysFired += 1;
        const target = ctx.getNearestEnemy(owner);
        const baseAng = target
          ? Math.atan2(target.y - owner.y, target.x - owner.x)
          : owner.facingAngle;
        for (let k = -2; k <= 2; k++) {
          const a = baseAng + k * 0.22;
          ctx.projectiles.push({
            id: ctx.nextId('erza_sword'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'sword-wave',
            x: owner.x + Math.cos(a) * (owner.radius + 14),
            y: owner.y + Math.sin(a) * (owner.radius + 14),
            vx: Math.cos(a) * 610,
            vy: Math.sin(a) * 610,
            radius: 10,
            damage: ctx.getEffectiveDamage(owner, 6.8),
            knockback: 180,
            color: '#f8fafc',
            secondaryColor: '#ef4444',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: true,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'slash', intensity: 1.1 });
      }
    }

    // Climax (2.0s): NAKAGAMI STARLIGHT — cleaves obstacles, shields & invulnerability!
    if (!data.nakagamiFired && state.elapsed >= 2.0) {
      data.nakagamiFired = true;
      data.flash = 1.25;
      const target = ctx.getNearestEnemy(owner);
      const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : data.slashAngle;
      data.slashAngle = ang;
      const lx = Math.cos(ang);
      const ly = Math.sin(ang);

      for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
        ctx.obstacles.splice(i, 1);
      }

      for (const e of ctx.getEnemies(owner)) {
        const px = e.x - owner.x;
        const py = e.y - owner.y;
        if (px * lx + py * ly >= -e.radius - 40 && Math.abs(px * ly - py * lx) <= e.radius + 85) {
          e.shieldTimer = 0;
          e.evadeTimer = 0;
          e.armorShredTimer = Math.max(e.armorShredTimer, 3.2);
          ctx.applyDamage(owner, e, ctx.getEffectiveDamage(owner, 22.0), lx * 520, ly * 520, {
            isCrit: true,
            bypassInvuln: true,
            sourceKind: 'ability',
          });
        }
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        230,
        '#facc15',
        8,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'NAKAGAMI STARLIGHT!',
        '#fef08a',
        'crit',
      );
      ctx.addScreenShake(16);
      ctx.addHitstop(0.065);
      ctx.emitSfx({ type: 'ko', intensity: 1.3 });
    }
  },
};

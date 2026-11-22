import type { UltimateHandler } from './types';

export interface SantaCsmUltimateData {
  dollsDone: number;
  dollCd: number;
  collapseFired: boolean;
  flash: number;
}

export const santaCsmUltimateHandler: UltimateHandler = {
  characterId: 'santa_csm',
  title: 'DOLL DEVIL: DARKNESS FLESH & PERFECT DOLLS!',
  subtitle:
    'Empowered by Darkness flesh (Totem Doll Transfer + Enemy Confusion), fires 3 Doll Swarm volleys, and triggers Perfect Doll Collapse!',
  bannerColor: '#a855f7',
  castDuration: 0.22,
  duration: 4.0,

  onCast(ctx, owner, state) {
    owner.totemActive = true;
    owner.unstoppableTimer = Math.max(owner.unstoppableTimer, 3.4);
    for (const e of ctx.getEnemies(owner)) {
      e.confusedTimer = Math.max(e.confusedTimer, 2.8);
    }

    const data: SantaCsmUltimateData = {
      dollsDone: 0,
      dollCd: 0.3,
      collapseFired: false,
      flash: 0,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#a855f7', 'ULT', true);
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 26,
      'PERFECT DOLL CONTRACT!!',
      '#a855f7',
      'powerup',
    );
    ctx.addScreenShake(11);
    ctx.emitSfx({ type: 'powerup', intensity: 1.25 });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as SantaCsmUltimateData;
    if (data.flash > 0) data.flash = Math.max(0, data.flash - dt);

    if (!data.collapseFired && data.dollsDone < 3) {
      data.dollCd -= dt;
      if (data.dollCd <= 0) {
        data.dollCd = 0.44;
        data.dollsDone += 1;
        const target = ctx.getNearestEnemy(owner);
        const ang = target ? Math.atan2(target.y - owner.y, target.x - owner.x) : owner.facingAngle;
        for (const offset of [-0.22, 0, 0.22]) {
          const a = ang + offset;
          ctx.projectiles.push({
            id: ctx.nextId('santa_doll'),
            ownerUid: owner.uid,
            ownerCharId: owner.character.id,
            ownerSeries: owner.character.series,
            teamId: owner.teamId,
            kind: 'zoltraak-orb',
            x: owner.x + Math.cos(a) * (owner.radius + 10),
            y: owner.y + Math.sin(a) * (owner.radius + 10),
            vx: Math.cos(a) * 630,
            vy: Math.sin(a) * 630,
            radius: 11,
            damage: ctx.getEffectiveDamage(owner, 7.8),
            knockback: 200,
            color: '#a855f7',
            secondaryColor: '#1e293b',
            angle: a,
            life: 1.5,
            maxLife: 1.5,
            piercing: false,
            hitCooldowns: {},
            powerLevel: ctx.getForm(owner).powerLevel,
          });
        }
        ctx.emitSfx({ type: 'powerup', intensity: 1.15 });
      }
    }

    if (!data.collapseFired && state.elapsed >= 2.05) {
      data.collapseFired = true;
      data.flash = 1.4;
      for (const e of ctx.getEnemies(owner)) {
        e.stunTimer = Math.max(e.stunTimer, 1.1);
        e.stunKind = 'petrified';
        const ang = Math.atan2(e.y - owner.y, e.x - owner.x);
        ctx.applyDamage(
          owner,
          e,
          ctx.getEffectiveDamage(owner, 25.0),
          Math.cos(ang) * 580,
          Math.sin(ang) * 580,
          { isCrit: true, bypassInvuln: true, sourceKind: 'ability' },
        );
      }
      ctx.spawnShockwave(
        owner.x,
        owner.y,
        320,
        '#a855f7',
        11,
        owner.character.id,
        owner.character.series,
      );
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 26,
        'DARKNESS DOLL COLLAPSE!!',
        '#a855f7',
        'crit',
      );
      ctx.addScreenShake(18);
      ctx.addHitstop(0.07);
      ctx.emitSfx({ type: 'ko', intensity: 1.35 });
    }
  },

  onExpire(_ctx, owner) {
    if (!owner) return;
    owner.totemActive = false;
  },
};

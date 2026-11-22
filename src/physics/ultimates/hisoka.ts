import type { UltimateHandler } from './types';

export interface BungeeAnchor {
  targetUid: string;
  anchorX: number;
  anchorY: number;
  snapped: boolean;
}

export interface HisokaUltimateData {
  anchors: BungeeAnchor[];
  elasticPulls: number;
  pullCd: number;
  cardsThrown: boolean;
  snapCrashFired: boolean;
}

export const hisokaUltimateHandler: UltimateHandler = {
  characterId: 'hisoka',
  title: 'BUNGEE GUM (RUBBER & GUM) & TRICK CARD STORM',
  subtitle:
    'Bungee Gum has the properties of both rubber and gum: attaches elastic threads yanking foes back to the anchor → Unleashes an 8-Card Poker Storm & snaps Bungee impact bursts!',
  bannerColor: '#ec4899',
  castDuration: 0.24,
  duration: 3.8,

  onCast(ctx, owner, state) {
    owner.evadeTimer = Math.max(owner.evadeTimer, 1.8);
    const enemies = ctx.getEnemies(owner);
    const anchors: BungeeAnchor[] = enemies.slice(0, 3).map((e) => ({
      targetUid: e.uid,
      anchorX: owner.x,
      anchorY: owner.y,
      snapped: false,
    }));

    const data: HisokaUltimateData = {
      anchors,
      elasticPulls: 0,
      pullCd: 0.35,
      cardsThrown: false,
      snapCrashFired: false,
    };
    state.data = data as unknown as Record<string, unknown>;

    ctx.spawnCastSeal(owner, owner.x, owner.y, owner.facingAngle, '#ec4899', 'ULT', true);
    ctx.spawnShockwave(
      owner.x,
      owner.y,
      185,
      '#f472b6',
      6,
      owner.character.id,
      owner.character.series,
    );
    ctx.spawnFloatingText(
      owner.x,
      owner.y - owner.radius - 20,
      'BUNGEE GUM: RUBBER & GUM!',
      '#f9a8d4',
      'powerup',
    );
    ctx.spawnParticles(owner.x, owner.y, 20, '#ec4899', 70, 230, 3, 6, 'diamond');
    ctx.addScreenShake(9);
    ctx.addHitstop(0.05);
    ctx.emitSfx({ type: 'powerup' });
  },

  onTick(ctx, owner, state, dt) {
    const data = state.data as unknown as HisokaUltimateData;
    const enemies = ctx.getEnemies(owner);

    // 1. Update anchor to follow Hisoka smoothly and snap-pull enemies violently when stretched!
    data.pullCd -= dt;
    if (data.pullCd <= 0 && state.elapsed < 2.1) {
      data.pullCd = 0.48;
      for (const anc of data.anchors) {
        anc.anchorX = owner.x;
        anc.anchorY = owner.y;
        const target = enemies.find((e) => e.uid === anc.targetUid && e.alive);
        if (target) {
          const dx = owner.x - target.x;
          const dy = owner.y - target.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          if (d >= 110) {
            data.elasticPulls++;
            target.vx += (dx / d) * 440;
            target.vy += (dy / d) * 440;
            ctx.applyDamage(
              owner,
              target,
              ctx.getEffectiveDamage(owner, 4.2),
              (dx / d) * 280,
              (dy / d) * 280,
              {
                sourceKind: 'ability',
              },
            );
            ctx.spawnFloatingText(
              target.x,
              target.y - target.radius - 14,
              'BUNGEE SNAP!',
              '#f472b6',
              'callout',
            );
            ctx.emitSfx({ type: 'hit', intensity: 1.0 });
          }
        }
      }
    }

    // 2. Throw 8 Razor Suit Poker Cards at 0.85s
    if (!data.cardsThrown && state.elapsed >= 0.85) {
      data.cardsThrown = true;
      const target = ctx.getNearestEnemy(owner);
      const baseAng = target
        ? Math.atan2(target.y - owner.y, target.x - owner.x)
        : owner.facingAngle;
      for (let i = 0; i < 8; i++) {
        const ang = baseAng + (i - 3.5) * 0.24;
        ctx.projectiles.push({
          id: ctx.nextId('hisoka_card'),
          ownerUid: owner.uid,
          ownerCharId: owner.character.id,
          ownerSeries: owner.character.series,
          teamId: owner.teamId,
          kind: 'card-spade',
          x: owner.x + Math.cos(ang) * (owner.radius + 10),
          y: owner.y + Math.sin(ang) * (owner.radius + 10),
          vx: Math.cos(ang) * 610,
          vy: Math.sin(ang) * 610,
          radius: 14,
          damage: ctx.getEffectiveDamage(owner, 5.2),
          knockback: 210,
          color: '#ec4899',
          secondaryColor: '#38bdf8',
          angle: ang,
          life: 1.4,
          maxLife: 1.4,
          piercing: false,
          boomerang: true,
          hitCooldowns: {},
          powerLevel: 6,
        });
      }
      ctx.spawnFloatingText(
        owner.x,
        owner.y - owner.radius - 18,
        'DEAL DEATH CARDS! ♠♥♦♣',
        '#fbcfe8',
        'callout',
      );
      ctx.emitSfx({ type: 'slash', intensity: 1.15 });
    }

    // Climax (2.2s): Final Bungee Gum Detonation Pull stripping shields & slamming into Hisoka!
    if (!data.snapCrashFired && state.elapsed >= 2.2) {
      data.snapCrashFired = true;
      for (const anc of data.anchors) {
        anc.snapped = true;
        const target = enemies.find((e) => e.uid === anc.targetUid && e.alive);
        if (target) {
          target.shieldTimer = 0;
          target.armorShredTimer = Math.max(target.armorShredTimer, 2.5);
          ctx.applyDamage(owner, target, ctx.getEffectiveDamage(owner, 12.5), 0, 0, {
            isCrit: true,
            sourceKind: 'ability',
          });
          ctx.spawnShockwave(
            target.x,
            target.y,
            130,
            '#ec4899',
            6,
            owner.character.id,
            owner.character.series,
          );
        }
      }
      ctx.addHitstop(0.065);
      ctx.addScreenShake(15);
      ctx.emitSfx({ type: 'ko', intensity: 1.2 });
    }
  },
};

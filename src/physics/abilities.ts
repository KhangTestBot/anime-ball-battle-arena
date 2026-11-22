import { getRimuruSkillsForForm } from '../characters/rimuruSkills';
import type {
  ActiveUltimateState,
  ArenaBounds,
  ArenaDomain,
  ArenaObstacle,
  Beam,
  Bomb,
  CastSeal,
  FighterState,
  FloatingText,
  FormConfig,
  LightningBolt,
  Minion,
  Particle,
  Point2D,
  Projectile,
  RicochetArm,
  SfxEvent,
  Shockwave,
  SkillDef,
  SkyPillar,
  SlashEffect,
  TrailNode,
} from '../types/game';
import { activateCharacterDomain, applyRegularSkillStatus, getHealMultiplier } from './domains';
import { triggerCustomUltimate } from './ultimates/registry';

export interface AbilityContext {
  bounds: ArenaBounds;
  fighters: FighterState[];
  projectiles: Projectile[];
  beams: Beam[];
  ricochetArms: RicochetArm[];
  slashes: SlashEffect[];
  trails: TrailNode[];
  bombs: Bomb[];
  skyPillars: SkyPillar[];
  lightningBolts: LightningBolt[];
  minions: Minion[];
  shockwaves: Shockwave[];
  castSeals: CastSeal[];
  domains: ArenaDomain[];
  obstacles: ArenaObstacle[];
  activeUltimates: ActiveUltimateState[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  nextId(prefix: string): string;
  getForm(fighter: FighterState): FormConfig;
  getEnemies(fighter: FighterState): FighterState[];
  getNearestEnemy(fighter: FighterState): FighterState | null;
  getEffectiveDamage(fighter: FighterState, rawBase: number): number;
  applyDamage(
    attacker: FighterState | null,
    target: FighterState,
    rawDamage: number,
    knockX: number,
    knockY: number,
    opts?: {
      isCrit?: boolean;
      bypassInvuln?: boolean;
      sourceKind?: 'collision' | 'ability' | 'dot' | 'wall';
      allowLifesteal?: boolean;
    },
  ): number;
  addScreenShake(amount: number): void;
  addHitstop(seconds: number): void;
  triggerCameraGlitch(seconds: number): void;
  dispelEnemyFields(owner: FighterState): number;
  emitSfx(event: SfxEvent): void;
  spawnParticles(
    x: number,
    y: number,
    count: number,
    color: string,
    speedMin: number,
    speedMax: number,
    sizeMin?: number,
    sizeMax?: number,
    shape?: Particle['shape'],
    glyph?: string,
  ): void;
  spawnSeriesParticles(
    fighter: FighterState,
    x: number,
    y: number,
    count: number,
    color: string,
    speedMin?: number,
    speedMax?: number,
  ): void;
  spawnCastSeal(
    fighter: FighterState,
    x: number,
    y: number,
    angle: number,
    color: string,
    skillKey: string,
    isUltimate?: boolean,
  ): void;
  spawnShockwave(
    x: number,
    y: number,
    maxRadius: number,
    color: string,
    lineWidth?: number,
    ownerCharId?: string,
    ownerSeries?: string,
  ): void;
  spawnFloatingText(
    x: number,
    y: number,
    text: string,
    color: string,
    kind: FloatingText['kind'],
    subtext?: string,
  ): void;
}

function normalize(dx: number, dy: number): { x: number; y: number; dist: number } {
  const dist = Math.hypot(dx, dy);
  if (dist < 0.0001) return { x: 1, y: 0, dist: 0 };
  return { x: dx / dist, y: dy / dist, dist };
}

/** Distance from point (px, py) to segment (x1,y1)-(x2,y2) */
export function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const lenSq = vx * vx + vy * vy;
  if (lenSq < 0.0001) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * vx + (py - y1) * vy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * vx), py - (y1 + t * vy));
}

function raycastToBounds(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  bounds: ArenaBounds,
): { x: number; y: number } {
  let tMin = Infinity;
  if (Math.abs(dx) > 0.0001) {
    const tx1 = (bounds.left - ox) / dx;
    const tx2 = (bounds.right - ox) / dx;
    if (tx1 > 0.001 && tx1 < tMin) tMin = tx1;
    if (tx2 > 0.001 && tx2 < tMin) tMin = tx2;
  }
  if (Math.abs(dy) > 0.0001) {
    const ty1 = (bounds.top - oy) / dy;
    const ty2 = (bounds.bottom - oy) / dy;
    if (ty1 > 0.001 && ty1 < tMin) tMin = ty1;
    if (ty2 > 0.001 && ty2 < tMin) tMin = ty2;
  }
  if (!Number.isFinite(tMin)) return { x: ox, y: oy };
  return {
    x: Math.max(bounds.left, Math.min(bounds.right, ox + dx * tMin)),
    y: Math.max(bounds.top, Math.min(bounds.bottom, oy + dy * tMin)),
  };
}

function createJaggedBoltPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  segs = 6,
): Point2D[] {
  const pts: Point2D[] = [{ x: x1, y: y1 }];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = len > 1 ? -dy / len : 0;
  const ny = len > 1 ? dx / len : 0;
  for (let i = 1; i < segs; i++) {
    const frac = i / segs;
    const jitter = (Math.random() - 0.5) * Math.min(34, len * 0.22);
    pts.push({
      x: x1 + dx * frac + nx * jitter,
      y: y1 + dy * frac + ny * jitter,
    });
  }
  pts.push({ x: x2, y: y2 });
  return pts;
}

/** Update character-specific passive & active ability behaviors each fixed step */
export function updateFighterAbilities(ctx: AbilityContext, f: FighterState, dt: number): void {
  if (!f.alive) return;
  const form = ctx.getForm(f);
  const cooldownMult = form.cooldownMult ?? 1;
  const baseCd = f.character.baseStats.abilityCooldown * cooldownMult;

  tickCooldownMap(f.orbitHitCooldowns, dt);
  tickCooldownMap(f.chainsawHitCooldowns, dt);
  tickCooldownMap(f.odmHitCooldowns, dt);

  const isFastOrbit =
    f.character.abilityId === 'santoryu-orbit' ||
    f.character.abilityId === 'blades-of-chaos' ||
    f.character.abilityId === 'antimagic-cleave' ||
    f.character.abilityId === 'minecraft-tnt' ||
    f.character.abilityId === 'meteor-orbs' ||
    f.character.abilityId === 'judgment-cut';
  f.orbitAngle += dt * (isFastOrbit ? 4.3 + form.powerLevel * 0.55 : 7.5);
  f.spinAngle +=
    dt * (f.odmActiveTimer > 0 || f.spinDashTimer > 0 ? 30 : f.rasenganDashTimer > 0 ? 18 : 3);

  // Passive abilities running continuously
  switch (f.character.abilityId) {
    case 'santoryu-orbit':
      updateOrbitWeaponDamage(ctx, f, form, 3, 22, 4.8, 'slash');
      break;
    case 'blades-of-chaos':
      updateOrbitWeaponDamage(ctx, f, form, 2, 26, 5.4, 'slash', true);
      break;
    case 'antimagic-cleave':
      updateOrbitWeaponDamage(ctx, f, form, 1, 24, 5.6, 'slash');
      updateProjectileDestroyerAura(ctx, f, f.radius + 30, 'ANTI-MAGIC!');
      break;
    case 'minecraft-tnt':
      updateOrbitWeaponDamage(ctx, f, form, 1, 22, 5.0, 'slash');
      break;
    case 'meteor-orbs':
      if (form.powerLevel >= 3) {
        updateOrbitWeaponDamage(ctx, f, form, 4, 24, 4.2, 'hit');
      }
      break;
    case 'judgment-cut':
      if (form.powerLevel >= 3) {
        updateOrbitWeaponDamage(ctx, f, form, 3, 23, 4.0, 'slash');
      }
      break;
    case 'breathing-trail':
      updateTrailEmitter(ctx, f, form, dt);
      break;
    case 'chidori-lightning':
      if (form.powerLevel >= 2) {
        updateTrailEmitter(ctx, f, form, dt);
      }
      break;
    case 'chainsaw-lifesteal':
      updateDenjiChainsawRim(ctx, f, form);
      break;
    case 'infinity-purple':
      updateGojoInfinityPassive(ctx, f, form, dt);
      break;
    case 'yasuo-wind':
      updateProjectileDestroyerAura(ctx, f, f.radius + 26, 'WIND WALL!');
      break;
    case 'serious-punch':
      f.rageProgress = Math.max(0, Math.min(1, 1 - f.abilityTimer / Math.max(0.5, baseCd)));
      break;
    default:
      break;
  }

  // Creeper fuse countdown -> BOOM!
  if (f.fuseTimer > 0) {
    f.fuseTimer -= dt;
    if (f.fuseTimer <= 0) {
      f.fuseTimer = 0;
      detonateCreeperBlast(ctx, f, form);
    }
    return;
  }

  // Sonic Spin Dash active buzzsaw state
  if (f.spinDashTimer > 0) {
    f.spinDashTimer = Math.max(0, f.spinDashTimer - dt);
    if (Math.random() < 0.7) {
      f.afterimages.push({
        x: f.x,
        y: f.y,
        alpha: 0.6,
        color: form.auraColor,
        formIndex: f.formIndex,
      });
    }
  }

  if (f.getExcitedTimer > 0) {
    f.getExcitedTimer = Math.max(0, f.getExcitedTimer - dt);
  }
  if (f.healSkillCooldown > 0) {
    f.healSkillCooldown = Math.max(0, f.healSkillCooldown - dt);
  }
  if (f.shieldTimer > 0) {
    f.shieldTimer = Math.max(0, f.shieldTimer - dt);
    // Active shield barrier continuously intercepts nearby enemy projectiles!
    updateProjectileDestroyerAura(ctx, f, f.radius + 22, 'BLOCKED!');
  }

  // Active ODM dash movement & multi-slash
  if (f.odmActiveTimer > 0) {
    f.odmActiveTimer = Math.max(0, f.odmActiveTimer - dt);
    f.vx = f.odmDashVx;
    f.vy = f.odmDashVy;
    if (Math.random() < 0.65) {
      f.afterimages.push({
        x: f.x,
        y: f.y,
        alpha: 0.55,
        color: form.auraColor,
        formIndex: f.formIndex,
      });
    }
    for (const enemy of ctx.getEnemies(f)) {
      const dist = Math.hypot(enemy.x - f.x, enemy.y - f.y);
      if (dist <= f.radius + enemy.radius + 26 && !f.odmHitCooldowns[enemy.uid]) {
        f.odmHitCooldowns[enemy.uid] = 0.085;
        const raw = ctx.getEffectiveDamage(f, 5.2 + form.powerLevel * 1.1);
        const dir = normalize(enemy.x - f.x, enemy.y - f.y);
        ctx.applyDamage(f, enemy, raw, dir.x * 240, dir.y * 240, {
          sourceKind: 'ability',
          bypassInvuln: true,
        });
        ctx.emitSfx({ type: 'slash', intensity: 1.0 });
        ctx.spawnParticles(
          enemy.x,
          enemy.y,
          7,
          form.auraSecondaryColor ?? '#67e8f9',
          110,
          290,
          2,
          4,
          'spark',
        );
        const ang = Math.random() * Math.PI * 2;
        const len = enemy.radius + 24;
        ctx.slashes.push({
          id: ctx.nextId('sl'),
          ownerUid: f.uid,
          teamId: f.teamId,
          x1: enemy.x - Math.cos(ang) * len,
          y1: enemy.y - Math.sin(ang) * len,
          x2: enemy.x + Math.cos(ang) * len,
          y2: enemy.y + Math.sin(ang) * len,
          color: form.auraColor,
          coreColor: '#ffffff',
          width: 4,
          telegraphTimer: 0,
          activeTimer: 0.01,
          fadeTimer: 0.22,
          maxFade: 0.22,
          damage: 0,
          hasStruck: true,
        });
      }
    }
  }

  if (f.rasenganDashTimer > 0) {
    f.rasenganDashTimer = Math.max(0, f.rasenganDashTimer - dt);
    if (Math.random() < 0.5) {
      ctx.spawnParticles(f.x, f.y, 2, form.auraColor, 40, 120, 2, 4, 'circle');
    }
  }

  // Beam charging (Goku Kamehameha, Vegeta Final Flash)
  if (f.abilityChargeTimer > 0) {
    f.abilityChargeTimer -= dt;
    const nearest = ctx.getNearestEnemy(f);
    if (nearest) {
      f.abilityTargetAngle = Math.atan2(nearest.y - f.y, nearest.x - f.x);
      f.facingAngle = f.abilityTargetAngle;
    }
    f.vx *= 0.94;
    f.vy *= 0.94;
    if (f.abilityChargeTimer <= 0) {
      f.abilityChargeTimer = 0;
      if (f.character.abilityId === 'final-flash') {
        fireFinalFlash(ctx, f, form);
      } else {
        fireKamehameha(ctx, f, form);
      }
    }
    return;
  }

  f.abilityTimer -= dt;
  if (f.abilityTimer <= 0) {
    const target = ctx.getNearestEnemy(f);
    if (!target) {
      f.abilityTimer = 0.5;
      return;
    }
    // Slightly brisker skill cadence so all 4-5 skills cycle vividly during a fight (LoL CDR items reduce cooldown further!)
    const cdrScale = Math.max(0.5, 1 - (f.lolCdrBonus ?? 0));
    f.abilityTimer = baseCd * cdrScale * 0.82 * (0.9 + Math.random() * 0.2);
    if (f.character.skills.length > 0) {
      pickAndExecuteSkill(ctx, f, target, form);
    } else {
      triggerActiveAbility(ctx, f, target, form);
    }
  }
}

export function onFighterTransform(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  if (f.character.abilityId === 'shadow-army') {
    summonShadowSoldiers(ctx, f, form, 3, f.x, f.y);
  }
  if (f.character.abilityId === 'rasengan-clones' && form.powerLevel >= 3) {
    spawnShadowClones(ctx, f, form, 1);
  }
  if (f.character.abilityId === 'jinx-rocket') {
    f.getExcitedTimer = 4.0;
  }
}

export function onFighterKill(
  ctx: AbilityContext,
  killer: FighterState,
  victim: FighterState,
): void {
  if (killer.character.abilityId === 'shadow-army' && killer.alive) {
    const form = ctx.getForm(killer);
    summonShadowSoldiers(ctx, killer, form, 2, victim.x, victim.y);
    ctx.spawnFloatingText(victim.x, victim.y - 24, 'ARISE!', '#c084fc', 'callout');
  }
  if (killer.character.abilityId === 'jinx-rocket' && killer.alive) {
    killer.getExcitedTimer = 4.5;
    ctx.spawnFloatingText(
      killer.x,
      killer.y - killer.radius - 16,
      'GET EXCITED!',
      '#ec4899',
      'callout',
    );
  }
}

function triggerActiveAbility(
  ctx: AbilityContext,
  f: FighterState,
  target: FighterState,
  form: FormConfig,
): void {
  const angle = Math.atan2(target.y - f.y, target.x - f.x);
  f.facingAngle = angle;

  switch (f.character.abilityId) {
    case 'rubber-ricochet':
      fireLuffyRicochetArm(ctx, f, angle, form);
      break;
    case 'kamehameha':
    case 'final-flash':
      f.abilityChargeDuration = 0.42;
      f.abilityChargeTimer = 0.42;
      f.abilityTargetAngle = angle;
      ctx.emitSfx({ type: 'beam-charge' });
      ctx.spawnShockwave(f.x, f.y, f.radius * 2.1, form.auraColor, 3);
      break;
    case 'rasengan-clones':
      triggerNarutoRasenganAndClones(ctx, f, angle, form);
      break;
    case 'infinity-purple':
      fireGojoOrb(ctx, f, angle, form);
      break;
    case 'cleave-dismantle':
      triggerSukunaSlashes(
        ctx,
        f,
        form,
        form.visualVariant === 'shrine' ? 8 : Math.min(6, form.powerLevel + 1),
      );
      break;
    case 'santoryu-orbit':
      fireZoroSwordWave(ctx, f, angle, form);
      break;
    case 'breathing-trail':
      triggerDashSurge(ctx, f, angle, form, 530);
      break;
    case 'getsuga-tensho':
      fireIchigoGetsuga(ctx, f, angle, form);
      break;
    case 'serious-punch':
      triggerSaitamaSeriousPunch(ctx, f, angle, form);
      break;
    case 'odm-grapple':
      triggerLeviOdmGrapple(ctx, f, target, form);
      break;
    case 'shadow-army':
      summonShadowSoldiers(ctx, f, form, form.powerLevel >= 4 ? 2 : 1, f.x, f.y);
      break;
    case 'chainsaw-lifesteal':
      triggerDashSurge(ctx, f, angle, form, 560);
      break;
    /* ---- NEW ANIME & GAME ABILITIES ---- */
    case 'chidori-lightning':
      triggerChidoriLightning(ctx, f, target, angle, form);
      break;
    case 'godspeed-bolt':
      triggerLightningStrike(ctx, f, form, 2 + (form.powerLevel >= 4 ? 2 : 0), '#38bdf8', true);
      break;
    case 'titan-stomp':
      triggerTitanSeismicSlam(ctx, f, form);
      break;
    case 'meteor-orbs':
      fireMadaraMeteor(ctx, f, angle, form);
      break;
    case 'blackwhip-smash':
      triggerBlackwhipSmash(ctx, f, angle, form);
      break;
    case 'gluttony-vortex':
      triggerGravityVortex(ctx, f, form, true);
      break;
    case 'antimagic-cleave':
      fireAntiMagicSlash(ctx, f, angle, form);
      break;
    case 'zoltraak-barrage':
      fireZoltraakBarrage(ctx, f, angle, form);
      break;
    case 'psychic-vortex':
      triggerGravityVortex(ctx, f, form, false);
      break;
    case 'minecraft-tnt':
      dropMinecraftTnt(ctx, f, form);
      break;
    case 'creeper-blast':
      f.fuseTimer = 0.42;
      ctx.emitSfx({ type: 'beam-charge' });
      ctx.spawnFloatingText(f.x, f.y - f.radius - 14, 'Tsss...', '#4ade80', 'callout');
      break;
    case 'yasuo-wind':
      fireYasuoTornado(ctx, f, angle, form);
      break;
    case 'ahri-orb':
      fireAhriBoomerangOrb(ctx, f, angle, form);
      break;
    case 'jinx-rocket':
      fireJinxRocket(ctx, f, angle, form);
      break;
    case 'gaster-blaster':
      fireSansGasterBlaster(ctx, f, angle, form);
      break;
    case 'pikachu-thunder':
      triggerPikachuThunder(ctx, f, angle, form);
      break;
    case 'sonic-spindash':
      triggerSonicSpinDash(ctx, f, angle, form);
      break;
    case 'judgment-cut':
      triggerVergilJudgmentCut(ctx, f, form);
      break;
    case 'blades-of-chaos':
      triggerKratosSpartanRage(ctx, f, form);
      break;
  }
}

/* ==================== SHARED ORBIT / ANTI-PROJECTILE PASSIVES ==================== */
function updateOrbitWeaponDamage(
  ctx: AbilityContext,
  f: FighterState,
  form: FormConfig,
  bladeCount: number,
  extraReach: number,
  baseDmg: number,
  sfx: 'slash' | 'hit',
  allowLifesteal = false,
): void {
  const orbitDist = f.radius + extraReach + form.powerLevel * 1.2;
  const enemies = ctx.getEnemies(f);

  for (let b = 0; b < bladeCount; b++) {
    const a = f.orbitAngle + (b * Math.PI * 2) / bladeCount;
    const bx = f.x + Math.cos(a) * orbitDist;
    const by = f.y + Math.sin(a) * orbitDist;

    for (const enemy of enemies) {
      if (f.orbitHitCooldowns[enemy.uid]) continue;
      if (Math.hypot(enemy.x - bx, enemy.y - by) <= enemy.radius + 14) {
        f.orbitHitCooldowns[enemy.uid] = 0.34;
        const raw = ctx.getEffectiveDamage(f, baseDmg + form.powerLevel * 0.9);
        const dir = normalize(enemy.x - f.x, enemy.y - f.y);
        ctx.applyDamage(f, enemy, raw, dir.x * 220, dir.y * 220, {
          sourceKind: 'ability',
          allowLifesteal,
        });
        ctx.emitSfx({ type: sfx, intensity: 0.85 });
        ctx.spawnParticles(bx, by, 7, form.auraColor, 90, 240, 2, 4, 'spark');
      }
    }
  }
}

function updateProjectileDestroyerAura(
  ctx: AbilityContext,
  f: FighterState,
  reach: number,
  label: string,
): void {
  for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
    const p = ctx.projectiles[i];
    if (p.ownerUid === f.uid) continue;
    if (f.teamId !== null && p.teamId === f.teamId) continue;
    if (Math.hypot(p.x - f.x, p.y - f.y) <= reach + p.radius) {
      ctx.spawnShockwave(p.x, p.y, 44, '#f8fafc', 3);
      ctx.spawnParticles(p.x, p.y, 10, p.color, 90, 250, 2, 4.5, 'spark');
      ctx.spawnFloatingText(f.x, f.y - f.radius - 14, label, '#e2e8f0', 'callout');
      ctx.emitSfx({ type: 'slash', intensity: 0.9 });
      ctx.projectiles.splice(i, 1);
    }
  }
}

/* ==================== ORIGINAL 12 ABILITIES ==================== */
function fireLuffyRicochetArm(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const isGear5 = form.visualVariant === 'gear5';
  const bounces = isGear5 ? 7 : Math.min(5, form.powerLevel + 1);
  const speed = isGear5 ? 1280 : 880 + form.powerLevel * 70;
  const startX = f.x + Math.cos(angle) * (f.radius + 4);
  const startY = f.y + Math.sin(angle) * (f.radius + 4);

  ctx.ricochetArms.push({
    id: ctx.nextId('arm'),
    ownerUid: f.uid,
    teamId: f.teamId,
    points: [
      { x: f.x, y: f.y },
      { x: startX, y: startY },
    ],
    headX: startX,
    headY: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    bouncesLeft: bounces,
    phase: 'extend',
    life: isGear5 ? 1.45 : 1.05,
    maxLife: isGear5 ? 1.45 : 1.05,
    damage: ctx.getEffectiveDamage(f, 7.5 + form.powerLevel * 1.9),
    color: isGear5 ? '#ffffff' : form.visualVariant === 'haki' ? '#1e1b4b' : '#f5cfa8',
    glowColor: isGear5 ? '#e9d5ff' : form.auraColor,
    isGear5,
    hitCooldowns: {},
  });

  ctx.emitSfx({ type: 'hit', intensity: isGear5 ? 1.2 : 0.85 });
  ctx.spawnParticles(startX, startY, isGear5 ? 12 : 6, form.auraColor, 90, 240, 2, 4.5, 'spark');
}

function fireKamehameha(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  const isUI = form.visualVariant === 'ui';
  const isBlue = form.visualVariant === 'ssb';
  const width = 22 + form.powerLevel * 5.5;
  const maxLife = 0.56 + form.powerLevel * 0.05;

  ctx.beams.push({
    id: ctx.nextId('beam'),
    ownerUid: f.uid,
    teamId: f.teamId,
    originX: f.x,
    originY: f.y,
    angle: f.abilityTargetAngle,
    width,
    damagePerTick: ctx.getEffectiveDamage(f, 3.8 + form.powerLevel * 0.85),
    color: isUI ? '#e2e8f0' : isBlue ? '#0ea5e9' : '#38bdf8',
    coreColor: '#ffffff',
    life: maxLife,
    maxLife,
    tickTimer: 0,
    powerLevel: form.powerLevel,
    style: 'kamehameha',
  });

  f.vx -= Math.cos(f.abilityTargetAngle) * 190;
  f.vy -= Math.sin(f.abilityTargetAngle) * 190;
  ctx.addScreenShake(6 + form.powerLevel * 1.4);
  ctx.emitSfx({ type: 'beam-fire', intensity: 0.9 + form.powerLevel * 0.12 });
  ctx.spawnShockwave(f.x, f.y, f.radius * 2.5, '#38bdf8', 4);
}

function fireFinalFlash(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  const isEgo = form.visualVariant === 'ego';
  const width = 24 + form.powerLevel * 5.8;
  const maxLife = 0.54 + form.powerLevel * 0.05;
  const color = isEgo ? '#a855f7' : form.visualVariant === 'ssbe' ? '#2563eb' : '#facc15';

  ctx.beams.push({
    id: ctx.nextId('beam'),
    ownerUid: f.uid,
    teamId: f.teamId,
    originX: f.x,
    originY: f.y,
    angle: f.abilityTargetAngle,
    width,
    damagePerTick: ctx.getEffectiveDamage(f, 4.1 + form.powerLevel * 0.9),
    color,
    coreColor: '#ffffff',
    life: maxLife,
    maxLife,
    tickTimer: 0,
    powerLevel: form.powerLevel,
    style: 'final-flash',
  });

  f.vx -= Math.cos(f.abilityTargetAngle) * 200;
  f.vy -= Math.sin(f.abilityTargetAngle) * 200;
  ctx.addScreenShake(7 + form.powerLevel * 1.3);
  ctx.emitSfx({ type: 'beam-fire', intensity: 1.05 });
  ctx.spawnShockwave(f.x, f.y, f.radius * 2.6, color, 4);
}

function triggerNarutoRasenganAndClones(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const dashSpeed = 540 + form.powerLevel * 45;
  f.vx = Math.cos(angle) * dashSpeed;
  f.vy = Math.sin(angle) * dashSpeed;
  f.rasenganDashTimer = 0.58;
  spawnShadowClones(ctx, f, form, form.powerLevel >= 2 ? 2 : 1);
  ctx.spawnShockwave(f.x, f.y, f.radius * 2.2, '#38bdf8', 3.5);
  ctx.emitSfx({ type: 'hit', intensity: 0.95 });
}

function spawnShadowClones(
  ctx: AbilityContext,
  f: FighterState,
  form: FormConfig,
  count: number,
): void {
  const existing = ctx.minions.filter((m) => m.ownerUid === f.uid && m.kind === 'clone').length;
  const toSpawn = Math.max(0, Math.min(count, 4 - existing));
  for (let i = 0; i < toSpawn; i++) {
    const spread = (Math.random() - 0.5) * Math.PI * 1.6;
    const speed = 340 + Math.random() * 110;
    const ox = Math.max(
      ctx.bounds.left + 18,
      Math.min(ctx.bounds.right - 18, f.x + Math.cos(spread) * (f.radius + 14)),
    );
    const oy = Math.max(
      ctx.bounds.top + 18,
      Math.min(ctx.bounds.bottom - 18, f.y + Math.sin(spread) * (f.radius + 14)),
    );
    ctx.minions.push({
      id: ctx.nextId('clone'),
      ownerUid: f.uid,
      ownerCharId: f.character.id,
      teamId: f.teamId,
      kind: 'clone',
      x: ox,
      y: oy,
      vx: Math.cos(spread) * speed,
      vy: Math.sin(spread) * speed,
      radius: 14,
      hp: 16 + form.powerLevel * 4,
      maxHp: 16 + form.powerLevel * 4,
      damage: ctx.getEffectiveDamage(f, 4.4 + form.powerLevel * 0.8),
      life: 5.5,
      maxLife: 5.5,
      color: f.character.primaryColor,
      accentColor: form.auraColor,
      hitCooldowns: {},
    });
    ctx.spawnParticles(ox, oy, 8, '#e2e8f0', 40, 140, 3, 6, 'circle');
  }
}

function updateGojoInfinityPassive(
  ctx: AbilityContext,
  f: FighterState,
  form: FormConfig,
  dt: number,
): void {
  f.infinityPulseTimer -= dt;
  if (f.infinityPulseTimer > 0) return;

  const repelRange = f.radius * 3.0 + form.powerLevel * 10;
  let triggered = false;
  for (const enemy of ctx.getEnemies(f)) {
    const dx = enemy.x - f.x;
    const dy = enemy.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist < repelRange && dist > 0.01) {
      const push = 310 + form.powerLevel * 38;
      enemy.vx += (dx / dist) * push;
      enemy.vy += (dy / dist) * push;
      triggered = true;
    }
  }
  for (const proj of ctx.projectiles) {
    if (proj.ownerUid === f.uid) continue;
    if (f.teamId !== null && proj.teamId === f.teamId) continue;
    const dx = proj.x - f.x;
    const dy = proj.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist < repelRange + proj.radius && dist > 0.01) {
      const speed = Math.hypot(proj.vx, proj.vy);
      proj.vx = (dx / dist) * speed;
      proj.vy = (dy / dist) * speed;
      proj.angle = Math.atan2(proj.vy, proj.vx);
      triggered = true;
    }
  }
  if (triggered) {
    f.infinityPulseTimer = Math.max(1.3, 2.35 - form.powerLevel * 0.18);
    ctx.spawnShockwave(f.x, f.y, repelRange, form.auraColor, 3);
    ctx.emitSfx({ type: 'dodge' });
  }
}

function fireGojoOrb(ctx: AbilityContext, f: FighterState, angle: number, form: FormConfig): void {
  const isPurple = form.powerLevel >= 3;
  const speed = isPurple ? 330 : 460;
  const radius = isPurple ? 32 + form.powerLevel * 2.5 : 19;
  ctx.projectiles.push({
    id: ctx.nextId('proj'),
    ownerUid: f.uid,
    teamId: f.teamId,
    kind: isPurple ? 'purple' : 'red',
    x: f.x + Math.cos(angle) * (f.radius + radius * 0.6),
    y: f.y + Math.sin(angle) * (f.radius + radius * 0.6),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
    damage: ctx.getEffectiveDamage(
      f,
      isPurple ? 10.5 + form.powerLevel * 1.8 : 8.5 + form.powerLevel * 1.4,
    ),
    knockback: isPurple ? 380 : 320,
    color: isPurple ? '#a855f7' : '#f43f5e',
    secondaryColor: isPurple ? '#e879f9' : '#fda4af',
    angle,
    life: isPurple ? 2.5 : 1.7,
    maxLife: isPurple ? 2.5 : 1.7,
    piercing: isPurple,
    hitCooldowns: {},
    powerLevel: form.powerLevel,
  });
  ctx.emitSfx({ type: isPurple ? 'beam-fire' : 'hit', intensity: isPurple ? 1.15 : 0.95 });
  ctx.spawnShockwave(f.x, f.y, f.radius * 2.3, isPurple ? '#a855f7' : '#f43f5e', 3.5);
  if (isPurple) ctx.addScreenShake(5);
}

function triggerSukunaSlashes(
  ctx: AbilityContext,
  f: FighterState,
  form: FormConfig,
  slashCount: number,
): void {
  const enemies = ctx.getEnemies(f);
  const { left, right, top, bottom } = ctx.bounds;
  const span = Math.max(right - left, bottom - top);

  for (let i = 0; i < slashCount; i++) {
    const focus = enemies.length > 0 ? enemies[i % enemies.length] : f;
    const wideArea = form.powerLevel >= 5 && i >= 3;
    const cx = wideArea
      ? left + 40 + Math.random() * (right - left - 80)
      : focus.x + (Math.random() - 0.5) * 90;
    const cy = wideArea
      ? top + 40 + Math.random() * (bottom - top - 80)
      : focus.y + (Math.random() - 0.5) * 90;
    const ang = (Math.PI / slashCount) * i + (Math.random() - 0.5) * 0.7;
    const halfLen = span * (form.powerLevel >= 5 ? 0.44 : 0.32);

    ctx.slashes.push({
      id: ctx.nextId('sl'),
      ownerUid: f.uid,
      teamId: f.teamId,
      x1: cx - Math.cos(ang) * halfLen,
      y1: cy - Math.sin(ang) * halfLen,
      x2: cx + Math.cos(ang) * halfLen,
      y2: cy + Math.sin(ang) * halfLen,
      color: form.auraColor,
      coreColor: '#ffffff',
      width: 5 + form.powerLevel * 0.9,
      telegraphTimer: 0.22 + i * 0.035,
      activeTimer: 0.09,
      fadeTimer: 0.24,
      maxFade: 0.24,
      damage: ctx.getEffectiveDamage(f, 5.5 + form.powerLevel * 1.15),
      hasStruck: false,
    });
  }
  ctx.emitSfx({ type: 'slash', intensity: 1.0 + form.powerLevel * 0.1 });
  if (form.powerLevel >= 5) {
    ctx.spawnShockwave(f.x, f.y, 195, form.auraColor, 4);
  }
}

function fireZoroSwordWave(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const count = form.visualVariant === 'kinghell' ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const a = angle + (count === 2 ? (i === 0 ? -0.16 : 0.16) : 0);
    const speed = 530 + form.powerLevel * 38;
    ctx.projectiles.push({
      id: ctx.nextId('proj'),
      ownerUid: f.uid,
      teamId: f.teamId,
      kind: 'sword-wave',
      x: f.x + Math.cos(a) * (f.radius + 14),
      y: f.y + Math.sin(a) * (f.radius + 14),
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      radius: 22 + form.powerLevel * 2,
      damage: ctx.getEffectiveDamage(f, 8.2 + form.powerLevel * 1.5),
      knockback: 290,
      color: form.auraColor,
      secondaryColor: form.auraSecondaryColor ?? '#bbf7d0',
      angle: a,
      life: 1.5,
      maxLife: 1.5,
      piercing: true,
      hitCooldowns: {},
      powerLevel: form.powerLevel,
    });
  }
  ctx.emitSfx({ type: 'slash', intensity: 1.1 });
}

function updateTrailEmitter(
  ctx: AbilityContext,
  f: FighterState,
  form: FormConfig,
  dt: number,
): void {
  f.trailDropTimer -= dt;
  if (f.trailDropTimer > 0) return;
  f.trailDropTimer = f.character.id === 'sasuke' ? 0.14 : 0.095;

  let element: TrailNode['element'] = 'water';
  if (f.character.id === 'sasuke') {
    element = 'amaterasu';
  } else if (form.visualVariant === 'mark') {
    element = 'sun';
  } else if (form.visualVariant === 'hinokami') {
    element = 'fire';
  }

  ctx.trails.push({
    id: ctx.nextId('tr'),
    ownerUid: f.uid,
    teamId: f.teamId,
    x: f.x,
    y: f.y,
    radius: 17 + form.powerLevel * 2.0,
    life: element === 'water' ? 2.4 : 3.0,
    maxLife: element === 'water' ? 2.4 : 3.0,
    damagePerTick: ctx.getEffectiveDamage(f, 3.2 + form.powerLevel * 0.7),
    element,
    hitCooldowns: {},
  });

  const myTrails = ctx.trails.filter((t) => t.ownerUid === f.uid);
  if (myTrails.length > 32) {
    const idx = ctx.trails.findIndex((t) => t.id === myTrails[0].id);
    if (idx !== -1) ctx.trails.splice(idx, 1);
  }
}

function triggerDashSurge(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
  baseSpeed: number,
): void {
  const speed = baseSpeed + form.powerLevel * 42;
  f.vx = Math.cos(angle) * speed;
  f.vy = Math.sin(angle) * speed;
  ctx.spawnShockwave(f.x, f.y, f.radius * 2.3, form.auraColor, 3.5);
  ctx.spawnParticles(f.x, f.y, 12, form.auraColor, 80, 240, 2.5, 5.5, 'spark');
  ctx.emitSfx({ type: 'slash', intensity: 0.95 });
}

function fireIchigoGetsuga(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const count = form.visualVariant === 'truebankai' ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const a = angle + (count === 2 ? (i === 0 ? -0.14 : 0.14) : 0);
    const speed = 640 + form.powerLevel * 45;
    ctx.projectiles.push({
      id: ctx.nextId('proj'),
      ownerUid: f.uid,
      teamId: f.teamId,
      kind: 'getsuga',
      x: f.x + Math.cos(a) * (f.radius + 16),
      y: f.y + Math.sin(a) * (f.radius + 16),
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      radius: 26 + form.powerLevel * 2.5,
      damage: ctx.getEffectiveDamage(f, 8.6 + form.powerLevel * 1.5),
      knockback: 310,
      color: form.auraColor,
      secondaryColor: form.auraSecondaryColor ?? '#111827',
      angle: a,
      life: 1.4,
      maxLife: 1.4,
      piercing: true,
      hitCooldowns: {},
      powerLevel: form.powerLevel,
    });
  }
  f.afterimages.push({
    x: f.x,
    y: f.y,
    alpha: 0.65,
    color: form.auraColor,
    formIndex: f.formIndex,
  });
  ctx.emitSfx({ type: 'slash', intensity: 1.15 });
}

function triggerSaitamaSeriousPunch(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const isSerious = form.visualVariant === 'serious';
  const shockRadius = isSerious ? 245 : 185;
  const punchX = f.x + Math.cos(angle) * (f.radius + 18);
  const punchY = f.y + Math.sin(angle) * (f.radius + 18);

  ctx.spawnShockwave(
    punchX,
    punchY,
    shockRadius,
    isSerious ? '#ef4444' : '#facc15',
    isSerious ? 7 : 5,
  );
  ctx.spawnShockwave(punchX, punchY, shockRadius * 0.65, '#ffffff', 3);
  ctx.spawnParticles(
    punchX,
    punchY,
    isSerious ? 28 : 16,
    isSerious ? '#ef4444' : '#facc15',
    160,
    480,
    3,
    7,
    'spark',
  );

  let hitAny = false;
  for (const enemy of ctx.getEnemies(f)) {
    const dx = enemy.x - f.x;
    const dy = enemy.y - f.y;
    const dist = Math.hypot(dx, dy);
    const dir = normalize(dx, dy);
    const align = dir.x * Math.cos(angle) + dir.y * Math.sin(angle);
    if (dist <= shockRadius || (dist < shockRadius * 1.45 && align > 0.55)) {
      hitAny = true;
      const blastPower = isSerious ? 860 : 640;
      const raw = ctx.getEffectiveDamage(f, isSerious ? 17.5 : 12.0);
      ctx.applyDamage(f, enemy, raw, dir.x * blastPower, dir.y * blastPower, {
        isCrit: isSerious,
        sourceKind: 'ability',
      });
    }
  }
  f.rageProgress = 0;
  ctx.addScreenShake(isSerious ? 14 : 9);
  ctx.emitSfx({ type: 'crit', intensity: isSerious ? 1.4 : 1.05 });
  if (hitAny && isSerious) {
    ctx.addHitstop(0.065);
    ctx.spawnFloatingText(f.x, f.y - f.radius - 20, 'SERIOUS PUNCH!', '#facc15', 'callout');
  }
}

function triggerLeviOdmGrapple(
  ctx: AbilityContext,
  f: FighterState,
  target: FighterState,
  form: FormConfig,
): void {
  const dir = normalize(target.x - f.x, target.y - f.y);
  const anchor = raycastToBounds(f.x, f.y, dir.x, dir.y, ctx.bounds);
  const zipSpeed = form.visualVariant === 'ackerman' ? 960 : 780;
  f.odmAnchorX = anchor.x;
  f.odmAnchorY = anchor.y;
  f.odmDashVx = dir.x * zipSpeed;
  f.odmDashVy = dir.y * zipSpeed;
  f.odmActiveTimer = 0.36;
  f.odmHitCooldowns = {};
  ctx.emitSfx({ type: 'slash', intensity: 1.0 });
  ctx.spawnParticles(anchor.x, anchor.y, 7, '#e2e8f0', 60, 180, 2, 3.5, 'spark');
}

function summonShadowSoldiers(
  ctx: AbilityContext,
  f: FighterState,
  form: FormConfig,
  count: number,
  originX: number,
  originY: number,
): void {
  const existing = ctx.minions.filter((m) => m.ownerUid === f.uid && m.kind === 'shadow').length;
  const toSpawn = Math.max(0, Math.min(count, 5 - existing));
  if (toSpawn <= 0) return;

  for (let i = 0; i < toSpawn; i++) {
    const a = (Math.PI * 2 * i) / toSpawn + Math.random() * 0.7;
    const sx = Math.max(
      ctx.bounds.left + 18,
      Math.min(ctx.bounds.right - 18, originX + Math.cos(a) * (f.radius + 16)),
    );
    const sy = Math.max(
      ctx.bounds.top + 18,
      Math.min(ctx.bounds.bottom - 18, originY + Math.sin(a) * (f.radius + 16)),
    );
    ctx.minions.push({
      id: ctx.nextId('shd'),
      ownerUid: f.uid,
      ownerCharId: f.character.id,
      teamId: f.teamId,
      kind: 'shadow',
      x: sx,
      y: sy,
      vx: Math.cos(a) * 260,
      vy: Math.sin(a) * 260,
      radius: 13 + (form.powerLevel >= 4 ? 2 : 0),
      hp: 18 + form.powerLevel * 5,
      maxHp: 18 + form.powerLevel * 5,
      damage: ctx.getEffectiveDamage(f, 4.6 + form.powerLevel * 0.85),
      life: 7.5,
      maxLife: 7.5,
      color: '#1e1b4b',
      accentColor: form.auraColor,
      hitCooldowns: {},
    });
    ctx.spawnParticles(sx, sy, 9, form.auraColor, 40, 170, 2.5, 5, 'circle');
  }
  ctx.spawnShockwave(originX, originY, 75, form.auraColor, 3);
  ctx.emitSfx({ type: 'powerup' });
}

function updateDenjiChainsawRim(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  const reach =
    f.radius + (form.visualVariant === 'herohell' ? 18 : form.visualVariant === 'hybrid' ? 14 : 9);
  for (const enemy of ctx.getEnemies(f)) {
    if (f.chainsawHitCooldowns[enemy.uid]) continue;
    if (Math.hypot(enemy.x - f.x, enemy.y - f.y) <= reach + enemy.radius) {
      f.chainsawHitCooldowns[enemy.uid] = 0.28;
      const raw = ctx.getEffectiveDamage(f, 3.8 + form.powerLevel * 0.85);
      const dir = normalize(enemy.x - f.x, enemy.y - f.y);
      ctx.applyDamage(f, enemy, raw, dir.x * 130, dir.y * 130, {
        sourceKind: 'ability',
        allowLifesteal: true,
      });
      ctx.emitSfx({ type: 'slash', intensity: 0.7 });
      ctx.spawnParticles(
        (f.x + enemy.x) / 2,
        (f.y + enemy.y) / 2,
        6,
        '#ef4444',
        70,
        210,
        2,
        4,
        'spark',
      );
    }
  }
}

/* ==================== NEW ANIME & GAME ABILITIES ==================== */
function triggerChidoriLightning(
  ctx: AbilityContext,
  f: FighterState,
  target: FighterState,
  angle: number,
  form: FormConfig,
): void {
  // Chidori dash toward target + crackling chain bolt!
  f.vx = Math.cos(angle) * (540 + form.powerLevel * 42);
  f.vy = Math.sin(angle) * (540 + form.powerLevel * 42);
  f.rasenganDashTimer = 0.45;
  const color = form.powerLevel >= 3 ? '#a855f7' : '#38bdf8';
  triggerLightningStrike(ctx, f, form, form.powerLevel >= 4 ? 2 : 1, color, false, target);
}

function triggerLightningStrike(
  ctx: AbilityContext,
  f: FighterState,
  form: FormConfig,
  maxTargets: number,
  color: string,
  dashFirst: boolean,
  priorityTarget?: FighterState,
): void {
  const enemies = ctx
    .getEnemies(f)
    .sort((a, b) => Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y));
  const targets = priorityTarget
    ? [priorityTarget, ...enemies.filter((e) => e.uid !== priorityTarget.uid)].slice(0, maxTargets)
    : enemies.slice(0, maxTargets);

  if (dashFirst && targets[0]) {
    const a = Math.atan2(targets[0].y - f.y, targets[0].x - f.x);
    f.vx = Math.cos(a) * (580 + form.powerLevel * 40);
    f.vy = Math.sin(a) * (580 + form.powerLevel * 40);
  }

  for (const t of targets) {
    const dist = Math.hypot(t.x - f.x, t.y - f.y);
    if (dist > 390) continue;
    ctx.lightningBolts.push({
      id: ctx.nextId('bolt'),
      ownerCharId: f.character.id,
      ownerSeries: f.character.series,
      points: createJaggedBoltPoints(f.x, f.y, t.x, t.y, 7),
      color,
      coreColor: '#ffffff',
      width: 4.5 + form.powerLevel * 0.8,
      life: 0.28,
      maxLife: 0.28,
    });
    const dir = normalize(t.x - f.x, t.y - f.y);
    const raw = ctx.getEffectiveDamage(f, 7.6 + form.powerLevel * 1.45);
    ctx.applyDamage(f, t, raw, dir.x * 230, dir.y * 230, { sourceKind: 'ability' });
    ctx.spawnSeriesParticles(f, t.x, t.y, 12, color, 90, 280);
  }
  ctx.emitSfx({ type: 'crit', intensity: 0.85 });
  ctx.addScreenShake(5);
}

function triggerTitanSeismicSlam(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  const slamR = 175 + form.powerLevel * 18;
  ctx.spawnShockwave(f.x, f.y, slamR, form.auraColor, 6);
  ctx.spawnShockwave(f.x, f.y, slamR * 0.6, '#ffffff', 3);
  ctx.spawnParticles(f.x, f.y, 20, form.auraColor, 110, 340, 3, 7, 'shard');

  for (const enemy of ctx.getEnemies(f)) {
    const dx = enemy.x - f.x;
    const dy = enemy.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= slamR) {
      const dir = normalize(dx, dy);
      const raw = ctx.getEffectiveDamage(f, 10.5 + form.powerLevel * 1.8);
      ctx.applyDamage(f, enemy, raw, dir.x * 540, dir.y * 540, {
        isCrit: form.powerLevel >= 4,
        sourceKind: 'ability',
      });
    }
  }
  ctx.addScreenShake(9 + form.powerLevel);
  ctx.emitSfx({ type: 'crit', intensity: 1.15 });
}

function fireMadaraMeteor(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const radius = 26 + form.powerLevel * 3;
  const speed = 310 + form.powerLevel * 22;
  ctx.projectiles.push({
    id: ctx.nextId('proj'),
    ownerUid: f.uid,
    teamId: f.teamId,
    kind: 'meteor',
    x: f.x + Math.cos(angle) * (f.radius + radius * 0.5),
    y: f.y + Math.sin(angle) * (f.radius + radius * 0.5),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
    damage: ctx.getEffectiveDamage(f, 10.2 + form.powerLevel * 1.8),
    knockback: 420,
    color: form.visualVariant === 'juubi' ? '#18181b' : '#b45309',
    secondaryColor: form.auraColor,
    angle,
    life: 2.3,
    maxLife: 2.3,
    piercing: false,
    explosiveRadius: 115 + form.powerLevel * 12,
    hitCooldowns: {},
    powerLevel: form.powerLevel,
  });
  ctx.emitSfx({ type: 'beam-fire', intensity: 1.0 });
  ctx.addScreenShake(6);
}

function triggerBlackwhipSmash(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  // Launches black-teal ricocheting Blackwhip tendril + forward wind burst!
  const bounces = Math.min(4, form.powerLevel + 1);
  const speed = 980 + form.powerLevel * 60;
  const sx = f.x + Math.cos(angle) * (f.radius + 4);
  const sy = f.y + Math.sin(angle) * (f.radius + 4);
  ctx.ricochetArms.push({
    id: ctx.nextId('arm'),
    ownerUid: f.uid,
    teamId: f.teamId,
    points: [
      { x: f.x, y: f.y },
      { x: sx, y: sy },
    ],
    headX: sx,
    headY: sy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    bouncesLeft: bounces,
    phase: 'extend',
    life: 0.95,
    maxLife: 0.95,
    damage: ctx.getEffectiveDamage(f, 7.6 + form.powerLevel * 1.5),
    color: '#09090b',
    glowColor: form.auraColor,
    isGear5: form.powerLevel >= 5,
    hitCooldowns: {},
  });
  f.vx += Math.cos(angle) * 260;
  f.vy += Math.sin(angle) * 260;
  ctx.spawnShockwave(f.x, f.y, 115, form.auraColor, 3.5);
  ctx.emitSfx({ type: 'hit', intensity: 1.0 });
}

function triggerGravityVortex(
  ctx: AbilityContext,
  f: FighterState,
  form: FormConfig,
  isRimuru: boolean,
): void {
  const range = 225 + form.powerLevel * 20;
  ctx.spawnShockwave(f.x, f.y, range, form.auraColor, 5);
  ctx.spawnShockwave(f.x, f.y, range * 0.55, '#09090b', 4);
  ctx.spawnParticles(f.x, f.y, 22, form.auraColor, 80, 260, 2.5, 5.5, 'circle');

  for (const enemy of ctx.getEnemies(f)) {
    const dx = enemy.x - f.x;
    const dy = enemy.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= range && dist > 1) {
      const dir = normalize(dx, dy);
      // Rimuru pulls in & drains HP; Mob violently flings targets sideways/outward!
      const force = isRimuru ? -360 : 560;
      const raw = ctx.getEffectiveDamage(f, 8.8 + form.powerLevel * 1.6);
      ctx.applyDamage(f, enemy, raw, dir.x * force, dir.y * force, {
        sourceKind: 'ability',
        allowLifesteal: isRimuru,
      });
    }
  }

  // Mob reverses nearby enemy projectiles back at enemies!
  if (!isRimuru) {
    for (const p of ctx.projectiles) {
      if (p.ownerUid === f.uid) continue;
      if (f.teamId !== null && p.teamId === f.teamId) continue;
      if (Math.hypot(p.x - f.x, p.y - f.y) <= range) {
        p.vx = -p.vx * 1.15;
        p.vy = -p.vy * 1.15;
        p.ownerUid = f.uid;
        p.teamId = f.teamId;
        p.angle = Math.atan2(p.vy, p.vx);
      }
    }
  }

  ctx.addScreenShake(7 + form.powerLevel);
  ctx.emitSfx({ type: 'beam-fire', intensity: 0.9 });
}

function fireAntiMagicSlash(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const speed = 580 + form.powerLevel * 38;
  ctx.projectiles.push({
    id: ctx.nextId('proj'),
    ownerUid: f.uid,
    teamId: f.teamId,
    kind: 'getsuga',
    x: f.x + Math.cos(angle) * (f.radius + 16),
    y: f.y + Math.sin(angle) * (f.radius + 16),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 26 + form.powerLevel * 2,
    damage: ctx.getEffectiveDamage(f, 8.8 + form.powerLevel * 1.5),
    knockback: 310,
    color: '#ef4444',
    secondaryColor: '#09090b',
    angle,
    life: 1.4,
    maxLife: 1.4,
    piercing: true,
    blocksProjectiles: true,
    hitCooldowns: {},
    powerLevel: form.powerLevel + 1,
  });
  ctx.emitSfx({ type: 'slash', intensity: 1.1 });
}

function fireZoltraakBarrage(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const count = form.powerLevel >= 5 ? 3 : form.powerLevel >= 3 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const spread = count === 1 ? 0 : (i - (count - 1) / 2) * 0.24;
    const a = angle + spread;
    ctx.beams.push({
      id: ctx.nextId('beam'),
      ownerUid: f.uid,
      teamId: f.teamId,
      originX: f.x,
      originY: f.y,
      angle: a,
      width: 14 + form.powerLevel * 2.4,
      damagePerTick: ctx.getEffectiveDamage(f, 3.2 + form.powerLevel * 0.6),
      color: i % 2 === 0 ? '#38bdf8' : '#facc15',
      coreColor: '#ffffff',
      life: 0.36,
      maxLife: 0.36,
      tickTimer: 0,
      powerLevel: form.powerLevel,
      style: 'zoltraak',
    });
  }
  ctx.emitSfx({ type: 'beam-fire', intensity: 0.9 });
  ctx.spawnShockwave(f.x, f.y, f.radius * 2.4, '#facc15', 3);
}

function dropMinecraftTnt(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  const count = form.powerLevel >= 4 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const ox = Math.max(
      ctx.bounds.left + 26,
      Math.min(ctx.bounds.right - 26, f.x + (i === 0 ? 0 : (Math.random() - 0.5) * 90)),
    );
    const oy = Math.max(
      ctx.bounds.top + 26,
      Math.min(ctx.bounds.bottom - 26, f.y + (i === 0 ? 0 : (Math.random() - 0.5) * 90)),
    );
    ctx.bombs.push({
      id: ctx.nextId('tnt'),
      ownerUid: f.uid,
      teamId: f.teamId,
      kind: 'tnt',
      x: ox,
      y: oy,
      radius: 17,
      blastRadius: 145 + form.powerLevel * 16,
      damage: ctx.getEffectiveDamage(f, 11.5 + form.powerLevel * 1.9),
      fuseTimer: 1.05,
      maxFuse: 1.05,
      color: '#ef4444',
    });
  }
  ctx.emitSfx({ type: 'wall', intensity: 1.1 });
  ctx.spawnFloatingText(f.x, f.y - f.radius - 14, 'TNT!', '#ef4444', 'callout');
}

function detonateCreeperBlast(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  const isCharged = form.visualVariant === 'charged';
  const blastR = isCharged ? 235 : 175;
  ctx.spawnShockwave(f.x, f.y, blastR, isCharged ? '#38bdf8' : '#4ade80', isCharged ? 7 : 5);
  ctx.spawnShockwave(f.x, f.y, blastR * 0.6, '#ffffff', 3.5);
  ctx.spawnParticles(
    f.x,
    f.y,
    isCharged ? 30 : 20,
    isCharged ? '#38bdf8' : '#4ade80',
    130,
    420,
    4,
    8,
    'square',
  );
  ctx.spawnFloatingText(
    f.x,
    f.y - f.radius - 16,
    'BOOM!',
    isCharged ? '#38bdf8' : '#4ade80',
    'callout',
  );

  for (const enemy of ctx.getEnemies(f)) {
    const dx = enemy.x - f.x;
    const dy = enemy.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= blastR) {
      const dir = normalize(dx, dy);
      const raw = ctx.getEffectiveDamage(f, isCharged ? 16.5 : 11.5);
      ctx.applyDamage(
        f,
        enemy,
        raw,
        dir.x * (isCharged ? 740 : 540),
        dir.y * (isCharged ? 740 : 540),
        {
          isCrit: isCharged,
          sourceKind: 'ability',
        },
      );
    }
  }
  ctx.addScreenShake(isCharged ? 13 : 9);
  ctx.emitSfx({ type: 'ko' });
}

function fireYasuoTornado(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const speed = 470 + form.powerLevel * 35;
  ctx.projectiles.push({
    id: ctx.nextId('proj'),
    ownerUid: f.uid,
    teamId: f.teamId,
    kind: 'tornado',
    x: f.x + Math.cos(angle) * (f.radius + 18),
    y: f.y + Math.sin(angle) * (f.radius + 18),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 26 + form.powerLevel * 2.5,
    damage: ctx.getEffectiveDamage(f, 8.4 + form.powerLevel * 1.45),
    knockback: 420,
    color: form.auraColor,
    secondaryColor: '#ffffff',
    angle,
    life: 1.9,
    maxLife: 1.9,
    piercing: true,
    blocksProjectiles: true,
    hitCooldowns: {},
    powerLevel: form.powerLevel,
  });
  // Sweeping blade dash
  f.vx = Math.cos(angle) * 480;
  f.vy = Math.sin(angle) * 480;
  ctx.emitSfx({ type: 'slash', intensity: 1.1 });
  ctx.spawnFloatingText(f.x, f.y - f.radius - 14, 'HASAGI!', form.auraColor, 'callout');
}

function fireAhriBoomerangOrb(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const speed = 540 + form.powerLevel * 28;
  ctx.projectiles.push({
    id: ctx.nextId('proj'),
    ownerUid: f.uid,
    teamId: f.teamId,
    kind: 'boomerang',
    x: f.x + Math.cos(angle) * (f.radius + 14),
    y: f.y + Math.sin(angle) * (f.radius + 14),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 17 + form.powerLevel * 1.4,
    damage: ctx.getEffectiveDamage(f, 7.6 + form.powerLevel * 1.3),
    knockback: 220,
    color: form.auraColor,
    secondaryColor: '#ffffff',
    angle,
    life: 1.85,
    maxLife: 1.85,
    piercing: true,
    boomerang: true,
    returning: false,
    hitCooldowns: {},
    powerLevel: form.powerLevel,
  });

  // Bonus homing Fox-Fire wisps at higher forms
  if (form.powerLevel >= 3) {
    for (const offset of [-0.6, 0.6]) {
      const a = angle + offset;
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        teamId: f.teamId,
        kind: 'foxfire',
        x: f.x + Math.cos(a) * (f.radius + 10),
        y: f.y + Math.sin(a) * (f.radius + 10),
        vx: Math.cos(a) * 380,
        vy: Math.sin(a) * 380,
        radius: 10,
        damage: ctx.getEffectiveDamage(f, 4.6 + form.powerLevel * 0.7),
        knockback: 140,
        color: '#f472b6',
        secondaryColor: '#ffffff',
        angle: a,
        life: 1.6,
        maxLife: 1.6,
        piercing: false,
        homing: true,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
    }
  }
  ctx.emitSfx({ type: 'dodge' });
}

function fireJinxRocket(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const speed = 510 + form.powerLevel * 38;
  ctx.projectiles.push({
    id: ctx.nextId('proj'),
    ownerUid: f.uid,
    teamId: f.teamId,
    kind: 'rocket',
    x: f.x + Math.cos(angle) * (f.radius + 16),
    y: f.y + Math.sin(angle) * (f.radius + 16),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 15 + form.powerLevel * 1.4,
    damage: ctx.getEffectiveDamage(f, 10.5 + form.powerLevel * 1.8),
    knockback: 420,
    color: '#ec4899',
    secondaryColor: '#06b6d4',
    angle,
    life: 2.0,
    maxLife: 2.0,
    piercing: false,
    explosiveRadius: 115 + form.powerLevel * 15,
    hitCooldowns: {},
    powerLevel: form.powerLevel,
  });
  // Recoil hop
  f.vx -= Math.cos(angle) * 180;
  f.vy -= Math.sin(angle) * 180;
  ctx.emitSfx({ type: 'beam-fire', intensity: 0.95 });
}

function fireSansGasterBlaster(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const isBadTime = form.visualVariant === 'badtime';
  const beamCount = isBadTime ? 2 : 1;
  for (let i = 0; i < beamCount; i++) {
    const a = angle + (beamCount === 2 ? (i === 0 ? -0.18 : 0.18) : 0);
    ctx.beams.push({
      id: ctx.nextId('beam'),
      ownerUid: f.uid,
      teamId: f.teamId,
      originX: f.x,
      originY: f.y,
      angle: a,
      width: isBadTime ? 26 : 18,
      damagePerTick: ctx.getEffectiveDamage(f, isBadTime ? 4.4 : 3.2),
      color: isBadTime ? '#38bdf8' : '#e2e8f0',
      coreColor: '#ffffff',
      life: 0.44,
      maxLife: 0.44,
      tickTimer: 0,
      powerLevel: form.powerLevel,
      style: 'gaster',
    });
  }
  // Also toss quick bone slashes in Bad Time
  if (isBadTime) {
    triggerSukunaSlashes(ctx, f, form, 3);
  }
  ctx.emitSfx({ type: 'beam-fire', intensity: 1.05 });
  ctx.addScreenShake(6);
}

function triggerPikachuThunder(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  // Volt Tackle dash + Thunderbolt strike!
  f.vx = Math.cos(angle) * (580 + form.powerLevel * 40);
  f.vy = Math.sin(angle) * (580 + form.powerLevel * 40);
  f.rasenganDashTimer = 0.42;
  triggerLightningStrike(ctx, f, form, form.powerLevel >= 4 ? 3 : 2, '#facc15', false);
}

function triggerSonicSpinDash(
  ctx: AbilityContext,
  f: FighterState,
  angle: number,
  form: FormConfig,
): void {
  const speed = 740 + form.powerLevel * 55;
  f.vx = Math.cos(angle) * speed;
  f.vy = Math.sin(angle) * speed;
  f.spinDashTimer = 0.72;
  ctx.spawnShockwave(f.x, f.y, f.radius * 2.5, form.auraColor, 4);
  ctx.spawnParticles(f.x, f.y, 14, '#facc15', 90, 260, 2.5, 5, 'circle');
  ctx.emitSfx({ type: 'dodge' });
}

function triggerVergilJudgmentCut(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  const count = form.visualVariant === 'sdt' ? 8 : form.visualVariant === 'dt' ? 5 : 3;
  triggerSukunaSlashes(ctx, f, form, count);
  if (form.visualVariant === 'sdt') {
    ctx.spawnFloatingText(f.x, f.y - f.radius - 16, 'JUDGMENT CUT!', '#38bdf8', 'callout');
  }
}

function triggerKratosSpartanRage(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  const blastR = 165 + form.powerLevel * 18;
  ctx.spawnShockwave(f.x, f.y, blastR, '#ef4444', 6);
  ctx.spawnShockwave(f.x, f.y, blastR * 0.65, '#facc15', 3.5);
  ctx.spawnParticles(f.x, f.y, 22, '#f97316', 110, 340, 3, 6.5, 'spark');

  for (const enemy of ctx.getEnemies(f)) {
    const dx = enemy.x - f.x;
    const dy = enemy.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= blastR) {
      const dir = normalize(dx, dy);
      const raw = ctx.getEffectiveDamage(f, 9.8 + form.powerLevel * 1.7);
      ctx.applyDamage(f, enemy, raw, dir.x * 480, dir.y * 480, {
        isCrit: form.powerLevel >= 4,
        sourceKind: 'ability',
        allowLifesteal: true,
      });
    }
  }
  ctx.addScreenShake(8 + form.powerLevel);
  ctx.emitSfx({ type: 'crit', intensity: 1.1 });
}

/* ==================== COMBAT ENTITY UPDATES ==================== */
export function updateProjectiles(ctx: AbilityContext, dt: number): void {
  const { bounds } = ctx;

  for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
    const p = ctx.projectiles[i];
    if (p.frozenTimer && p.frozenTimer > 0) {
      p.frozenTimer = Math.max(0, p.frozenTimer - dt);
      continue;
    }
    p.life -= dt;
    tickCooldownMap(p.hitCooldowns, dt);

    const owner = ctx.fighters.find((f) => f.uid === p.ownerUid) ?? null;

    // Orbital ring phase before launching outward!
    if (p.orbitTimer !== undefined && p.orbitTimer > 0 && owner && owner.alive) {
      p.orbitTimer -= dt;
      p.orbitOffset = (p.orbitOffset ?? 0) + dt * 7.5;
      const orbDist = owner.radius + 32;
      p.x = owner.x + Math.cos(p.orbitOffset) * orbDist;
      p.y = owner.y + Math.sin(p.orbitOffset) * orbDist;
      p.angle = p.orbitOffset + Math.PI / 2;
      if (p.orbitTimer <= 0) {
        const nearest = findNearestEnemyFromPos(ctx, p.ownerUid, p.teamId, p.x, p.y);
        const launchAng = nearest ? Math.atan2(nearest.y - p.y, nearest.x - p.x) : p.orbitOffset;
        p.vx = Math.cos(launchAng) * 560;
        p.vy = Math.sin(launchAng) * 560;
        p.angle = launchAng;
      }
    } else {
      // Ahri Boomerang return curve!
      if (p.boomerang && owner && owner.alive) {
        if (!p.returning && p.life < p.maxLife * 0.56) {
          p.returning = true;
          p.hitCooldowns = {}; // Can strike targets a SECOND time on the return!
        }
        if (p.returning) {
          const dir = normalize(owner.x - p.x, owner.y - p.y);
          const speed = 600;
          p.vx += (dir.x * speed - p.vx) * Math.min(1, dt * 8);
          p.vy += (dir.y * speed - p.vy) * Math.min(1, dt * 8);
          if (Math.hypot(owner.x - p.x, owner.y - p.y) <= owner.radius + p.radius) {
            ctx.projectiles.splice(i, 1);
            continue;
          }
        }
      }

      // Homing steering (Six Eyes Gojo orbs steer fast up to 720 px/s!)
      if (p.homing) {
        const nearest = findNearestEnemyFromPos(ctx, p.ownerUid, p.teamId, p.x, p.y);
        if (nearest) {
          const isGojoOrb = p.ownerCharId === 'gojo';
          const dir = normalize(nearest.x - p.x, nearest.y - p.y);
          const steer = isGojoOrb ? 1550 : 780;
          const cap = isGojoOrb ? 720 : 430;
          p.vx += dir.x * steer * dt;
          p.vy += dir.y * steer * dt;
          const spd = Math.hypot(p.vx, p.vy);
          if (spd > cap) {
            p.vx = (p.vx / spd) * cap;
            p.vy = (p.vy / spd) * cap;
          }
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle = Math.atan2(p.vy, p.vx);
    }

    if (Math.random() < 0.45) {
      ctx.spawnParticles(p.x, p.y, 1, p.color, 20, 90, 2, 4.5, 'circle');
    }

    const outOfBounds =
      p.x + p.radius < bounds.left - 35 ||
      p.x - p.radius > bounds.right + 35 ||
      p.y + p.radius < bounds.top - 35 ||
      p.y - p.radius > bounds.bottom + 35;

    if (!p.piercing) {
      const hitWall =
        p.x - p.radius <= bounds.left ||
        p.x + p.radius >= bounds.right ||
        p.y - p.radius <= bounds.top ||
        p.y + p.radius >= bounds.bottom;
      if (hitWall) {
        if (p.explosiveRadius) {
          detonateExplosiveProjectile(ctx, p, owner);
        } else {
          ctx.spawnShockwave(p.x, p.y, p.radius * 2.5, p.color, 3);
          ctx.spawnParticles(p.x, p.y, 10, p.color, 70, 220, 2.5, 5, 'spark');
        }
        ctx.projectiles.splice(i, 1);
        continue;
      }
    }

    if (p.life <= 0 || outOfBounds) {
      ctx.projectiles.splice(i, 1);
      continue;
    }

    // Hit enemy fighters
    let destroyed = false;
    for (const target of ctx.fighters) {
      if (!target.alive || target.uid === p.ownerUid) continue;
      if (p.teamId !== null && target.teamId === p.teamId) continue;
      if (p.hitCooldowns[target.uid]) continue;

      const dist = Math.hypot(target.x - p.x, target.y - p.y);
      if (dist <= target.radius + p.radius) {
        p.hitCooldowns[target.uid] = p.kind === 'purple' ? 0.24 : 0.45;
        const dir = normalize(p.vx, p.vy);
        // Ahri's Heart (Charm) & Chain Hooks / Tethered skills pull target toward caster!
        const kbDir = p.kind === 'heart' || p.kind === 'anchor-hook' || p.tetherToOwner ? -1.4 : 1;
        ctx.applyDamage(
          owner,
          target,
          p.damage,
          dir.x * p.knockback * kbDir,
          dir.y * p.knockback * kbDir,
          {
            isCrit:
              (p.kind === 'purple' ||
                p.kind === 'rocket' ||
                p.kind === 'meteor' ||
                p.kind === 'sonic-boom' ||
                p.kind === 'wither-skull' ||
                p.kind === 'buster-greatsword' ||
                p.kind === 'magma-orb') &&
              p.powerLevel >= 3,
            bypassInvuln: p.kind === 'sonic-boom' || p.kind === 'void-eye',
            sourceKind: 'ability',
            allowLifesteal:
              p.kind === 'boomerang' ||
              p.kind === 'foxfire' ||
              p.kind === 'heart' ||
              p.kind === 'blood-scythe',
          },
        );
        ctx.spawnParticles(target.x, target.y, 10, p.color, 90, 260, 2.5, 5, 'spark');
        ctx.emitSfx({
          type:
            p.kind === 'getsuga' || p.kind === 'sword-wave' || p.kind === 'tornado'
              ? 'slash'
              : 'hit',
          intensity: 1.05,
        });

        if (!p.piercing) {
          if (p.explosiveRadius) {
            detonateExplosiveProjectile(ctx, p, owner);
          } else {
            ctx.spawnShockwave(p.x, p.y, p.radius * 2.8, p.color, 4);
          }
          destroyed = true;
          break;
        }
      }
    }

    if (destroyed) {
      ctx.projectiles.splice(i, 1);
    }
  }

  // Projectile vs Projectile clashes!
  for (let i = 0; i < ctx.projectiles.length; i++) {
    const a = ctx.projectiles[i];
    for (let j = i + 1; j < ctx.projectiles.length; j++) {
      const b = ctx.projectiles[j];
      if (a.ownerUid === b.ownerUid) continue;
      if (a.teamId !== null && a.teamId === b.teamId) continue;

      if (Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius) {
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        ctx.spawnShockwave(mx, my, 46, '#ffffff', 3);
        ctx.spawnParticles(mx, my, 8, '#f8fafc', 80, 240, 2, 4, 'spark');
        ctx.emitSfx({ type: 'hit', intensity: 0.7 });
        if (a.blocksProjectiles && !b.blocksProjectiles) {
          b.life = 0;
        } else if (b.blocksProjectiles && !a.blocksProjectiles) {
          a.life = 0;
        } else if (a.powerLevel < b.powerLevel) {
          a.life = Math.min(a.life, 0.04);
        } else if (b.powerLevel < a.powerLevel) {
          b.life = Math.min(b.life, 0.04);
        } else {
          const tmpVx = a.vx;
          const tmpVy = a.vy;
          a.vx = -tmpVx * 0.6 + b.vx * 0.4;
          a.vy = -tmpVy * 0.6 + b.vy * 0.4;
          b.vx = -b.vx * 0.6 + tmpVx * 0.4;
          b.vy = -b.vy * 0.6 + tmpVy * 0.4;
          a.life *= 0.6;
          b.life *= 0.6;
        }
      }
    }
  }
}

function detonateExplosiveProjectile(
  ctx: AbilityContext,
  p: Projectile,
  owner: FighterState | null,
): void {
  const blastR = p.explosiveRadius ?? 110;
  ctx.spawnShockwave(p.x, p.y, blastR, p.color, 5);
  ctx.spawnShockwave(p.x, p.y, blastR * 0.6, p.secondaryColor, 3);
  ctx.spawnParticles(p.x, p.y, 20, p.color, 110, 360, 3, 6.5, 'spark');
  ctx.addScreenShake(8);
  ctx.emitSfx({ type: 'crit', intensity: 1.15 });

  for (const target of ctx.fighters) {
    if (!target.alive || target.uid === p.ownerUid) continue;
    if (p.teamId !== null && target.teamId === p.teamId) continue;
    if (p.hitCooldowns[target.uid]) continue;
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= blastR) {
      const dir = normalize(dx, dy);
      ctx.applyDamage(owner, target, p.damage * 0.8, dir.x * 460, dir.y * 460, {
        sourceKind: 'ability',
      });
    }
  }
}

export function updateBombs(ctx: AbilityContext, dt: number): void {
  for (let i = ctx.bombs.length - 1; i >= 0; i--) {
    const b = ctx.bombs[i];
    b.fuseTimer -= dt;
    const owner = ctx.fighters.find((f) => f.uid === b.ownerUid) ?? null;

    // Proximity mines (Chompers, Teemo Mushrooms, Lotus Traps) snap-detonate when an enemy steps close!
    if (
      (b.kind === 'chomper' || b.kind === 'mushroom' || b.kind === 'lotus-trap') &&
      b.fuseTimer > 0.05
    ) {
      const triggered = ctx.fighters.some(
        (t) =>
          t.alive &&
          t.uid !== b.ownerUid &&
          (b.teamId === null || t.teamId !== b.teamId) &&
          Math.hypot(t.x - b.x, t.y - b.y) <= t.radius + b.radius + 20,
      );
      if (triggered) b.fuseTimer = 0;
    }

    // Obsidian Block & Ice Pillar act as physical solid obstacles bouncing enemies before shattering!
    if ((b.kind === 'obsidian-block' || b.kind === 'ice-pillar') && b.fuseTimer > 0) {
      for (const target of ctx.fighters) {
        if (!target.alive || target.uid === b.ownerUid) continue;
        if (b.teamId !== null && target.teamId === b.teamId) continue;
        const dx = target.x - b.x;
        const dy = target.y - b.y;
        const dist = Math.hypot(dx, dy);
        const minDist = target.radius + b.radius + 3;
        if (dist < minDist && dist > 0.01) {
          const nx = dx / dist;
          const ny = dy / dist;
          target.x = b.x + nx * minDist;
          target.y = b.y + ny * minDist;
          target.vx = nx * 420;
          target.vy = ny * 420;
          ctx.applyDamage(owner, target, b.damage * 0.45, nx * 120, ny * 120, {
            sourceKind: 'ability',
          });
          ctx.spawnParticles(
            b.x + nx * b.radius,
            b.y + ny * b.radius,
            8,
            b.kind === 'ice-pillar' ? '#38bdf8' : '#6366f1',
            70,
            220,
            3,
            5,
            'square',
          );
          ctx.emitSfx({ type: 'wall', intensity: 1.2 });
          b.fuseTimer = Math.min(b.fuseTimer, 0.12);
        }
      }
    }

    if (b.fuseTimer > 0) continue;

    const blastColor =
      b.kind === 'chomper'
        ? '#ec4899'
        : b.kind === 'obsidian-block'
          ? '#6366f1'
          : b.kind === 'ice-pillar'
            ? '#38bdf8'
            : b.kind === 'mushroom'
              ? '#a855f7'
              : b.kind === 'lotus-trap'
                ? '#f43f5e'
                : b.kind === 'glitch-bomb'
                  ? '#ff1f5a'
                  : b.color || '#ef4444';
    ctx.spawnShockwave(b.x, b.y, b.blastRadius, blastColor, 6);
    ctx.spawnShockwave(b.x, b.y, b.blastRadius * 0.55, '#facc15', 3.5);
    ctx.spawnParticles(b.x, b.y, 24, blastColor, 120, 380, 4, 8, 'square');
    ctx.spawnParticles(b.x, b.y, 12, '#facc15', 90, 290, 3, 6, 'square');
    ctx.addScreenShake(9.5);
    ctx.emitSfx({ type: 'ko' });

    for (const target of ctx.fighters) {
      if (!target.alive || target.uid === b.ownerUid) continue;
      if (b.teamId !== null && target.teamId === b.teamId) continue;
      const dx = target.x - b.x;
      const dy = target.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= b.blastRadius) {
        const dir = normalize(dx, dy);
        ctx.applyDamage(owner, target, b.damage, dir.x * 580, dir.y * 580, {
          isCrit: true,
          sourceKind: 'ability',
        });
      }
    }
    ctx.bombs.splice(i, 1);
  }
}

export function updateSkyPillars(ctx: AbilityContext, dt: number): void {
  for (let i = ctx.skyPillars.length - 1; i >= 0; i--) {
    const p = ctx.skyPillars[i];
    if (p.telegraphTimer > 0) {
      p.telegraphTimer -= dt;
      continue;
    }

    if (!p.hasStruck) {
      p.hasStruck = true;
      const owner = ctx.fighters.find((f) => f.uid === p.ownerUid) ?? null;
      ctx.spawnShockwave(p.x, p.targetY, 105, p.color, 5);
      ctx.spawnParticles(p.x, p.targetY, 18, p.color, 100, 320, 3, 6, 'spark');
      ctx.addScreenShake(7.5);
      ctx.emitSfx({ type: 'crit', intensity: 1.15 });

      for (const target of ctx.fighters) {
        if (!target.alive || target.uid === p.ownerUid) continue;
        if (p.teamId !== null && target.teamId === p.teamId) continue;
        // Vertical lightning column strikes anything along x-band from sky to targetY!
        const inColumn =
          Math.abs(target.x - p.x) <= target.radius + p.width * 0.65 &&
          target.y <= p.targetY + target.radius + 32;
        if (inColumn) {
          const pushX = target.x >= p.x ? 340 : -340;
          ctx.applyDamage(owner, target, p.damage, pushX, -140, {
            isCrit: true,
            sourceKind: 'ability',
          });
        }
      }
    }

    p.activeTimer -= dt;
    if (p.activeTimer <= 0) {
      ctx.skyPillars.splice(i, 1);
    }
  }
}

export function updateLightningBolts(ctx: AbilityContext, dt: number): void {
  for (let i = ctx.lightningBolts.length - 1; i >= 0; i--) {
    const bolt = ctx.lightningBolts[i];
    bolt.life -= dt;
    if (bolt.life <= 0) {
      ctx.lightningBolts.splice(i, 1);
    }
  }
}

export function updateBeams(ctx: AbilityContext, dt: number): void {
  const span = ctx.bounds.fullSize * 1.6;
  for (let i = ctx.beams.length - 1; i >= 0; i--) {
    const b = ctx.beams[i];
    b.life -= dt;
    b.tickTimer -= dt;

    const owner = ctx.fighters.find((f) => f.uid === b.ownerUid) ?? null;
    if (owner && owner.alive) {
      b.originX = owner.x;
      b.originY = owner.y;
    }

    if (b.life <= 0) {
      ctx.beams.splice(i, 1);
      continue;
    }

    if (b.tickTimer <= 0) {
      b.tickTimer = 0.095;
      const x2 = b.originX + Math.cos(b.angle) * span;
      const y2 = b.originY + Math.sin(b.angle) * span;

      for (const target of ctx.fighters) {
        if (!target.alive || target.uid === b.ownerUid) continue;
        if (b.teamId !== null && target.teamId === b.teamId) continue;

        const d = pointToSegmentDistance(target.x, target.y, b.originX, b.originY, x2, y2);
        if (d <= target.radius + b.width * 0.55) {
          ctx.applyDamage(
            owner,
            target,
            b.damagePerTick,
            Math.cos(b.angle) * 260,
            Math.sin(b.angle) * 260,
            { sourceKind: 'ability', bypassInvuln: true },
          );
          ctx.spawnParticles(target.x, target.y, 4, b.color, 90, 250, 2, 4.5, 'spark');
        }
      }
    }
  }
}

export function updateRicochetArms(ctx: AbilityContext, dt: number): void {
  const { bounds } = ctx;
  for (let i = ctx.ricochetArms.length - 1; i >= 0; i--) {
    const arm = ctx.ricochetArms[i];
    arm.life -= dt;
    tickCooldownMap(arm.hitCooldowns, dt);

    const owner = ctx.fighters.find((f) => f.uid === arm.ownerUid) ?? null;
    if (owner && arm.points.length > 0) {
      arm.points[0].x = owner.x;
      arm.points[0].y = owner.y;
    }

    if (arm.phase === 'extend') {
      arm.headX += arm.vx * dt;
      arm.headY += arm.vy * dt;

      let bounced = false;
      if (arm.headX <= bounds.left + 8) {
        arm.headX = bounds.left + 8;
        arm.vx = Math.abs(arm.vx);
        bounced = true;
      } else if (arm.headX >= bounds.right - 8) {
        arm.headX = bounds.right - 8;
        arm.vx = -Math.abs(arm.vx);
        bounced = true;
      }
      if (arm.headY <= bounds.top + 8) {
        arm.headY = bounds.top + 8;
        arm.vy = Math.abs(arm.vy);
        bounced = true;
      } else if (arm.headY >= bounds.bottom - 8) {
        arm.headY = bounds.bottom - 8;
        arm.vy = -Math.abs(arm.vy);
        bounced = true;
      }

      if (bounced) {
        arm.points[arm.points.length - 1] = { x: arm.headX, y: arm.headY };
        arm.points.push({ x: arm.headX, y: arm.headY });
        const speed = Math.hypot(arm.vx, arm.vy);
        const angle = Math.atan2(arm.vy, arm.vx) + (Math.random() - 0.5) * 0.25;
        arm.vx = Math.cos(angle) * speed;
        arm.vy = Math.sin(angle) * speed;
        arm.bouncesLeft -= 1;
        ctx.spawnParticles(
          arm.headX,
          arm.headY,
          arm.isGear5 ? 8 : 5,
          arm.glowColor,
          60,
          190,
          2,
          4,
          'spark',
        );
        ctx.emitSfx({ type: 'wall', intensity: 0.9 });
        if (arm.bouncesLeft <= 0) arm.phase = 'retract';
      } else {
        arm.points[arm.points.length - 1] = { x: arm.headX, y: arm.headY };
      }

      for (const target of ctx.fighters) {
        if (!target.alive || target.uid === arm.ownerUid) continue;
        if (arm.teamId !== null && target.teamId === arm.teamId) continue;
        if (arm.hitCooldowns[target.uid]) continue;

        let hit = Math.hypot(target.x - arm.headX, target.y - arm.headY) <= target.radius + 16;
        if (!hit && arm.isGear5 && arm.points.length >= 2) {
          for (let s = 1; s < arm.points.length; s++) {
            const p1 = arm.points[s - 1];
            const p2 = arm.points[s];
            if (
              pointToSegmentDistance(target.x, target.y, p1.x, p1.y, p2.x, p2.y) <=
              target.radius + 9
            ) {
              hit = true;
              break;
            }
          }
        }

        if (hit) {
          arm.hitCooldowns[target.uid] = arm.isGear5 ? 0.26 : 0.35;
          const dir = normalize(arm.vx, arm.vy);
          ctx.applyDamage(owner, target, arm.damage, dir.x * 320, dir.y * 320, {
            isCrit: arm.isGear5,
            sourceKind: 'ability',
          });
          ctx.spawnParticles(target.x, target.y, 10, arm.glowColor, 100, 260, 2, 5, 'spark');
          ctx.emitSfx({ type: arm.isGear5 ? 'crit' : 'hit', intensity: 1.0 });
        }
      }
    }

    if (arm.life <= 0) {
      ctx.ricochetArms.splice(i, 1);
    }
  }
}

export function updateSlashes(ctx: AbilityContext, dt: number): void {
  for (let i = ctx.slashes.length - 1; i >= 0; i--) {
    const sl = ctx.slashes[i];
    if (sl.telegraphTimer > 0) {
      sl.telegraphTimer -= dt;
      continue;
    }

    if (!sl.hasStruck) {
      sl.hasStruck = true;
      const owner = ctx.fighters.find((f) => f.uid === sl.ownerUid) ?? null;
      if (sl.damage > 0) {
        ctx.emitSfx({ type: 'slash', intensity: 0.95 });
        for (const target of ctx.fighters) {
          if (!target.alive || target.uid === sl.ownerUid) continue;
          if (sl.teamId !== null && target.teamId === sl.teamId) continue;

          const d = pointToSegmentDistance(target.x, target.y, sl.x1, sl.y1, sl.x2, sl.y2);
          if (d <= target.radius + sl.width * 0.9) {
            const perp = normalize(-(sl.y2 - sl.y1), sl.x2 - sl.x1);
            ctx.applyDamage(owner, target, sl.damage, perp.x * 160, perp.y * 160, {
              sourceKind: 'ability',
              bypassInvuln: true,
            });
            ctx.spawnParticles(target.x, target.y, 8, sl.color, 90, 240, 2, 4, 'spark');
          }
        }
      }
    }

    if (sl.activeTimer > 0) {
      sl.activeTimer -= dt;
    } else {
      sl.fadeTimer -= dt;
      if (sl.fadeTimer <= 0) ctx.slashes.splice(i, 1);
    }
  }
}

export function updateTrails(ctx: AbilityContext, dt: number): void {
  for (let i = ctx.trails.length - 1; i >= 0; i--) {
    const tr = ctx.trails[i];
    tr.life -= dt;
    tickCooldownMap(tr.hitCooldowns, dt);
    if (tr.life <= 0) {
      ctx.trails.splice(i, 1);
      continue;
    }

    const owner = ctx.fighters.find((f) => f.uid === tr.ownerUid) ?? null;
    for (const target of ctx.fighters) {
      if (!target.alive || target.uid === tr.ownerUid) continue;
      if (tr.teamId !== null && target.teamId === tr.teamId) continue;
      if (tr.hitCooldowns[target.uid]) continue;

      if (Math.hypot(target.x - tr.x, target.y - tr.y) <= target.radius + tr.radius * 0.85) {
        for (const other of ctx.trails) {
          if (other.ownerUid === tr.ownerUid) {
            other.hitCooldowns[target.uid] = Math.max(other.hitCooldowns[target.uid] ?? 0, 0.34);
          }
        }
        ctx.applyDamage(owner, target, tr.damagePerTick, 0, 0, { sourceKind: 'dot' });
        const pColor =
          tr.element === 'water'
            ? '#38bdf8'
            : tr.element === 'amaterasu'
              ? '#a855f7'
              : tr.element === 'fire'
                ? '#f97316'
                : '#facc15';
        ctx.spawnParticles(target.x, target.y, 4, pColor, 40, 140, 2, 4, 'circle');
      }
    }
  }
}

export function updateMinions(ctx: AbilityContext, dt: number): void {
  const { bounds } = ctx;
  for (let i = ctx.minions.length - 1; i >= 0; i--) {
    const m = ctx.minions[i];
    m.life -= dt;
    tickCooldownMap(m.hitCooldowns, dt);

    const owner = ctx.fighters.find((f) => f.uid === m.ownerUid) ?? null;
    if (m.life <= 0 || m.hp <= 0 || !owner || !owner.alive) {
      ctx.spawnParticles(
        m.x,
        m.y,
        m.kind === 'ender-dragon' ? 22 : 8,
        m.kind === 'clone' ? '#e2e8f0' : '#c084fc',
        40,
        220,
        2.5,
        6,
        'circle',
      );
      ctx.minions.splice(i, 1);
      continue;
    }

    const nearest = findNearestEnemyFromPos(ctx, m.ownerUid, m.teamId, m.x, m.y);
    if (nearest) {
      const dir = normalize(nearest.x - m.x, nearest.y - m.y);
      const steerForce = m.kind === 'ender-dragon' ? 560 : m.kind === 'shadow' ? 720 : 210;
      m.vx += dir.x * steerForce * dt;
      m.vy += dir.y * steerForce * dt;
    }

    // Ender Dragon wing flap & periodic Dragon Acid Breath attack!
    if (m.kind === 'ender-dragon') {
      m.wingPhase = (m.wingPhase ?? 0) + dt * 11;
      m.attackTimer = (m.attackTimer ?? 0.9) - dt;
      if (m.attackTimer <= 0 && nearest) {
        m.attackTimer = 1.15;
        const a = Math.atan2(nearest.y - m.y, nearest.x - m.x);
        ctx.projectiles.push({
          id: ctx.nextId('drg'),
          ownerUid: m.ownerUid,
          teamId: m.teamId,
          kind: 'dragon-acid',
          x: m.x + Math.cos(a) * (m.radius + 10),
          y: m.y + Math.sin(a) * (m.radius + 10),
          vx: Math.cos(a) * 440,
          vy: Math.sin(a) * 440,
          radius: 15,
          damage: m.damage * 0.95,
          knockback: 260,
          color: '#c084fc',
          secondaryColor: '#f0abfc',
          angle: a,
          life: 1.7,
          maxLife: 1.7,
          piercing: false,
          explosiveRadius: 85,
          hitCooldowns: {},
          powerLevel: 4,
        });
        // Leave lingering Dragon Breath purple acid cloud on the floor!
        ctx.trails.push({
          id: ctx.nextId('tr'),
          ownerUid: m.ownerUid,
          teamId: m.teamId,
          x: m.x,
          y: m.y,
          radius: 26,
          life: 3.4,
          maxLife: 3.4,
          damagePerTick: m.damage * 0.35,
          element: 'dragon-breath',
          hitCooldowns: {},
        });
        ctx.emitSfx({ type: 'beam-fire', intensity: 0.7 });
      }
    }

    const spd = Math.hypot(m.vx, m.vy);
    const maxSpd = m.kind === 'ender-dragon' ? 370 : m.kind === 'shadow' ? 390 : 410;
    const minSpd = 210;
    if (spd > maxSpd) {
      m.vx = (m.vx / spd) * maxSpd;
      m.vy = (m.vy / spd) * maxSpd;
    } else if (spd < minSpd && spd > 0.01) {
      m.vx = (m.vx / spd) * minSpd;
      m.vy = (m.vy / spd) * minSpd;
    }

    m.x += m.vx * dt;
    m.y += m.vy * dt;

    if (m.x - m.radius < bounds.left) {
      m.x = bounds.left + m.radius;
      m.vx = Math.abs(m.vx);
    } else if (m.x + m.radius > bounds.right) {
      m.x = bounds.right - m.radius;
      m.vx = -Math.abs(m.vx);
    }
    if (m.y - m.radius < bounds.top) {
      m.y = bounds.top + m.radius;
      m.vy = Math.abs(m.vy);
    } else if (m.y + m.radius > bounds.bottom) {
      m.y = bounds.bottom - m.radius;
      m.vy = -Math.abs(m.vy);
    }

    for (const target of ctx.fighters) {
      if (!target.alive || target.uid === m.ownerUid) continue;
      if (m.teamId !== null && target.teamId === m.teamId) continue;
      if (m.hitCooldowns[target.uid]) continue;

      if (Math.hypot(target.x - m.x, target.y - m.y) <= target.radius + m.radius) {
        m.hitCooldowns[target.uid] = 0.42;
        const dir = normalize(target.x - m.x, target.y - m.y);
        ctx.applyDamage(owner, target, m.damage, dir.x * 180, dir.y * 180, {
          sourceKind: 'ability',
        });
        m.vx = -dir.x * 320;
        m.vy = -dir.y * 320;
        m.hp -= 8;
        ctx.emitSfx({ type: 'hit', intensity: 0.72 });
        ctx.spawnParticles(m.x, m.y, 6, m.accentColor, 60, 180, 2, 4, 'spark');
      }
    }
  }
}

function findNearestEnemyFromPos(
  ctx: AbilityContext,
  ownerUid: string,
  teamId: number | null,
  x: number,
  y: number,
): FighterState | null {
  let best: FighterState | null = null;
  let bestDist = Infinity;
  for (const f of ctx.fighters) {
    if (!f.alive || f.uid === ownerUid) continue;
    if (teamId !== null && f.teamId === teamId) continue;
    const d = Math.hypot(f.x - x, f.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = f;
    }
  }
  return best;
}

function tickCooldownMap(map: Record<string, number>, dt: number): void {
  for (const key of Object.keys(map)) {
    map[key] -= dt;
    if (map[key] <= 0) delete map[key];
  }
}

/* ==================== SMART 4-5 SKILL KIT ROTATION & EXECUTOR ==================== */
function pickAndExecuteSkill(
  ctx: AbilityContext,
  f: FighterState,
  target: FighterState,
  form: FormConfig,
): void {
  const skills =
    f.character.id === 'rimuru' ? getRimuruSkillsForForm(f.formIndex) : f.character.skills;
  if (skills.length === 0) return;

  const hpRatio = f.hp / f.maxHp;
  const candidates: Array<{ idx: number; skill: SkillDef; weight: number }> = [];

  for (let i = 0; i < skills.length; i++) {
    const sk = skills[i];
    if (sk.effect === 'heal-item') {
      if (hpRatio > 0.78 || f.healSkillCooldown > 0) continue;
      candidates.push({ idx: i, skill: sk, weight: hpRatio < 0.45 ? 3.5 : 1.4 });
      continue;
    }
    if (sk.effect === 'shield-buff' && f.shieldTimer > 0.4) continue;

    // Strongly avoid repeating the exact same skill twice in a row
    const repeatPenalty = i === f.lastSkillIndex && skills.length > 1 ? 0.12 : 1.0;
    const shieldBoost = sk.effect === 'shield-buff' && hpRatio < 0.65 ? 1.5 : 1.0;
    candidates.push({ idx: i, skill: sk, weight: repeatPenalty * shieldBoost });
  }

  const pool = candidates.length > 0 ? candidates : [{ idx: 0, skill: skills[0], weight: 1 }];
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = pool[0];
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) {
      chosen = item;
      break;
    }
  }

  f.lastSkillIndex = chosen.idx;
  f.lastSkillName = `${chosen.skill.key}: ${chosen.skill.name}`;
  executeSkillDef(ctx, f, chosen.skill, target, form);
}

export function executeSkillDef(
  ctx: AbilityContext,
  f: FighterState,
  skill: SkillDef,
  target: FighterState,
  form: FormConfig,
): void {
  const angle = Math.atan2(target.y - f.y, target.x - f.x);
  f.facingAngle = angle;
  const pwr = skill.power ?? 1.0;
  const color = skill.color || form.auraColor;
  const charId = f.character.id;
  const series = f.character.series;
  const motif = skill.visualMotif ?? `${charId}:${skill.key}`;

  // Flash this character's franchise & personal Cast Seal + series-native particles on EVERY skill!
  ctx.spawnCastSeal(f, f.x, f.y, angle, color, skill.key, false);
  ctx.spawnSeriesParticles(f, f.x, f.y, 10, color, 60, 210);
  if (Math.hypot(target.x - f.x, target.y - f.y) < 260) {
    applyRegularSkillStatus(ctx, f, target, skill);
  }

  if (skill.callout) {
    ctx.spawnFloatingText(f.x, f.y - f.radius - 14, skill.callout, color, 'callout');
  }

  // Bespoke Pattern Execution Overrides (17 distinct anime & game skill mechanics!)
  if (skill.pattern === 'gate-barrage') {
    // Fate Gate of Babylon / Bleach Senbonzakura / JoJo Knife Wall: portals open behind caster & launch staggered weapons!
    const count = skill.count ?? 5;
    const kind = skill.projectileKind ?? 'spear';
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 26;
      const gx = f.x - Math.cos(angle) * (f.radius + 14) + perpX * offset;
      const gy = f.y - Math.sin(angle) * (f.radius + 14) + perpY * offset;
      const aimA = Math.atan2(target.y - gy, target.x - gx);
      const spd = 500 + (i % 3) * 65 + form.powerLevel * 28;
      ctx.spawnShockwave(gx, gy, 24, f.character.secondaryColor || color, 2.5, charId, series);
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        ownerSeries: series,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: gx,
        y: gy,
        vx: Math.cos(aimA) * spd,
        vy: Math.sin(aimA) * spd,
        radius: 14 + form.powerLevel,
        damage: ctx.getEffectiveDamage(f, (4.9 + form.powerLevel * 0.95) * pwr),
        knockback: 230,
        color,
        secondaryColor: f.character.secondaryColor,
        angle: aimA,
        life: 1.65,
        maxLife: 1.65,
        piercing: true,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
    }
    ctx.emitSfx({ type: 'slash', intensity: 1.1 });
    return;
  }

  if (skill.pattern === 'transmute-ring') {
    // Fullmetal Alchemist Transmutation Circle / Fairy Tail Magic Array / Naruto Sealing eruption around target!
    const tx = target.x;
    const ty = target.y;
    const kind = skill.projectileKind ?? 'totem-golem';
    ctx.spawnCastSeal(f, tx, ty, angle, color, `${skill.key}_RING`, false);
    ctx.spawnShockwave(tx, ty, 135, color, 5, charId, series);
    ctx.spawnSeriesParticles(f, tx, ty, 16, color, 80, 260);
    const count = skill.count ?? 4;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + angle;
      const rx = Math.max(
        ctx.bounds.left + 20,
        Math.min(ctx.bounds.right - 20, tx + Math.cos(a) * 62),
      );
      const ry = Math.max(
        ctx.bounds.top + 20,
        Math.min(ctx.bounds.bottom - 20, ty + Math.sin(a) * 62),
      );
      const inward = Math.atan2(ty - ry, tx - rx);
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        ownerSeries: series,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: rx,
        y: ry,
        vx: Math.cos(inward) * 340,
        vy: Math.sin(inward) * 340,
        radius: 15 + form.powerLevel,
        damage: ctx.getEffectiveDamage(f, (5.4 + form.powerLevel * 1.0) * pwr),
        knockback: 260,
        color,
        secondaryColor: f.character.secondaryColor,
        angle: inward,
        life: 1.1,
        maxLife: 1.1,
        piercing: true,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
    }
    ctx.addScreenShake(6);
    ctx.emitSfx({ type: 'powerup' });
    return;
  }

  if (skill.pattern === 'shadow-ambush') {
    // Solo Leveling / Zed / Assassin Shadow Ambush: blink behind target + twin cross-slashes from departure & arrival!
    const oldX = f.x;
    const oldY = f.y;
    f.afterimages.push({ x: oldX, y: oldY, alpha: 0.9, color, formIndex: f.formIndex });
    const behindA = angle + Math.PI;
    const nx = Math.max(
      ctx.bounds.left + f.radius + 6,
      Math.min(
        ctx.bounds.right - f.radius - 6,
        target.x + Math.cos(behindA) * (f.radius + target.radius + 16),
      ),
    );
    const ny = Math.max(
      ctx.bounds.top + f.radius + 6,
      Math.min(
        ctx.bounds.bottom - f.radius - 6,
        target.y + Math.sin(behindA) * (f.radius + target.radius + 16),
      ),
    );
    f.x = nx;
    f.y = ny;
    ctx.spawnCastSeal(f, nx, ny, angle, color, `${skill.key}_BLINK`, false);
    for (const [x1, y1, x2, y2] of [
      [oldX, oldY, target.x, target.y],
      [nx, ny, target.x - (nx - target.x) * 0.7, target.y - (ny - target.y) * 0.7],
    ] as const) {
      ctx.slashes.push({
        id: ctx.nextId('sl'),
        ownerUid: f.uid,
        ownerCharId: charId,
        ownerSeries: series,
        skillMotif: motif,
        teamId: f.teamId,
        x1,
        y1,
        x2,
        y2,
        color,
        secondaryColor: f.character.secondaryColor,
        coreColor: '#ffffff',
        width: 7.5 + form.powerLevel * 0.6,
        telegraphTimer: 0.08,
        activeTimer: 0.14,
        fadeTimer: 0.3,
        maxFade: 0.3,
        damage: ctx.getEffectiveDamage(f, (6.2 + form.powerLevel * 1.1) * pwr),
        hasStruck: false,
      });
    }
    const strikeDir = normalize(target.x - f.x, target.y - f.y);
    f.vx = strikeDir.x * 460;
    f.vy = strikeDir.y * 460;
    ctx.emitSfx({ type: 'slash', intensity: 1.15 });
    return;
  }

  if (skill.pattern === 'gravity-vortex') {
    // Pulls enemies inward into a swirling domain & spawns orbiting projectiles around the vortex!
    const range = 240 + form.powerLevel * 20;
    ctx.spawnShockwave(f.x, f.y, range, color, 5.5, charId, series);
    ctx.spawnSeriesParticles(f, f.x, f.y, 18, color, 80, 280);
    for (const enemy of ctx.getEnemies(f)) {
      const dx = enemy.x - f.x;
      const dy = enemy.y - f.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= range && dist > 1) {
        const dir = normalize(dx, dy);
        ctx.applyDamage(
          f,
          enemy,
          ctx.getEffectiveDamage(f, (8.2 + form.powerLevel * 1.4) * pwr),
          -dir.x * 420,
          -dir.y * 420,
          { sourceKind: 'ability' },
        );
      }
    }
    const kind = skill.projectileKind ?? 'void-eye';
    for (let i = 0; i < 3; i++) {
      const off = (Math.PI * 2 * i) / 3;
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        ownerSeries: series,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: f.x + Math.cos(off) * (f.radius + 36),
        y: f.y + Math.sin(off) * (f.radius + 36),
        vx: 0,
        vy: 0,
        radius: 14 + form.powerLevel,
        damage: ctx.getEffectiveDamage(f, (5.2 + form.powerLevel * 0.9) * pwr),
        knockback: 220,
        color,
        secondaryColor: f.character.secondaryColor,
        angle: off,
        life: 1.9,
        maxLife: 1.9,
        piercing: true,
        orbitTimer: 0.65 + i * 0.15,
        orbitOffset: off,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
    }
    ctx.addScreenShake(6.5);
    ctx.emitSfx({ type: 'dodge' });
    return;
  }

  if (skill.pattern === 'counter-nova') {
    // Full Counter / Wind Wall / Reflective Stance: reflects enemy projectiles back & fires a counter wave!
    f.shieldTimer = Math.max(f.shieldTimer, 2.3);
    f.shieldColor = color;
    const range = 195 + form.powerLevel * 16;
    ctx.spawnShockwave(f.x, f.y, range, color, 5.5, charId, series);
    let reflected = 0;
    for (const p of ctx.projectiles) {
      if (p.ownerUid === f.uid) continue;
      if (f.teamId !== null && p.teamId === f.teamId) continue;
      if (Math.hypot(p.x - f.x, p.y - f.y) <= range) {
        p.vx = -p.vx * 1.35;
        p.vy = -p.vy * 1.35;
        p.ownerUid = f.uid;
        p.ownerCharId = charId;
        p.ownerSeries = series;
        p.teamId = f.teamId;
        p.damage *= 1.35;
        p.color = color;
        p.angle = Math.atan2(p.vy, p.vx);
        reflected += 1;
      }
    }
    const kind = skill.projectileKind ?? 'sword-wave';
    ctx.projectiles.push({
      id: ctx.nextId('proj'),
      ownerUid: f.uid,
      ownerCharId: charId,
      ownerSeries: series,
      skillMotif: motif,
      teamId: f.teamId,
      kind,
      x: f.x + Math.cos(angle) * (f.radius + 16),
      y: f.y + Math.sin(angle) * (f.radius + 16),
      vx: Math.cos(angle) * 580,
      vy: Math.sin(angle) * 580,
      radius: 22 + reflected * 4,
      damage: ctx.getEffectiveDamage(f, (7.6 + reflected * 2.5 + form.powerLevel * 1.2) * pwr),
      knockback: 380,
      color,
      secondaryColor: f.character.secondaryColor,
      angle,
      life: 1.5,
      maxLife: 1.5,
      piercing: true,
      blocksProjectiles: true,
      hitCooldowns: {},
      powerLevel: form.powerLevel + 1,
    });
    ctx.emitSfx({ type: 'slash', intensity: 1.15 });
    return;
  }

  if (skill.pattern === 'combo-finisher') {
    // High-speed brawler dash + rapid phantom flurry + heavy knockback shockwave!
    const spd = 610 + form.powerLevel * 42;
    f.vx = Math.cos(angle) * spd;
    f.vy = Math.sin(angle) * spd;
    f.rasenganDashTimer = 0.52;
    const kind = skill.projectileKind ?? 'stand-fist';
    for (let i = -1; i <= 1; i++) {
      const a = angle + i * 0.22;
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        ownerSeries: series,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: f.x + Math.cos(a) * (f.radius + 14),
        y: f.y + Math.sin(a) * (f.radius + 14),
        vx: Math.cos(a) * (520 + Math.abs(i) * 40),
        vy: Math.sin(a) * (520 + Math.abs(i) * 40),
        radius: 15 + form.powerLevel,
        damage: ctx.getEffectiveDamage(f, (5.5 + form.powerLevel * 1.0) * pwr),
        knockback: 320,
        color,
        secondaryColor: f.character.secondaryColor,
        angle: a,
        life: 1.15,
        maxLife: 1.15,
        piercing: false,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
    }
    ctx.spawnShockwave(f.x, f.y, f.radius * 3.1, color, 4.5, charId, series);
    ctx.addScreenShake(6.5);
    ctx.emitSfx({ type: 'crit', intensity: 1.05 });
    return;
  }

  if (skill.pattern === 'spiral-burst') {
    const count = skill.count ?? 6;
    const kind = skill.projectileKind ?? 'petal-sakura';
    const speed = 420 + form.powerLevel * 28;
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.PI * 2 * i) / count;
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: f.x + Math.cos(a) * (f.radius + 14),
        y: f.y + Math.sin(a) * (f.radius + 14),
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        radius: 15 + form.powerLevel,
        damage: ctx.getEffectiveDamage(f, (5.4 + form.powerLevel * 1.0) * pwr),
        knockback: 230,
        color,
        secondaryColor: f.character.secondaryColor,
        angle: a,
        life: 1.75,
        maxLife: 1.75,
        piercing: true,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
    }
    ctx.emitSfx({ type: 'slash', intensity: 1.05 });
    return;
  }

  if (skill.pattern === 'pincer-converge') {
    const count = skill.count ?? 3;
    const kind = skill.projectileKind ?? 'shuriken-star';
    const speed = 470 + form.powerLevel * 30;
    for (let i = 0; i < count; i++) {
      const flank = (i - (count - 1) / 2) * 0.92;
      const sx = f.x + Math.cos(angle + flank) * (f.radius + 26);
      const sy = f.y + Math.sin(angle + flank) * (f.radius + 26);
      const aimA = Math.atan2(target.y - sy, target.x - sx);
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: sx,
        y: sy,
        vx: Math.cos(aimA) * speed,
        vy: Math.sin(aimA) * speed,
        radius: 15 + form.powerLevel,
        damage: ctx.getEffectiveDamage(f, (5.8 + form.powerLevel * 1.1) * pwr),
        knockback: 240,
        color,
        secondaryColor: f.character.secondaryColor,
        angle: aimA,
        life: 1.7,
        maxLife: 1.7,
        piercing: true,
        homing: true,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
    }
    ctx.emitSfx({ type: 'slash', intensity: 1.0 });
    return;
  }

  if (skill.pattern === 'orbital-ring') {
    const count = skill.count ?? 4;
    const kind = skill.projectileKind ?? 'holy-cross';
    for (let i = 0; i < count; i++) {
      const offset = (Math.PI * 2 * i) / count;
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: f.x + Math.cos(offset) * (f.radius + 32),
        y: f.y + Math.sin(offset) * (f.radius + 32),
        vx: 0,
        vy: 0,
        radius: 14 + form.powerLevel,
        damage: ctx.getEffectiveDamage(f, (5.6 + form.powerLevel * 1.0) * pwr),
        knockback: 220,
        color,
        secondaryColor: f.character.secondaryColor,
        angle: offset,
        life: 2.3,
        maxLife: 2.3,
        piercing: false,
        orbitTimer: 0.72 + i * 0.14,
        orbitOffset: offset,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
    }
    ctx.emitSfx({ type: 'powerup' });
    return;
  }

  if (skill.pattern === 'gatling-stream') {
    const waves = skill.count ?? 5;
    const kind = skill.projectileKind ?? 'stand-fist';
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    for (let i = 0; i < waves; i++) {
      const lat = ((i % 3) - 1) * 14;
      const spd = 430 + i * 58 + form.powerLevel * 24;
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: f.x + Math.cos(angle) * (f.radius + 10) + perpX * lat,
        y: f.y + Math.sin(angle) * (f.radius + 10) + perpY * lat,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: 13 + form.powerLevel,
        damage: ctx.getEffectiveDamage(f, (4.6 + form.powerLevel * 0.9) * pwr),
        knockback: 200,
        color,
        secondaryColor: f.character.secondaryColor,
        angle,
        life: 1.4,
        maxLife: 1.4,
        piercing: false,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
    }
    ctx.emitSfx({ type: 'hit', intensity: 1.05 });
    return;
  }

  if (skill.pattern === 'chain-hook-reel') {
    const kind = skill.projectileKind ?? 'anchor-hook';
    const speed = 640 + form.powerLevel * 32;
    ctx.projectiles.push({
      id: ctx.nextId('proj'),
      ownerUid: f.uid,
      ownerCharId: charId,
      skillMotif: motif,
      teamId: f.teamId,
      kind,
      x: f.x + Math.cos(angle) * (f.radius + 14),
      y: f.y + Math.sin(angle) * (f.radius + 14),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 18 + form.powerLevel,
      damage: ctx.getEffectiveDamage(f, (8.6 + form.powerLevel * 1.4) * pwr),
      knockback: 440,
      color,
      secondaryColor: f.character.secondaryColor,
      angle,
      life: 1.4,
      maxLife: 1.4,
      piercing: true,
      boomerang: true,
      returning: false,
      tetherToOwner: true,
      hitCooldowns: {},
      powerLevel: form.powerLevel,
    });
    ctx.emitSfx({ type: 'slash', intensity: 1.05 });
    return;
  }

  if (skill.pattern === 'sky-judgment') {
    const count = skill.count ?? 2;
    const enemies = ctx.getEnemies(f);
    for (let i = 0; i < count; i++) {
      const focus = enemies.length > 0 ? enemies[i % enemies.length] : target;
      const px = Math.max(
        ctx.bounds.left + 30,
        Math.min(ctx.bounds.right - 30, focus.x + (i === 0 ? 0 : (Math.random() - 0.5) * 90)),
      );
      const py = Math.max(ctx.bounds.top + 60, Math.min(ctx.bounds.bottom - 24, focus.y));
      ctx.skyPillars.push({
        id: ctx.nextId('sky'),
        ownerUid: f.uid,
        ownerCharId: charId,
        style: motif,
        teamId: f.teamId,
        x: px,
        targetY: py,
        width: 38 + form.powerLevel * 4,
        color,
        telegraphTimer: 0.22 + i * 0.08,
        activeTimer: 0.38,
        maxActive: 0.38,
        damage: ctx.getEffectiveDamage(f, (10.5 + form.powerLevel * 1.5) * pwr),
        hasStruck: false,
      });
    }
    ctx.emitSfx({ type: 'beam-charge' });
    return;
  }

  if (skill.pattern === 'zigzag-blitz') {
    // 3-point high-speed lightning Z-dash across the target!
    const midX = (f.x + target.x) / 2 + -Math.sin(angle) * 65;
    const midY = (f.y + target.y) / 2 + Math.cos(angle) * 65;
    const endX = Math.max(
      ctx.bounds.left + f.radius + 6,
      Math.min(ctx.bounds.right - f.radius - 6, target.x + Math.cos(angle) * 48),
    );
    const endY = Math.max(
      ctx.bounds.top + f.radius + 6,
      Math.min(ctx.bounds.bottom - f.radius - 6, target.y + Math.sin(angle) * 48),
    );
    for (const [x1, y1, x2, y2] of [
      [f.x, f.y, midX, midY],
      [midX, midY, endX, endY],
    ] as const) {
      ctx.slashes.push({
        id: ctx.nextId('sl'),
        ownerUid: f.uid,
        teamId: f.teamId,
        x1,
        y1,
        x2,
        y2,
        color,
        coreColor: '#ffffff',
        width: 7,
        telegraphTimer: 0,
        activeTimer: 0.14,
        fadeTimer: 0.28,
        maxFade: 0.28,
        damage: ctx.getEffectiveDamage(f, (5.2 + form.powerLevel) * pwr),
        hasStruck: false,
      });
    }
    f.afterimages.push({ x: f.x, y: f.y, alpha: 0.85, color, formIndex: f.formIndex });
    f.afterimages.push({ x: midX, y: midY, alpha: 0.75, color, formIndex: f.formIndex });
    f.x = endX;
    f.y = endY;
    f.vx = Math.cos(angle) * 480;
    f.vy = Math.sin(angle) * 480;
    const raw = ctx.getEffectiveDamage(f, (8.6 + form.powerLevel * 1.4) * pwr);
    ctx.applyDamage(f, target, raw, Math.cos(angle) * 320, Math.sin(angle) * 320, {
      sourceKind: 'ability',
    });
    ctx.emitSfx({ type: 'slash', intensity: 1.15 });
    return;
  }

  if (skill.pattern === 'carpet-bombs') {
    const count = 3;
    const bKind = skill.bombKind ?? 'lotus-trap';
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    for (let i = -1; i <= 1; i++) {
      const bx = Math.max(
        ctx.bounds.left + 28,
        Math.min(ctx.bounds.right - 28, f.x + Math.cos(angle) * 75 + perpX * i * 56),
      );
      const by = Math.max(
        ctx.bounds.top + 28,
        Math.min(ctx.bounds.bottom - 28, f.y + Math.sin(angle) * 75 + perpY * i * 56),
      );
      const fuse =
        bKind === 'obsidian-block' || bKind === 'ice-pillar'
          ? 3.0
          : bKind === 'mushroom' || bKind === 'chomper'
            ? 2.6
            : 0.95 + (i + 1) * 0.12;
      ctx.bombs.push({
        id: ctx.nextId('bmb'),
        ownerUid: f.uid,
        teamId: f.teamId,
        kind: bKind,
        x: bx,
        y: by,
        radius: bKind === 'obsidian-block' || bKind === 'ice-pillar' ? 20 : 16,
        blastRadius: 135 + form.powerLevel * 12,
        damage: ctx.getEffectiveDamage(f, (8.8 + form.powerLevel * 1.4) * pwr),
        fuseTimer: fuse,
        maxFuse: fuse,
        color,
      });
    }
    void count;
    ctx.emitSfx({ type: 'wall', intensity: 1.05 });
    return;
  }

  if (skill.pattern === 'domain-zone') {
    const blastR = 185 + form.powerLevel * 20;
    ctx.shockwaves.push({
      x: f.x,
      y: f.y,
      radius: 18,
      maxRadius: blastR,
      color,
      lineWidth: 6,
      alpha: 0.98,
      ownerCharId: charId,
      motif,
    });
    for (const enemy of ctx.getEnemies(f)) {
      const dx = enemy.x - f.x;
      const dy = enemy.y - f.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= blastR) {
        const dir = normalize(dx, dy);
        ctx.applyDamage(
          f,
          enemy,
          ctx.getEffectiveDamage(f, (9.4 + form.powerLevel * 1.5) * pwr),
          dir.x * 460,
          dir.y * 460,
          { sourceKind: 'ability' },
        );
      }
    }
    ctx.addScreenShake(7.5);
    ctx.emitSfx({ type: 'powerup' });
    return;
  }

  switch (skill.effect) {
    case 'dash-strike': {
      const speed = (540 + form.powerLevel * 44) * Math.min(1.2, pwr);
      f.vx = Math.cos(angle) * speed;
      f.vy = Math.sin(angle) * speed;
      if (f.character.id === 'sonic') {
        f.spinDashTimer = 0.68;
      } else {
        f.rasenganDashTimer = 0.52;
      }
      if (f.character.id === 'jinx') {
        f.getExcitedTimer = 3.2;
      }
      ctx.spawnShockwave(f.x, f.y, f.radius * 2.2, color, 3.5);
      ctx.spawnParticles(f.x, f.y, 12, color, 80, 250, 2.5, 5, 'spark');
      ctx.emitSfx({ type: 'hit', intensity: 0.95 });
      break;
    }

    case 'ricochet-arm': {
      const isGear5 = f.character.id === 'luffy' && form.visualVariant === 'gear5';
      const bounces = isGear5 ? 7 : Math.min(5, form.powerLevel + 1);
      const speed = isGear5 ? 1280 : 900 + form.powerLevel * 65;
      const sx = f.x + Math.cos(angle) * (f.radius + 4);
      const sy = f.y + Math.sin(angle) * (f.radius + 4);
      ctx.ricochetArms.push({
        id: ctx.nextId('arm'),
        ownerUid: f.uid,
        teamId: f.teamId,
        points: [
          { x: f.x, y: f.y },
          { x: sx, y: sy },
        ],
        headX: sx,
        headY: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        bouncesLeft: bounces,
        phase: 'extend',
        life: isGear5 ? 1.45 : 1.05,
        maxLife: isGear5 ? 1.45 : 1.05,
        damage: ctx.getEffectiveDamage(f, (7.4 + form.powerLevel * 1.7) * pwr),
        color: isGear5 ? '#ffffff' : f.character.id === 'deku' ? '#09090b' : color,
        glowColor: isGear5 ? '#e9d5ff' : color,
        isGear5,
        hitCooldowns: {},
      });
      ctx.emitSfx({ type: 'hit', intensity: 1.0 });
      break;
    }

    case 'projectile-fan': {
      const count = skill.count ?? 3;
      const kind = skill.projectileKind ?? 'sword-wave';
      const spreadStep = count >= 5 ? 0.16 : 0.2;
      const isCrescent = kind === 'getsuga' || kind === 'sword-wave' || kind === 'tornado';
      const speed = isCrescent ? 540 + form.powerLevel * 32 : 470 + form.powerLevel * 28;
      for (let i = 0; i < count; i++) {
        const a = angle + (i - (count - 1) / 2) * spreadStep;
        ctx.projectiles.push({
          id: ctx.nextId('proj'),
          ownerUid: f.uid,
          ownerCharId: charId,
          skillMotif: motif,
          teamId: f.teamId,
          kind,
          x: f.x + Math.cos(a) * (f.radius + 14),
          y: f.y + Math.sin(a) * (f.radius + 14),
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          radius: isCrescent ? 22 + form.powerLevel * 1.5 : 13 + form.powerLevel,
          damage: ctx.getEffectiveDamage(f, (5.2 + form.powerLevel * 1.05) * pwr),
          knockback: isCrescent ? 280 : 210,
          color,
          secondaryColor: f.character.secondaryColor,
          angle: a,
          life: 1.6,
          maxLife: 1.6,
          piercing: isCrescent,
          blocksProjectiles: kind === 'tornado' || f.character.id === 'asta',
          hitCooldowns: {},
          powerLevel: form.powerLevel,
        });
      }
      ctx.emitSfx({ type: isCrescent ? 'slash' : 'hit', intensity: 1.0 });
      break;
    }

    case 'heavy-orb': {
      const kind = skill.projectileKind ?? 'meteor';
      const isPurple = kind === 'purple';
      const isRocket = kind === 'rocket';
      const isGojo = charId === 'gojo';
      const radius =
        (isPurple ? 34 + form.powerLevel * 2.5 : isRocket ? 16 : 24 + form.powerLevel * 2) +
        (isGojo ? 6 : 0);
      const speed = isGojo ? (isPurple ? 640 : 680) : isPurple ? 330 : isRocket ? 520 : 370;

      // Six Eyes predictive lead-aiming for Gojo's Blue, Red & Hollow Purple!
      let fireAngle = angle;
      if (isGojo) {
        const nearest = ctx.getNearestEnemy(f);
        if (nearest) {
          const d = Math.hypot(nearest.x - f.x, nearest.y - f.y);
          const leadT = Math.min(0.42, d / speed);
          fireAngle = Math.atan2(
            nearest.y + nearest.vy * leadT - f.y,
            nearest.x + nearest.vx * leadT - f.x,
          );
        }
      }

      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: f.x + Math.cos(fireAngle) * (f.radius + radius * 0.6),
        y: f.y + Math.sin(fireAngle) * (f.radius + radius * 0.6),
        vx: Math.cos(fireAngle) * speed,
        vy: Math.sin(fireAngle) * speed,
        radius,
        damage: ctx.getEffectiveDamage(f, (9.6 + form.powerLevel * 1.55) * pwr),
        knockback: 390,
        color,
        secondaryColor: f.character.secondaryColor,
        angle: fireAngle,
        life: 2.3,
        maxLife: 2.3,
        piercing: isPurple,
        homing: isGojo,
        explosiveRadius: isPurple ? undefined : 115 + form.powerLevel * 10,
        hitCooldowns: {},
        powerLevel: form.powerLevel + (isPurple ? 1 : 0),
      });
      ctx.emitSfx({ type: isPurple ? 'beam-fire' : 'hit', intensity: 1.1 });
      ctx.addScreenShake(5);
      break;
    }

    case 'boomerang-orb': {
      const speed = 550 + form.powerLevel * 25;
      const kind = skill.projectileKind ?? 'boomerang';
      ctx.projectiles.push({
        id: ctx.nextId('proj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        skillMotif: motif,
        teamId: f.teamId,
        kind,
        x: f.x + Math.cos(angle) * (f.radius + 14),
        y: f.y + Math.sin(angle) * (f.radius + 14),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius:
          kind === 'scythe' || kind === 'axe'
            ? 21 + form.powerLevel * 1.4
            : 17 + form.powerLevel * 1.4,
        damage: ctx.getEffectiveDamage(f, (7.4 + form.powerLevel * 1.25) * pwr),
        knockback: 230,
        color,
        secondaryColor: f.character.secondaryColor,
        angle,
        life: 1.85,
        maxLife: 1.85,
        piercing: true,
        boomerang: true,
        returning: false,
        hitCooldowns: {},
        powerLevel: form.powerLevel,
      });
      ctx.emitSfx({ type: 'slash', intensity: 0.95 });
      break;
    }

    case 'homing-swarm': {
      const count = skill.count ?? 3;
      const kind = skill.projectileKind ?? 'foxfire';
      for (let i = 0; i < count; i++) {
        const a = angle + (i - (count - 1) / 2) * 0.52;
        ctx.projectiles.push({
          id: ctx.nextId('proj'),
          ownerUid: f.uid,
          ownerCharId: charId,
          skillMotif: motif,
          teamId: f.teamId,
          kind,
          x: f.x + Math.cos(a) * (f.radius + 12),
          y: f.y + Math.sin(a) * (f.radius + 12),
          vx: Math.cos(a) * 380,
          vy: Math.sin(a) * 380,
          radius: kind === 'dagger-blade' ? 14 : 11,
          damage: ctx.getEffectiveDamage(f, (4.8 + form.powerLevel * 0.8) * pwr),
          knockback: 150,
          color,
          secondaryColor: f.character.secondaryColor,
          angle: a,
          life: 1.9,
          maxLife: 1.9,
          piercing: false,
          homing: true,
          hitCooldowns: {},
          powerLevel: form.powerLevel,
        });
      }
      ctx.emitSfx({ type: 'dodge' });
      break;
    }

    case 'beam-shot': {
      const style =
        f.character.id === 'sans'
          ? 'gaster'
          : f.character.id === 'frieren'
            ? 'zoltraak'
            : f.character.id === 'vegeta'
              ? 'final-flash'
              : 'kamehameha';
      ctx.beams.push({
        id: ctx.nextId('beam'),
        ownerUid: f.uid,
        teamId: f.teamId,
        originX: f.x,
        originY: f.y,
        angle,
        width: 20 + form.powerLevel * 3.8,
        damagePerTick: ctx.getEffectiveDamage(f, (3.6 + form.powerLevel * 0.65) * pwr),
        color,
        coreColor: '#ffffff',
        life: 0.48 + form.powerLevel * 0.04,
        maxLife: 0.48 + form.powerLevel * 0.04,
        tickTimer: 0,
        powerLevel: form.powerLevel,
        style,
      });
      f.vx -= Math.cos(angle) * 140;
      f.vy -= Math.sin(angle) * 140;
      ctx.addScreenShake(5.5);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.0 });
      break;
    }

    case 'slash-cross': {
      const count = (skill.count ?? 4) + (form.powerLevel >= 4 ? 2 : 0);
      const enemies = ctx.getEnemies(f);
      const { left, right, top, bottom } = ctx.bounds;
      const span = Math.max(right - left, bottom - top);
      for (let i = 0; i < count; i++) {
        const focus = enemies.length > 0 ? enemies[i % enemies.length] : target;
        const cx = focus.x + (Math.random() - 0.5) * 75;
        const cy = focus.y + (Math.random() - 0.5) * 75;
        const ang = (Math.PI / count) * i + (Math.random() - 0.5) * 0.5;
        const halfLen = span * 0.3;
        ctx.slashes.push({
          id: ctx.nextId('sl'),
          ownerUid: f.uid,
          teamId: f.teamId,
          x1: cx - Math.cos(ang) * halfLen,
          y1: cy - Math.sin(ang) * halfLen,
          x2: cx + Math.cos(ang) * halfLen,
          y2: cy + Math.sin(ang) * halfLen,
          color,
          coreColor: '#ffffff',
          width: 5 + form.powerLevel * 0.7,
          telegraphTimer: 0.2 + i * 0.03,
          activeTimer: 0.09,
          fadeTimer: 0.24,
          maxFade: 0.24,
          damage: ctx.getEffectiveDamage(f, (4.8 + form.powerLevel * 0.95) * pwr),
          hasStruck: false,
        });
      }
      ctx.emitSfx({ type: 'slash', intensity: 1.05 });
      break;
    }

    case 'shockwave-nova': {
      const blastR = 175 + form.powerLevel * 18;
      ctx.shockwaves.push({
        x: f.x,
        y: f.y,
        radius: 14,
        maxRadius: blastR,
        color,
        lineWidth: 5.5,
        alpha: 0.96,
        ownerCharId: charId,
        motif,
      });
      ctx.spawnShockwave(f.x, f.y, blastR * 0.6, '#ffffff', 3);
      ctx.spawnParticles(f.x, f.y, 20, color, 110, 340, 2.5, 6, 'spark');
      for (const enemy of ctx.getEnemies(f)) {
        const dx = enemy.x - f.x;
        const dy = enemy.y - f.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= blastR) {
          const dir = normalize(dx, dy);
          ctx.applyDamage(
            f,
            enemy,
            ctx.getEffectiveDamage(f, (9.8 + form.powerLevel * 1.55) * pwr),
            dir.x * (540 * pwr),
            dir.y * (540 * pwr),
            { isCrit: pwr >= 1.25, sourceKind: 'ability' },
          );
        }
      }
      ctx.addScreenShake(8.5);
      ctx.emitSfx({ type: 'crit', intensity: 1.05 });
      break;
    }

    case 'shield-buff': {
      f.shieldTimer = 2.6;
      f.shieldColor = color;
      ctx.spawnShockwave(f.x, f.y, f.radius * 2.8, color, 4);
      // Immediately clear nearby enemy projectiles and shove close attackers!
      updateProjectileDestroyerAura(ctx, f, f.radius + 75, skill.callout ?? 'BLOCKED!');
      for (const enemy of ctx.getEnemies(f)) {
        const dx = enemy.x - f.x;
        const dy = enemy.y - f.y;
        const d = Math.hypot(dx, dy);
        if (d > 0.01 && d < f.radius * 3.5) {
          enemy.vx += (dx / d) * 320;
          enemy.vy += (dy / d) * 320;
        }
      }
      ctx.emitSfx({ type: 'dodge' });
      break;
    }

    case 'heal-item': {
      f.healSkillCooldown = 8.5;
      if (f.antiHealTimer > 0) {
        ctx.spawnFloatingText(f.x, f.y + f.radius + 14, 'HEAL BLOCKED!', '#ff1f5a', 'callout');
        ctx.emitSfx({ type: 'wall', intensity: 0.7 });
        break;
      }
      const pct = skill.healPct ?? 0.12;
      const healAmt = Math.max(4, Math.round(f.maxHp * pct * getHealMultiplier(f)));
      const actual = Math.min(f.maxHp - f.hp, healAmt);
      if (actual > 0) {
        f.hp += actual;
        ctx.spawnFloatingText(f.x, f.y + f.radius + 14, `+${actual} HP`, '#4ade80', 'heal');
      }
      // Golden Apple / Shield items also grant a brief golden protection glint
      if (f.character.id === 'steve' || f.character.id === 'sonic' || f.character.id === 'yasuo') {
        f.shieldTimer = Math.max(f.shieldTimer, 1.3);
        f.shieldColor = color;
      }
      ctx.spawnShockwave(f.x, f.y, f.radius * 2.4, '#4ade80', 3.5);
      ctx.spawnParticles(f.x, f.y, 14, '#4ade80', 60, 200, 2.5, 5, 'circle');
      ctx.emitSfx({ type: 'heal' });
      break;
    }

    case 'teleport-strike': {
      // Leave crisp afterimage at departure point (Ender Pearl / Instant Transmission / Shortcut!)
      f.afterimages.push({
        x: f.x,
        y: f.y,
        alpha: 0.85,
        color,
        formIndex: f.formIndex,
      });
      ctx.spawnShockwave(f.x, f.y, f.radius * 2.0, color, 3);
      ctx.spawnParticles(f.x, f.y, 12, color, 70, 220, 2.5, 5, 'circle');

      // Blink to clean strike spot behind/beside target inside active bounds
      const behindAngle = angle + Math.PI + (Math.random() - 0.5) * 1.1;
      const offsetDist = f.radius + target.radius + 14;
      const nx = Math.max(
        ctx.bounds.left + f.radius + 4,
        Math.min(ctx.bounds.right - f.radius - 4, target.x + Math.cos(behindAngle) * offsetDist),
      );
      const ny = Math.max(
        ctx.bounds.top + f.radius + 4,
        Math.min(ctx.bounds.bottom - f.radius - 4, target.y + Math.sin(behindAngle) * offsetDist),
      );
      f.x = nx;
      f.y = ny;

      const strikeDir = normalize(target.x - f.x, target.y - f.y);
      f.vx = strikeDir.x * 460;
      f.vy = strikeDir.y * 460;
      ctx.spawnShockwave(f.x, f.y, f.radius * 2.4, color, 3.5);

      const raw = ctx.getEffectiveDamage(f, (8.4 + form.powerLevel * 1.4) * pwr);
      ctx.applyDamage(f, target, raw, strikeDir.x * 320, strikeDir.y * 320, {
        sourceKind: 'ability',
      });
      ctx.spawnParticles(target.x, target.y, 12, color, 90, 260, 2.5, 5, 'spark');
      ctx.emitSfx({ type: 'dodge' });
      ctx.emitSfx({ type: 'hit', intensity: 1.0 });
      break;
    }

    case 'drop-bomb': {
      const count = (skill.count ?? 1) + (form.powerLevel >= 4 ? 1 : 0);
      const bKind = skill.bombKind ?? 'tnt';
      for (let i = 0; i < count; i++) {
        const ox = Math.max(
          ctx.bounds.left + 28,
          Math.min(ctx.bounds.right - 28, f.x + (i === 0 ? 0 : (Math.random() - 0.5) * 95)),
        );
        const oy = Math.max(
          ctx.bounds.top + 28,
          Math.min(ctx.bounds.bottom - 28, f.y + (i === 0 ? 0 : (Math.random() - 0.5) * 95)),
        );
        const fuse = bKind === 'obsidian-block' ? 3.2 : bKind === 'chomper' ? 2.4 : 0.95 + i * 0.14;
        ctx.bombs.push({
          id: ctx.nextId('tnt'),
          ownerUid: f.uid,
          teamId: f.teamId,
          kind: bKind,
          x: ox,
          y: oy,
          radius: bKind === 'obsidian-block' ? 21 : 17,
          blastRadius: 145 + form.powerLevel * 14,
          damage: ctx.getEffectiveDamage(f, (10.5 + form.powerLevel * 1.6) * pwr),
          fuseTimer: fuse,
          maxFuse: fuse,
          color,
        });
      }
      ctx.emitSfx({ type: 'wall', intensity: 1.1 });
      break;
    }

    case 'summon-dragon': {
      summonEnderDragon(ctx, f, form);
      break;
    }

    case 'sky-pillar': {
      const count = skill.count ?? 3;
      const enemies = ctx.getEnemies(f);
      for (let i = 0; i < count; i++) {
        const focus = enemies.length > 0 ? enemies[i % enemies.length] : target;
        const px = Math.max(
          ctx.bounds.left + 30,
          Math.min(ctx.bounds.right - 30, focus.x + (i === 0 ? 0 : (Math.random() - 0.5) * 110)),
        );
        const py = Math.max(ctx.bounds.top + 60, Math.min(ctx.bounds.bottom - 24, focus.y));
        ctx.skyPillars.push({
          id: ctx.nextId('sky'),
          ownerUid: f.uid,
          ownerCharId: charId,
          style: motif,
          teamId: f.teamId,
          x: px,
          targetY: py,
          width: 34 + form.powerLevel * 4,
          color,
          telegraphTimer: 0.24 + i * 0.08,
          activeTimer: 0.34,
          maxActive: 0.34,
          damage: ctx.getEffectiveDamage(f, (10.2 + form.powerLevel * 1.5) * pwr),
          hasStruck: false,
        });
      }
      ctx.emitSfx({ type: 'beam-charge' });
      break;
    }

    case 'sonic-boom': {
      // Iconic Warden Sonic Boom: piercing expanding cyan ring cannon ignoring shields!
      const speed = 640 + form.powerLevel * 35;
      ctx.projectiles.push({
        id: ctx.nextId('sonic'),
        ownerUid: f.uid,
        teamId: f.teamId,
        kind: 'sonic-boom',
        x: f.x + Math.cos(angle) * (f.radius + 16),
        y: f.y + Math.sin(angle) * (f.radius + 16),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 30 + form.powerLevel * 2.5,
        damage: ctx.getEffectiveDamage(f, (11.5 + form.powerLevel * 1.8) * pwr),
        knockback: 460,
        color: '#22d3ee',
        secondaryColor: '#67e8f9',
        angle,
        life: 1.45,
        maxLife: 1.45,
        piercing: true,
        blocksProjectiles: true,
        hitCooldowns: {},
        powerLevel: form.powerLevel + 1,
      });
      ctx.addScreenShake(7);
      ctx.emitSfx({ type: 'beam-fire', intensity: 1.15 });
      break;
    }

    case 'chain-lightning': {
      triggerLightningStrike(ctx, f, form, skill.count ?? 2, color, false);
      break;
    }

    case 'gravity-pull': {
      const range = 240 + form.powerLevel * 20;
      ctx.spawnShockwave(f.x, f.y, range, color, 4.5);
      for (const enemy of ctx.getEnemies(f)) {
        const dx = enemy.x - f.x;
        const dy = enemy.y - f.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= range && dist > 1) {
          const dir = normalize(dx, dy);
          ctx.applyDamage(
            f,
            enemy,
            ctx.getEffectiveDamage(f, (7.6 + form.powerLevel * 1.35) * pwr),
            -dir.x * 390,
            -dir.y * 390,
            {
              sourceKind: 'ability',
              allowLifesteal:
                f.character.id === 'rimuru' ||
                f.character.id === 'ahri' ||
                f.character.id === 'denji',
            },
          );
        }
      }
      ctx.emitSfx({ type: 'dodge' });
      break;
    }

    case 'summon-minion': {
      if (f.character.id === 'jinwoo') {
        summonShadowSoldiers(ctx, f, form, skill.count ?? 2, f.x, f.y);
      } else {
        spawnShadowClones(ctx, f, form, skill.count ?? 2);
        ctx.emitSfx({ type: 'powerup' });
      }
      break;
    }

    case 'trail-surge': {
      const speed = 550 + form.powerLevel * 42;
      f.vx = Math.cos(angle) * speed;
      f.vy = Math.sin(angle) * speed;
      const element: TrailNode['element'] =
        f.character.id === 'sasuke'
          ? 'amaterasu'
          : f.character.id === 'warden'
            ? 'sculk'
            : f.character.id === 'tanjiro' && form.visualVariant === 'base'
              ? 'water'
              : 'fire';
      for (let k = 0; k < 5; k++) {
        ctx.trails.push({
          id: ctx.nextId('tr'),
          ownerUid: f.uid,
          teamId: f.teamId,
          x: f.x - Math.cos(angle) * k * 18,
          y: f.y - Math.sin(angle) * k * 18,
          radius: 20 + form.powerLevel * 2,
          life: 3.1,
          maxLife: 3.1,
          damagePerTick: ctx.getEffectiveDamage(f, 3.6 + form.powerLevel * 0.7),
          element,
          hitCooldowns: {},
        });
      }
      ctx.spawnShockwave(f.x, f.y, f.radius * 2.3, color, 3.5);
      ctx.emitSfx({ type: 'slash', intensity: 0.95 });
      break;
    }

    case 'odm-zip': {
      triggerLeviOdmGrapple(ctx, f, target, form);
      break;
    }
  }
}

function summonEnderDragon(ctx: AbilityContext, f: FighterState, form: FormConfig): void {
  // Cap at 1 active Ender Dragon per Steve (refreshes HP & duration if already flying!)
  const existing = ctx.minions.find((m) => m.ownerUid === f.uid && m.kind === 'ender-dragon');
  if (existing) {
    existing.life = 11.5;
    existing.hp = existing.maxHp;
    ctx.spawnShockwave(existing.x, existing.y, 90, '#c084fc', 4);
    ctx.emitSfx({ type: 'powerup' });
    return;
  }

  const sx = Math.max(ctx.bounds.left + 40, Math.min(ctx.bounds.right - 40, f.x));
  const sy = Math.max(ctx.bounds.top + 40, Math.min(ctx.bounds.bottom - 40, f.y - 45));
  const ang = f.facingAngle;

  ctx.minions.push({
    id: ctx.nextId('dragon'),
    ownerUid: f.uid,
    teamId: f.teamId,
    kind: 'ender-dragon',
    x: sx,
    y: sy,
    vx: Math.cos(ang) * 320,
    vy: Math.sin(ang) * 320,
    radius: 26,
    hp: 95 + form.powerLevel * 22,
    maxHp: 95 + form.powerLevel * 22,
    damage: ctx.getEffectiveDamage(f, 8.8 + form.powerLevel * 1.3),
    life: 11.5,
    maxLife: 11.5,
    color: '#18181b',
    accentColor: '#c084fc',
    attackTimer: 0.65,
    wingPhase: 0,
    hitCooldowns: {},
  });

  ctx.spawnShockwave(sx, sy, 130, '#c084fc', 5);
  ctx.spawnParticles(sx, sy, 20, '#c084fc', 80, 260, 3, 6, 'square');
  ctx.emitSfx({ type: 'powerup' });
}

/* ==================== SIGNATURE ULTIMATE SKILLS (ALL 36 FIGHTERS) ==================== */
export function executeUltimateSkill(ctx: AbilityContext, f: FighterState): void {
  if (!f.alive) return;

  // Dispatch to bespoke per-character modular Ultimate Handler if available (Anti-Reskin Registry!)
  if (triggerCustomUltimate(ctx, f)) {
    return;
  }

  const form = ctx.getForm(f);
  const ult = f.character.ultimate;
  const charId = f.character.id;
  const series = f.character.series;
  const secColor = f.character.secondaryColor || '#ffffff';
  const target = ctx.getNearestEnemy(f);
  const baseAngle = target ? Math.atan2(target.y - f.y, target.x - f.x) : f.facingAngle;
  f.facingAngle = baseAngle;
  f.invulnTimer = Math.max(f.invulnTimer, 0.65);
  f.transformAngryTimer = Math.max(f.transformAngryTimer, 3.0);

  ctx.spawnCastSeal(f, f.x, f.y, baseAngle, ult.color, 'ULT', true);
  ctx.spawnShockwave(f.x, f.y, f.radius * 4.8, ult.color, 6, charId, series);
  ctx.spawnSeriesParticles(f, f.x, f.y, 26, ult.color, 130, 420);
  ctx.addScreenShake(13);
  ctx.addHitstop(0.055);
  ctx.emitSfx({ type: 'beam-fire', intensity: 1.35 });

  // Activate this character's true Anime/Game Domain Expansion or Signature Reality!
  activateCharacterDomain(ctx, f);

  const enemies = ctx.getEnemies(f);
  const { left, right, top, bottom } = ctx.bounds;
  const span = Math.max(right - left, bottom - top);

  switch (ult.archetype) {
    case 'mega-beam': {
      ctx.beams.push({
        id: ctx.nextId('ubeam'),
        ownerUid: f.uid,
        ownerCharId: charId,
        ownerSeries: series,
        skillMotif: `${charId}:ULT`,
        teamId: f.teamId,
        originX: f.x,
        originY: f.y,
        angle: baseAngle,
        width: 56,
        damagePerTick: ctx.getEffectiveDamage(f, 5.5 + form.powerLevel * 0.8),
        color: ult.color,
        secondaryColor: secColor,
        coreColor: '#ffffff',
        life: 0.92,
        maxLife: 0.92,
        tickTimer: 0,
        powerLevel: 6,
        style: charId === 'vegeta' ? 'final-flash' : charId === 'sans' ? 'gaster' : 'kamehameha',
      });
      for (const offset of [-0.24, 0.24]) {
        ctx.beams.push({
          id: ctx.nextId('ubeam'),
          ownerUid: f.uid,
          ownerCharId: charId,
          ownerSeries: series,
          skillMotif: `${charId}:ULT`,
          teamId: f.teamId,
          originX: f.x,
          originY: f.y,
          angle: baseAngle + offset,
          width: 22,
          damagePerTick: ctx.getEffectiveDamage(f, 3.2),
          color: form.auraColor,
          secondaryColor: secColor,
          coreColor: '#ffffff',
          life: 0.65,
          maxLife: 0.65,
          tickTimer: 0,
          powerLevel: 5,
        });
      }
      break;
    }

    case 'slash-storm': {
      // Entity 303 adds 2 spinning crimson Glitch Scythes + Error 303 bombs on top of Redstone Matrix slashes!
      if (charId === 'entity303') {
        for (const spread of [-0.35, 0.35]) {
          const a = baseAngle + spread;
          ctx.projectiles.push({
            id: ctx.nextId('uscythe'),
            ownerUid: f.uid,
            ownerCharId: charId,
            ownerSeries: series,
            skillMotif: `${charId}:ULT`,
            teamId: f.teamId,
            kind: 'scythe',
            x: f.x + Math.cos(a) * (f.radius + 16),
            y: f.y + Math.sin(a) * (f.radius + 16),
            vx: Math.cos(a) * 580,
            vy: Math.sin(a) * 580,
            radius: 26,
            damage: ctx.getEffectiveDamage(f, 13.5),
            knockback: 340,
            color: '#ff1f5a',
            secondaryColor: '#09090b',
            angle: a,
            life: 2.1,
            maxLife: 2.1,
            piercing: true,
            boomerang: true,
            returning: false,
            hitCooldowns: {},
            powerLevel: 6,
          });
        }
      }
      const count = 14;
      for (let i = 0; i < count; i++) {
        const focus = enemies.length > 0 && i < 8 ? enemies[i % enemies.length] : null;
        const cx = focus
          ? focus.x + (Math.random() - 0.5) * 80
          : left + 40 + Math.random() * (right - left - 80);
        const cy = focus
          ? focus.y + (Math.random() - 0.5) * 80
          : top + 40 + Math.random() * (bottom - top - 80);
        const ang = (Math.PI * i) / 7 + (Math.random() - 0.5) * 0.4;
        const halfLen = span * 0.52;
        ctx.slashes.push({
          id: ctx.nextId('usl'),
          ownerUid: f.uid,
          ownerCharId: charId,
          ownerSeries: series,
          skillMotif: `${charId}:ULT`,
          teamId: f.teamId,
          x1: cx - Math.cos(ang) * halfLen,
          y1: cy - Math.sin(ang) * halfLen,
          x2: cx + Math.cos(ang) * halfLen,
          y2: cy + Math.sin(ang) * halfLen,
          color: ult.color,
          secondaryColor: secColor,
          coreColor: '#ffffff',
          width: 8,
          telegraphTimer: 0.14 + i * 0.04,
          activeTimer: 0.1,
          fadeTimer: 0.3,
          maxFade: 0.3,
          damage: ctx.getEffectiveDamage(f, 5.4 + form.powerLevel * 0.7),
          hasStruck: false,
        });
      }
      break;
    }

    case 'mega-fist': {
      const isLuffyGear5 = charId === 'luffy' && form.visualVariant === 'gear5';
      for (const spread of [-0.42, 0, 0.42]) {
        const a = baseAngle + spread;
        const sx = f.x + Math.cos(a) * (f.radius + 6);
        const sy = f.y + Math.sin(a) * (f.radius + 6);
        ctx.ricochetArms.push({
          id: ctx.nextId('uarm'),
          ownerUid: f.uid,
          ownerCharId: charId,
          ownerSeries: series,
          skillMotif: `${charId}:ULT`,
          teamId: f.teamId,
          points: [
            { x: f.x, y: f.y },
            { x: sx, y: sy },
          ],
          headX: sx,
          headY: sy,
          vx: Math.cos(a) * 1320,
          vy: Math.sin(a) * 1320,
          bouncesLeft: 7,
          phase: 'extend',
          life: 1.65,
          maxLife: 1.65,
          damage: ctx.getEffectiveDamage(f, 11.5 + form.powerLevel * 1.4),
          color: charId === 'deku' ? '#09090b' : isLuffyGear5 ? '#ffffff' : ult.color,
          glowColor: ult.color,
          isGear5: isLuffyGear5,
          hitCooldowns: {},
        });
      }
      break;
    }

    case 'domain-void': {
      ctx.spawnShockwave(f.x, f.y, span * 0.85, ult.color, 7, charId, series);
      for (const enemy of enemies) {
        enemy.vx *= 0.25;
        enemy.vy *= 0.25;
      }
      const sigKind =
        charId === 'gojo'
          ? 'purple'
          : (f.character.skills.find((s) => s.projectileKind)?.projectileKind ?? 'void-eye');
      ctx.projectiles.push({
        id: ctx.nextId('uproj'),
        ownerUid: f.uid,
        ownerCharId: charId,
        ownerSeries: series,
        skillMotif: `${charId}:ULT`,
        teamId: f.teamId,
        kind: sigKind,
        x: f.x + Math.cos(baseAngle) * (f.radius + 24),
        y: f.y + Math.sin(baseAngle) * (f.radius + 24),
        vx: Math.cos(baseAngle) * 320,
        vy: Math.sin(baseAngle) * 320,
        radius: charId === 'gojo' ? 54 : 42,
        damage: ctx.getEffectiveDamage(f, 16 + form.powerLevel * 1.6),
        knockback: 520,
        color: ult.color,
        secondaryColor: secColor,
        angle: baseAngle,
        life: 3.0,
        maxLife: 3.0,
        piercing: true,
        blocksProjectiles: true,
        hitCooldowns: {},
        powerLevel: 6,
      });
      break;
    }

    case 'meteor-rain': {
      const isRocket = f.character.id === 'jinx';
      const isAhri = f.character.id === 'ahri';
      const isWither = f.character.id === 'wither';
      const isNaruto = f.character.id === 'naruto';
      if (isRocket) f.getExcitedTimer = 5.5;
      if (isNaruto) spawnShadowClones(ctx, f, form, 3);
      if (isWither) {
        // Wither Storm Tractor Beam pulls all enemies first!
        for (const enemy of enemies) {
          const dir = normalize(enemy.x - f.x, enemy.y - f.y);
          enemy.vx -= dir.x * 380;
          enemy.vy -= dir.y * 380;
        }
      }

      const sigProjKind =
        f.character.skills.find((s) => s.projectileKind)?.projectileKind ?? 'meteor';
      const spreads = isWither ? [-0.5, -0.25, 0, 0.25, 0.5] : [-0.36, 0, 0.36];
      for (const spread of spreads) {
        const a = baseAngle + spread;
        ctx.projectiles.push({
          id: ctx.nextId('uproj'),
          ownerUid: f.uid,
          teamId: f.teamId,
          kind: isRocket
            ? 'rocket'
            : isAhri
              ? 'boomerang'
              : isWither
                ? 'wither-skull'
                : isNaruto
                  ? 'rasenshuriken'
                  : sigProjKind,
          x: f.x + Math.cos(a) * (f.radius + 18),
          y: f.y + Math.sin(a) * (f.radius + 18),
          vx: Math.cos(a) * (isRocket ? 560 : isAhri ? 580 : 410),
          vy: Math.sin(a) * (isRocket ? 560 : isAhri ? 580 : 410),
          radius: isAhri ? 22 : isWither ? 24 : 30,
          damage: ctx.getEffectiveDamage(f, 13.5 + form.powerLevel * 1.4),
          knockback: 460,
          color: isWither ? '#38bdf8' : ult.color,
          secondaryColor: '#facc15',
          angle: a,
          life: 2.4,
          maxLife: 2.4,
          piercing: isAhri,
          boomerang: isAhri,
          returning: false,
          explosiveRadius: isAhri ? undefined : 145,
          hitCooldowns: {},
          powerLevel: 6,
        });
      }
      break;
    }

    case 'thunder-storm': {
      // Herobrine calls 5 Sky Lightning Pillars + Glitch Command Cubes!
      if (f.character.id === 'herobrine') {
        for (let i = 0; i < 5; i++) {
          const focus = enemies.length > 0 ? enemies[i % enemies.length] : null;
          const px = focus
            ? Math.max(left + 30, Math.min(right - 30, focus.x + (i - 2) * 55))
            : left + 60 + Math.random() * (right - left - 120);
          const py = focus ? focus.y : top + (bottom - top) * 0.65;
          ctx.skyPillars.push({
            id: ctx.nextId('usky'),
            ownerUid: f.uid,
            teamId: f.teamId,
            x: px,
            targetY: py,
            width: 48,
            color: '#ffffff',
            telegraphTimer: 0.16 + i * 0.08,
            activeTimer: 0.42,
            maxActive: 0.42,
            damage: ctx.getEffectiveDamage(f, 14.5 + form.powerLevel * 1.5),
            hasStruck: false,
          });
        }
        break;
      }
      if (f.character.id === 'sonic') {
        f.spinDashTimer = 1.2;
        f.vx = Math.cos(baseAngle) * 920;
        f.vy = Math.sin(baseAngle) * 920;
      }
      for (const enemy of enemies) {
        for (let b = 0; b < 2; b++) {
          ctx.lightningBolts.push({
            id: ctx.nextId('ubolt'),
            ownerCharId: charId,
            ownerSeries: series,
            skillMotif: `${charId}:ULT`,
            points: createJaggedBoltPoints(f.x, f.y, enemy.x, enemy.y, 8),
            color: b === 0 ? ult.color : secColor,
            coreColor: '#ffffff',
            width: 7,
            life: 0.42,
            maxLife: 0.42,
          });
        }
        const dir = normalize(enemy.x - f.x, enemy.y - f.y);
        ctx.applyDamage(
          f,
          enemy,
          ctx.getEffectiveDamage(f, 15.5 + form.powerLevel * 1.5),
          dir.x * 420,
          dir.y * 420,
          { isCrit: true, sourceKind: 'ability' },
        );
        ctx.spawnParticles(enemy.x, enemy.y, 16, ult.color, 110, 340, 2.5, 5.5, 'spark');
      }
      break;
    }

    case 'tnt-barrage': {
      // Steve Creative Mode summons an enraged Ender Dragon + 5-TNT ring!
      if (f.character.id === 'steve') {
        summonEnderDragon(ctx, f, form);
      }
      const sigBombKind = f.character.skills.find((s) => s.bombKind)?.bombKind ?? 'tnt';
      const count = 5;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count;
        const dist = 115;
        const bx = Math.max(left + 28, Math.min(right - 28, f.x + Math.cos(a) * dist));
        const by = Math.max(top + 28, Math.min(bottom - 28, f.y + Math.sin(a) * dist));
        ctx.bombs.push({
          id: ctx.nextId('utnt'),
          ownerUid: f.uid,
          teamId: f.teamId,
          kind: sigBombKind,
          x: bx,
          y: by,
          radius: 19,
          blastRadius: 185,
          damage: ctx.getEffectiveDamage(f, 13.5 + form.powerLevel * 1.4),
          fuseTimer: 0.65 + i * 0.08,
          maxFuse: 0.65 + i * 0.08,
          color: ult.color || '#ef4444',
        });
      }
      if (f.character.id === 'creeper') {
        detonateCreeperBlast(ctx, f, form);
      }
      break;
    }

    case 'gaster-cross': {
      // Warden fires 3 giant piercing Sonic Boom cannons!
      if (f.character.id === 'warden') {
        for (const spread of [-0.26, 0, 0.26]) {
          const a = baseAngle + spread;
          ctx.projectiles.push({
            id: ctx.nextId('usonic'),
            ownerUid: f.uid,
            teamId: f.teamId,
            kind: 'sonic-boom',
            x: f.x + Math.cos(a) * (f.radius + 18),
            y: f.y + Math.sin(a) * (f.radius + 18),
            vx: Math.cos(a) * 680,
            vy: Math.sin(a) * 680,
            radius: 40,
            damage: ctx.getEffectiveDamage(f, 15.5 + form.powerLevel * 1.5),
            knockback: 540,
            color: '#22d3ee',
            secondaryColor: '#ffffff',
            angle: a,
            life: 1.6,
            maxLife: 1.6,
            piercing: true,
            blocksProjectiles: true,
            hitCooldowns: {},
            powerLevel: 6,
          });
        }
        break;
      }
      const isSans = f.character.id === 'sans';
      const count = isSans ? 4 : 5;
      for (let i = 0; i < count; i++) {
        const a = isSans ? baseAngle + (Math.PI * 2 * i) / count : baseAngle + (i - 2) * 0.22;
        ctx.beams.push({
          id: ctx.nextId('ubeam'),
          ownerUid: f.uid,
          teamId: f.teamId,
          originX: f.x,
          originY: f.y,
          angle: a,
          width: isSans ? 28 : 22,
          damagePerTick: ctx.getEffectiveDamage(f, 4.4 + form.powerLevel * 0.6),
          color: i % 2 === 0 ? ult.color : '#38bdf8',
          coreColor: '#ffffff',
          life: 0.72,
          maxLife: 0.72,
          tickTimer: 0,
          powerLevel: 6,
          style: isSans ? 'gaster' : 'zoltraak',
        });
      }
      break;
    }

    case 'gravity-crush': {
      const isRimuru = charId === 'rimuru';
      ctx.spawnShockwave(f.x, f.y, span * 0.8, ult.color, 7, charId, series);
      for (const enemy of enemies) {
        const dir = normalize(enemy.x - f.x, enemy.y - f.y);
        const force = isRimuru ? -520 : 720;
        ctx.applyDamage(
          f,
          enemy,
          ctx.getEffectiveDamage(f, 15 + form.powerLevel * 1.5),
          dir.x * force,
          dir.y * force,
          { isCrit: true, sourceKind: 'ability', allowLifesteal: isRimuru },
        );
      }
      for (const p of ctx.projectiles) {
        if (p.ownerUid === f.uid) continue;
        p.vx = -p.vx * 1.25;
        p.vy = -p.vy * 1.25;
        p.ownerUid = f.uid;
        p.teamId = f.teamId;
      }
      break;
    }

    case 'mega-shockwave': {
      const blastR = Math.max(320, span * 0.65);
      ctx.spawnShockwave(f.x, f.y, blastR, ult.color, 9, charId, series);
      ctx.spawnShockwave(f.x, f.y, blastR * 0.65, secColor, 5, charId, series);
      const lifesteal = f.character.id === 'kratos' || f.character.id === 'denji';
      for (const enemy of enemies) {
        const dx = enemy.x - f.x;
        const dy = enemy.y - f.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= blastR) {
          const dir = normalize(dx, dy);
          ctx.applyDamage(
            f,
            enemy,
            ctx.getEffectiveDamage(f, 18.5 + form.powerLevel * 1.5),
            dir.x * 920,
            dir.y * 920,
            { isCrit: true, sourceKind: 'ability', allowLifesteal: lifesteal },
          );
        }
      }
      break;
    }

    case 'shadow-legion': {
      summonShadowSoldiers(ctx, f, form, 5, f.x, f.y);
      ctx.spawnShockwave(f.x, f.y, 260, ult.color, 6, charId, series);
      for (const enemy of enemies) {
        const dir = normalize(enemy.x - f.x, enemy.y - f.y);
        ctx.applyDamage(
          f,
          enemy,
          ctx.getEffectiveDamage(f, 12.5 + form.powerLevel * 1.2),
          dir.x * 340,
          dir.y * 340,
          { isCrit: true, sourceKind: 'ability' },
        );
      }
      break;
    }

    case 'blade-vortex': {
      const isYasuo = f.character.id === 'yasuo';
      const isTanjiro = f.character.id === 'tanjiro';
      const sigWaveKind =
        f.character.skills.find((s) => s.projectileKind)?.projectileKind ?? 'sword-wave';
      const waveCount = 5;
      for (let i = 0; i < waveCount; i++) {
        const a = baseAngle + (i - 2) * 0.25;
        ctx.projectiles.push({
          id: ctx.nextId('uproj'),
          ownerUid: f.uid,
          teamId: f.teamId,
          kind: isYasuo ? 'tornado' : f.character.id === 'asta' ? 'getsuga' : sigWaveKind,
          x: f.x + Math.cos(a) * (f.radius + 18),
          y: f.y + Math.sin(a) * (f.radius + 18),
          vx: Math.cos(a) * 580,
          vy: Math.sin(a) * 580,
          radius: 30,
          damage: ctx.getEffectiveDamage(f, 11.5 + form.powerLevel * 1.3),
          knockback: 380,
          color: ult.color,
          secondaryColor: '#ffffff',
          angle: a,
          life: 1.8,
          maxLife: 1.8,
          piercing: true,
          blocksProjectiles: isYasuo || f.character.id === 'asta',
          hitCooldowns: {},
          powerLevel: 6,
        });
      }
      if (isTanjiro) {
        for (let k = 0; k < 10; k++) {
          const a = (Math.PI * 2 * k) / 10;
          ctx.trails.push({
            id: ctx.nextId('utr'),
            ownerUid: f.uid,
            teamId: f.teamId,
            x: f.x + Math.cos(a) * 75,
            y: f.y + Math.sin(a) * 75,
            radius: 28,
            life: 4.0,
            maxLife: 4.0,
            damagePerTick: ctx.getEffectiveDamage(f, 4.8),
            element: 'sun',
            hitCooldowns: {},
          });
        }
      }
      break;
    }
  }
}

import { getLolBuildForCharacter, isLolChampion } from '../physics/lolShop';
import type { CharacterConfig, FighterState, FormConfig } from '../types/game';
import { drawAnimeOuterBodyAndCape, drawAnimeOuterWeaponAndHands } from './characterGear';
import { drawBespokeFaceMarkings, drawBespokeHairAndHeadgear } from './characterVisuals';
import { drawCharacterUniqueCrest, getCharacterVfxDNA } from './vfxIdentity';

export type FaceMood = 'confident' | 'focused' | 'fierce' | 'critical' | 'ko';

export function getFighterMood(f: FighterState): FaceMood {
  if (!f.alive || f.hp <= 0) return 'ko';
  const ratio = f.hp / f.maxHp;
  if (ratio <= 0.25) return 'critical';
  if (f.transformAngryTimer > 0 || f.abilityChargeTimer > 0 || f.fuseTimer > 0) return 'fierce';
  if (ratio > 0.6) return 'confident';
  return 'focused';
}

export function getTeamRingColor(teamId: number | null): string | null {
  if (teamId === 0) return '#38bdf8';
  if (teamId === 1) return '#f43f5e';
  return null;
}

/** Draw an active FighterState in the arena (including aura, weapons, face, and HP badge) */
export function drawFighterBall(
  ctx: CanvasRenderingContext2D,
  f: FighterState,
  timeSec: number,
): void {
  const form = f.character.forms[f.formIndex] ?? f.character.forms[0];

  for (const img of f.afterimages) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(0.65, img.alpha));
    ctx.translate(img.x, img.y);
    ctx.beginPath();
    ctx.arc(0, 0, f.radius * 0.96, 0, Math.PI * 2);
    ctx.fillStyle = img.color;
    ctx.fill();
    ctx.restore();
  }

  if (!f.alive && f.koFadeTimer <= 0) return;

  const baseAlpha = f.alive ? 1 : Math.max(0, Math.min(1, f.koFadeTimer / 0.55));
  const alpha = f.untargetableTimer > 0 ? baseAlpha * 0.22 : baseAlpha;
  const mood = getFighterMood(f);
  const r = f.radius;

  // Ground shadow when knocked Airborne (Yasuo Last Breath!)
  if (f.alive && f.airborneTimer > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(f.x, f.y + r * 0.72, r * 0.72, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(f.x, f.y - (f.airborneTimer > 0 ? 15 : 0));
  if (f.airborneTimer > 0) {
    ctx.scale(1.22, 1.22);
  }

  // Creeper fuse swelling & rapid blink!
  if (f.fuseTimer > 0) {
    const swell = 1 + (1 - f.fuseTimer / 0.42) * 0.22;
    ctx.scale(swell, swell);
  }

  if (f.squashTimer > 0) {
    const t = f.squashTimer / 0.13;
    ctx.rotate(f.squashAngle);
    ctx.scale(1 - t * 0.16, 1 + t * 0.14);
    ctx.rotate(-f.squashAngle);
  }

  drawAuraLayer(ctx, f.character, form, r, timeSec, f.orbitAngle, f.powerUpFlashTimer);

  // Saitama Rage Ring gauge or Universal Ultimate Near-Ready golden ring
  if (f.character.abilityId === 'serious-punch' && f.alive && f.rageProgress > 0.05) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f.rageProgress);
    ctx.strokeStyle = f.rageProgress > 0.8 ? '#ef4444' : '#facc15';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  } else if (f.alive && f.ultimateCharge >= 70) {
    ctx.save();
    const frac = Math.min(1, f.ultimateCharge / 100);
    ctx.beginPath();
    ctx.arc(0, 0, r + 9.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.strokeStyle = f.ultimateCharge >= 95 ? '#ffffff' : '#facc15';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();
  }

  // Team ring
  const teamColor = getTeamRingColor(f.teamId);
  if (teamColor) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r + 6.5, 0, Math.PI * 2);
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = teamColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  const isFuseBlink = f.fuseTimer > 0 && Math.floor(timeSec * 22) % 2 === 0;

  // Sonic Spin Dash curls into glowing buzzsaw ball!
  if (f.spinDashTimer > 0 && f.alive) {
    drawSonicSpinDashBall(ctx, r, form, f.spinAngle);
  } else {
    drawAnimeOuterBodyAndCape(ctx, f.character, form, r, f.facingAngle, timeSec);
    drawCharacterVectorHead(
      ctx,
      f.character,
      form,
      r,
      mood,
      timeSec,
      f.hitFlashTimer > 0 || isFuseBlink,
    );
  }

  // Orbiting / attached combat gear + External Anime Held Weapons & Hands!
  if (f.alive) {
    const chargeProgress =
      f.abilityChargeTimer > 0
        ? 1 - f.abilityChargeTimer / Math.max(0.01, f.abilityChargeDuration)
        : 0;
    switch (f.character.abilityId) {
      case 'santoryu-orbit':
        drawZoroOrbitingSwords(ctx, r, f.orbitAngle, form);
        break;
      case 'blades-of-chaos':
        drawKratosBlades(ctx, r, f.orbitAngle, form);
        break;
      case 'antimagic-cleave':
        drawAstaGreatsword(ctx, r, f.orbitAngle, form);
        break;
      case 'minecraft-tnt':
        drawMinecraftOrbitSword(ctx, r, f.orbitAngle, form);
        break;
      case 'meteor-orbs':
        if (form.powerLevel >= 3) drawTruthSeekingOrbs(ctx, r, f.orbitAngle, form);
        break;
      case 'judgment-cut':
        if (form.powerLevel >= 3) drawVergilMirageBlades(ctx, r, f.orbitAngle);
        break;
      default:
        break;
    }

    drawAnimeOuterWeaponAndHands(
      ctx,
      f.character,
      form,
      r,
      f.facingAngle,
      f.orbitAngle,
      chargeProgress,
      timeSec,
      true,
    );

    if (f.rasenganDashTimer > 0) {
      drawEnergyDashOrb(ctx, f, r, f.facingAngle, timeSec, form);
    }
    if (f.abilityChargeTimer > 0) {
      drawBeamCharge(ctx, r, f.abilityTargetAngle, chargeProgress, form);
    }
  }

  if (f.alive || f.koFadeTimer > 0.15) {
    // Active character-specific defensive shield barrier!
    if (f.alive && f.shieldTimer > 0) {
      drawCharacterShieldBarrier(ctx, f, form, r, timeSec);
    }

    // Active anime/game status overlays (Unlimited Void Overload, Frozen Ice Block, Time Stop, Chains, Genjutsu, Burn, 777 Immortal!)
    if (f.alive) {
      drawFighterStatusOverlay(ctx, f, r, timeSec);
    }

    drawHpBadge(ctx, r, Math.ceil(f.hp), teamColor ?? form.auraColor);
    if (f.alive && isLolChampion(f.character)) {
      drawLolInventoryBadge(ctx, f, r);
    }
  }

  ctx.restore();
}

function drawLolInventoryBadge(ctx: CanvasRenderingContext2D, f: FighterState, r: number): void {
  const build = getLolBuildForCharacter(f.character);
  if (build.length === 0) return;

  ctx.save();
  // Golden Hextech Shop purchase flash ring around the ball
  if (f.lolShopFlashTimer > 0) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.globalAlpha = Math.min(1, f.lolShopFlashTimer);
    ctx.beginPath();
    ctx.arc(0, 0, r + 9 + (1.25 - f.lolShopFlashTimer) * 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // 6-slot mini Hextech inventory bar under the HP pill
  const slotSize = 5.5;
  const gap = 1.6;
  const totalW = build.length * slotSize + (build.length - 1) * gap;
  const startX = -totalW * 0.5;
  const y = r * 0.78;

  ctx.fillStyle = 'rgba(9, 13, 24, 0.88)';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(startX - 2.5, y - 2, totalW + 5, slotSize + 4, 3);
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < build.length; i++) {
    const sx = startX + i * (slotSize + gap);
    const owned = i < f.lolItemsCount;
    ctx.fillStyle = owned ? build[i].color : 'rgba(30, 41, 59, 0.75)';
    ctx.fillRect(sx, y, slotSize, slotSize);
    ctx.strokeStyle = owned ? build[i].borderColor : '#475569';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(sx, y, slotSize, slotSize);
  }
  ctx.restore();
}

const portraitCache = new Map<string, string>();

/** Draw a large centered high-res showcase of a character during an Ultimate Cut-In */
export function drawUltimateShowcaseCharacter(
  ctx: CanvasRenderingContext2D,
  character: CharacterConfig,
  formIndex: number,
  radius: number,
  timeSec: number,
): void {
  const form = character.forms[formIndex] ?? character.forms[0];
  drawAuraLayer(ctx, character, form, radius, timeSec, timeSec * 4.5, 0.5);
  drawAnimeOuterBodyAndCape(ctx, character, form, radius, 0, timeSec);
  drawCharacterVectorHead(ctx, character, form, radius, 'fierce', timeSec, false);
  drawAnimeOuterWeaponAndHands(
    ctx,
    character,
    form,
    radius,
    -0.32,
    timeSec * 4.5,
    0.5,
    timeSec,
    false,
  );
}

export function getCharacterPortraitDataUrl(
  character: CharacterConfig,
  formIndex = 0,
  size = 96,
): string {
  const key = `${character.id}:${formIndex}:${size}`;
  const cached = portraitCache.get(key);
  if (cached) return cached;
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const form = character.forms[formIndex] ?? character.forms[0];
  const r = size * 0.27;
  ctx.translate(size * 0.48, size * 0.49);
  drawAuraLayer(ctx, character, form, r, 0.8, 0.4, 0);
  drawAnimeOuterBodyAndCape(ctx, character, form, r, 0, 0.8);
  drawCharacterVectorHead(
    ctx,
    character,
    form,
    r,
    formIndex > 0 ? 'fierce' : 'confident',
    0.8,
    false,
  );
  drawAnimeOuterWeaponAndHands(ctx, character, form, r, -0.35, 0.4, 0.2, 0.8, false);

  const url = canvas.toDataURL('image/png');
  portraitCache.set(key, url);
  return url;
}

/* ==================== AURA & FORM BACK-LAYER ==================== */
function drawAuraLayer(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
  t: number,
  orbitAngle: number,
  powerUpFlash: number,
): void {
  const level = form.powerLevel;

  ctx.save();
  const pulse = 1 + Math.sin(t * 9) * 0.05;
  const auraRadius = r + 5 + level * 2.5 + (powerUpFlash > 0 ? 8 : 0);
  const grad = ctx.createRadialGradient(0, 0, r * 0.75, 0, 0, auraRadius * pulse);
  grad.addColorStop(0, hexWithAlpha(form.auraColor, 0.55));
  grad.addColorStop(0.65, hexWithAlpha(form.auraColor, 0.22));
  grad.addColorStop(1, hexWithAlpha(form.auraColor, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius * pulse, 0, Math.PI * 2);
  ctx.fill();

  if (level >= 2) {
    const spikes = 10 + level * 2;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const ang = (i * Math.PI) / spikes + t * (level >= 4 ? 2.4 : 1.3);
      const isOuter = i % 2 === 0;
      const rad = isOuter ? r + 7 + level * 2.2 + Math.sin(t * 14 + i * 1.7) * 2.8 : r + 1.5;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = hexWithAlpha(form.auraColor, 0.28);
    ctx.strokeStyle = hexWithAlpha(form.auraSecondaryColor ?? form.auraColor, 0.72);
    ctx.lineWidth = 1.6;
    ctx.fill();
    ctx.stroke();
  }

  // Luffy Gear 5 cloud scarf
  if (char.id === 'luffy' && form.visualVariant === 'gear5') {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    for (let i = 0; i < 9; i++) {
      const ang = -Math.PI * 0.88 + (i / 8) * Math.PI * 0.76 + Math.PI;
      ctx.beginPath();
      ctx.arc(
        Math.cos(ang) * (r + 7),
        Math.sin(ang) * (r + 5),
        6.2 + Math.sin(t * 6 + i) * 1.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Gojo Infinite Void cosmic ring
  if (char.id === 'gojo' && form.visualVariant === 'void') {
    ctx.beginPath();
    ctx.arc(0, 0, r + 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.7)';
    ctx.lineWidth = 2.4;
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = t * 1.6 + (i * Math.PI * 2) / 6;
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#7dd3fc';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (r + 12), Math.sin(a) * (r + 12), 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Charged Creeper electric blue Minecraft shell
  if (char.id === 'creeper' && form.visualVariant === 'charged') {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Herobrine eerie haunted fog & command glitch rings
  if (char.id === 'herobrine' && form.powerLevel >= 4) {
    ctx.save();
    ctx.strokeStyle = form.visualVariant === 'god' ? '#ffffff' : '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 14;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, r + 8.5, t * 2.2, t * 2.2 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Entity 303 flickering redstone error glitch bars
  if (char.id === 'entity303') {
    ctx.save();
    for (let g = 0; g < 4; g++) {
      const a = t * 3 + g * 1.57;
      const gx = Math.cos(a) * (r + 7);
      const gy = Math.sin(a) * (r + 7);
      ctx.fillStyle =
        g % 2 === 0 ? '#ef4444' : form.visualVariant === 'system' ? '#22d3ee' : '#09090b';
      ctx.fillRect(gx - 5, gy - 2, 10, 4);
    }
    ctx.restore();
  }

  // Wither Boss swirling Wither Armor / Wither Storm barrier
  if (char.id === 'wither' && form.powerLevel >= 4) {
    ctx.save();
    const shieldCol = form.visualVariant === 'storm' ? '#c084fc' : '#38bdf8';
    ctx.strokeStyle = shieldCol;
    ctx.lineWidth = 3;
    ctx.shadowColor = shieldCol;
    ctx.shadowBlur = 16;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, r + 8, -t * 3, -t * 3 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Ahri glowing fox tails fan behind
  if (char.id === 'ahri') {
    ctx.save();
    for (let i = -2; i <= 2; i++) {
      const a = Math.PI / 2 + i * 0.42 + Math.sin(t * 5 + i) * 0.08;
      ctx.fillStyle = hexWithAlpha(form.auraColor, 0.48);
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(a) * (r + 8),
        Math.sin(a) * (r + 8),
        7,
        13,
        a - Math.PI / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  // Sasuke Susanoo purple skeletal halo
  if (char.id === 'sasuke' && form.visualVariant === 'susanoo') {
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.88)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 9, -Math.PI * 0.85, Math.PI * 0.85);
    ctx.stroke();
  }

  // Denji Chainsaw Teeth spinning rim
  if (char.id === 'denji') {
    const teethCount =
      form.visualVariant === 'herohell' ? 18 : form.visualVariant === 'hybrid' ? 14 : 10;
    const toothLen =
      form.visualVariant === 'herohell' ? 11 : form.visualVariant === 'hybrid' ? 8.5 : 5;
    const sawColor = form.visualVariant === 'herohell' ? '#ef4444' : '#cbd5e1';
    ctx.save();
    ctx.rotate(orbitAngle * 1.6);
    ctx.fillStyle = sawColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < teethCount; i++) {
      const a = (i * Math.PI * 2) / teethCount;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(r - 1, -3.2);
      ctx.lineTo(r + toothLen, 0.8);
      ctx.lineTo(r - 1, 3.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  ctx.restore();
}

/* ==================== CORE CHARACTER VECTOR HEAD ==================== */
function drawCharacterVectorHead(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
  mood: FaceMood,
  t: number,
  hitFlash: boolean,
): void {
  const isDenjiHelmet =
    char.id === 'denji' && (form.visualVariant === 'hybrid' || form.visualVariant === 'herohell');
  const isRimuruSlime = char.id === 'rimuru' && form.visualVariant === 'slime';
  const isCreeper = char.id === 'creeper';
  const isSteve = char.id === 'steve';
  const isHerobrine = char.id === 'herobrine';
  const isEntity303 = char.id === 'entity303';
  const isWarden = char.id === 'warden';
  const isWither = char.id === 'wither';
  const isSans = char.id === 'sans';
  const isPikachu = char.id === 'pikachu';
  const isSonic = char.id === 'sonic';

  // 1. Back silhouettes (hair spikes, ears, braids, quills!)
  drawBackSilhouette(ctx, char, form, r, t);

  // 2. Head Sphere base
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);

  if (isDenjiHelmet) {
    const helmColor = form.visualVariant === 'herohell' ? '#1f2937' : '#f97316';
    const helmDark = form.visualVariant === 'herohell' ? '#09090b' : '#c2410c';
    const g = ctx.createRadialGradient(-r * 0.25, -r * 0.28, r * 0.1, 0, 0, r);
    g.addColorStop(0, helmColor);
    g.addColorStop(1, helmDark);
    ctx.fillStyle = g;
  } else if (isRimuruSlime) {
    const g = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.1, 0, 0, r);
    g.addColorStop(0, '#bae6fd');
    g.addColorStop(0.55, '#38bdf8');
    g.addColorStop(1, '#0284c7');
    ctx.fillStyle = g;
  } else if (isSonic) {
    const bodyColor = form.hairColor;
    const g = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.1, 0, 0, r);
    g.addColorStop(0, bodyColor);
    g.addColorStop(1, shadeHex(bodyColor, -26));
    ctx.fillStyle = g;
  } else {
    const skin =
      char.id === 'luffy' && form.visualVariant === 'steam'
        ? '#f6b3a5'
        : char.id === 'yasuo' && form.visualVariant === 'nightbringer'
          ? '#3f1d1d'
          : char.skinColor;
    const g = ctx.createRadialGradient(-r * 0.24, -r * 0.3, r * 0.12, 0, 0, r);
    g.addColorStop(0, skin);
    g.addColorStop(1, shadeHex(skin, -18));
    ctx.fillStyle = g;
  }
  ctx.fill();

  // Clip interior features inside ball circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r - 0.5, 0, Math.PI * 2);
  ctx.clip();

  drawCollar(ctx, char, form, r);
  drawFaceMarkings(ctx, char, form, r);
  drawBespokeFaceMarkings(ctx, char, form, r);

  if (isDenjiHelmet) {
    drawDenjiHelmetFace(ctx, form, r, mood);
  } else if (isRimuruSlime) {
    drawRimuruSlimeFace(ctx, r, mood);
  } else if (isCreeper) {
    drawCreeperFace(ctx, r, mood);
  } else if (isSteve) {
    drawMinecraftSteveFace(ctx, r, mood);
  } else if (isHerobrine) {
    drawHerobrineFace(ctx, form, r, mood);
  } else if (isEntity303) {
    drawEntity303Face(ctx, form, r, mood, t);
  } else if (isWarden) {
    drawWardenFace(ctx, form, r, mood, t);
  } else if (isWither) {
    drawWitherFace(ctx, form, r, mood);
  } else if (isSans) {
    drawSansFace(ctx, form, r, mood, t);
  } else if (isPikachu) {
    drawPikachuFace(ctx, r, mood);
  } else if (isSonic) {
    drawSonicFace(ctx, form, r, mood);
  } else if (drawExpansionSpecialFace(ctx, char, form, r, mood, t)) {
    // Handled by bespoke expansion face renderer (Minecraft mobs, masked ninjas, stands, monsters, helmets)
  } else {
    drawAnimeFace(ctx, char, form, r, mood);
  }

  if (char.id === 'ichigo' && form.visualVariant === 'hollow') {
    drawIchigoHollowMask(ctx, r, mood);
  }

  if (char.id === 'gojo' && (form.visualVariant === 'base' || form.visualVariant === 'red')) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-r, -r * 0.32, r * 2, r * 0.44);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-r, -r * 0.1);
    ctx.lineTo(r, -r * 0.1);
    ctx.stroke();
  }

  if (hitFlash) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
    ctx.fillRect(-r, -r, r * 2, r * 2);
  }

  ctx.restore(); // end interior clip

  // Outer ink outline
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#070b14';
  ctx.lineWidth = 2.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, r - 1.8, 0, Math.PI * 2);
  ctx.strokeStyle = hexWithAlpha(form.auraColor, 0.6);
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();

  // 3. Front hair bangs, hats, helmets, horns, earrings
  drawFrontHairAndAccessories(ctx, char, form, r);
}

function drawBackSilhouette(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
  t: number,
): void {
  // Goku wild Saiyan spikes
  if (char.id === 'goku') {
    ctx.save();
    ctx.fillStyle = form.hairColor;
    ctx.strokeStyle = '#070b14';
    ctx.lineWidth = 2;
    const spikes: Array<[number, number, number]> =
      form.visualVariant === 'ssj3'
        ? [
            [-1.35, -0.45, 0.72],
            [-1.4, 0.3, 0.85],
            [-1.0, 0.95, 0.85],
            [1.0, 0.95, 0.85],
            [1.4, 0.3, 0.85],
            [1.35, -0.45, 0.72],
            [-0.75, -1.42, 0.85],
            [0.05, -1.52, 0.95],
            [0.82, -1.36, 0.82],
          ]
        : [
            [-1.36, -0.55, 0.65],
            [-1.38, 0.05, 0.6],
            [-0.85, -1.35, 0.78],
            [-0.08, -1.48, 0.86],
            [0.75, -1.32, 0.76],
            [1.36, -0.48, 0.66],
            [1.26, 0.08, 0.54],
          ];
    drawSpikeArray(ctx, r, spikes);
    ctx.restore();
    return;
  }

  // Vegeta tall flame crown hair
  if (char.id === 'vegeta') {
    ctx.save();
    ctx.fillStyle = form.hairColor;
    ctx.strokeStyle = '#070b14';
    ctx.lineWidth = 2;
    drawSpikeArray(ctx, r, [
      [-0.95, -1.25, 0.72],
      [-0.45, -1.55, 0.75],
      [0, -1.66, 0.84],
      [0.45, -1.55, 0.75],
      [0.95, -1.25, 0.72],
    ]);
    ctx.restore();
    return;
  }

  // Madara huge wild mane
  if (char.id === 'madara') {
    ctx.save();
    ctx.fillStyle = form.hairColor;
    ctx.strokeStyle = '#070b14';
    ctx.lineWidth = 2;
    drawSpikeArray(ctx, r, [
      [-1.32, -0.7, 0.75],
      [-1.42, 0.1, 0.8],
      [-1.22, 0.8, 0.75],
      [1.22, 0.8, 0.75],
      [1.42, 0.1, 0.8],
      [1.32, -0.7, 0.75],
      [-0.5, -1.38, 0.72],
      [0.5, -1.38, 0.72],
    ]);
    ctx.restore();
    return;
  }

  // Luffy Gear 5 cloud halo
  if (char.id === 'luffy' && form.visualVariant === 'gear5') {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * 0.95 + (i / 8) * Math.PI * 0.9;
      const rad = r + 5 + Math.sin(t * 7 + i) * 1.5;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rad, Math.sin(a) * rad, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Pikachu long black-tipped ears!
  if (char.id === 'pikachu') {
    ctx.save();
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * r * 0.55, -r * 0.72);
      ctx.rotate(side * 0.45);
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.45, r * 0.22, r * 0.56, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Iconic black ear tip
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-r * 0.3, -r * 1.05, r * 0.6, r * 0.36);
      ctx.restore();
      ctx.restore();
    }
    ctx.restore();
    return;
  }

  // Sonic quills & pointed ears!
  if (char.id === 'sonic') {
    ctx.save();
    ctx.fillStyle = form.hairColor;
    ctx.strokeStyle = '#070b14';
    ctx.lineWidth = 2;
    drawSpikeArray(ctx, r, [
      [-1.38, -0.58, 0.74],
      [-1.45, -0.05, 0.72],
      [-1.25, 0.55, 0.65],
      [1.38, -0.58, 0.74],
      [1.45, -0.05, 0.72],
      [1.25, 0.55, 0.65],
    ]);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.35, -r * 0.78);
      ctx.lineTo(side * r * 0.85, -r * 1.32);
      ctx.lineTo(side * r * 0.88, -r * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f5cba7';
      ctx.beginPath();
      ctx.moveTo(side * r * 0.5, -r * 0.78);
      ctx.lineTo(side * r * 0.78, -r * 1.12);
      ctx.lineTo(side * r * 0.78, -r * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = form.hairColor;
    }
    ctx.restore();
    return;
  }

  // Ahri fox ears!
  if (char.id === 'ahri') {
    ctx.save();
    for (const side of [-1, 1]) {
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(side * r * 0.25, -r * 0.82);
      ctx.lineTo(side * r * 0.78, -r * 1.48);
      ctx.lineTo(side * r * 0.9, -r * 0.58);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fce7f3';
      ctx.beginPath();
      ctx.moveTo(side * r * 0.42, -r * 0.82);
      ctx.lineTo(side * r * 0.72, -r * 1.24);
      ctx.lineTo(side * r * 0.78, -r * 0.68);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  // Frieren pointed elf ears & twin tails!
  if (char.id === 'frieren') {
    ctx.save();
    ctx.fillStyle = char.skinColor;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.85, -r * 0.16);
      ctx.lineTo(side * r * 1.48, -r * 0.08);
      ctx.lineTo(side * r * 0.88, r * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Silver twin-tails
    ctx.fillStyle = form.hairColor;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * r * 1.04, r * 0.25, r * 0.22, r * 0.58, side * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Jinx long electric-blue twin braids!
  if (char.id === 'jinx') {
    ctx.save();
    ctx.fillStyle = form.hairColor;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    for (const side of [-1, 1]) {
      for (let b = 0; b < 3; b++) {
        ctx.beginPath();
        ctx.arc(side * (r * 0.96 + b * 2), r * 0.08 + b * 11, 6.5 - b * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  // Yasuo tall high samurai ponytail!
  if (char.id === 'yasuo') {
    ctx.save();
    ctx.fillStyle = form.hairColor;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, -r * 0.85);
    ctx.quadraticCurveTo(-r * 0.55, -r * 1.45, 0, -r * 1.65);
    ctx.quadraticCurveTo(r * 0.55, -r * 1.4, r * 0.25, -r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Mob floating 100% / ???% psychic hair!
  if (char.id === 'mob' && form.powerLevel >= 3) {
    ctx.save();
    ctx.fillStyle = form.hairColor;
    ctx.strokeStyle = form.auraColor;
    ctx.lineWidth = 1.8;
    drawSpikeArray(ctx, r, [
      [-1.05, -1.18, 0.72],
      [-0.48, -1.42, 0.75],
      [0, -1.48, 0.8],
      [0.48, -1.42, 0.75],
      [1.05, -1.18, 0.72],
    ]);
    ctx.restore();
    return;
  }

  // Entity 303 sharp pointed white reaper hood silhouette!
  if (char.id === 'entity303') {
    ctx.save();
    ctx.fillStyle = form.hairColor;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-r * 1.12, r * 0.25);
    ctx.lineTo(-r * 1.05, -r * 0.65);
    ctx.lineTo(0, -r * 1.45);
    ctx.lineTo(r * 1.05, -r * 0.65);
    ctx.lineTo(r * 1.12, r * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Warden pulsing Deep Dark Sculk Sensor antlers!
  if (char.id === 'warden') {
    ctx.save();
    const glow = 0.75 + Math.sin(t * 9) * 0.25;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * r * 0.75, -r * 0.48);
      ctx.rotate(side * 0.45);
      // Dark teal antler stalk
      ctx.fillStyle = '#0f2933';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-r * 0.16, -r * 0.82, r * 0.32, r * 0.75, 4);
      ctx.fill();
      ctx.stroke();
      // Glowing cyan sculk sensor tendrils
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10 * glow;
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-r * 0.22, -r * 0.92, r * 0.44, r * 0.2);
      ctx.fillRect(-r * 0.14, -r * 0.6, r * 0.28, r * 0.14);
      ctx.restore();
    }
    ctx.restore();
    return;
  }

  // Wither Boss two flanking side Wither skulls!
  if (char.id === 'wither') {
    ctx.save();
    const sideEyeCol =
      form.visualVariant === 'storm'
        ? '#c084fc'
        : form.visualVariant === 'armor'
          ? '#38bdf8'
          : '#f8fafc';
    for (const side of [-1, 1]) {
      const sx = side * (r * 1.04);
      const sy = -r * 0.08 + Math.sin(t * 6 + side) * 2.5;
      const sr = r * 0.42;
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      ctx.strokeRect(sx - sr, sy - sr, sr * 2, sr * 2);
      // Mini skull glowing eyes
      ctx.fillStyle = sideEyeCol;
      ctx.fillRect(sx - sr * 0.62, sy - sr * 0.25, sr * 0.42, sr * 0.28);
      ctx.fillRect(sx + sr * 0.2, sy - sr * 0.25, sr * 0.42, sr * 0.28);
      // Mini grim mouth
      ctx.fillStyle = '#09090b';
      ctx.fillRect(sx - sr * 0.5, sy + sr * 0.28, sr, sr * 0.28);
    }
    ctx.restore();
  }
}

function drawSpikeArray(
  ctx: CanvasRenderingContext2D,
  r: number,
  spikes: Array<[number, number, number]>,
): void {
  for (const [tx, ty, baseSpread] of spikes) {
    const ang = Math.atan2(ty, tx);
    const bx1 = Math.cos(ang - 0.32 * baseSpread) * (r * 0.76);
    const by1 = Math.sin(ang - 0.32 * baseSpread) * (r * 0.76);
    const bx2 = Math.cos(ang + 0.32 * baseSpread) * (r * 0.76);
    const by2 = Math.sin(ang + 0.32 * baseSpread) * (r * 0.76);
    ctx.beginPath();
    ctx.moveTo(bx1, by1);
    ctx.lineTo(tx * r, ty * r);
    ctx.lineTo(bx2, by2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

/* ==================== COLLARS & CLOTHING ==================== */
function drawCollar(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
): void {
  const y = r * 0.62;
  ctx.save();

  switch (char.accessory) {
    case 'straw-hat':
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, y + r * 0.2, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'gi-collar':
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.moveTo(-r * 0.38, y);
      ctx.lineTo(0, r * 0.98);
      ctx.lineTo(r * 0.38, y);
      ctx.closePath();
      ctx.fill();
      break;
    case 'headband':
      ctx.fillStyle = form.visualVariant === 'baryon' ? '#dc2626' : '#f97316';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-r * 0.22, y, r * 0.44, r * 0.45);
      break;
    case 'blindfold':
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-r, y - 2, r * 2, r * 0.55);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r, y - 2);
      ctx.lineTo(r, y - 2);
      ctx.stroke();
      break;
    case 'sukuna-marks':
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, y);
      ctx.lineTo(0, r);
      ctx.lineTo(r * 0.45, y);
      ctx.stroke();
      break;
    case 'zoro-scar':
      ctx.fillStyle = '#14532d';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-r, y + r * 0.2, r * 2, r * 0.14);
      break;
    case 'hanafuda': {
      const cell = r * 0.25;
      for (let gx = -4; gx <= 4; gx++) {
        for (let gy = 0; gy < 2; gy++) {
          ctx.fillStyle = (gx + gy) % 2 === 0 ? '#10b981' : '#09090b';
          ctx.fillRect(gx * cell, y + gy * cell, cell + 0.5, cell + 0.5);
        }
      }
      break;
    }
    case 'shihakusho':
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-r * 0.42, y);
      ctx.lineTo(0, r * 0.98);
      ctx.lineTo(r * 0.42, y);
      ctx.stroke();
      break;
    case 'bald-cape':
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-r * 0.65, y);
      ctx.lineTo(-r * 0.35, r);
      ctx.lineTo(-r, r);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.65, y);
      ctx.lineTo(r * 0.35, r);
      ctx.lineTo(r, r);
      ctx.closePath();
      ctx.fill();
      break;
    case 'scout-cloak':
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-r * 0.26, y - 1);
      ctx.lineTo(r * 0.26, y - 1);
      ctx.lineTo(r * 0.14, r);
      ctx.lineTo(-r * 0.14, r);
      ctx.closePath();
      ctx.fill();
      break;
    case 'hunter-collar':
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-r, y - 2, r * 2, r * 0.55);
      ctx.strokeStyle = form.visualVariant === 'monarch' ? '#a855f7' : '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, y - 2);
      ctx.lineTo(0, r * 0.92);
      ctx.lineTo(r * 0.5, y - 2);
      ctx.stroke();
      break;
    case 'chainsaw-tie':
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.moveTo(-r * 0.12, y);
      ctx.lineTo(r * 0.12, y);
      ctx.lineTo(r * 0.18, r);
      ctx.lineTo(-r * 0.18, r);
      ctx.closePath();
      ctx.fill();
      break;
    case 'uchiha-collar':
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-r, y - 2, r * 2, r * 0.55);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(-r * 0.28, y, r * 0.56, r * 0.45);
      break;
    case 'saiyan-armor':
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-r * 0.72, y, r * 1.44, r * 0.3);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-r * 0.82, y, r * 0.28, r * 0.35);
      ctx.fillRect(r * 0.54, y, r * 0.28, r * 0.35);
      break;
    case 'turtleneck':
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-r, y - 2, r * 2, r * 0.55);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-r, y + r * 0.18, r * 2, r * 0.14);
      break;
    case 'titan-collar':
      if (form.visualVariant === 'base') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-r, y, r * 2, r * 0.5);
      }
      break;
    case 'madara-armor':
      ctx.fillStyle = form.visualVariant === 'juubi' ? '#f8fafc' : '#991b1b';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-r * 0.25, y, r * 0.5, r * 0.45);
      break;
    case 'hero-mask':
      ctx.fillStyle = '#047857';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-r * 0.45, y + 2, r * 0.9, r * 0.24);
      break;
    case 'demon-fur':
      if (form.visualVariant !== 'slime') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-r, y, r * 2, r * 0.5);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-r, y - 2, r * 2, r * 0.18);
      }
      break;
    case 'bulls-band':
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-r, y, r * 2, r * 0.1);
      break;
    case 'mage-collar':
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-r, y, r * 2, r * 0.12);
      break;
    case 'school-uniform':
      ctx.fillStyle = '#111827';
      ctx.fillRect(-r, y - 2, r * 2, r * 0.55);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-r * 0.16, y - 2, r * 0.32, r * 0.16);
      break;
    case 'minecraft-shirt':
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      break;
    case 'herobrine-shirt':
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = form.visualVariant === 'god' ? '#ffffff' : '#0f172a';
      ctx.fillRect(-r * 0.22, y, r * 0.44, r * 0.45);
      break;
    case 'entity303-hood':
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-r, y - 2, r * 2, r * 0.55);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-r * 0.16, y - 2, r * 0.32, r * 0.52);
      break;
    case 'warden-sculk':
      ctx.fillStyle = '#042f2e';
      ctx.fillRect(-r, y - 2, r * 2, r * 0.55);
      // Glowing cyan ribcage + soul heart
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-r * 0.55, y + 1, r * 1.1, r * 0.08);
      ctx.fillRect(-r * 0.45, y + r * 0.16, r * 0.9, r * 0.08);
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(0, y + r * 0.12, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'wither-ribs':
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-r, y - 2, r * 2, r * 0.55);
      ctx.fillStyle = '#71717a';
      ctx.fillRect(-r * 0.6, y + 1, r * 1.2, r * 0.09);
      ctx.fillRect(-r * 0.48, y + r * 0.16, r * 0.96, r * 0.09);
      ctx.fillRect(-r * 0.12, y - 2, r * 0.24, r * 0.5);
      break;
    case 'ionian-pauldron':
      ctx.fillStyle = form.visualVariant === 'nightbringer' ? '#450a0a' : '#1e3a8a';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-r, y, r * 0.55, r * 0.35);
      break;
    case 'fox-collar':
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(-r, y, r * 2, r * 0.14);
      break;
    case 'jinx-harness':
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, y);
      ctx.lineTo(r * 0.5, r);
      ctx.moveTo(r * 0.5, y);
      ctx.lineTo(-r * 0.5, r);
      ctx.stroke();
      break;
    case 'sans-hoodie':
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-r * 0.72, y - 3, r * 1.44, r * 0.22);
      break;
    case 'vergil-coat':
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-r, y - 2, r * 2, r * 0.55);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-r * 0.18, y - 2, r * 0.36, r * 0.45);
      break;
    case 'spartan-strap':
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-r * 0.7, y, r * 0.35, r * 0.45);
      break;
    default:
      // Generic data-driven collar for all 100 expansion characters using secondary & primary colors!
      ctx.fillStyle = char.secondaryColor;
      ctx.fillRect(-r, y, r * 2, r * 0.5);
      ctx.fillStyle = char.primaryColor;
      ctx.beginPath();
      ctx.moveTo(-r * 0.38, y);
      ctx.lineTo(0, r * 0.98);
      ctx.lineTo(r * 0.38, y);
      ctx.closePath();
      ctx.fill();
      break;
  }

  ctx.restore();
}

/* ==================== SPECIAL CHARACTER FACES ==================== */
function drawRimuruSlimeFace(ctx: CanvasRenderingContext2D, r: number, mood: FaceMood): void {
  ctx.save();
  // Glossy wet highlight
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.34, -r * 0.45, r * 0.24, r * 0.13, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#0c4a6e';
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  if (mood === 'ko') {
    for (const side of [-1, 1]) {
      const cx = side * r * 0.32;
      ctx.beginPath();
      ctx.moveTo(cx - 5, -5);
      ctx.lineTo(cx + 5, 5);
      ctx.moveTo(cx + 5, -5);
      ctx.lineTo(cx - 5, 5);
      ctx.stroke();
    }
  } else {
    // Iconic cute Rimuru slime curved eyes!
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.18, 0);
      ctx.quadraticCurveTo(side * r * 0.35, mood === 'fierce' ? 5 : -8, side * r * 0.52, 0);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawMinecraftSteveFace(ctx: CanvasRenderingContext2D, r: number, mood: FaceMood): void {
  ctx.save();
  const px = r * 0.22;
  // Blocky pixel eyes (white outer + indigo inner!)
  if (mood === 'ko') {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      const cx = side * r * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx - 5, -6);
      ctx.lineTo(cx + 5, 4);
      ctx.moveTo(cx + 5, -6);
      ctx.lineTo(cx - 5, 4);
      ctx.stroke();
    }
  } else {
    // Left eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-r * 0.58, -px * 0.65, px * 1.1, px * 0.72);
    ctx.fillStyle = '#4338ca';
    ctx.fillRect(-r * 0.58 + px * 0.45, -px * 0.65, px * 0.65, px * 0.72);
    // Right eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(r * 0.58 - px * 1.1, -px * 0.65, px * 1.1, px * 0.72);
    ctx.fillStyle = '#4338ca';
    ctx.fillRect(r * 0.58 - px * 1.1, -px * 0.65, px * 0.65, px * 0.72);
  }
  // Pixel nose
  ctx.fillStyle = '#9a684a';
  ctx.fillRect(-px * 0.5, px * 0.15, px, px * 0.55);
  // Iconic Steve blocky smile / goatee!
  ctx.fillStyle = '#5c341d';
  ctx.fillRect(-px * 1.05, px * 0.75, px * 2.1, px * 0.95);
  ctx.fillStyle = '#b98263';
  ctx.fillRect(-px * 0.55, px * 0.75, px * 1.1, px * 0.55);
  ctx.restore();
}

function drawHerobrineFace(
  ctx: CanvasRenderingContext2D,
  form: FormConfig,
  r: number,
  mood: FaceMood,
): void {
  ctx.save();
  const px = r * 0.22;
  if (mood === 'ko') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      const cx = side * r * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx - 5, -6);
      ctx.lineTo(cx + 5, 4);
      ctx.moveTo(cx + 5, -6);
      ctx.lineTo(cx - 5, 4);
      ctx.stroke();
    }
  } else {
    // Unmistakable pure-white glowing Herobrine blank eyes!
    ctx.shadowColor = form.visualVariant === 'god' ? '#38bdf8' : '#ffffff';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-r * 0.62, -px * 0.68, px * 1.25, px * 0.76);
    ctx.fillRect(r * 0.62 - px * 1.25, -px * 0.68, px * 1.25, px * 0.76);
    ctx.shadowBlur = 0;
  }
  // Pixel nose + stern Herobrine goatee
  ctx.fillStyle = '#8b5a3c';
  ctx.fillRect(-px * 0.48, px * 0.16, px * 0.96, px * 0.52);
  ctx.fillStyle = '#432210';
  ctx.fillRect(-px * 1.05, px * 0.78, px * 2.1, px * 0.92);
  ctx.fillStyle = '#a87252';
  ctx.fillRect(-px * 0.5, px * 0.78, px, px * 0.45);
  ctx.restore();
}

function drawEntity303Face(
  ctx: CanvasRenderingContext2D,
  form: FormConfig,
  r: number,
  mood: FaceMood,
  t: number,
): void {
  ctx.save();
  // Pitch-black shadow void face
  ctx.fillStyle = '#050507';
  ctx.fillRect(-r, -r, r * 2, r * 1.7);

  // Subtle redstone glitch scanlines
  if (form.powerLevel >= 4) {
    const gy = ((t * 40) % (r * 1.2)) - r * 0.6;
    ctx.fillStyle =
      form.visualVariant === 'system' ? 'rgba(34, 211, 238, 0.35)' : 'rgba(239, 68, 68, 0.35)';
    ctx.fillRect(-r * 0.85, gy, r * 1.7, 2.5);
  }

  const px = r * 0.22;
  if (mood === 'ko') {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      const cx = side * r * 0.34;
      ctx.beginPath();
      ctx.moveTo(cx - 5, -6);
      ctx.lineTo(cx + 5, 4);
      ctx.moveTo(cx + 5, -6);
      ctx.lineTo(cx - 5, 4);
      ctx.stroke();
    }
  } else {
    // Piercing glowing crimson pixel eyes!
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-r * 0.58, -px * 0.65, px * 1.15, px * 0.72);
    ctx.fillRect(r * 0.58 - px * 1.15, -px * 0.65, px * 1.15, px * 0.72);
    ctx.fillStyle = '#fecaca';
    ctx.fillRect(-r * 0.42, -px * 0.46, px * 0.5, px * 0.32);
    ctx.fillRect(r * 0.42 - px * 0.5, -px * 0.46, px * 0.5, px * 0.32);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

function drawWardenFace(
  ctx: CanvasRenderingContext2D,
  form: FormConfig,
  r: number,
  mood: FaceMood,
  t: number,
): void {
  ctx.save();
  // Deep Dark mottled sculk speckles
  ctx.fillStyle = '#042f2e';
  ctx.fillRect(-r * 0.75, -r * 0.55, r * 0.4, r * 0.32);
  ctx.fillRect(r * 0.32, -r * 0.48, r * 0.38, r * 0.3);

  // Glowing cyan sculk veins on temples
  const pulse = 0.65 + Math.sin(t * 10) * 0.35;
  ctx.fillStyle = hexWithAlpha(form.auraColor, pulse);
  ctx.fillRect(-r * 0.72, -r * 0.12, r * 0.2, r * 0.16);
  ctx.fillRect(r * 0.52, -r * 0.12, r * 0.2, r * 0.16);

  // Blind hollow gaping Deep Dark mouth (no eyes!)
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(-r * 0.46, -r * 0.28, r * 0.92, r * 0.72, 6);
  ctx.fill();
  ctx.stroke();

  if (mood === 'ko') {
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-r * 0.22, -r * 0.08);
    ctx.lineTo(r * 0.22, r * 0.22);
    ctx.moveTo(r * 0.22, -r * 0.08);
    ctx.lineTo(-r * 0.22, r * 0.22);
    ctx.stroke();
  } else {
    // Glowing cyan inner sonic throat core when fierce/agitated
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = form.powerLevel >= 4 ? 14 : 7;
    ctx.fillStyle = form.powerLevel >= 4 ? '#67e8f9' : '#0891b2';
    ctx.beginPath();
    ctx.arc(0, r * 0.08, r * (mood === 'fierce' ? 0.24 : 0.15), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pale bone jaw teeth ridges
    ctx.fillStyle = '#cbd5e1';
    for (let i = -1; i <= 1; i++) {
      ctx.fillRect(i * r * 0.24 - r * 0.06, -r * 0.28, r * 0.12, r * 0.15);
      ctx.fillRect(i * r * 0.24 - r * 0.06, r * 0.3, r * 0.12, r * 0.14);
    }
  }
  ctx.restore();
}

function drawWitherFace(
  ctx: CanvasRenderingContext2D,
  form: FormConfig,
  r: number,
  mood: FaceMood,
): void {
  ctx.save();
  // Charcoal blocky Wither skull patches
  ctx.fillStyle = '#18181b';
  ctx.fillRect(-r * 0.8, -r * 0.75, r * 0.42, r * 0.38);
  ctx.fillRect(r * 0.35, -r * 0.72, r * 0.42, r * 0.36);
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(-r * 0.25, -r * 0.65, r * 0.5, r * 0.26);

  const px = r * 0.23;
  const eyeCol =
    form.visualVariant === 'storm'
      ? '#c084fc'
      : form.visualVariant === 'armor'
        ? '#38bdf8'
        : '#f8fafc';

  if (mood === 'ko') {
    ctx.strokeStyle = eyeCol;
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      const cx = side * r * 0.36;
      ctx.beginPath();
      ctx.moveTo(cx - 5, -6);
      ctx.lineTo(cx + 5, 4);
      ctx.moveTo(cx + 5, -6);
      ctx.lineTo(cx - 5, 4);
      ctx.stroke();
    }
  } else {
    // Dark recessed skull eye sockets + glowing Wither pixel eyes!
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-r * 0.62, -px * 0.72, px * 1.25, px * 0.85);
    ctx.fillRect(r * 0.62 - px * 1.25, -px * 0.72, px * 1.25, px * 0.85);

    ctx.shadowColor = eyeCol;
    ctx.shadowBlur = 10;
    ctx.fillStyle = eyeCol;
    ctx.fillRect(-r * 0.48, -px * 0.55, px * 0.72, px * 0.48);
    ctx.fillRect(r * 0.48 - px * 0.72, -px * 0.55, px * 0.72, px * 0.48);
    ctx.shadowBlur = 0;
  }

  // Grim blocky Wither skeleton jaw
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-r * 0.52, px * 0.62, r * 1.04, px * 0.95);
  ctx.fillStyle = '#52525b';
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(i * r * 0.2 - 2, px * 0.68, 4, px * 0.82);
  }
  ctx.restore();
}

function drawCreeperFace(ctx: CanvasRenderingContext2D, r: number, mood: FaceMood): void {
  ctx.save();
  // Pixelated green mottled texture patches
  const cells: Array<[number, number, string]> = [
    [-0.7, -0.7, '#22c55e'],
    [0.3, -0.65, '#16a34a'],
    [-0.65, 0.25, '#16a34a'],
    [0.4, 0.3, '#22c55e'],
    [-0.1, -0.4, '#86efac'],
  ];
  for (const [cx, cy, col] of cells) {
    ctx.fillStyle = col;
    ctx.fillRect(cx * r, cy * r, r * 0.36, r * 0.36);
  }

  // Unmistakable black blocky Creeper face!
  ctx.fillStyle = '#09090b';
  const s = r * 0.26;
  if (mood === 'ko') {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      const cx = side * s * 1.3;
      ctx.beginPath();
      ctx.moveTo(cx - 5, -s * 0.9);
      ctx.lineTo(cx + 5, -s * 0.1);
      ctx.moveTo(cx + 5, -s * 0.9);
      ctx.lineTo(cx - 5, -s * 0.1);
      ctx.stroke();
    }
  } else {
    ctx.fillRect(-s * 1.85, -s * 1.15, s * 1.15, s * 1.15);
    ctx.fillRect(s * 0.7, -s * 1.15, s * 1.15, s * 1.15);
  }
  // Creeper nose/mouth inverted T + legs
  ctx.fillRect(-s * 0.55, 0, s * 1.1, s * 1.05);
  ctx.fillRect(-s * 1.15, s * 0.55, s * 2.3, s * 0.85);
  ctx.fillRect(-s * 1.15, s * 1.25, s * 0.65, s * 0.65);
  ctx.fillRect(s * 0.5, s * 1.25, s * 0.65, s * 0.65);
  ctx.restore();
}

function drawSansFace(
  ctx: CanvasRenderingContext2D,
  form: FormConfig,
  r: number,
  mood: FaceMood,
  t: number,
): void {
  ctx.save();
  const eyeX = r * 0.34;
  const eyeY = -r * 0.1;

  // Black skeletal sockets
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(side * eyeX, eyeY, r * 0.2, r * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (mood !== 'ko') {
    // Right socket white pinpoint pupil
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-eyeX, eyeY, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Left socket: glowing flaming CYAN-YELLOW Bad Time eye!
    if (form.visualVariant === 'badtime') {
      const eyeCol = Math.floor(t * 14) % 2 === 0 ? '#38bdf8' : '#facc15';
      ctx.shadowColor = eyeCol;
      ctx.shadowBlur = 14;
      ctx.fillStyle = eyeCol;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, r * 0.055, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Nasal bone triangle
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.moveTo(0, r * 0.02);
  ctx.lineTo(-r * 0.08, r * 0.17);
  ctx.lineTo(r * 0.08, r * 0.17);
  ctx.closePath();
  ctx.fill();

  // Iconic permanent wide gridded Sans grin!
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, r * 0.16, r * 0.44, 0.2, Math.PI - 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Teeth divider lines
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.13, r * 0.27);
    ctx.lineTo(i * r * 0.13, r * 0.56);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPikachuFace(ctx: CanvasRenderingContext2D, r: number, mood: FaceMood): void {
  ctx.save();
  // Rosy red electric cheeks!
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(-r * 0.58, r * 0.22, r * 0.19, 0, Math.PI * 2);
  ctx.arc(r * 0.58, r * 0.22, r * 0.19, 0, Math.PI * 2);
  ctx.fill();

  // Shiny black eyes
  if (mood === 'ko') {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.8;
    for (const side of [-1, 1]) {
      const cx = side * r * 0.34;
      ctx.beginPath();
      ctx.moveTo(cx - 5, -r * 0.16);
      ctx.lineTo(cx + 5, r * 0.02);
      ctx.moveTo(cx + 5, -r * 0.16);
      ctx.lineTo(cx - 5, r * 0.02);
      ctx.stroke();
    }
  } else {
    for (const side of [-1, 1]) {
      const cx = side * r * 0.34;
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(cx, -r * 0.08, r * 0.145, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - side * 2, -r * 0.13, r * 0.055, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Tiny nose + cute :3 mouth
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(0, r * 0.08, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.22, r * 0.22);
  ctx.quadraticCurveTo(-r * 0.1, r * 0.32, 0, r * 0.22);
  ctx.quadraticCurveTo(r * 0.1, r * 0.32, r * 0.22, r * 0.22);
  ctx.stroke();
  ctx.restore();
}

function drawSonicFace(
  ctx: CanvasRenderingContext2D,
  form: FormConfig,
  r: number,
  mood: FaceMood,
): void {
  ctx.save();
  // Peach muzzle lower face
  ctx.fillStyle = '#f5cba7';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.36, r * 0.68, r * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Connected iconic Sonic white eyes!
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-r * 0.24, -r * 0.12, r * 0.28, r * 0.34, -0.1, 0, Math.PI * 2);
  ctx.ellipse(r * 0.24, -r * 0.12, r * 0.28, r * 0.34, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const irisColor = form.eyeColor ?? '#16a34a';
  if (mood !== 'ko') {
    for (const side of [-1, 1]) {
      ctx.fillStyle = irisColor;
      ctx.beginPath();
      ctx.ellipse(side * r * 0.17, -r * 0.08, r * 0.09, r * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.ellipse(side * r * 0.17, -r * 0.08, r * 0.045, r * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.6;
    for (const side of [-1, 1]) {
      const cx = side * r * 0.22;
      ctx.beginPath();
      ctx.moveTo(cx - 5, -r * 0.18);
      ctx.lineTo(cx + 5, -r * 0.02);
      ctx.moveTo(cx + 5, -r * 0.18);
      ctx.lineTo(cx - 5, -r * 0.02);
      ctx.stroke();
    }
  }

  // Black nose & confident Sonic smirk
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.18, r * 0.13, r * 0.075, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, r * 0.42);
  ctx.quadraticCurveTo(r * 0.12, r * 0.48, r * 0.34, r * 0.34);
  ctx.stroke();
  ctx.restore();
}

function drawSonicSpinDashBall(
  ctx: CanvasRenderingContext2D,
  r: number,
  form: FormConfig,
  spinAngle: number,
): void {
  ctx.save();
  ctx.rotate(spinAngle);
  ctx.shadowColor = form.auraColor;
  ctx.shadowBlur = 18;
  ctx.fillStyle = form.hairColor;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.rotate((Math.PI * 2) / 3);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 0.8);
    ctx.stroke();
  }
  ctx.restore();
}

/* ==================== FACE MARKINGS & ANIME FACE ==================== */
function drawFaceMarkings(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
): void {
  ctx.save();

  if (char.id === 'luffy') {
    ctx.strokeStyle = '#3f2014';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(r * 0.34, r * 0.14, r * 0.17, 0.2, Math.PI - 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.26);
    ctx.lineTo(r * 0.3, r * 0.34);
    ctx.moveTo(r * 0.39, r * 0.26);
    ctx.lineTo(r * 0.39, r * 0.34);
    ctx.stroke();

    if (form.visualVariant === 'haki') {
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.85)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-r * 0.32, -r * 0.05, r * 0.21, 0, Math.PI * 2);
      ctx.arc(r * 0.32, -r * 0.05, r * 0.21, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (char.id === 'naruto' || char.id === 'ahri') {
    ctx.strokeStyle =
      char.id === 'ahri'
        ? '#9d174d'
        : form.visualVariant === 'kyuubi' || form.visualVariant === 'baryon'
          ? '#9a3412'
          : '#573619';
    ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(side * r * 0.5, r * 0.14 + k * 4.4);
        ctx.lineTo(side * r * 0.78, r * 0.12 + k * 5.0);
        ctx.stroke();
      }
    }
    if (char.id === 'naruto' && form.visualVariant === 'sage') {
      ctx.fillStyle = 'rgba(234, 88, 12, 0.65)';
      ctx.fillRect(-r * 0.52, -r * 0.19, r * 0.38, r * 0.26);
      ctx.fillRect(r * 0.14, -r * 0.19, r * 0.38, r * 0.26);
    }
  }

  // Deku cute freckles!
  if (char.id === 'deku') {
    ctx.fillStyle = '#78350f';
    for (const side of [-1, 1]) {
      const fx = side * r * 0.48;
      ctx.beginPath();
      ctx.arc(fx, r * 0.15, 1.4, 0, Math.PI * 2);
      ctx.arc(fx + side * 4.5, r * 0.18, 1.4, 0, Math.PI * 2);
      ctx.arc(fx - side * 1.5, r * 0.24, 1.4, 0, Math.PI * 2);
      ctx.arc(fx + side * 3.5, r * 0.26, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Kratos iconic crimson Spartan stripe + thick dark beard!
  if (char.id === 'kratos') {
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r);
    ctx.lineTo(-r * 0.18, -r);
    ctx.lineTo(-r * 0.22, r * 0.35);
    ctx.lineTo(-r * 0.52, r * 0.35);
    ctx.closePath();
    ctx.fill();

    // Thick dark beard along jaw
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, r * 0.14, r * 0.92, 0.25, Math.PI - 0.25);
    ctx.closePath();
    ctx.fill();
  }

  // Eren Attack Titan cheek marks
  if (char.id === 'eren' && form.visualVariant !== 'base') {
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.32, r * 0.08);
      ctx.lineTo(side * r * 0.42, r * 0.42);
      ctx.stroke();
    }
  }

  // Yasuo nose scar
  if (char.id === 'yasuo') {
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-r * 0.16, r * 0.04);
    ctx.lineTo(r * 0.16, r * 0.12);
    ctx.stroke();
  }

  if (char.id === 'sukuna') {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.24, r * 0.06);
    ctx.lineTo(r * 0.24, r * 0.06);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -r * 0.55, r * 0.26, 0.3, Math.PI - 0.3);
    ctx.stroke();
    if (form.powerLevel >= 2) {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * r * 0.52, r * 0.04);
        ctx.lineTo(side * r * 0.74, r * 0.24);
        ctx.moveTo(side * r * 0.44, r * 0.22);
        ctx.lineTo(side * r * 0.65, r * 0.4);
        ctx.stroke();
        ctx.fillStyle = form.powerLevel >= 4 ? '#ff1f5a' : '#09090b';
        ctx.beginPath();
        ctx.ellipse(side * r * 0.34, r * 0.14, r * 0.11, r * 0.042, side * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (char.id === 'zoro') {
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.38, -r * 0.34);
    ctx.lineTo(-r * 0.26, r * 0.18);
    ctx.stroke();
  }

  if (char.id === 'tanjiro') {
    const isMark = form.visualVariant === 'mark';
    ctx.fillStyle = isMark ? '#dc2626' : '#881337';
    ctx.beginPath();
    ctx.moveTo(-r * 0.48, -r * 0.54);
    ctx.lineTo(-r * 0.14, -r * 0.5);
    ctx.lineTo(-r * 0.22, -r * 0.32);
    ctx.lineTo(-r * 0.08, -r * 0.25);
    ctx.lineTo(-r * 0.44, -r * 0.24);
    ctx.closePath();
    ctx.fill();
    if (isMark) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  if (char.id === 'saitama') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.28, -r * 0.54, r * 0.22, r * 0.11, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Asta Black half-face demon shading
  if (char.id === 'asta' && form.visualVariant !== 'base') {
    ctx.fillStyle = 'rgba(9, 9, 11, 0.72)';
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, -r);
    ctx.lineTo(r, r * 0.2);
    ctx.lineTo(r * 0.12, -r * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  // Expansion signature face markings (scars, tattoos, facial hair, cheek symbols)
  if (char.id === 'shanks') {
    // Shanks iconic 3 red vertical scars over left eye!
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.8;
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.34 + k * 3.5, -r * 0.32);
      ctx.lineTo(-r * 0.32 + k * 3.5, r * 0.18);
      ctx.stroke();
    }
  } else if (char.id === 'hisoka') {
    // Hisoka pink star & cyan teardrop cheek paint!
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(-r * 0.52, r * 0.16, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(r * 0.52, r * 0.16, 3.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (char.id === 'gaara') {
    // Gaara dark eye rings + crimson forehead mark!
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-r * 0.48, -r * 0.42, 6, 6);
  } else if (char.id === 'todoroki') {
    // Todoroki crimson frost/fire burn mark around left eye!
    ctx.fillStyle = 'rgba(220, 38, 38, 0.55)';
    ctx.beginPath();
    ctx.arc(r * 0.34, -r * 0.08, r * 0.26, 0, Math.PI * 2);
    ctx.fill();
  } else if (char.id === 'akaza') {
    // Akaza blue demon tattoo stripes!
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.22, -r * 0.42);
      ctx.lineTo(side * r * 0.68, -r * 0.32);
      ctx.moveTo(side * r * 0.22, r * 0.18);
      ctx.lineTo(side * r * 0.72, r * 0.24);
      ctx.stroke();
    }
  } else if (char.id === 'whitebeard') {
    // Whitebeard iconic giant white crescent mustache!
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-r * 0.88, r * 0.05);
    ctx.quadraticCurveTo(0, r * 0.48, r * 0.88, r * 0.05);
    ctx.quadraticCurveTo(0, r * 0.24, -r * 0.88, r * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (char.id === 'mario') {
    // Mario iconic dark brown wavy mustache & round nose!
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.24, r * 0.46, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5cba7';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, r * 0.08, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (char.id === 'katakuri') {
    // Katakuri jagged white scarf covering lower jaw!
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.6;
    ctx.fillRect(-r, r * 0.14, r * 2, r * 0.56);
    ctx.strokeRect(-r, r * 0.14, r * 2, r * 0.56);
  } else if (char.id === 'kakashi' || char.id === 'akali') {
    // Ninja lower face mask!
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-r, r * 0.08, r * 2, r * 0.62);
  }

  ctx.restore();
}

function drawAnimeFace(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
  mood: FaceMood,
): void {
  const eyeY = -r * 0.06;
  const eyeX = r * 0.32;
  const eyeColor = form.eyeColor ?? char.eyeColor;

  ctx.save();

  if (mood === 'ko') {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      const cx = side * eyeX;
      const s = r * 0.14;
      ctx.beginPath();
      ctx.moveTo(cx - s, eyeY - s);
      ctx.lineTo(cx + s, eyeY + s);
      ctx.moveTo(cx + s, eyeY - s);
      ctx.lineTo(cx - s, eyeY + s);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-r * 0.24, r * 0.34);
    ctx.quadraticCurveTo(-r * 0.08, r * 0.22, 0, r * 0.34);
    ctx.quadraticCurveTo(r * 0.08, r * 0.46, r * 0.24, r * 0.3);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Saitama & Mob 0% deadpan oval faces
  if (
    ((char.id === 'saitama' && form.visualVariant === 'base') ||
      (char.id === 'mob' && form.visualVariant === 'base')) &&
    mood !== 'critical'
  ) {
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(side * eyeX, eyeY, r * 0.15, r * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(side * eyeX, eyeY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.14, r * 0.34);
    ctx.lineTo(r * 0.14, r * 0.34);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const isWide = mood === 'critical';
  const isFierce =
    mood === 'fierce' ||
    form.visualVariant === 'serious' ||
    char.id === 'kratos' ||
    (char.id === 'eren' && form.visualVariant !== 'base');

  for (const side of [-1, 1]) {
    const cx = side * eyeX;
    if (char.id === 'zoro' && side === -1) {
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.15, eyeY);
      ctx.lineTo(cx + r * 0.14, eyeY + 2);
      ctx.stroke();
      continue;
    }

    // Mob ???% glowing pure white blank eyes
    if (char.id === 'mob' && form.visualVariant === 'mobxxx') {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, eyeY, r * 0.17, r * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      continue;
    }

    const ew = isWide ? r * 0.19 : r * 0.17;
    const eh = isWide ? r * 0.19 : isFierce ? r * 0.12 : r * 0.145;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, eyeY, ew, eh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Sasuke heterochromia (left Rinnegan purple, right Sharingan red!)
    const thisEyeColor =
      char.id === 'sasuke' && form.powerLevel >= 3
        ? side === -1
          ? '#c084fc'
          : '#dc2626'
        : eyeColor;

    const irisR = isWide ? r * 0.08 : r * 0.105;
    ctx.fillStyle = thisEyeColor;
    ctx.beginPath();
    ctx.arc(cx, eyeY + 0.5, irisR, 0, Math.PI * 2);
    ctx.fill();

    if (
      (char.id === 'gojo' && form.powerLevel >= 3) ||
      (char.id === 'jinwoo' && form.visualVariant === 'monarch') ||
      (char.id === 'goku' && form.visualVariant === 'ui') ||
      (char.id === 'killua' && form.visualVariant === 'godspeed')
    ) {
      ctx.save();
      ctx.shadowColor = thisEyeColor;
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, eyeY + 0.5, irisR * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(cx, eyeY + 0.5, irisR * 0.48, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - irisR * 0.35, eyeY - irisR * 0.32, 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = isFierce ? 2.6 : 2.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (isFierce) {
      ctx.moveTo(cx - side * r * 0.2, eyeY - eh - 5);
      ctx.lineTo(cx + side * r * 0.14, eyeY - eh + 2);
    } else if (isWide) {
      ctx.moveTo(cx - side * r * 0.16, eyeY - eh - 2);
      ctx.lineTo(cx + side * r * 0.14, eyeY - eh - 7);
    } else if (mood === 'focused') {
      ctx.moveTo(cx - side * r * 0.18, eyeY - eh - 4);
      ctx.lineTo(cx + side * r * 0.14, eyeY - eh - 1);
    } else {
      ctx.moveTo(cx - side * r * 0.16, eyeY - eh - 4);
      ctx.lineTo(cx + side * r * 0.14, eyeY - eh - 4);
    }
    ctx.stroke();
  }

  if (mood === 'critical') {
    const sx = r * 0.64;
    const sy = -r * 0.26;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0c4a6e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 7);
    ctx.quadraticCurveTo(sx + 5, sy + 2, sx, sy + 6);
    ctx.quadraticCurveTo(sx - 5, sy + 2, sx, sy - 7);
    ctx.fill();
    ctx.stroke();
  }

  // Mouth
  ctx.strokeStyle = char.id === 'kratos' ? '#e2e8f0' : '#09090b';
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  const my = r * 0.31;

  if (mood === 'fierce' || (char.id === 'eren' && form.visualVariant !== 'base')) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#09090b';
    ctx.beginPath();
    ctx.roundRect(-r * 0.25, my - 3, r * 0.5, r * 0.19, 3);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.22, my + 2.5);
    ctx.lineTo(r * 0.22, my + 2.5);
    ctx.stroke();
  } else if (mood === 'critical') {
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(0, my + 3, r * 0.16, r * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (mood === 'confident') {
    if (char.id === 'denji' || char.id === 'jinx') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, my - 2, r * 0.26, 0.12, Math.PI - 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (char.id === 'luffy' && form.visualVariant === 'gear5') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, my - 3, r * 0.32, 0.05, Math.PI - 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, my + 1);
      ctx.quadraticCurveTo(0, my + 9, r * 0.24, my - 3);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(-r * 0.17, my + 2);
    ctx.lineTo(r * 0.17, my);
    ctx.stroke();
  }

  ctx.restore();
}

function drawDenjiHelmetFace(
  ctx: CanvasRenderingContext2D,
  form: FormConfig,
  r: number,
  mood: FaceMood,
): void {
  const isHell = form.visualVariant === 'herohell';
  const visorColor = isHell ? '#ef4444' : '#fef08a';
  ctx.save();
  for (const side of [-1, 1]) {
    ctx.fillStyle = mood === 'ko' ? '#475569' : visorColor;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(side * r * 0.12, -r * 0.05);
    ctx.lineTo(side * r * 0.56, -r * 0.24);
    ctx.lineTo(side * r * 0.44, r * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-r * 0.52, r * 0.18, r * 1.04, r * 0.34, 6);
  ctx.fill();
  ctx.fillStyle = isHell ? '#f87171' : '#e2e8f0';
  const teeth = 6;
  const startX = -r * 0.44;
  const step = (r * 0.88) / teeth;
  for (let i = 0; i < teeth; i++) {
    ctx.beginPath();
    ctx.moveTo(startX + i * step, r * 0.19);
    ctx.lineTo(startX + (i + 0.5) * step, r * 0.35);
    ctx.lineTo(startX + (i + 1) * step, r * 0.19);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawIchigoHollowMask(ctx: CanvasRenderingContext2D, r: number, mood: FaceMood): void {
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.96, Math.PI * 0.5, Math.PI * 1.5);
  ctx.quadraticCurveTo(r * 0.12, 0, 0, r * 0.96);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-r * 0.72, -r * 0.48);
  ctx.lineTo(-r * 0.16, -r * 0.24);
  ctx.moveTo(-r * 0.8, -r * 0.24);
  ctx.lineTo(-r * 0.14, -r * 0.04);
  ctx.moveTo(-r * 0.68, r * 0.12);
  ctx.lineTo(-r * 0.18, r * 0.32);
  ctx.stroke();
  if (mood !== 'ko') {
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(-r * 0.34, -r * 0.06, r * 0.18, r * 0.12, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-r * 0.34, -r * 0.06, r * 0.075, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ==================== FRONT HAIR & ACCESSORIES ==================== */
function drawFrontHairAndAccessories(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
): void {
  ctx.save();

  switch (char.id) {
    case 'luffy':
      drawSpikyBangs(ctx, r, form.hairColor, 5, 0.42);
      if (form.visualVariant !== 'gear5') {
        ctx.save();
        ctx.translate(0, -r * 0.66);
        ctx.rotate(-0.08);
        ctx.fillStyle = '#eab308';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 2, r * 0.74, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-r * 0.72, -r * 0.18, r * 1.44, r * 0.2);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(0, 3, r * 1.16, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      break;

    case 'goku':
      drawSpikyBangs(ctx, r, form.hairColor, 5, 0.34);
      break;

    case 'vegeta':
      // Classic Vegeta M-widow's peak hairline!
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.arc(0, -r * 0.04, r * 1.05, Math.PI * 1.05, Math.PI * 1.95);
      ctx.lineTo(r * 0.84, -r * 0.34);
      ctx.lineTo(r * 0.48, -r * 0.68);
      ctx.lineTo(0, -r * 0.34);
      ctx.lineTo(-r * 0.48, -r * 0.68);
      ctx.lineTo(-r * 0.84, -r * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'naruto':
      drawSpikyBangs(ctx, r, form.hairColor, 6, 0.45);
      drawHeadband(ctx, r, form.visualVariant === 'baryon' ? '#7f1d1d' : '#1e293b', '#cbd5e1');
      if (form.visualVariant === 'baryon') {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 1.8;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(side * r * 0.35, -r * 0.8);
          ctx.lineTo(side * r * 0.75, -r * 1.38);
          ctx.lineTo(side * r * 0.85, -r * 0.65);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      break;

    case 'gojo':
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.95, -r * 0.32);
      ctx.lineTo(-r * 1.05, -r * 0.95);
      ctx.lineTo(-r * 0.52, -r * 0.84);
      ctx.lineTo(-r * 0.32, -r * 1.32);
      ctx.lineTo(0, -r * 0.94);
      ctx.lineTo(r * 0.34, -r * 1.3);
      ctx.lineTo(r * 0.58, -r * 0.86);
      ctx.lineTo(r * 1.04, -r * 0.92);
      ctx.lineTo(r * 0.95, -r * 0.32);
      ctx.quadraticCurveTo(0, -r * 0.56, -r * 0.95, -r * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'sukuna':
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.94, -r * 0.34);
      ctx.lineTo(-r * 1.02, -r * 0.92);
      ctx.lineTo(-r * 0.45, -r * 0.78);
      ctx.lineTo(-r * 0.18, -r * 1.24);
      ctx.lineTo(r * 0.18, -r * 1.22);
      ctx.lineTo(r * 0.48, -r * 0.8);
      ctx.lineTo(r * 1.02, -r * 0.9);
      ctx.lineTo(r * 0.94, -r * 0.34);
      ctx.quadraticCurveTo(0, -r * 0.65, -r * 0.94, -r * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'zoro':
      drawSpikyBangs(ctx, r, form.hairColor, 7, 0.38);
      if (form.visualVariant === 'enma' || form.visualVariant === 'kinghell') {
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.02, Math.PI * 1.1, Math.PI * 1.9);
        ctx.lineTo(r * 0.92, -r * 0.36);
        ctx.quadraticCurveTo(0, -r * 0.52, -r * 0.92, -r * 0.36);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#facc15';
      for (let e = 0; e < 3; e++) {
        ctx.fillRect(-r - 3, r * 0.02 + e * 5.2, 3.2, 3.8);
      }
      break;

    case 'tanjiro':
      drawSpikyBangs(ctx, r, form.hairColor, 6, 0.4);
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * (r + 3.5), r * 0.22);
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.2;
        ctx.fillRect(-3.5, -6, 7, 13);
        ctx.strokeRect(-3.5, -6, 7, 13);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -1, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;

    case 'ichigo':
      drawSpikyBangs(ctx, r, form.hairColor, 6, 0.48);
      if (form.visualVariant === 'truebankai') {
        drawDemonHorn(ctx, r, -1, '#f8fafc');
      }
      break;

    case 'levi':
    case 'eren':
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.03, Math.PI * 1.06, Math.PI * 1.94);
      ctx.lineTo(r * 0.9, -r * 0.16);
      ctx.lineTo(r * 0.55, -r * 0.42);
      ctx.lineTo(r * 0.25, -r * 0.12);
      ctx.lineTo(0, -r * 0.52);
      ctx.lineTo(-r * 0.25, -r * 0.12);
      ctx.lineTo(-r * 0.55, -r * 0.42);
      ctx.lineTo(-r * 0.9, -r * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'jinwoo':
    case 'sasuke':
    case 'killua':
    case 'jinx':
      drawSpikyBangs(ctx, r, form.hairColor, 6, 0.46);
      break;

    case 'madara':
      drawSpikyBangs(ctx, r, form.hairColor, 5, 0.44);
      if (form.visualVariant === 'juubi') {
        // Forehead crimson Rinne-Sharingan & white horn band!
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-r * 0.85, -r * 0.65, r * 1.7, r * 0.24, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -r * 0.53, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'deku':
      // Bushy green curls!
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 8; i++) {
        const a = Math.PI * 1.02 + (i / 7) * Math.PI * 0.96;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.86 - r * 0.1, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;

    case 'rimuru':
      if (form.visualVariant !== 'slime') {
        drawSpikyBangs(ctx, r, form.hairColor, 5, 0.42);
      }
      break;

    case 'asta':
      drawSpikyBangs(ctx, r, form.hairColor, 6, 0.44);
      drawHeadband(ctx, r, '#09090b', '#eab308');
      if (form.visualVariant === 'black') {
        drawDemonHorn(ctx, r, 1, '#09090b');
      } else if (form.visualVariant === 'union') {
        drawDemonHorn(ctx, r, -1, '#09090b');
        drawDemonHorn(ctx, r, 1, '#09090b');
      }
      break;

    case 'frieren':
    case 'ahri':
      drawSpikyBangs(ctx, r, form.hairColor, 5, 0.38);
      break;

    case 'mob':
      // Iconic straight black bowl-cut bangs!
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -r * 0.04, r * 1.04, Math.PI * 1.04, Math.PI * 1.96);
      ctx.lineTo(r * 0.94, -r * 0.34);
      ctx.lineTo(-r * 0.94, -r * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'steve':
      // Blocky Steve hair + Minecraft Armor Helmets per form!
      ctx.fillStyle = '#422006';
      ctx.fillRect(-r * 0.92, -r * 0.96, r * 1.84, r * 0.44);
      ctx.fillRect(-r * 0.92, -r * 0.58, r * 0.24, r * 0.25);
      ctx.fillRect(r * 0.68, -r * 0.58, r * 0.24, r * 0.25);

      if (form.visualVariant !== 'wood') {
        const helmFill =
          form.visualVariant === 'iron'
            ? '#cbd5e1'
            : form.visualVariant === 'diamond'
              ? '#22d3ee'
              : '#3f3f46';
        const helmTrim = form.visualVariant === 'netherite' ? '#a855f7' : '#09090b';
        ctx.fillStyle = helmFill;
        ctx.strokeStyle = helmTrim;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-r * 1.04, -r * 1.06, r * 2.08, r * 0.58, 5);
        ctx.fill();
        ctx.stroke();
        // Nose guard bar
        ctx.fillRect(-r * 0.16, -r * 0.56, r * 0.32, r * 0.3);
        ctx.strokeRect(-r * 0.16, -r * 0.56, r * 0.32, r * 0.3);
      }
      break;

    case 'herobrine':
      // Blocky dark-brown Steve hair + glowing white command halo in God form
      ctx.fillStyle = form.hairColor;
      ctx.fillRect(-r * 0.92, -r * 0.96, r * 1.84, r * 0.44);
      ctx.fillRect(-r * 0.92, -r * 0.58, r * 0.24, r * 0.25);
      ctx.fillRect(r * 0.68, -r * 0.58, r * 0.24, r * 0.25);
      if (form.visualVariant === 'god') {
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(0, -r * 1.12, r * 0.62, r * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      break;

    case 'entity303':
      // Crisp white hood brow rim framing black face with crimson trim
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.06, Math.PI * 1.02, Math.PI * 1.98);
      ctx.lineTo(r * 0.88, -r * 0.28);
      ctx.quadraticCurveTo(0, -r * 0.66, -r * 0.88, -r * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.84, -r * 0.28);
      ctx.quadraticCurveTo(0, -r * 0.62, r * 0.84, -r * 0.28);
      ctx.stroke();
      break;

    case 'warden':
      // Thick pale-bone Deep Dark Warden forehead plate
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-r * 0.86, -r * 1.0, r * 1.72, r * 0.44, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0f2933';
      ctx.fillRect(-r * 0.68, -r * 0.86, r * 1.36, r * 0.18);
      break;

    case 'wither':
      // Blocky charcoal Wither crown ridge
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = form.visualVariant === 'storm' ? '#c084fc' : '#52525b';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-r * 0.92, -r * 1.02, r * 1.84, r * 0.34);
      ctx.strokeRect(-r * 0.92, -r * 1.02, r * 1.84, r * 0.34);
      break;

    case 'yasuo':
      drawSpikyBangs(ctx, r, form.hairColor, 5, 0.42);
      if (form.visualVariant === 'nightbringer') {
        drawDemonHorn(ctx, r, -1, '#f97316');
        drawDemonHorn(ctx, r, 1, '#f97316');
      } else {
        drawHeadband(ctx, r, '#1d4ed8', '#38bdf8');
      }
      break;

    case 'vergil':
      // Slick swept-back silver hair!
      ctx.fillStyle = form.hairColor;
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.95, -r * 0.32);
      ctx.lineTo(-r * 0.72, -r * 1.24);
      ctx.lineTo(0, -r * 1.04);
      ctx.lineTo(r * 0.72, -r * 1.24);
      ctx.lineTo(r * 0.95, -r * 0.32);
      ctx.quadraticCurveTo(0, -r * 0.62, -r * 0.95, -r * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (form.visualVariant === 'sdt') {
        drawDemonHorn(ctx, r, -1, '#38bdf8');
        drawDemonHorn(ctx, r, 1, '#38bdf8');
      }
      break;

    case 'denji':
      if (form.visualVariant === 'base') {
        drawSpikyBangs(ctx, r, form.hairColor, 6, 0.44);
      } else {
        const isHell = form.visualVariant === 'herohell';
        ctx.fillStyle = isHell ? '#dc2626' : '#cbd5e1';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.16, -r * 0.72);
        ctx.lineTo(-r * 0.12, -r * 1.62);
        ctx.lineTo(0, -r * 1.76);
        ctx.lineTo(r * 0.12, -r * 1.62);
        ctx.lineTo(r * 0.16, -r * 0.72);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-r * 0.045, -r * 1.48, r * 0.09, r * 0.68);
      }
      break;

    case 'saitama':
    case 'kratos':
    case 'creeper':
    case 'sans':
    case 'pikachu':
    case 'sonic':
      break;

    default:
      drawExpansionHairAndAccessory(ctx, char, form, r);
      break;
  }

  ctx.restore();
}

function drawHeadband(
  ctx: CanvasRenderingContext2D,
  r: number,
  bandColor: string,
  plateColor: string,
): void {
  ctx.save();
  ctx.fillStyle = bandColor;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-r * 0.94, -r * 0.62, r * 1.88, r * 0.28, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = plateColor;
  ctx.beginPath();
  ctx.roundRect(-r * 0.46, -r * 0.59, r * 0.92, r * 0.22, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawDemonHorn(
  ctx: CanvasRenderingContext2D,
  r: number,
  side: -1 | 1,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(side * r * 0.48, -r * 0.78);
  ctx.quadraticCurveTo(side * r * 0.96, -r * 1.28, side * r * 0.36, -r * 1.48);
  ctx.quadraticCurveTo(side * r * 0.56, -r * 1.06, side * r * 0.22, -r * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSpikyBangs(
  ctx: CanvasRenderingContext2D,
  r: number,
  color: string,
  spikeCount: number,
  bangDrop: number,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.arc(0, -r * 0.04, r * 1.06, Math.PI * 1.04, Math.PI * 1.96);
  const rightX = r * 0.96;
  const leftX = -r * 0.96;
  for (let i = 0; i <= spikeCount * 2; i++) {
    const frac = i / (spikeCount * 2);
    const px = rightX + (leftX - rightX) * frac;
    const py = i % 2 === 1 ? -r * (0.6 - bangDrop) : -r * 0.56;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/* ==================== ATTACHED WEAPONS & ORBITING GEAR ==================== */
function drawZoroOrbitingSwords(
  ctx: CanvasRenderingContext2D,
  r: number,
  orbitAngle: number,
  form: FormConfig,
): void {
  const orbitDist = r + 22 + form.powerLevel * 1.4;
  const hiltColors = ['#f8fafc', '#a855f7', '#dc2626'];
  const bladeGlow =
    form.visualVariant === 'kinghell'
      ? '#4ade80'
      : form.visualVariant === 'enma'
        ? '#c084fc'
        : '#e2e8f0';
  for (let i = 0; i < 3; i++) {
    const a = orbitAngle + (i * Math.PI * 2) / 3;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(orbitDist, 0);
    ctx.rotate(Math.PI / 2);
    ctx.shadowColor = bladeGlow;
    ctx.shadowBlur = form.powerLevel >= 3 ? 10 : 4;
    ctx.fillStyle = bladeGlow;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2.3, 6);
    ctx.lineTo(-1.8, -17);
    ctx.lineTo(0, -22);
    ctx.lineTo(2.2, -16);
    ctx.lineTo(2.3, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-5, 5, 10, 2.5);
    ctx.fillStyle = hiltColors[i];
    ctx.fillRect(-2, 7.5, 4, 9);
    ctx.restore();
  }
}

function drawKratosBlades(
  ctx: CanvasRenderingContext2D,
  r: number,
  orbitAngle: number,
  form: FormConfig,
): void {
  const orbitDist = r + 26 + form.powerLevel * 1.2;
  for (let i = 0; i < 2; i++) {
    const a = orbitAngle + i * Math.PI;
    ctx.save();
    // Fiery chain linking blade to Kratos
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * orbitDist, Math.sin(a) * orbitDist);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.rotate(a);
    ctx.translate(orbitDist, 0);
    ctx.rotate(Math.PI / 2);
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-6, -15);
    ctx.lineTo(2, -21);
    ctx.lineTo(5, -10);
    ctx.lineTo(3, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawAstaGreatsword(
  ctx: CanvasRenderingContext2D,
  r: number,
  orbitAngle: number,
  form: FormConfig,
): void {
  const orbitDist = r + 24 + form.powerLevel * 1.2;
  ctx.save();
  ctx.rotate(orbitAngle);
  ctx.translate(orbitDist, 0);
  ctx.rotate(Math.PI / 2);
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#09090b';
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, 8);
  ctx.lineTo(-6, -20);
  ctx.lineTo(0, -28);
  ctx.lineTo(6, -20);
  ctx.lineTo(6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawMinecraftOrbitSword(
  ctx: CanvasRenderingContext2D,
  r: number,
  orbitAngle: number,
  form: FormConfig,
): void {
  const orbitDist = r + 22;
  const bladeColor =
    form.visualVariant === 'wood'
      ? '#a16207'
      : form.visualVariant === 'iron'
        ? '#e2e8f0'
        : form.visualVariant === 'diamond'
          ? '#22d3ee'
          : '#52525b';
  ctx.save();
  ctx.rotate(orbitAngle);
  ctx.translate(orbitDist, 0);
  ctx.rotate(Math.PI / 2);
  if (form.visualVariant === 'netherite') {
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 12;
  }
  ctx.fillStyle = bladeColor;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.6;
  ctx.fillRect(-3.5, -20, 7, 24);
  ctx.strokeRect(-3.5, -20, 7, 24);
  // Pixelated crossguard & handle
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-8, 3, 16, 4);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-2.5, 7, 5, 8);
  ctx.restore();
}

function drawTruthSeekingOrbs(
  ctx: CanvasRenderingContext2D,
  r: number,
  orbitAngle: number,
  form: FormConfig,
): void {
  const orbitDist = r + 24;
  for (let i = 0; i < 4; i++) {
    const a = orbitAngle + (i * Math.PI) / 2;
    ctx.save();
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = form.auraSecondaryColor ?? '#a855f7';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * orbitDist, Math.sin(a) * orbitDist, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawVergilMirageBlades(
  ctx: CanvasRenderingContext2D,
  r: number,
  orbitAngle: number,
): void {
  const orbitDist = r + 23;
  for (let i = 0; i < 3; i++) {
    const a = orbitAngle + (i * Math.PI * 2) / 3;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(orbitDist, 0);
    ctx.rotate(Math.PI / 2);
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(3, 6);
    ctx.lineTo(0, 12);
    ctx.lineTo(-3, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawCharacterShieldBarrier(
  ctx: CanvasRenderingContext2D,
  f: FighterState,
  form: FormConfig,
  r: number,
  t: number,
): void {
  const cid = f.character.id;
  const dna = getCharacterVfxDNA(cid, f.character.series);
  const sColor = f.shieldColor || form.auraColor;
  const sec = f.character.secondaryColor || '#ffffff';
  const sr = r + 13;
  ctx.save();
  ctx.strokeStyle = sColor;
  ctx.fillStyle = hexWithAlpha(sColor, 0.14);
  ctx.lineWidth = 2.8;
  ctx.shadowColor = sColor;
  ctx.shadowBlur = 14;

  switch (dna.shieldStyle) {
    case 'naruto-susanoo': {
      // Susanoo Glowing Skeletal Ribcage Barrier!
      for (const side of [-1, 1]) {
        for (let rib = -1; rib <= 1; rib++) {
          ctx.beginPath();
          ctx.arc(
            0,
            rib * 7,
            sr,
            side === -1 ? Math.PI * 0.65 : -Math.PI * 0.35,
            side === -1 ? Math.PI * 1.35 : Math.PI * 0.35,
          );
          ctx.stroke();
        }
      }
      break;
    }

    case 'lol-windwall-hex': {
      // Sweeping Directional Wind Wall / Hextech Shield Arc!
      ctx.rotate(f.facingAngle);
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(4, 0, sr + 3, -Math.PI * 0.58, Math.PI * 0.58);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(7, 0, sr + 3, -Math.PI * 0.44, Math.PI * 0.44);
      ctx.stroke();
      break;
    }

    case 'mc-voxel-shield': {
      // Blocky Minecraft Shield / Voxel Cube Barrier!
      ctx.rotate(f.facingAngle);
      ctx.fillStyle = cid === 'steve' || cid === 'alex' ? '#78350f' : hexWithAlpha(sColor, 0.3);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.fillRect(sr - 4, -r * 0.85, 9, r * 1.7);
      ctx.strokeRect(sr - 4, -r * 0.85, 9, r * 1.7);
      break;
    }

    case 'sds-perfect-cube': {
      // Merlin's Perfect Cube Glowing Violet Wireframe Cube!
      ctx.rotate(t * 0.9);
      ctx.strokeRect(-sr * 0.92, -sr * 0.92, sr * 1.84, sr * 1.84);
      ctx.strokeStyle = sec;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-sr * 0.68, -sr * 0.68, sr * 1.36, sr * 1.36);
      break;
    }

    case 'undertale-battle-box': {
      // Crisp Monochrome Undertale Battle-Box Shield!
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(-sr, -sr, sr * 2, sr * 2);
      break;
    }

    case 'solo-system-firewall': {
      // Holographic Cyan [SYSTEM] Corner Firewall!
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.8;
      const b = sr * 0.96;
      const arm = sr * 0.45;
      for (const [sx, sy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        ctx.beginPath();
        ctx.moveTo(sx * b, sy * (b - arm));
        ctx.lineTo(sx * b, sy * b);
        ctx.lineTo(sx * (b - arm), sy * b);
        ctx.stroke();
      }
      break;
    }

    case 'bleach-bakudo-grid': {
      // Bleach Bakudo Rectangular Spirit Lattice!
      ctx.rotate(t * 1.2);
      ctx.strokeRect(-sr * 0.88, -sr * 0.88, sr * 1.76, sr * 1.76);
      ctx.beginPath();
      ctx.moveTo(-sr * 0.88, 0);
      ctx.lineTo(sr * 0.88, 0);
      ctx.moveTo(0, -sr * 0.88);
      ctx.lineTo(0, sr * 0.88);
      ctx.stroke();
      break;
    }

    case 'fate-avalon': {
      // Fate Golden Avalon Scabbard Double-Halo Shield!
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, sr * 0.82, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'demon-breathing-ring': {
      // Demon Slayer 12-Point Compass / Breathing Halo!
      ctx.rotate(t * 1.8);
      for (let k = 0; k < 6; k++) {
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(-sr, 0);
        ctx.lineTo(sr, 0);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, sr, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'fma-alchemy-wall':
    case 'fairy-magic-dome': {
      // Rotating Alchemical Transmutation / Magic Circle Dome!
      ctx.rotate(t * 1.8 * dna.spinDir);
      ctx.beginPath();
      ctx.arc(0, 0, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (const flip of [1, -1]) {
        ctx.beginPath();
        for (let k = 0; k < 3; k++) {
          const a = (k * Math.PI * 2) / 3 + (flip < 0 ? Math.PI : 0);
          if (k === 0) ctx.moveTo(Math.cos(a) * sr * 0.94, Math.sin(a) * sr * 0.94);
          else ctx.lineTo(Math.cos(a) * sr * 0.94, Math.sin(a) * sr * 0.94);
        }
        ctx.closePath();
        ctx.stroke();
      }
      break;
    }

    case 'onepiece-haki-dome':
    case 'jjk-infinity-halo': {
      // Dark-Core Haki / Infinity Spatial Barrier!
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, sr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = sColor;
      ctx.lineWidth = 2.4;
      ctx.stroke();
      break;
    }

    default: {
      // JoJo Stand Guard / Geometric Sacred Polygon
      const sides = Math.max(3, Math.min(8, dna.symmetry));
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = t * 1.6 + (i * Math.PI * 2) / sides;
        const px = Math.cos(a) * sr;
        const py = Math.sin(a) * sr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
  }

  // Overlay character's personal crest on the barrier!
  drawCharacterUniqueCrest(ctx, dna, sr * 0.96, sColor, sec, t);
  ctx.restore();
}

function drawFighterStatusOverlay(
  ctx: CanvasRenderingContext2D,
  f: FighterState,
  r: number,
  t: number,
): void {
  // 1. Hard CC Visuals (Unlimited Void Overload, Frozen Ice Prison, Time Stop Lock, Genjutsu, Chains, Petrified!)
  if (f.stunTimer > 0 && f.stunKind) {
    ctx.save();
    if (f.stunKind === 'void-overload') {
      // Gojo Unlimited Void: Cosmic Information Overload pulsing white-cyan rings + ∞ symbol!
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, r + 6 + Math.sin(t * 22) * 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#a855f7';
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 11, t * 5, t * 5 + Math.PI * 1.7);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('∞', 0, -r - 12);
    } else if (f.stunKind === 'frozen') {
      // Solid translucent cyan Ice Crystal Block encasing the fighter!
      ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2.6;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.32);
      ctx.lineTo(r * 1.18, -r * 0.45);
      ctx.lineTo(r * 0.96, r * 1.15);
      ctx.lineTo(-r * 0.96, r * 1.15);
      ctx.lineTo(-r * 1.18, -r * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (f.stunKind === 'time-stop') {
      // DIO / Jotaro Time Stop monochrome lock ring + frozen hands!
      ctx.fillStyle = 'rgba(30, 27, 75, 0.36)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (f.stunKind === 'genjutsu') {
      // Tsukuyomi Crimson Sharingan Reticle locked over target!
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 7, 0, Math.PI * 2);
      ctx.moveTo(-r - 10, 0);
      ctx.lineTo(r + 10, 0);
      ctx.moveTo(0, -r - 10);
      ctx.lineTo(0, r + 10);
      ctx.stroke();
    } else if (f.stunKind === 'chained') {
      // Crossed Golden / Crimson Chains binding the fighter!
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(-r * 1.1, -r * 0.85);
      ctx.lineTo(r * 1.1, r * 0.85);
      ctx.moveTo(r * 1.1, -r * 0.85);
      ctx.lineTo(-r * 1.1, r * 0.85);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (f.stunKind === 'petrified') {
      // Cracked grey stone petrification crust!
      ctx.fillStyle = 'rgba(148, 163, 184, 0.56)';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (f.stunKind === 'airborne') {
      // Knocked up / Airborne wind rings underneath!
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, r + 6, r * 0.9, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. Burn Flames
  if (f.burnTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#f97316';
    for (let k = 0; k < 4; k++) {
      const a = t * 6 + (k * Math.PI) / 2;
      const fx = Math.cos(a) * (r + 3);
      const fy = Math.sin(a) * (r + 3) - 4;
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Hakari 777 Immortal Emerald-Gold Aura
  if (f.immortalTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, r + 8 + Math.sin(t * 14) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Escanor / Saitama Unstoppable Golden Corona
  if (f.unstoppableTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, r + 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 5. Confused / Kyoka Suigetsu Hypnosis Spiral
  if (f.confusedTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -r - 12, 6, t * 7, t * 7 + Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();
  }

  // 6. Entity 303 Anti-Heal Lock Indicator (crossed crimson heart mark)
  if (f.antiHealTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#ff1f5a';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.4;
    ctx.font = '900 11px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText('✕♥', 0, -r - 13);
    ctx.fillText('✕♥', 0, -r - 13);
    ctx.restore();
  }

  // 7. Sans Karmic Retribution (KR) or Wither Decay badge
  if (f.karmaTimer > 0) {
    ctx.save();
    const isKr = f.karmaKind === 'kr';
    const badgeY = -r - (f.antiHealTimer > 0 ? 26 : 14);
    ctx.fillStyle = isKr ? '#c084fc' : '#7e22ce';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.6;
    ctx.font = '900 10.5px monospace';
    ctx.textAlign = 'center';
    const label = isKr ? 'KR' : '☠♥';
    ctx.strokeText(label, 0, badgeY);
    ctx.fillText(label, 0, badgeY);
    ctx.restore();
  }

  // 8. Pikachu Authentic Pokémon [PAR] Status Pill!
  if (f.paralyzeTimer > 0) {
    ctx.save();
    const pillW = 30;
    const pillH = 13;
    const px = r + 3;
    const py = -r - 4;
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(px, py, pillW, pillH, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#09090b';
    ctx.font = '900 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAR', px + pillW * 0.5, py + pillH * 0.5 + 0.5);
    ctx.restore();
  }

  // 9. Sans Post-Ultimate Drowsy Window ("ZZZ")
  if (f.drowsyTimer > 0) {
    ctx.save();
    const bob = Math.sin(t * 7) * 3;
    ctx.fillStyle = '#bae6fd';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.5;
    ctx.font = '900 11px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText('ZZZ', r * 0.65, -r - 12 + bob);
    ctx.fillText('ZZZ', r * 0.65, -r - 12 + bob);
    ctx.restore();
  }

  // 10. Ahri Charm Winged Pink Heart
  if (f.charmTimer > 0) {
    ctx.save();
    const bob = Math.sin(t * 10) * 3;
    ctx.fillStyle = '#f472b6';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.font = '900 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText('♥', 0, -r - 16 + bob);
    ctx.fillText('♥', 0, -r - 16 + bob);
    ctx.restore();
  }

  // 11. Kratos Leviathan Frost Rim
  if (f.frostTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2.6;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, r + 5, t * 2, t * 2 + Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 12. Armor Shred Indicator (Yasuo / Naruto Rasenshuriken)
  if (f.armorShredTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#fb923c';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.font = '900 10px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText('-ARM', -r * 0.75, -r - 10);
    ctx.fillText('-ARM', -r * 0.75, -r - 10);
    ctx.restore();
  }

  // 13. Goku Ultra Instinct Silver Starlight Corona
  if (f.uiDodgeTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, r + 9 + Math.sin(t * 18) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 14. Tanjiro Demon Slayer Mark (-40% Healing Debuff)
  if (f.slayerMarkTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.font = '900 10px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText('MARK -40%', 0, r + 18);
    ctx.fillText('MARK -40%', 0, r + 18);
    ctx.restore();
  }

  // 15. Ichigo / Asta Spirit Lock
  if (f.spiritLockTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.font = '900 9.5px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText('EMPTY', 0, -r - 12);
    ctx.fillText('EMPTY', 0, -r - 12);
    ctx.restore();
  }

  // 16. Shanks Observation Haki Killer (Dodge Sealed)
  if (f.dodgeLockedTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.font = '900 9px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText('NO OBS', 0, -r - 22);
    ctx.fillText('NO OBS', 0, -r - 22);
    ctx.restore();
  }
}

function drawEnergyDashOrb(
  ctx: CanvasRenderingContext2D,
  f: FighterState,
  r: number,
  facingAngle: number,
  t: number,
  form: FormConfig,
): void {
  const cid = f.character.id;
  const ox = Math.cos(facingAngle) * (r + 12);
  const oy = Math.sin(facingAngle) * (r + 12);
  const orbR = 13 + form.powerLevel * 1.5;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.shadowColor = form.auraColor;
  ctx.shadowBlur = 16;

  // Sword/Spear Lunge Tip for bladed dashers!
  if (
    cid === 'zoro' ||
    cid === 'ichigo' ||
    cid === 'yasuo' ||
    cid === 'yone' ||
    cid === 'shanks' ||
    cid === 'trunks' ||
    cid === 'cloud' ||
    cid === 'dante' ||
    cid === 'riven' ||
    cid === 'viego' ||
    cid === 'katarina' ||
    cid === 'masterchief' ||
    cid === 'technoblade' ||
    cid === 'hutao'
  ) {
    ctx.rotate(facingAngle);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = form.auraColor;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(orbR * 1.45, 0);
    ctx.lineTo(-orbR * 0.6, -orbR * 0.65);
    ctx.lineTo(-orbR * 0.25, 0);
    ctx.lineTo(-orbR * 0.6, orbR * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Crackling Lightning Spearhead for Chidori / Raikiri / Thunder / Speedsters!
  if (
    cid === 'sasuke' ||
    cid === 'kakashi' ||
    cid === 'killua' ||
    cid === 'zenitsu' ||
    cid === 'minato' ||
    cid === 'raiden' ||
    cid === 'volibear' ||
    cid === 'pikachu'
  ) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.6;
    for (let k = 0; k < 5; k++) {
      const a = t * 25 + k * 1.25;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * orbR * 0.7, Math.sin(a) * orbR * 0.7);
      ctx.lineTo(Math.cos(a + 0.4) * orbR * 1.25, Math.sin(a + 0.4) * orbR * 1.25);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, orbR);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, form.auraColor);
  g.addColorStop(1, hexWithAlpha(form.auraColor, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, orbR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.6;
  ctx.rotate(t * 16);
  ctx.beginPath();
  ctx.arc(0, 0, orbR * 0.55, 0, Math.PI * 1.3);
  ctx.stroke();
  ctx.restore();
}

function drawBeamCharge(
  ctx: CanvasRenderingContext2D,
  r: number,
  angle: number,
  progress: number,
  form: FormConfig,
): void {
  const ox = Math.cos(angle) * (r + 11);
  const oy = Math.sin(angle) * (r + 11);
  const orbR = 6 + progress * (13 + form.powerLevel * 1.8);
  const color = form.auraColor;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, orbR);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.6, color);
  g.addColorStop(1, hexWithAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, orbR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = hexWithAlpha(color, 0.35 + progress * 0.3);
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(angle) * 260, Math.sin(angle) * 260);
  ctx.stroke();
  ctx.restore();
}

/* ==================== ON-BALL HP BADGE ==================== */
function drawHpBadge(
  ctx: CanvasRenderingContext2D,
  r: number,
  hp: number,
  borderColor: string,
): void {
  const text = `${Math.max(0, hp)}`;
  const badgeW = text.length >= 4 ? 46 : text.length === 3 ? 36 : 28;
  const badgeH = 18;
  const y = r - 1;

  ctx.save();
  ctx.fillStyle = '#070b14';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.roundRect(-badgeW / 2, y - badgeH / 2, badgeW, badgeH, 9);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  const fontSize = text.length >= 4 ? '10.5px' : '11.5px';
  ctx.font = `800 ${fontSize} system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, y + 0.5);
  ctx.restore();
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(255,255,255,${alpha})`;
  const num = parseInt(clean, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function shadeHex(hex: string, delta: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const red = Math.max(0, Math.min(255, ((num >> 16) & 255) + delta));
  const green = Math.max(0, Math.min(255, ((num >> 8) & 255) + delta));
  const blue = Math.max(0, Math.min(255, (num & 255) + delta));
  return `rgb(${red}, ${green}, ${blue})`;
}

/* ==================== EXPANSION 100 CHARACTERS VECTOR RENDERER ==================== */
function drawExpansionSpecialFace(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
  mood: FaceMood,
  t: number,
): boolean {
  const px = r * 0.22;

  // 1. Minecraft Expansion Blocky Pixel Faces (12 characters)
  if (char.id === 'alex') {
    ctx.save();
    if (mood === 'ko') {
      drawKoCrossEyes(ctx, r, '#09090b');
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-r * 0.56, -px * 0.6, px * 1.05, px * 0.68);
      ctx.fillRect(r * 0.56 - px * 1.05, -px * 0.6, px * 1.05, px * 0.68);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-r * 0.56 + px * 0.42, -px * 0.6, px * 0.6, px * 0.68);
      ctx.fillRect(r * 0.56 - px * 1.05, -px * 0.6, px * 0.6, px * 0.68);
    }
    ctx.fillStyle = '#e09f7d';
    ctx.fillRect(-px * 0.4, px * 0.15, px * 0.8, px * 0.45);
    ctx.fillStyle = '#c26d53';
    ctx.fillRect(-px * 0.7, px * 0.8, px * 1.4, px * 0.42);
    ctx.restore();
    return true;
  }

  if (char.id === 'enderman') {
    ctx.save();
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-r, -r, r * 2, r * 2);
    if (mood === 'ko') {
      drawKoCrossEyes(ctx, r, '#e879f9');
    } else {
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#f5d0fe';
      ctx.fillRect(-r * 0.72, -px * 0.45, px * 1.45, px * 0.62);
      ctx.fillRect(r * 0.72 - px * 1.45, -px * 0.45, px * 1.45, px * 0.62);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-r * 0.5, -px * 0.45, px * 0.6, px * 0.62);
      ctx.fillRect(r * 0.5 - px * 0.6, -px * 0.45, px * 0.6, px * 0.62);
    }
    ctx.restore();
    return true;
  }

  if (char.id === 'blaze') {
    ctx.save();
    if (mood === 'ko') {
      drawKoCrossEyes(ctx, r, '#7c2d12');
    } else {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-r * 0.6, -px * 0.6, px * 1.2, px * 0.72);
      ctx.fillRect(r * 0.6 - px * 1.2, -px * 0.6, px * 1.2, px * 0.72);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-r * 0.42, -px * 0.45, px * 0.6, px * 0.45);
      ctx.fillRect(r * 0.42 - px * 0.6, -px * 0.45, px * 0.6, px * 0.45);
    }
    // Orbiting pixel blaze rods
    ctx.fillStyle = '#facc15';
    for (let k = 0; k < 4; k++) {
      const a = t * 5 + k * 1.57;
      ctx.fillRect(Math.cos(a) * r * 0.65 - 3, Math.sin(a) * r * 0.45 + r * 0.25, 6, 14);
    }
    ctx.restore();
    return true;
  }

  if (char.id === 'irongolem') {
    ctx.save();
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-r * 0.65, -r * 0.75, r * 0.22, r * 1.4);
    if (mood === 'ko') {
      drawKoCrossEyes(ctx, r, '#dc2626');
    } else {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-r * 0.62, -px * 0.65, px * 1.2, px * 0.7);
      ctx.fillRect(r * 0.62 - px * 1.2, -px * 0.65, px * 1.2, px * 0.7);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-r * 0.48, -px * 0.55, px * 0.7, px * 0.52);
      ctx.fillRect(r * 0.48 - px * 0.7, -px * 0.55, px * 0.7, px * 0.52);
    }
    // Long blocky Golem/Villager nose
    ctx.fillStyle = '#a8a29e';
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 1.6;
    ctx.fillRect(-px * 0.55, -px * 0.1, px * 1.1, px * 1.85);
    ctx.strokeRect(-px * 0.55, -px * 0.1, px * 1.1, px * 1.85);
    ctx.restore();
    return true;
  }

  if (char.id === 'skeleton' || char.id === 'zombie' || char.id === 'ghast') {
    ctx.save();
    const eyeCol = char.id === 'ghast' ? '#ef4444' : '#09090b';
    if (mood === 'ko') {
      drawKoCrossEyes(ctx, r, eyeCol);
    } else {
      ctx.fillStyle = eyeCol;
      ctx.fillRect(-r * 0.62, -px * 0.68, px * 1.25, px * 0.85);
      ctx.fillRect(r * 0.62 - px * 1.25, -px * 0.68, px * 1.25, px * 0.85);
    }
    if (char.id === 'ghast') {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-r * 0.45, px * 0.15, px * 0.45, px * 1.3);
      ctx.fillRect(r * 0.45 - px * 0.45, px * 0.15, px * 0.45, px * 1.3);
    }
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-px * 1.1, px * 0.85, px * 2.2, px * 0.65);
    ctx.restore();
    return true;
  }

  if (char.id === 'piglin' || char.id === 'technoblade') {
    ctx.save();
    if (mood === 'ko') {
      drawKoCrossEyes(ctx, r, '#09090b');
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-r * 0.62, -px * 0.62, px * 1.05, px * 0.7);
      ctx.fillRect(r * 0.62 - px * 1.05, -px * 0.62, px * 1.05, px * 0.7);
      ctx.fillStyle = char.id === 'technoblade' ? '#1e293b' : '#f8fafc';
      ctx.fillRect(-r * 0.56, -px * 0.62, px * 0.55, px * 0.7);
      ctx.fillRect(r * 0.56 - px * 0.55, -px * 0.62, px * 0.55, px * 0.7);
    }
    // Pig snout + nostrils + tusks!
    ctx.fillStyle = '#f472b6';
    ctx.strokeStyle = '#9d174d';
    ctx.lineWidth = 1.6;
    ctx.fillRect(-px * 1.1, px * 0.15, px * 2.2, px * 1.15);
    ctx.strokeRect(-px * 1.1, px * 0.15, px * 2.2, px * 1.15);
    ctx.fillStyle = '#831843';
    ctx.fillRect(-px * 0.75, px * 0.5, px * 0.45, px * 0.5);
    ctx.fillRect(px * 0.3, px * 0.5, px * 0.45, px * 0.5);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-px * 1.55, px * 0.55, px * 0.45, px * 0.8);
    ctx.fillRect(px * 1.1, px * 0.55, px * 0.45, px * 0.8);
    ctx.restore();
    return true;
  }

  if (char.id === 'shulker' || char.id === 'evoker' || char.id === 'ravager') {
    ctx.save();
    if (char.id === 'shulker') {
      ctx.fillStyle = '#581c87';
      ctx.fillRect(-r, -r, r * 2, r * 0.62);
      ctx.fillRect(-r, r * 0.38, r * 2, r * 0.62);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-px * 1.4, -px * 0.5, px * 2.8, px * 1.2);
    }
    if (mood === 'ko') {
      drawKoCrossEyes(ctx, r, '#09090b');
    } else {
      ctx.fillStyle = char.id === 'ravager' ? '#ef4444' : '#10b981';
      ctx.fillRect(-r * 0.52, -px * 0.35, px * 0.9, px * 0.65);
      ctx.fillRect(r * 0.52 - px * 0.9, -px * 0.35, px * 0.9, px * 0.65);
    }
    ctx.restore();
    return true;
  }

  // 2. Masked / Helmeted / Non-Human Anime & Game Icons
  if (char.id === 'obito') {
    // Obito iconic orange spiral Tobi mask!
    ctx.save();
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(r * 0.32, -r * 0.08);
      ctx.quadraticCurveTo(
        Math.cos(a) * r * 0.6,
        Math.sin(a) * r * 0.6,
        Math.cos(a + 0.6) * r * 1.2,
        Math.sin(a + 0.6) * r * 1.2,
      );
      ctx.stroke();
    }
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(r * 0.32, -r * 0.08, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    if (mood !== 'ko') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(r * 0.32, -r * 0.08, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
  }

  if (char.id === 'kokushibo') {
    // Kokushibo Upper Moon 1 iconic 6 glowing demon eyes!
    ctx.save();
    const pairs: Array<[number, number, number]> = [
      [0.34, -0.34, 0.13],
      [0.38, -0.04, 0.15],
      [0.32, 0.24, 0.12],
    ];
    for (const [ex, ey, er] of pairs) {
      for (const side of [-1, 1]) {
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(side * r * ex, r * ey, r * er, r * er * 0.65, side * 0.18, 0, Math.PI * 2);
        ctx.fill();
        if (mood !== 'ko') {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(side * r * ex, r * ey, r * er * 0.48, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
    return true;
  }

  if (
    char.id === 'zed' ||
    char.id === 'mordekaiser' ||
    char.id === 'doomguy' ||
    char.id === 'masterchief' ||
    char.id === 'scorpion' ||
    char.id === 'subzero'
  ) {
    // Armored / Masked Ninja & Sci-Fi Visor Helmets!
    ctx.save();
    const isVisor = char.id === 'doomguy' || char.id === 'masterchief';
    if (isVisor) {
      ctx.fillStyle = char.id === 'masterchief' ? '#f59e0b' : '#22c55e';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-r * 0.72, -r * 0.36, r * 1.44, r * 0.56, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(-r * 0.55, -r * 0.28, r * 0.45, r * 0.14);
    } else {
      // Mask faceplate + fierce glowing eye slits
      ctx.fillStyle =
        char.id === 'scorpion' ? '#eab308' : char.id === 'subzero' ? '#0284c7' : '#1e293b';
      ctx.fillRect(-r * 0.78, r * 0.04, r * 1.56, r * 0.68);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-r * 0.78, r * 0.04, r * 1.56, r * 0.68);
      const slitCol = form.eyeColor ?? char.eyeColor;
      ctx.shadowColor = slitCol;
      ctx.shadowBlur = 12;
      ctx.fillStyle = mood === 'ko' ? '#475569' : slitCol;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * r * 0.14, -r * 0.08);
        ctx.lineTo(side * r * 0.62, -r * 0.24);
        ctx.lineTo(side * r * 0.52, -r * 0.02);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
    return true;
  }

  if (char.id === 'kirby') {
    // Kirby adorable rosy pink cheeks & tall glossy blue oval eyes!
    ctx.save();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(-r * 0.56, r * 0.12, r * 0.18, r * 0.1, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.56, r * 0.12, r * 0.18, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    if (mood === 'ko') {
      drawKoCrossEyes(ctx, r, '#09090b');
    } else {
      for (const side of [-1, 1]) {
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.ellipse(side * r * 0.26, -r * 0.12, r * 0.11, r * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(side * r * 0.26, -r * 0.22, r * 0.07, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.arc(0, r * 0.24, r * 0.14, 0, Math.PI);
    ctx.fill();
    ctx.restore();
    return true;
  }

  return false;
}

function drawKoCrossEyes(ctx: CanvasRenderingContext2D, r: number, color: string): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    const cx = side * r * 0.35;
    ctx.beginPath();
    ctx.moveTo(cx - 5, -6);
    ctx.lineTo(cx + 5, 4);
    ctx.moveTo(cx + 5, -6);
    ctx.lineTo(cx - 5, 4);
    ctx.stroke();
  }
}

function drawExpansionHairAndAccessory(
  ctx: CanvasRenderingContext2D,
  char: CharacterConfig,
  form: FormConfig,
  r: number,
): void {
  const acc = char.accessory;

  // Bespoke canon hairstyles, hats, ears, helmets & anti-duplicate procedural hair variety!
  if (drawBespokeHairAndHeadgear(ctx, char, form, r)) {
    return;
  }

  // Minecraft / Bald / Full-helmet characters without human hair bangs
  if (
    acc === 'mc-mob' ||
    char.id === 'frieza' ||
    char.id === 'jiren' ||
    char.id === 'buu' ||
    char.id === 'kirby' ||
    char.id === 'leesin'
  ) {
    if (char.id === 'frieza') {
      // Frieza purple bio-gem dome on head
      ctx.fillStyle = '#7e22ce';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.76, r * 0.45, r * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (char.id === 'buu') {
      // Majin Buu iconic head tentacle!
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, -r * 0.9);
      ctx.quadraticCurveTo(0, -r * 1.65, r * 0.65, -r * 1.15);
      ctx.quadraticCurveTo(r * 0.15, -r * 1.25, r * 0.2, -r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (char.id === 'leesin') {
      // Lee Sin crimson blindfold wrap!
      drawHeadband(ctx, r, '#dc2626', '#991b1b');
    }
    return;
  }

  // Overlay distinctive headgear / hats / visors for remaining expansion characters needing hats
  if (acc === 'king-crown' || char.id === 'technoblade' || char.id === 'viego') {
    const isRuined = char.id === 'viego';
    ctx.fillStyle = isRuined ? '#2dd4bf' : '#facc15';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.72, -r * 0.76);
    ctx.lineTo(-r * 0.82, -r * 1.32);
    ctx.lineTo(-r * 0.36, -r * 1.02);
    ctx.lineTo(0, -r * 1.44);
    ctx.lineTo(r * 0.36, -r * 1.02);
    ctx.lineTo(r * 0.82, -r * 1.32);
    ctx.lineTo(r * 0.72, -r * 0.76);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (acc === 'cowboy-hat' || char.id === 'ace') {
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -r * 0.65, r * 0.74, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.65, r * 1.22, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(i * 6.5, -r * 0.76, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (acc === 'fur-cap' || char.id === 'law') {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -r * 0.54, r * 0.88, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    for (const sx of [-r * 0.48, 0, r * 0.48]) {
      ctx.beginPath();
      ctx.arc(sx, -r * 0.74, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (acc === 'top-hat' || char.id === 'sabo' || char.id === 'hutao') {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.fillRect(-r * 0.65, -r * 1.42, r * 1.3, r * 0.76);
    ctx.strokeRect(-r * 0.65, -r * 1.42, r * 1.3, r * 0.76);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.66, r * 1.08, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = char.primaryColor;
    ctx.fillRect(-r * 0.64, -r * 0.88, r * 1.28, r * 0.18);
  } else if (acc === 'ninja-headband') {
    drawHeadband(ctx, r, '#1e293b', '#cbd5e1');
  } else if (acc === 'sunglasses-pink' || char.id === 'doflamingo') {
    ctx.fillStyle = '#ec4899';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.08, -r * 0.12);
      ctx.lineTo(side * r * 0.74, -r * 0.34);
      ctx.lineTo(side * r * 0.6, r * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (acc === 'demon-horns' || char.id === 'kaido' || char.id === 'aatrox') {
    drawDemonHorn(ctx, r, -1, char.secondaryColor);
    drawDemonHorn(ctx, r, 1, char.secondaryColor);
  } else if (acc === 'jotaro-cap' || char.id === 'jotaro') {
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.fillRect(-r * 0.92, -r * 1.08, r * 1.84, r * 0.52);
    ctx.strokeRect(-r * 0.92, -r * 1.08, r * 1.84, r * 0.52);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.82, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (acc === 'mario-cap' || char.id === 'mario') {
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -r * 0.56, r * 0.92, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -r * 0.86, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
  } else if (acc === 'allmight-horns' || char.id === 'allmight') {
    drawDemonHorn(ctx, r, -1, '#facc15');
    drawDemonHorn(ctx, r, 1, '#facc15');
  }
}

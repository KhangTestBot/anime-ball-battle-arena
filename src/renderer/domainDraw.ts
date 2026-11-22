import type { ArenaBounds, ArenaDomain, FighterState } from '../types/game';
import { hexWithAlpha } from './characterDraw';

/**
 * Renders full-arena anime/game Domain Expansion & Signature Reality backdrops!
 * Drawn right over the arena floor grid so the entire world visibly transforms.
 */
export function drawDomainBackdrops(
  ctx: CanvasRenderingContext2D,
  domains: ArenaDomain[],
  bounds: ArenaBounds,
  fighters: FighterState[],
  t: number,
): void {
  if (domains.length === 0) return;
  const full = bounds.fullSize;
  const cx = full / 2;
  const cy = full / 2;

  for (const dom of domains) {
    const fadeIn = Math.min(1, (dom.maxLife - dom.life) / 0.28);
    const fadeOut = Math.min(1, dom.life / 0.45);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
    if (alpha <= 0.01) continue;

    ctx.save();
    ctx.globalAlpha = alpha;

    switch (dom.kind) {
      case 'unlimited-void': {
        // GOJO SATORU — VÔ LƯỢNG KHÔNG XỨ (UNLIMITED VOID)!
        // Pitch-black deep cosmic space
        ctx.fillStyle = 'rgba(2, 4, 14, 0.88)';
        ctx.fillRect(0, 0, full, full);

        // Swirling cosmic nebula ring + Event Horizon White-Cyan Singularity
        const horizonR = full * 0.24 + Math.sin(t * 3) * 6;
        const glow = ctx.createRadialGradient(cx, cy, horizonR * 0.55, cx, cy, full * 0.58);
        glow.addColorStop(0, 'rgba(2, 6, 23, 1)');
        glow.addColorStop(0.36, 'rgba(224, 242, 254, 0.92)');
        glow.addColorStop(0.46, 'rgba(56, 189, 248, 0.48)');
        glow.addColorStop(0.68, 'rgba(139, 92, 246, 0.22)');
        glow.addColorStop(1, 'rgba(2, 4, 14, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, full, full);

        // Black event horizon core with crisp blinding white rim
        ctx.fillStyle = '#02040d';
        ctx.beginPath();
        ctx.arc(cx, cy, horizonR * 0.72, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#7dd3fc';
        ctx.shadowBlur = 24;
        ctx.stroke();

        // Infinite sensory data streaks & stars streaming around the void
        ctx.shadowBlur = 0;
        for (let i = 0; i < 36; i++) {
          const a = (i * Math.PI * 2) / 36 + t * (i % 2 === 0 ? 0.35 : -0.25);
          const dist = horizonR * 0.9 + ((i * 37) % Math.round(full * 0.34));
          const sx = cx + Math.cos(a) * dist;
          const sy = cy + Math.sin(a) * dist;
          ctx.fillStyle = i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#7dd3fc' : '#c084fc';
          ctx.beginPath();
          ctx.arc(sx, sy, i % 4 === 0 ? 2.4 : 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Rotating infinite information arcs
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.lineWidth = 1.6;
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            horizonR * (1.15 + k * 0.28),
            t * (0.9 + k * 0.3),
            t * (0.9 + k * 0.3) + 1.8,
          );
          ctx.stroke();
        }
        break;
      }

      case 'malevolent-shrine': {
        // SUKUNA — PHỤC MA NGỰ TRÙ TỬ (MALEVOLENT SHRINE)!
        const bg = ctx.createRadialGradient(cx, cy, 20, cx, cy, full * 0.65);
        bg.addColorStop(0, 'rgba(127, 29, 29, 0.72)');
        bg.addColorStop(0.6, 'rgba(30, 6, 12, 0.82)');
        bg.addColorStop(1, 'rgba(9, 4, 8, 0.9)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, full, full);

        // Giant Crimson Torii Shrine Silhouette in center
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = 'rgba(15, 5, 8, 0.92)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 22;
        // Curved shrine roof
        ctx.beginPath();
        ctx.moveTo(-115, -55);
        ctx.quadraticCurveTo(0, -108, 115, -55);
        ctx.lineTo(92, -32);
        ctx.quadraticCurveTo(0, -68, -92, -32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Shrine pillars
        ctx.fillRect(-68, -36, 16, 110);
        ctx.strokeRect(-68, -36, 16, 110);
        ctx.fillRect(52, -36, 16, 110);
        ctx.strokeRect(52, -36, 16, 110);
        // Eerie glowing demonic shrine mouth & eyes
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-26, -12, 6, 0, Math.PI * 2);
        ctx.arc(26, -12, 6, 0, Math.PI * 2);
        ctx.fill();
        // Slashing grid aura
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.lineWidth = 1.5;
        for (let k = -3; k <= 3; k++) {
          ctx.beginPath();
          ctx.moveTo(-full * 0.45, k * 65);
          ctx.lineTo(full * 0.45, k * 65 + 40);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 'time-stop': {
        // DIO / JOTARO — ZA WARUDO / TIME STOP!
        ctx.fillStyle = 'rgba(30, 27, 75, 0.62)';
        ctx.fillRect(0, 0, full, full);

        // Giant translucent Roman Numeral Clockface frozen in the sky!
        const clockR = full * 0.36;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.72)';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, 0, clockR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, clockR * 0.86, 0, Math.PI * 2);
        ctx.stroke();

        // 12 hour ticks
        for (let k = 0; k < 12; k++) {
          const a = (k * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * clockR * 0.86, Math.sin(a) * clockR * 0.86);
          ctx.lineTo(Math.cos(a) * clockR, Math.sin(a) * clockR);
          ctx.stroke();
        }
        // Frozen clock hands + Roman numerals
        ctx.fillStyle = 'rgba(250, 204, 21, 0.75)';
        ctx.font = '900 18px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('XII', 0, -clockR * 0.72);
        ctx.fillText('III', clockR * 0.72, 0);
        ctx.fillText('VI', 0, clockR * 0.72);
        ctx.fillText('IX', -clockR * 0.72, 0);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -clockR * 0.62);
        ctx.moveTo(0, 0);
        ctx.lineTo(clockR * 0.42, -clockR * 0.25);
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'ope-room': {
        // TRAFALGAR LAW — ROOM: SHAMBLES!
        const roomR = full * 0.46;
        const grad = ctx.createRadialGradient(cx, cy, roomR * 0.2, cx, cy, roomR);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        grad.addColorStop(0.82, 'rgba(56, 189, 248, 0.22)');
        grad.addColorStop(1, 'rgba(125, 211, 252, 0.58)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, roomR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.stroke();
        // Surgical grid crosshairs
        ctx.setLineDash([10, 8]);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx - roomR, cy);
        ctx.lineTo(cx + roomR, cy);
        ctx.moveTo(cx, cy - roomR);
        ctx.lineTo(cx, cy + roomR);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'tsukuyomi': {
        // ITACHI — TSUKUYOMI BLOOD MOON!
        ctx.fillStyle = 'rgba(69, 10, 10, 0.72)';
        ctx.fillRect(0, 0, full, full);
        const moonR = full * 0.22;
        ctx.fillStyle = '#dc2626';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 28;
        ctx.beginPath();
        ctx.arc(cx, cy - full * 0.08, moonR, 0, Math.PI * 2);
        ctx.fill();
        // Sharingan 3-tomoe ring inside the blood moon!
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy - full * 0.08, moonR * 0.56, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#09090b';
        for (let k = 0; k < 3; k++) {
          const a = t * 1.4 + (k * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.arc(
            cx + Math.cos(a) * moonR * 0.56,
            cy - full * 0.08 + Math.sin(a) * moonR * 0.56,
            10,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        break;
      }

      case 'gear5-toonworld': {
        // LUFFY GEAR 5 — SUN GOD NIKA TOON FORCE!
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.fillRect(0, 0, full, full);
        // Cartoon puffy white clouds framing arena + golden Nika sun rays
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI * 2) / 12 + t * 0.8;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 60);
          ctx.lineTo(cx + Math.cos(a) * full * 0.48, cy + Math.sin(a) * full * 0.48);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI * 2) / 10 + t * 0.4;
          ctx.beginPath();
          ctx.arc(
            cx + Math.cos(a) * full * 0.43,
            cy + Math.sin(a) * full * 0.43,
            28,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        break;
      }

      case 'gate-of-babylon': {
        // GILGAMESH — GATE OF BABYLON GOLDEN PORTALS!
        ctx.fillStyle = 'rgba(113, 63, 18, 0.35)';
        ctx.fillRect(0, 0, full, full);
        const pts = dom.markers ?? [];
        for (const pt of pts) {
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(0, 0, 24 + Math.sin(t * 9) * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
          ctx.fill();
          ctx.restore();
        }
        break;
      }

      case 'unlimited-blade-works': {
        // ARCHER EMIYA / FATE — UNLIMITED BLADE WORKS!
        const bg = ctx.createLinearGradient(0, 0, 0, full);
        bg.addColorStop(0, 'rgba(124, 45, 18, 0.65)');
        bg.addColorStop(0.6, 'rgba(180, 83, 9, 0.42)');
        bg.addColorStop(1, 'rgba(28, 25, 23, 0.8)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, full, full);
        // Giant spinning Sky Gears
        for (const [gx, gy, gr, dir] of [
          [cx - 110, cy - 110, 75, 1],
          [cx + 120, cy - 75, 95, -1],
        ] as const) {
          ctx.save();
          ctx.translate(gx, gy);
          ctx.rotate(t * 0.7 * dir);
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, gr, 0, Math.PI * 2);
          ctx.stroke();
          for (let k = 0; k < 10; k++) {
            const a = (k * Math.PI * 2) / 10;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * gr * 0.75, Math.sin(a) * gr * 0.75);
            ctx.lineTo(Math.cos(a) * gr * 1.15, Math.sin(a) * gr * 1.15);
            ctx.stroke();
          }
          ctx.restore();
        }
        // Planted sword silhouettes across lower arena
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.32)';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 12; i++) {
          const sx = 45 + (i * (full - 90)) / 11;
          const sy = full - 45 - (i % 3) * 28;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy - 38);
          ctx.moveTo(sx - 9, sy - 26);
          ctx.lineTo(sx + 9, sy - 26);
          ctx.stroke();
        }
        break;
      }

      case 'shadow-monarch': {
        // SUNG JINWOO — SHADOW MONARCH ARISE! [SYSTEM]
        ctx.fillStyle = 'rgba(15, 7, 36, 0.74)';
        ctx.fillRect(0, 0, full, full);
        // Holographic Cyan [SYSTEM] Corner Brackets spanning arena
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3.2;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 16;
        const pad = 28;
        const arm = 58;
        for (const [x0, y0, dx, dy] of [
          [pad, pad, 1, 1],
          [full - pad, pad, -1, 1],
          [pad, full - pad, 1, -1],
          [full - pad, full - pad, -1, -1],
        ]) {
          ctx.beginPath();
          ctx.moveTo(x0, y0 + dy * arm);
          ctx.lineTo(x0, y0);
          ctx.lineTo(x0 + dx * arm, y0);
          ctx.stroke();
        }
        break;
      }

      case 'minecraft-end': {
        // STEVE — THE END DIMENSION + 4 HEALING END CRYSTALS!
        ctx.fillStyle = 'rgba(30, 16, 48, 0.62)';
        ctx.fillRect(0, 0, full, full);
        const owner = fighters.find((f) => f.uid === dom.ownerUid && f.alive);
        const corners = [
          [56, 56],
          [full - 56, 56],
          [56, full - 56],
          [full - 56, full - 56],
        ];
        for (const [ex, ey] of corners) {
          // Obsidian tower base + floating magenta End Crystal
          ctx.fillStyle = '#1e1b4b';
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.fillRect(ex - 14, ey - 14, 28, 28);
          ctx.strokeRect(ex - 14, ey - 14, 28, 28);
          ctx.fillStyle = '#e879f9';
          ctx.fillRect(ex - 6, ey - 6, 12, 12);
          if (owner) {
            // Iconic striped healing beam to Steve!
            ctx.strokeStyle = 'rgba(240, 171, 252, 0.55)';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(owner.x, owner.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        break;
      }

      case 'undertale-badtime': {
        // SANS — UNDERTALE MONOCHROME BATTLE BOX!
        ctx.fillStyle = 'rgba(2, 4, 8, 0.82)';
        ctx.fillRect(0, 0, full, full);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.strokeRect(24, 24, full - 48, full - 48);
        // Subtle blue downward gravity arrows
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 2.5;
        for (let k = 0; k < 5; k++) {
          const ax = 90 + (k * (full - 180)) / 4;
          const ay = ((t * 140 + k * 70) % (full - 120)) + 60;
          ctx.beginPath();
          ctx.moveTo(ax, ay - 14);
          ctx.lineTo(ax, ay + 14);
          ctx.lineTo(ax - 8, ay + 6);
          ctx.moveTo(ax, ay + 14);
          ctx.lineTo(ax + 8, ay + 6);
          ctx.stroke();
        }
        break;
      }

      case 'quake-shatter': {
        // WHITEBEARD — GURA GURA SHATTERED GLASS ARENA!
        ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
        ctx.fillRect(0, 0, full, full);
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.78)';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        for (let k = 0; k < 14; k++) {
          const a = (k * Math.PI * 2) / 14 + 0.15;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * full * 0.24, cy + Math.sin(a) * full * 0.24);
          ctx.lineTo(cx + Math.cos(a + 0.12) * full * 0.56, cy + Math.sin(a + 0.12) * full * 0.56);
          ctx.stroke();
        }
        break;
      }

      case 'transmutation-array':
      case 'mahoujin-grand-magic': {
        // FULLMETAL ALCHEMIST NATIONWIDE TRANSMUTATION / FAIRY TAIL GRAND MAHOUJIN!
        ctx.fillStyle = hexWithAlpha(dom.color, 0.14);
        ctx.fillRect(0, 0, full, full);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.6);
        const r = full * 0.42;
        ctx.strokeStyle = dom.kind === 'transmutation-array' ? '#38bdf8' : dom.color;
        ctx.lineWidth = 3.2;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2);
        ctx.stroke();
        // Hexagram inscribed star
        for (const flip of [1, -1]) {
          ctx.beginPath();
          for (let k = 0; k < 3; k++) {
            const a = (k * Math.PI * 2) / 3 + (flip < 0 ? Math.PI : 0);
            if (k === 0) ctx.moveTo(Math.cos(a) * r * 0.84, Math.sin(a) * r * 0.84);
            else ctx.lineTo(Math.cos(a) * r * 0.84, Math.sin(a) * r * 0.84);
          }
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 'idle-death-gamble': {
        // HAKARI — 777 JACKPOT IMMORTAL DOMAIN!
        ctx.fillStyle = 'rgba(6, 78, 59, 0.42)';
        ctx.fillRect(0, 0, full, full);
        ctx.fillStyle = 'rgba(74, 222, 128, 0.24)';
        ctx.font = '900 120px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('7 7 7', cx, cy);
        break;
      }

      case 'frozen-glacier': {
        // AOKIJI / TOSHIRO / GRAY — SOLID ICE GLACIER ARENA!
        ctx.fillStyle = 'rgba(14, 116, 144, 0.45)';
        ctx.fillRect(0, 0, full, full);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.25);
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
        ctx.lineWidth = 3;
        for (let k = 0; k < 6; k++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(-full * 0.4, 0);
          ctx.lineTo(full * 0.4, 0);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 'coffin-volcano': {
        // JOGO / YAMAMOTO / NATSU / AKAINU — VOLCANIC MAGMA CALDERA!
        const bg = ctx.createRadialGradient(cx, cy, 40, cx, cy, full * 0.65);
        bg.addColorStop(0, 'rgba(234, 88, 12, 0.45)');
        bg.addColorStop(0.65, 'rgba(124, 45, 18, 0.55)');
        bg.addColorStop(1, 'rgba(28, 10, 6, 0.78)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, full, full);
        break;
      }

      case 'deep-dark-sculk': {
        // WARDEN / BLACKBEARD / DARKNESS DEVIL — PITCH-BLACK DARKNESS!
        ctx.fillStyle = 'rgba(2, 6, 12, 0.82)';
        ctx.fillRect(0, 0, full, full);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.42)';
        ctx.lineWidth = 2.5;
        const pulseR = ((t * 180) % (full * 0.48)) + 30;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'compass-needle': {
        // AKAZA / DEMON SLAYER — 12-POINT SNOWFLAKE COMPASS NEEDLE!
        ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
        ctx.fillRect(0, 0, full, full);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.5);
        ctx.strokeStyle = dom.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = dom.color;
        ctx.shadowBlur = 16;
        for (let k = 0; k < 12; k++) {
          const a = (k * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * full * 0.42, Math.sin(a) * full * 0.42);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, full * 0.36, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'flying-raijin-blitz': {
        // MINATO / KILLUA / ZENITSU — 6 ELECTRIC FLYING RAIJIN SEAL MARKERS!
        ctx.fillStyle = hexWithAlpha(dom.color, 0.14);
        ctx.fillRect(0, 0, full, full);
        const pts = dom.markers ?? [];
        if (pts.length >= 2) {
          ctx.strokeStyle = hexWithAlpha(dom.color, 0.55);
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
          ctx.closePath();
          ctx.stroke();
          ctx.setLineDash([]);
          for (const pt of pts) {
            ctx.fillStyle = dom.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'chibaku-gravity': {
        // PAIN / MADARA / MOB — PLANETARY GRAVITY CORE!
        ctx.fillStyle = 'rgba(15, 10, 30, 0.52)';
        ctx.fillRect(0, 0, full, full);
        const coreR = 32 + Math.sin(t * 8) * 4;
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = dom.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = dom.color;
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Inward pulling gravity rings
        for (let k = 0; k < 3; k++) {
          const rr = full * 0.45 - ((t * 160 + k * 90) % (full * 0.42));
          ctx.strokeStyle = hexWithAlpha(dom.color, 0.4);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(coreR, rr), 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case 'birdcage-strings': {
        // DOFLAMINGO / MAKIMA — BIRDCAGE STRING WALLS!
        ctx.fillStyle = 'rgba(20, 8, 22, 0.42)';
        ctx.fillRect(0, 0, full, full);
        ctx.strokeStyle = hexWithAlpha(dom.color, 0.65);
        ctx.lineWidth = 2;
        for (let k = 0; k < 16; k++) {
          const a = (k * Math.PI * 2) / 16;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * full * 0.65, cy + Math.sin(a) * full * 0.65);
          ctx.lineTo(cx + Math.cos(a + 0.15) * full * 0.18, cy + Math.sin(a + 0.15) * full * 0.18);
          ctx.stroke();
        }
        break;
      }

      default: {
        // Remaining iconic domains (Full Counter Cube, High Noon Sun, Senbonzakura Bankai, LoL Nexus, Stand Requiem, Rumbling, Chainsaw Hell, Spirit Bomb, Herobrine Corruption, Petrify Charm)
        const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, full * 0.62);
        grad.addColorStop(0, hexWithAlpha(dom.color, 0.28));
        grad.addColorStop(0.75, hexWithAlpha(dom.color, 0.16));
        grad.addColorStop(1, 'rgba(5, 8, 20, 0.62)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, full, full);
        ctx.strokeStyle = hexWithAlpha(dom.color, 0.68);
        ctx.lineWidth = 3;
        if (dom.kind === 'full-counter-cube' || dom.kind === 'herobrine-corruption') {
          ctx.strokeRect(32, 32, full - 64, full - 64);
        } else {
          ctx.beginPath();
          ctx.arc(cx, cy, full * 0.42, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
    }

    ctx.restore();
  }
}

/**
 * Draws the crisp anime-style Domain Expansion Title Banner & Duration Bar at the top of the arena!
 */
export function drawDomainBanners(
  ctx: CanvasRenderingContext2D,
  domains: ArenaDomain[],
  bounds: ArenaBounds,
): void {
  if (domains.length === 0) return;
  const full = bounds.fullSize;

  domains.forEach((dom, idx) => {
    const ratio = Math.max(0, Math.min(1, dom.life / Math.max(0.01, dom.maxLife)));
    const y = 16 + idx * 42;
    const barW = Math.min(full - 44, 410);
    const x = (full - barW) / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(4, 7, 17, 0.84)';
    ctx.strokeStyle = dom.color;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = dom.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, 34, 8);
    ctx.fill();
    ctx.stroke();

    // Remaining duration progress bar along bottom edge
    ctx.shadowBlur = 0;
    ctx.fillStyle = dom.color;
    ctx.fillRect(x + 6, y + 29, (barW - 12) * ratio, 3);

    // Domain title text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 11.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`「${dom.title}」`, full / 2, y + 12);

    ctx.font = '700 9.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(dom.subtitle, full / 2, y + 23);
    ctx.restore();
  });
}

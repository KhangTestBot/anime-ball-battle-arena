import type { SaitamaUltimateData } from '../../physics/ultimates/saitama';
import type { UltimateRenderer } from './types';

export const saitamaUltimateRenderer: UltimateRenderer = {
  characterId: 'saitama',

  drawBackdrop(ctx, state, bounds, _fighters, _t) {
    const data = state.data as unknown as SaitamaUltimateData;
    const { left, top, right, bottom } = bounds;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.45);

    // 1. High-Contrast Black & White Manga Panel Backdrop + Converging Action Speedlines!
    ctx.save();
    ctx.fillStyle =
      data.stage === 'death-windup'
        ? 'rgba(255, 255, 255, 0.34)'
        : `rgba(15, 23, 42, ${0.46 * fade})`;
    ctx.fillRect(left, top, right - left, bottom - top);

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.32 * fade})`;
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 28; i++) {
      const ang = (i * Math.PI * 2) / 28;
      const rIn = 95;
      const rOut = (right - left) * 0.78;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * rIn, cy + Math.sin(ang) * rIn);
      ctx.lineTo(cx + Math.cos(ang) * rOut, cy + Math.sin(ang) * rOut);
      ctx.stroke();
    }
    ctx.restore();

    // 2. 80-Degree Directional Serious Punch Cone Telegraph / Manga DEATH "死" Symbol!
    if (data.stage === 'death-windup' || data.stage === 'punched') {
      const coneAlpha =
        data.stage === 'death-windup'
          ? 0.48
          : Math.max(0, Math.min(1, data.punchFlash / 0.9)) * 0.82;
      ctx.save();
      ctx.globalAlpha = coneAlpha;
      ctx.translate(data.originX, data.originY);
      ctx.fillStyle = data.stage === 'death-windup' ? '#ef4444' : '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 560, data.punchAngle - data.halfConeRad, data.punchAngle + data.halfConeRad);
      ctx.closePath();
      ctx.fill();

      // Massive Crimson Manga Kanji "死" during DEATH freeze!
      if (data.stage === 'death-windup') {
        ctx.globalAlpha = 0.98;
        const dx = Math.cos(data.punchAngle) * 125;
        const dy = Math.sin(data.punchAngle) * 125;
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 5.5;
        ctx.font = '900 78px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText('死', dx, dy);
        ctx.fillText('死', dx, dy);
      }
      ctx.restore();
    }
  },

  drawForeground(ctx, state, _bounds, _fighters, _t) {
    const data = state.data as unknown as SaitamaUltimateData;
    const fade = Math.min(1, (state.duration - state.elapsed) / 0.4);

    // Boulders & Slabs hurled upward by Serious Table Flip!
    ctx.save();
    ctx.globalAlpha = fade;
    for (const rock of data.rocks) {
      ctx.save();
      ctx.translate(rock.x, rock.y);
      ctx.rotate(rock.rot);
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.6;
      ctx.fillRect(-rock.size * 0.5, -rock.size * 0.5, rock.size, rock.size * 0.85);
      ctx.strokeRect(-rock.size * 0.5, -rock.size * 0.5, rock.size, rock.size * 0.85);
      ctx.restore();
    }
    ctx.restore();

    // Serious Punch Colossal Cloud-Splitting Shock Cones + "ONE PUNCH!!" Impact Burst!
    if (data.stage === 'punched' && data.punchFlash > 0) {
      const a = Math.max(0, Math.min(1, data.punchFlash / 0.9));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(data.originX, data.originY);
      ctx.rotate(data.punchAngle);

      // Blinding white core cone + gold shockwave rails
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 10 * a;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(540, -175);
      ctx.moveTo(16, 0);
      ctx.lineTo(540, 175);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 14 * a;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(520, 0);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3.5;
      ctx.font = '900 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeText('ONE PUNCH!!', 220, -48);
      ctx.fillText('ONE PUNCH!!', 220, -48);
      ctx.restore();
    }
  },
};

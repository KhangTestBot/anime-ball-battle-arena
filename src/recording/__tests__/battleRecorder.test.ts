import { describe, expect, it } from 'vitest';
import { BattleEngine } from '../../physics/engine';
import type { MatchConfig } from '../../types/game';
import {
  buildRecordingFilename,
  getRecordingDimensions,
  pickSupportedVideoMime,
} from '../battleRecorder';

function makeDuel(a: string, b: string): BattleEngine {
  const cfg: MatchConfig = {
    mode: '1v1',
    arenaSize: 'medium',
    baseHp: 2500,
    simSpeed: 0.5,
    suddenDeath: true,
    verticalMode: false,
    autoRecord: true,
    slots: [
      { slotId: 's_0', characterId: a, teamId: null },
      { slotId: 's_1', characterId: b, teamId: null },
    ],
  };
  return new BattleEngine(cfg);
}

describe('BattleRecorder helpers', () => {
  it('prefers hardware-friendly MP4/H.264 and VP8 ahead of CPU-heavy VP9', () => {
    const mp4 = pickSupportedVideoMime((m) => m.startsWith('video/mp4'));
    expect(mp4.ext).toBe('mp4');
    expect(mp4.mimeType).toContain('mp4');

    const h264Webm = pickSupportedVideoMime(
      (m) => m === 'video/webm;codecs=h264,opus' || m === 'video/webm;codecs=vp9,opus',
    );
    expect(h264Webm.ext).toBe('webm');
    expect(h264Webm.mimeType).toBe('video/webm;codecs=h264,opus');

    const vp8OverVp9 = pickSupportedVideoMime(
      (m) => m === 'video/webm;codecs=vp8,opus' || m === 'video/webm;codecs=vp9,opus',
    );
    expect(vp8OverVp9.mimeType).toBe('video/webm;codecs=vp8,opus');

    const fallback = pickSupportedVideoMime(() => false);
    expect(fallback).toEqual({ mimeType: 'video/webm', ext: 'webm' });
  });

  it('computes macroblock-aligned 9:16 HD vertical and standard broadcast recording resolutions', () => {
    const vert = getRecordingDimensions(true);
    const std = getRecordingDimensions(false);
    expect(vert).toEqual({ width: 720, height: 1280 });
    expect(std).toEqual({ width: 768, height: 912 });
    expect(vert.width % 16).toBe(0);
    expect(vert.height % 16).toBe(0);
    expect(std.width % 16).toBe(0);
    expect(std.height % 16).toBe(0);
  });

  it('builds sanitized matchup filenames with the selected extension', () => {
    const engine = makeDuel('luffy', 'goku');
    const filename = buildRecordingFilename(engine.fighters, 'webm');
    expect(filename).toMatch(/^luffy-vs-goku-\d{8}-\d{6}\.webm$/);
  });
});

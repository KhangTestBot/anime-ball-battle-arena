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
  it('picks MP4 when supported, otherwise falls back to VP9/VP8 WebM', () => {
    const mp4 = pickSupportedVideoMime((m) => m.startsWith('video/mp4'));
    expect(mp4.ext).toBe('mp4');
    expect(mp4.mimeType).toContain('mp4');

    const webmVp9 = pickSupportedVideoMime((m) => m === 'video/webm;codecs=vp9,opus');
    expect(webmVp9.ext).toBe('webm');
    expect(webmVp9.mimeType).toBe('video/webm;codecs=vp9,opus');

    const fallback = pickSupportedVideoMime(() => false);
    expect(fallback).toEqual({ mimeType: 'video/webm', ext: 'webm' });
  });

  it('computes 9:16 HD vertical and standard broadcast recording resolutions', () => {
    expect(getRecordingDimensions(true)).toEqual({ width: 720, height: 1280 });
    expect(getRecordingDimensions(false)).toEqual({ width: 900, height: 1060 });
  });

  it('builds sanitized matchup filenames with the selected extension', () => {
    const engine = makeDuel('luffy', 'goku');
    const filename = buildRecordingFilename(engine.fighters, 'webm');
    expect(filename).toMatch(/^luffy-vs-goku-\d{8}-\d{6}\.webm$/);
  });
});

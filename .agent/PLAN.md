# Anime Ball Battle Arena — Implementation Plan

## Project Location
`/Users/mac/.gemini/antigravity/scratch/anime-ball-battle-arena`

## Architecture
- `src/types/game.ts`: Core types for characters, forms, abilities, physics entities, projectiles, trails, slashes, clones, match config, stats, and tournament state.
- `src/characters/roster.ts`: Data-driven roster of 12 anime fighters (Luffy, Goku, Naruto, Gojo, Sukuna, Zoro, Tanjiro, Ichigo, Saitama, Levi, Sung Jinwoo, Denji) with 2–5 auto-evolving forms and unique signature abilities.
- `src/physics/engine.ts`: Fixed-timestep 2D arena physics engine (wall bounce, ball-ball elastic collisions, DMG scaling, form triggers, hitstop, slow-motion KO, Sudden Death shrinking arena, team fire rules).
- `src/physics/abilities.ts`: Implementation of all 12 distinct character physical abilities (ricochet rubber arms, Kamehameha beam + UI dodge, Rasengan + Shadow Clones, Infinity + Hollow Purple, Cleave/Dismantle slashes, orbiting Santoryu swords + wave, Water/Fire breathing trails, Getsuga Tensho crescents, Serious Punch shockwave, ODM wall grapple multi-slash, Shadow Monarch army summons, Chainsaw rim + lifesteal).
- `src/renderer/characterDraw.ts`: Pure Canvas 2D vector drawing for all 12 characters across every form, dynamic facial expressions (`>60%`, transforming/angry, `<25%` sweat, `0 HP` `X X`), team rings, HP badges, and portrait data URL generator for Lobby/HUD.
- `src/renderer/effectsDraw.ts`: Rendering for all abilities, beams, ricochet arms, slashes, orbiting blades, trails, shockwaves, particles, damage popups, and `POWER UP!` banners.
- `src/renderer/canvas.ts`: Main Arena canvas renderer with deep navy `#080d1a` grid, reactive glowing border (white -> orange -> crimson), Sudden Death danger zone, and screen shake.
- `src/audio/sfx.ts`: Web Audio API procedural sound effects with polyphony throttling and mute control.
- `src/tournament/bracket.ts`: 4-fighter and 8-fighter single-elimination tournament manager.
- `src/ui/lobby.ts`, `src/ui/hud.ts`, `src/ui/app.ts`: Lobby, mode & match settings, live 1v1 / multi-fighter HUD, 9:16 TikTok Mode framing, Pause/Speed/Rematch controls, Tournament bracket view, and Post-match summary.

## Checklist
- [x] Scaffold Vite + TypeScript + Vitest + ESLint + Prettier project
- [x] Implement core types (`src/types/game.ts`)
- [x] Implement 12-character data-driven roster (`src/characters/roster.ts`)
- [x] Implement physics engine & 12 signature abilities (`src/physics/`)
- [x] Implement Web Audio procedural SFX (`src/audio/sfx.ts`)
- [x] Implement Canvas 2D vector character, VFX, and arena renderers (`src/renderer/`)
- [x] Implement Tournament bracket manager (`src/tournament/bracket.ts`)
- [x] Implement Lobby, HUD, 9:16 mode, Controls, Summary (`src/ui/`, `src/style.css`)
- [x] Expand roster to 36 characters (Steve Ender Dragon summon + Herobrine, Entity 303, Warden, Wither Boss) & 5000 HP support
- [x] Codify mandatory character-creation rules in `AGENTS.md`
- [x] Expand roster by 100 Anime & Game characters (136 total) with per-character bespoke skill patterns, emblems, barriers, shockwaves, and minions
- [x] Expand roster by +200 Anime characters across 18 famous anime series (~15 characters/series, 336 total characters: 277 Anime + 59 Game), add series filter dropdown in Lobby, and generate 336/336 CC0 real voice files
- [x] Write unit tests (roster integrity for 336 characters, physics invariants, abilities, team rules, tournament progression)
- [x] Run TypeScript check, ESLint, Prettier, Vitest, Vite production build, and Gitleaks
- [x] Visually inspect & playtest live in browser (Lobby, 1v1, FFA, Team 4v4, Pause, 9:16 mode) and polish edge clamping & 9:16 HUD alignment

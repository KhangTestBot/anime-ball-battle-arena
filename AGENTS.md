# Anime Ball Battle Arena — Quy tắc Bắt buộc khi Thêm Nhân vật Mới

Mọi nhân vật mới (Anime hoặc Game: Minecraft, League of Legends, Undertale, v.v.) thêm vào dự án này **bắt buộc phải tuân thủ đầy đủ 6 tiêu chuẩn sau**:

## 1. Dữ liệu & Chuỗi biến hình (Forms + Hồi máu)
- Khai báo nhân vật trong `src/characters/roster.ts` (`category: 'anime' | 'game'`), `abilityId` và `accessory` duy nhất trong `src/types/game.ts`.
- Mỗi nhân vật phải có **2–5 cấp biến hình (`forms`)** gắn với mốc `trigger` chuẩn `200 HP` (engine tự scale lên tối đa `5000 HP`) để khi tiến hóa sẽ tự động hồi một phần Max HP, tăng chỉ số và đổi ngoại hình/hào quang.
- Chọn `primaryColor` đủ tương phản trên cả nền tối (`#080d1a`) và chữ trắng trên thanh HP (tránh màu trắng/xám quá nhạt làm chìm chữ HP).

## 2. Bộ chiêu thức đa dạng (4–5 Chiêu thường + 1 Ultimate Nộ)
- **Bắt buộc có 4–5 chiêu thức** khai báo trong `src/characters/skills.ts`, bám sát nguyên tác:
  - Tướng **League of Legends**: đủ bộ kỹ năng phím `Q`, `W`, `E`, `P` (kèm combo nếu có) và `R` làm Ultimate.
  - Nhân vật **Minecraft**: dùng các vật phẩm/khối/triệu hồi đặc trưng (`ITEM 1`–`ITEM 5`, ví dụ TNT, Ender Pearl, Táo Vàng, Ender Dragon, Cột Sét, Obsidian, Sonic Boom, Đầu Lâu Wither...).
  - Nhân vật **Anime / Game khác**: 4–5 chiêu đặc trưng có tên, mô tả, phím ký hiệu và cơ chế chiến đấu riêng.
- **Bắt buộc có 1 chiêu đặc biệt (Ultimate)** trong `src/characters/ultimates.ts` kèm tên chiêu, mô tả và câu thoại (`voiceLine`), kích hoạt **Center-Screen Cut-In Highlight** khi thanh Nộ đạt `100%` và có logic thực thi riêng trong `executeUltimateSkill` (`src/physics/abilities.ts`).

## 3. Hiệu ứng VFX Chiêu thức Riêng biệt theo Từng Bộ Game/Anime & Từng Nhân Vật (Cấm dùng chung)
- **Tuyệt đối không** tái sử dụng chung hiệu ứng chiêu thức, đạn, tia, vết chém, bẫy hay ấn kỹ năng của nhân vật này cho nhân vật khác.
- Mọi nhân vật phải đăng ký bản sắc hình ảnh riêng trong `src/renderer/vfxIdentity.ts` (`SeriesVfxId` theo từng bộ Game/Anime + `CharacterVfxDNA` duy nhất không trùng lặp trên toàn bộ roster, được kiểm chứng bằng `src/renderer/__tests__/vfxIdentity.test.ts`).
- Mỗi chiêu thức phải có `visualMotif: '<charId>:<key>'`, kết hợp 17 cơ chế quỹ đạo (`SkillPattern`), 47 hình dạng đạn, 34 ấn thi triển mặt sân (`CastSeal`), tia (`drawBeams`), vết chém (`drawSlashes`), bẫy (`drawBombs`), đòn vươn (`drawRicochetArms`), trụ trời (`drawSkyPillars`), khiên (`drawCharacterShieldBarrier`), triệu hồi (`drawMinions`) và sóng Lãnh Địa (`drawShockwaves`) mang chất riêng của đúng bộ Anime/Game và nhân vật đó.

## 4. Tạo hình Nhân vật Canvas 2D Vector (Không phụ thuộc ảnh ngoài)
- Vẽ đầy đủ mặt, tóc/mũ/sừng/phụ kiện, cổ áo, hào quang theo từng Form và vũ khí quay quanh (nếu có) trong `src/renderer/characterDraw.ts`.
- Hỗ trợ đầy đủ 5 trạng thái biểu cảm khuôn mặt: `confident`, `focused`, `fierce`, `critical`, `ko`.

## 5. Voice Thật (Real Audio — Không dùng giọng AI làm mặc định)
- Mọi nhân vật mới **phải có file giọng thật** (`.mp3` / `.wav` / `.ogg`, ưu tiên nguồn CC0/miễn phí bản quyền hoặc clip thật người dùng cung cấp) lưu tại `public/voices/<characterId>.mp3`.
- Chạy `npm run sync-voices` để cập nhật `public/voices/manifest.json` đạt tỷ lệ `N/N` voice sẵn sàng.
- Thêm các từ khóa/biệt danh nhận diện tên file vào `ALIAS_MAP` trong `src/audio/voiceStore.ts`.
- Giữ mặc định chế độ **`Voice: File thật`** (`real`), không tự đổi sang Web Speech AI TTS.

## 6. Tương thích HP lên đến `5000 HP` & Kiểm thử Bắt buộc
- Luôn tính sát thương qua `ctx.getEffectiveDamage(fighter, base)` và hồi máu theo tỉ lệ `% maxHp` (`healPct`) để hoạt động cân bằng ở mọi mức HP từ `50` đến `5000 HP`.
- Sau khi thêm nhân vật, bắt buộc:
  1. Cập nhật unit test trong `src/characters/__tests__/roster.test.ts`, `src/physics/__tests__/engine.test.ts` và `src/audio/__tests__/voiceStore.test.ts`.
  2. Chạy đầy đủ: `npm run sync-voices && npm run format && npm run build && npm test && npm run lint && gitleaks detect --no-git --source .`.
  3. Kiểm tra trực tiếp trên trình duyệt (chân dung Lobby, số lượng Voice thật `N/N`, chiêu thức & VFX riêng biệt trong trận, `0` lỗi console/404).

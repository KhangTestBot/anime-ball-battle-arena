# Thư mục Voice thật cho nhân vật

Bạn có 2 cách để gắn file âm thanh voice thật (`.mp3`, `.wav`, `.ogg`, `.m4a`) cho từng nhân vật:

## Cách 1: Tải trực tiếp trên trình duyệt (Nhanh nhất)
1. Mở game tại `http://localhost:5173/`.
2. Bấm nút **Voice thật (0/32)** ở góc trên Lobby (hoặc nút **+ Gắn voice thật** trong khung thông tin nhân vật).
3. Kéo thả hoặc chọn hàng loạt nhiều file `.mp3/.wav/.ogg` — game tự nhận diện nhân vật theo tên file (ví dụ `luffy.mp3`, `goku-kamehameha.mp3`, `gojo.wav`, `yasuo-hasagi.mp3`, `sans.mp3`...) và lưu bền vững vào trình duyệt (IndexedDB).

## Cách 2: Chép file trực tiếp vào thư mục này (`public/voices/`)
1. Chép các file voice thật vào thư mục `public/voices/` đặt tên theo ID nhân vật:
   - **Anime:** `luffy.mp3`, `goku.mp3`, `naruto.mp3`, `gojo.mp3`, `sukuna.mp3`, `zoro.mp3`, `tanjiro.mp3`, `ichigo.mp3`, `saitama.mp3`, `levi.mp3`, `jinwoo.mp3`, `denji.mp3`, `sasuke.mp3`, `vegeta.mp3`, `killua.mp3`, `eren.mp3`, `madara.mp3`, `deku.mp3`, `rimuru.mp3`, `asta.mp3`, `frieren.mp3`, `mob.mp3`
   - **Game:** `steve.mp3`, `creeper.mp3`, `yasuo.mp3`, `ahri.mp3`, `jinx.mp3`, `sans.mp3`, `pikachu.mp3`, `sonic.mp3`, `vergil.mp3`, `kratos.mp3`
2. Chạy `npm run sync-voices` để tự động cập nhật `manifest.json`.
3. Tải lại trang để game tự động nạp toàn bộ voice thật.

# Dispora DKI Jakarta — Demo Mobile (Expo)

Versi mobile dari `https://dispora.jakarta.go.id/` untuk keperluan demo.
Semua data masih dummy (`src/data/content.js`), belum ada backend.

## Kenapa versi ini

macOS 11.7.10 Big Sur sudah tidak didukung toolchain terbaru, jadi stack-nya
sengaja dikunci ke versi terakhir yang masih aman berjalan di Big Sur:

| Komponen | Versi | Alasan |
|---|---|---|
| Expo SDK | 51 | SDK terakhir yang nyaman dengan Node 18 dan Xcode lama |
| React Native | 0.74.5 | Pasangan resmi SDK 51 |
| React | 18.2.0 | Pasangan resmi RN 0.74 |
| Node.js | 18.20.x LTS | Node 22+ sering bermasalah di Big Sur |
| JDK | 17 (Temurin) | Wajib untuk Android SDK/Gradle modern |
| Android Studio | Hedgehog 2023.1.1 | Rilis terakhir yang resmi mendukung macOS 10.14+ |
| Xcode | 13.2.1 | Versi tertinggi yang bisa dipasang di Big Sur (Simulator iOS 15.2) |

Jangan `expo upgrade` ke SDK 53/54 di mesin ini — build tool-nya menuntut
macOS 13+ dan Xcode 15.

## 1. Siapkan Node 18

Pakai nvm supaya tidak mengganggu Node yang sudah ada:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# tutup lalu buka lagi Terminal
nvm install 18.20.4
nvm alias default 18.20.4
node -v   # harus v18.20.4
```

Homebrew di Big Sur sudah berstatus unsupported, jadi hindari `brew install node`.
Watchman opsional; kalau gagal dipasang, lewati saja — Metro tetap jalan.

## 2. Install dependensi

```bash
cd dispora-mobile
npm install
```

Kalau muncul error peer dependency, jalankan `npm install --legacy-peer-deps`.

## 3. Jalankan di emulator Android (jalur paling stabil di Big Sur)

1. Pasang **Android Studio Hedgehog 2023.1.1** dari halaman arsip Android Studio.
   Kalau installer menolak versi macOS, turun ke Giraffe 2022.3.1.
2. Pasang **JDK 17**, lalu tambahkan ke `~/.zshrc`:

   ```bash
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
   ```

3. Di Android Studio → **Device Manager** → buat AVD:
   **Pixel 5, sistem image Android 13 (API 33), ABI x86_64**.
   Jangan pilih arm64 — Mac Intel tidak bisa menjalankannya.
4. Nyalakan emulator, lalu:

   ```bash
   npm run android
   ```

Expo CLI otomatis mengunduh Expo Go versi SDK 51 ke emulator, jadi tidak perlu
ambil dari Play Store.

## 4. Jalankan di iOS Simulator (opsional)

Butuh Xcode 13.2.1 dari halaman More Downloads Apple Developer.

```bash
sudo xcode-select -s /Applications/Xcode.app
npm run ios
```

Simulator tertinggi di Xcode 13.2.1 adalah iOS 15.2, dan Expo Go SDK 51 masih
mendukungnya. Yang tidak bisa di mesin ini adalah *native build* iOS
(`expo run:ios`) — untuk itu pakai EAS Build di cloud.

## 5. Jalankan di HP fisik

```bash
npm start
```

Scan QR dengan Expo Go. Catatan: Expo Go di App Store/Play Store versi terbaru
hanya mendukung SDK terkini. Untuk SDK 51 pasang Expo Go versi lama (`2.31.x`)
atau gunakan emulator seperti langkah 3.

## Struktur

```
App.js                        entry point
app.json                      konfigurasi Expo
src/theme/index.js            warna, spacing, radius, tipografi
src/data/content.js           data dummy (program, acara, berita, fasilitas)
src/components/common.js      heading, tag, tombol, empty state
src/components/cards.js       kartu program, acara, berita, fasilitas, atlet
src/navigation/RootNavigator  bottom tab + stack detail
src/screens/                  Beranda, Fasilitas, Acara, Berita, Lainnya, detail
```

## Menyamakan warna dengan web

Semua warna ada di `src/theme/index.js`:

- `primary` `#D51C29` — merah DISPORA, dipakai untuk aksen, tombol utama, tab aktif
- `gold` `#F2B705` — kuning Jaya Raya, untuk label sekunder dan tautan
- `blue` `#1D4ED8` — biru Jaya Raya, untuk kategori layanan
- `base` `#0B0C10` / `surface` `#141620` — latar gelap seperti tampilan web

Kalau tim desain punya kode hex resmi, cukup ganti nilai di file itu dan seluruh
layar ikut berubah.

## Troubleshooting

- `Unable to resolve module ...` → `npm run clear`
- Emulator tidak terdeteksi → cek `adb devices`, pastikan emulator sudah booting penuh
- Layar putih di emulator → tekan `r` di terminal Metro untuk reload
- Gambar tidak muncul → beberapa gambar diambil dari server Dispora, butuh koneksi internet

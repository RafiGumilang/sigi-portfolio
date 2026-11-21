# SIGI Web Portfolio — Offline Edition

Versi statis/PWA yang terpisah dari SIGI Production. Dibuat berdasarkan struktur menu dan deskripsi modul pada aplikasi SIGI yang diberikan, tetapi **seluruh angka, nama aset, ID pekerjaan, transaksi, dan laporan di dalam paket ini adalah data simulasi**.

## Tujuan

- Menunjukkan dashboard SIGI pada LinkedIn/CV.
- Dapat dipasang sebagai PWA pada browser/perangkat yang mendukung.
- Setelah kunjungan online pertama dan cache offline siap, dashboard serta modul demo dapat dibuka tanpa internet.
- Tidak terhubung ke XAMPP, PHP, SQLite, akun karyawan, atau server produksi.

## Isi paket

```text
SIGI-Portfolio-Offline/
├── index.html
├── app.webmanifest
├── app-sw.js
├── .nojekyll
├── README-PANDUAN.md
└── assets/
    ├── app.css
    ├── app.js
    ├── sigi-logo.png
    ├── sigi-pwa-192.png
    ├── sigi-pwa-512.png
    ├── sigi-pwa-maskable-512.png
    └── apple-touch-icon.png
```

## Cara menjalankan secara lokal

Service Worker membutuhkan HTTPS atau localhost. Jangan membuka `index.html` langsung dengan `file://` jika ingin menguji instalasi/offline.

Dengan Python terpasang:

```bash
python -m http.server 8000
```

Buka `http://localhost:8000/` pada browser komputer yang sama.

Cara ini hanya untuk preview lokal. Untuk install pada HP, gunakan hosting HTTPS seperti GitHub Pages.

## Publikasikan gratis dengan GitHub Pages

1. Buat/login akun GitHub.
2. Buat repository baru bernama `sigi-portfolio`.
3. Pilih **Public** bila memakai GitHub Free untuk GitHub Pages.
4. Upload seluruh isi folder paket ini ke root repository. Pastikan `index.html` berada langsung di root, bukan di dalam subfolder tambahan.
5. Buka repository → **Settings** → **Pages**.
6. Pada **Build and deployment**, pilih **Deploy from a branch**.
7. Pilih branch `main` dan folder `/(root)`, lalu Save.
8. Tunggu GitHub Pages menerbitkan alamat `https://USERNAME.github.io/sigi-portfolio/`.
9. Pastikan opsi **Enforce HTTPS** aktif jika tersedia.

File `.nojekyll` disertakan untuk memastikan direktori statis dipublikasikan tanpa pemrosesan Jekyll yang tidak diperlukan.

> Repository GitHub Public dapat dilihat orang lain. Paket ini sengaja tidak menyertakan database atau kode backend perusahaan. Tetap tinjau seluruh file sebelum publikasi dan pastikan penggunaan logo/identitas SIGI telah mendapat izin yang sesuai.

## Cara install pada Android

1. Sambungkan HP/tablet ke internet.
2. Buka URL GitHub Pages melalui Google Chrome.
3. Tunggu sampai indikator di bar atas berubah menjadi **Offline siap · cache aplikasi tersedia**.
4. Reload halaman satu kali agar Service Worker aktif mengendalikan tab.
5. Gunakan tombol **Install App** pada aplikasi atau menu Chrome `⋮` → **Install app** jika tersedia.
6. Setelah instalasi, buka aplikasi dari ikon SIGI.

Pada beberapa versi/perangkat Chrome, label instalasi dapat berbeda. Jika Chrome hanya menawarkan **Add to Home screen/Create shortcut**, itu mungkin shortcut browser dan tidak selalu WebAPK/PWA terpasang penuh. Kelayakan install juga bergantung pada browser, perangkat, dan kebijakan platform.

## Cara install pada iPhone/iPad

1. Buka URL GitHub Pages menggunakan Safari.
2. Tekan Share.
3. Pilih **Add to Home Screen**.
4. Aktifkan **Open as Web App** jika opsi tersedia, lalu Add.

## Cara menguji offline

Lakukan setelah kunjungan online pertama:

1. Buka SIGI Portfolio dari ikon aplikasi atau URL.
2. Pastikan indikator menampilkan **Offline siap**.
3. Reload halaman saat masih online sekali lagi.
4. Aktifkan Airplane Mode atau matikan Wi-Fi dan data seluler.
5. Buka aplikasi dari ikon Home Screen.
6. Uji navigasi Dashboard, Elektrik, Mekanik, SPM & Utility, KWH, Ampere, Daily Report, Maintenance Cost, Sparepart, dan Kalender.
7. Isi contoh Daily Report; data demonstrasi akan tersimpan pada penyimpanan lokal browser/perangkat tersebut.

Cache offline menyimpan application shell, CSS, JavaScript, manifest, dan ikon. Data demo yang tertanam dalam JavaScript tersedia di dalam aplikasi. Laporan demo yang dibuat pengguna disimpan lokal menggunakan `localStorage` dan tidak tersinkron ke perangkat lain.

## Modul yang didemonstrasikan

- Dashboard dan briefing pemeliharaan harian.
- Elektrik: KWH, Laporan KWH, Data Motor/Ampere, Daily Electrical Report, Breakdown, Job Progress, Pending Job, History Modification, History Mesin, Verifikasi & Kalibrasi, Pengukuran Speed Line #2.
- Mekanik: Daily Report, Perawatan Mesin, Lubrication, Vibration.
- SPM & Utility: Vehicle, Recycle, Utility, Jadwal Perawatan Utility.
- Umum: Kalender Job, Maintenance Cost Bulanan, Sparepart Container.

## Batasan penting

- Ini adalah **demonstrasi statis**, bukan pengganti SIGI Production.
- Tidak menjalankan PHP dan tidak terhubung ke SQLite.
- Tidak mengirim, menerima, atau menyimpan data operasional perusahaan.
- Simpanan Daily Report hanya berada pada perangkat yang digunakan.
- Penghapusan data browser/app storage akan menghapus laporan demo lokal.
- Service Worker baru dapat diunduh pada kunjungan online pertama. Setelah itu aplikasi shell dapat dibuka offline dari cache.
- Offline tidak berarti link LinkedIn/CV dapat dibuka tanpa internet. Link portfolio tetap memerlukan internet untuk kunjungan pertama dan instalasi.

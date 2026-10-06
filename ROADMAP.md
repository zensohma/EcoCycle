# PROJECT ROADMAP

## Phase 1: Project Setup

**Goal:** Menyiapkan fondasi proyek dan lingkungan pengembangan.

**Deliverables:**

- Struktur proyek frontend dan backend.
    
- Repository Git dan aturan pengelolaan branch.
    
- Konfigurasi Next.js, FastAPI, dan MySQL.
    
- Docker dan Docker Compose untuk pengembangan lokal.
    
- Konfigurasi environment variables dan `.env.example`.
    
- CI untuk linting, pemeriksaan tipe, dan pengujian otomatis.
    
- Finalisasi cakupan MVP bersama bank sampah mitra.
    

**Status:** Planned.

---

## Phase 2: Core Features

**Goal:** Menyediakan autentikasi, pengelolaan pengguna, dan struktur data utama.

**Deliverables:**

- Skema database dan migrasi.
    
- Registrasi nasabah, login, dan logout.
    
- Hak akses nasabah, pengelola, dan administrator.
    
- Pembuatan akun pengelola oleh administrator.
    
- Pengelolaan profil serta data nasabah.
    
- Pembatasan akses berdasarkan bank sampah.
    
- Pengujian autentikasi dan otorisasi.
    

**Status:** Planned.

---

## Phase 3: Business Features

**Goal:** Menyediakan alur utama layanan bank sampah dari informasi hingga transaksi.

**Deliverables:**

- Daftar, pencarian, dan detail bank sampah.
    
- Pengelolaan informasi layanan, jenis sampah, dan harga.
    
- Dashboard nasabah dan pengelola.
    
- Pencatatan setoran dengan perhitungan nilai otomatis.
    
- Pembaruan saldo dan riwayat transaksi.
    
- Pencatatan penarikan setelah pembayaran di luar sistem.
    
- Pencegahan transaksi ganda dan jejak audit.
    
- Pengujian alur transaksi dari awal hingga akhir.
    
- Panduan pemilahan serta laporan CSV jika disepakati masuk dalam MVP.
    

**Status:** Planned.

---

## Phase 4: Validation and Optimization

**Goal:** Memastikan aplikasi mudah digunakan, akurat, aman, dan memenuhi target performa.

**Deliverables:**

- Pengujian penerimaan bersama nasabah dan pengelola.
    
- Perbaikan bug dan masalah penggunaan.
    
- Pengujian transaksi bersamaan serta konsistensi saldo.
    
- Optimasi query, indeks database, dan pagination.
    
- Pengujian beban 50 pengguna aktif bersamaan.
    
- Pemeriksaan keamanan dan hak akses.
    
- Caching informasi publik jika hasil pengujian menunjukkan kebutuhan.
    
- Background jobs untuk laporan besar jika diperlukan.
    

**Status:** Planned.

---

## Phase 5: Production and Pilot Launch

**Goal:** Meluncurkan MVP secara terbatas dan memastikan operasional dapat dipantau serta dipulihkan.

**Deliverables:**

- Deployment dengan Docker, Nginx, dan HTTPS.
    
- Logging, monitoring, dan notifikasi gangguan.
    
- Backup otomatis dan pengujian pemulihan.
    
- Dokumentasi teknis serta panduan pengguna.
    
- Pelatihan petugas bank sampah.
    
- Peluncuran terbatas di bank sampah mitra.
    
- Pemantauan success metrics dan pengumpulan masukan pengguna.
    
- Penentuan prioritas pengembangan berikutnya berdasarkan hasil uji coba.
    

**Status:** Planned.

---

# Milestones

|Milestone|Kriteria Pencapaian|
|---|---|
|**MVP**|Seluruh fitur Must Have selesai dan alur utama berhasil diuji di lingkungan pengujian.|
|**Beta**|Produk digunakan secara terbatas oleh nasabah dan pengelola bank sampah mitra untuk memperoleh masukan.|
|**Release Candidate**|Pengujian penerimaan lulus, target performa tercapai, dan tidak ada bug kritis atau berprioritas tinggi yang belum diselesaikan.|
|**Production v1.0**|Versi stabil tersedia di lingkungan produksi dengan dokumentasi, monitoring, backup, dan prosedur operasional yang siap digunakan.|

---

# Risks

|Risk|Mitigation|
|---|---|
|Cakupan fitur bertambah|Tetapkan batas MVP dan evaluasi fitur tambahan sebelum dimasukkan ke roadmap.|
|Kesalahan transaksi atau saldo|Gunakan transaksi database, pencegahan request ganda, dan pengujian transaksi bersamaan.|
|Data awal tidak akurat|Verifikasi informasi bank sampah, harga, dan saldo migrasi bersama pengelola.|
|Performa menurun saat data bertambah|Ukur performa dan optimalkan query, indeks, serta pagination.|
|Biaya infrastruktur melebihi anggaran|Tetapkan anggaran dan pantau penggunaan layanan secara berkala.|
|Adopsi pengguna rendah|Libatkan pengguna dalam uji coba dan sediakan pelatihan serta panduan sederhana.|
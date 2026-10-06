# TASKS

## Status

- **Todo:** belum dikerjakan.
- **In Progress:** sedang dikerjakan.
- **Done:** selesai dan acceptance criteria terpenuhi.
- **Blocked:** terhambat dependensi atau keputusan yang belum tersedia.

Semua tugas berstatus awal **Todo** karena progres implementasi belum dikonfirmasi. Pilih tugas untuk setiap sprint sesuai prioritas dan kapasitas tim.

---

# Sprint Backlog

## Epic: Project Setup

### Task 2: Configure Docker and CI

**Status:** In Progress

**Description:**  
Menyiapkan container aplikasi dan pemeriksaan kode otomatis.

**Files:**

- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `backend/Dockerfile`
- `backend/.dockerignore`
- `compose.yaml`
- `.github/workflows/ci.yml`
- `backend/tests/test_health.py`

**Dependencies:** Task 1.

**Notes (2026-10-06):**

- Semua langkah CI sudah dijalankan lokal dan lulus: `ruff check`, `ruff format --check`, `mypy`, `pytest` (backend); `eslint`, `tsc --noEmit`, `next build` (frontend).
- Build frontend lokal menghasilkan `.next/standalone/server.js` (konfigurasi `output: "standalone"`).
- Verifikasi `docker compose up --build` dan hasil CI di GitHub belum dapat dijalankan karena Docker tidak tersedia di lingkungan pengembangan ini. Status menjadi Done setelah keduanya terverifikasi.

**Acceptance Criteria:**

- Frontend, backend, dan MySQL dapat dijalankan melalui Docker Compose.
- Data MySQL menggunakan persistent volume.
- CI menjalankan linting, pemeriksaan tipe, dan pengujian yang tersedia.
- Kegagalan pemeriksaan menghasilkan status CI gagal.

---

## Epic: Authentication

### Task 4: Register User

**Status:** Done

**Description:**  
Membuat endpoint registrasi dan formulir pendaftaran nasabah.

**Files:**

- `backend/app/modules/auth/router.py`
- `backend/app/modules/auth/schemas.py`
- `backend/app/modules/auth/service.py`
- `backend/app/core/security.py`
- `frontend/src/features/auth/`

**Dependencies:** Task 3.

**Completion Date:** 2026-10-07

**Testing:**

- Backend: 9 test registrasi (`pytest -q` → total 21 passed, termasuk health + model + auth).
- Validasi: email unik (case-insensitive), password & konfirmasi sama, panjang minimal, format email.
- Hashing Argon2id, role tetap nasabah meski payload mengirim `administrator`.
- Frontend: form `RegisterForm` client-side validation, submit ke API, redirect ke `/login`, pesan sukses/kesalahan. Build & lint & tsc lulus.

**Acceptance Criteria:**

- Nama, email, nomor telepon, dan kata sandi divalidasi.
- Email yang sudah terdaftar ditolak.
- Kata sandi dan konfirmasi kata sandi harus sama.
- Kata sandi di-hash menggunakan Argon2id.
- Pendaftaran umum hanya menghasilkan akun nasabah.
- Setelah berhasil, pengguna diarahkan ke login.
- Pengujian registrasi berhasil.

---

### Task 5: Implement Login and Logout

**Status:** Done

**Description:**  
Membuat login menggunakan JWT dan logout untuk mengakhiri sesi browser.

**Files:**

- `backend/app/modules/auth/router.py`
- `backend/app/modules/auth/service.py`
- `backend/app/core/security.py`
- `frontend/src/features/auth/`

**Dependencies:** Task 4.

**Completion Date:** 2026-10-07

**Decisions:**

- JWT (PyJWT, HS256) disimpan sebagai cookie `access_token` HttpOnly + `csrf_token` readable JS; `Secure` hanya di environment production, `SameSite=None` karena frontend dan backend berbeda origin.
- Rate limiting login in-memory per IP: 5 percobaan per 60 detik → 429.
- CSRF: middleware membandingkan header `X-CSRF-Token` dengan cookie `csrf_token` untuk semua request non-safe yang membawa cookie auth; endpoint `/login` dan `/register` di-exempt (kredensial dari payload).
- `GET /api/v1/auth/me` ditambahkan agar frontend bisa memverifikasi sesi/peran.

**Testing:**

- 11 test baru (`tests/test_auth_login.py`), total pytest **32 passed**: sukses login + atribut cookie, kredensial salah 401, rate limit 429 setelah 5 gagal, logout menghapus cookie + wajib CSRF, `/me` 401 tanpa token / token invalid / token expired / user inactive, CSRF 403 tanpa & dengan header salah.
- Frontend: `tsc --noEmit`, `eslint`, `next build` lulus (route `/login`, `/dashboard`, `/admin`).

**Acceptance Criteria:**

- Kredensial valid menghasilkan JWT dan mengarahkan pengguna ke dashboard sesuai peran.
- Kredensial tidak valid menampilkan pesan kesalahan umum.
- Token kedaluwarsa atau tidak valid ditolak.
- Cookie produksi menggunakan HttpOnly, Secure, dan SameSite.
- Logout menghapus cookie autentikasi.
- Login menerapkan rate limiting.
- Request yang mengubah data memiliki perlindungan CSRF.
- Pengujian autentikasi berhasil.

---

### Task 6: Implement Role and Access Management

**Status:** Done

**Description:**  
Menerapkan akses nasabah, pengelola, dan administrator berdasarkan kewenangan.

**Files:**

- `backend/app/modules/auth/`
- `backend/app/modules/users/`
- `backend/app/modules/memberships/`
- `frontend/src/features/admin/`

**Dependencies:** Task 5.

**Completion Date:** 2026-10-07

**Decisions:**

- Guard peran berbasis dependency FastAPI `require_roles(*roles)` → `AdminUser`, `PengelolaUser`, `CurrentUser` (403 jika peran tidak berhak).
- Endpoint baru: `POST /api/v1/admin/users` (admin membuat akun pengelola + `waste_bank_id` wajib & divalidasi FK), `GET /api/v1/users/{user_id}` (nasabah hanya dirinya; pengelola hanya pengguna di bank dikelolanya — via `waste_bank_id` atau membership; admin semua), `GET /api/v1/waste-banks/{id}/members` (admin semua bank, pengelola hanya banknya, nasabah 403), `GET /api/v1/admin/waste-banks` (daftar bank untuk dropdown admin).
- Frontend: `CreatePengelolaForm` di `features/admin/` dengan pilihan bank dari endpoint admin, submit ber-CSRF.

**Testing:**

- 13 test baru (`tests/test_role_access.py`), total pytest **45 passed**: 401 tanpa login, nasabah hanya profil sendiri + ditolak dari semua endpoint admin, pengelola lintas-bank 403, admin membuat pengelola (201, role, argon2, FK bank), bank tidak ada 422, email duplikat 409, password mismatch 422, register umum tetap nasabah walau kirim `role`/`waste_bank_id`, CSRF wajib 403.
- Frontend: `tsc --noEmit`, `eslint`, `next build` lulus.

**Acceptance Criteria:**

- Nasabah hanya dapat mengakses data miliknya.
- Pengelola hanya dapat mengakses bank sampah yang dikelolanya.
- Administrator dapat membuat akun pengelola dan menetapkan bank sampahnya.
- Pendaftaran umum tidak dapat memberikan peran pengelola atau administrator.
- Pengujian akses tanpa izin dan akses lintas bank sampah berhasil.

---

## Epic: Bank Sampah Information

### Task 7: Implement Public Bank Sampah Pages

**Status:** Done

**Description:**  
Menampilkan daftar, pencarian, dan detail bank sampah mitra.

**Files:**

- `backend/app/modules/waste_banks/`
- `frontend/src/features/waste-banks/`

**Dependencies:** Task 3.

**Completion Date:** 2026-10-07

**Decisions:**

- Endpoint publik tanpa auth: `GET /api/v1/waste-banks?q=` (filter `is_active`, pencarian case-insensitive nama/wilayah via `ilike`) dan `GET /api/v1/waste-banks/{id}` (404 untuk tidak ada/nonaktif).
- `latitude`/`longitude` di-serialize sebagai `float` agar langsung dipakai untuk tautan Google Maps.
- Halaman `/` kini menjadi daftar publik (search live dengan debounce 300ms, grid responsif, empty-state); detail di `/waste-banks/[id]`.
- Seed demo: `backend/scripts/seed_demo_banks.py` (3 bank contoh; id pakai `REPLACE(UUID(),'-','')` karena kolom UUID = CHAR(32)).

**Testing:**

- 9 test baru (`tests/test_waste_banks_public.py`), total pytest **54 passed**: akses tanpa login (list & detail), pengecualian bank nonaktif, search nama/wilayah, hasil kosong `[]`, field detail lengkap (alamat, kontak, jadwal, prosedur, koordinat), 404 (missing & nonaktif).
- Verifikasi live: `q=bandung` → 1 hasil, `q=zzzz` → 0, detail lat/lng benar.
- Frontend: `tsc --noEmit`, `eslint`, `next build` lulus (route `/` static, `/waste-banks/[id]` dynamic).

**Acceptance Criteria:**

- Informasi dapat diakses tanpa login.
- Pengguna dapat mencari berdasarkan nama atau wilayah.
- Detail menampilkan alamat, kontak, jadwal, dan prosedur penyetoran.
- Lokasi dapat dibuka melalui tautan peta eksternal.
- Sistem menampilkan pesan jika pencarian tidak menghasilkan data.
- Halaman dapat digunakan pada ponsel dan desktop.

---

### Task 8: Implement Bank Sampah Information Management

**Status:** Done

**Description:**  
Memungkinkan pengelola memperbarui informasi bank sampahnya.

**Files:**

- `backend/app/modules/waste_banks/`
- `frontend/src/features/waste-banks/`

**Dependencies:** Task 6 dan Task 7.

**Completion Date:** 2026-10-07

**Decisions:**

- Endpoint manage baru di `manage_router` (`/api/v1/waste-banks`): `GET /{id}/manage` (isi form) dan `PUT /{id}` (update), keduanya butuh auth; guard `_get_manageable_bank` → 404 bila bank tidak ada, 403 bila bukan administrator dan `user.waste_bank_id` tidak cocok.
- Skema `WasteBankUpdateRequest`: semua field opsional; `name`/`address`/`region` wajib non-blank bila dikirim (explicit `null` → 422); `phone`/`email`/`operating_hours`/`deposit_procedure` di-strip, `""` → `None` (boleh dikosongkan); `EmailStr` untuk email; payload `{}` → 422 "Tidak ada kolom yang diperbarui"; router pakai `exclude_unset=True` sehingga update parsial tidak menyentuh kolom lain.
- `/api/v1/auth/me` kini mengembalikan `waste_bank_id` (`UserResponse`), agar frontend tahu bank yang dikelola.
- UI: halaman admin `/admin/pengaturan` (sesuai design reference) di-wire ke API: load/prefill, textarea baru "Prosedur Penyetoran" (wajib AC, tidak ada di design), Slogan `readOnly` (tidak ada kolom DB), pesan sukses/error, tombol submit aktif (hanya `disabled` saat loading/saving). Administrator mendapat select "Bank Sampah" (bisa edit semua bank); pengelola langsung terkunci ke banknya. Kirim header `X-CSRF-Token` dari cookie `csrf_token`.

**Testing:**

- 16 test baru (`tests/test_waste_bank_manage.py`), total pytest **70 passed**: 401 tanpa login, nasabah 403, pengelola baca/update bank sendiri (persist + terlihat di `GET /waste-banks/{id}` publik), pengelola bank lain 403 (data tidak berubah), admin bisa update semua bank, 404 bank hilang, 422 (nama/alamat kosong, email invalid, phone >32, payload `{}`), 403 tanpa `X-CSRF-Token`, update parsial tidak merusak kolom lain, field opsional bisa dikosongkan, `/me` memuat `waste_bank_id`.
- `ruff check`, `ruff format --check`, `mypy` lulus; frontend `tsc --noEmit`, `eslint`, `next build` lulus.
- Smoke test live terhadap MySQL lokal + uvicorn (15/15): login admin, `/manage`, PUT dengan/tanpa CSRF, validasi 422/404/401, perubahan tampil di endpoint publik, restore data.

**Acceptance Criteria:**

- Pengelola dapat memperbarui alamat, kontak, jadwal, dan prosedur.
- Kolom wajib divalidasi.
- Pengelola tidak dapat mengubah bank sampah di luar kewenangannya.
- Perubahan tersimpan dan tampil pada halaman publik.

---

### Task 9: Implement Waste Types and Prices

**Status:** Todo

**Description:**  
Mengelola jenis sampah yang diterima dan harga per kilogram.

**Files:**

- `backend/app/modules/waste_types/`
- `frontend/src/features/waste-types/`

**Dependencies:** Task 6 dan Task 7.

**Acceptance Criteria:**

- Pengelola dapat menambah jenis sampah, memperbarui harga, dan menonaktifkan jenis sampah.
- Harga wajib berupa angka positif.
- Jenis dan harga aktif ditampilkan pada halaman publik.
- Jenis nonaktif tidak dapat digunakan untuk transaksi baru.
- Perubahan harga tidak mengubah transaksi lama.

---

## Epic: Nasabah Management

### Task 10: Implement Nasabah Management

**Status:** Todo

**Description:**  
Menyediakan pengelolaan keanggotaan dan data nasabah bank sampah.

**Files:**

- `backend/app/modules/users/`
- `backend/app/modules/memberships/`
- `frontend/src/features/customers/`

**Dependencies:** Task 6 dan keputusan alur keanggotaan nasabah.

**Acceptance Criteria:**

- Nasabah dapat dihubungkan dengan bank sampah sesuai alur yang disepakati.
- Pengelola dapat mencari nasabah berdasarkan nama atau ID.
- Pengelola dapat melihat profil dan memperbarui kontak.
- Data yang ditampilkan dibatasi pada bank sampah terkait.
- Perubahan profil tidak mengubah saldo atau riwayat transaksi.
- Daftar nasabah menggunakan pagination.

---

## Epic: Transactions

### Task 11: Implement Setoran Recording

**Status:** Todo

**Description:**  
Mencatat setoran, menghitung nilai sampah, dan memperbarui saldo secara atomik.

**Files:**

- `backend/app/modules/transactions/`
- `frontend/src/features/transactions/`

**Dependencies:** Task 9, Task 10, dan keputusan aturan pembulatan.

**Acceptance Criteria:**

- Pengelola dapat memilih nasabah dan memasukkan beberapa jenis sampah.
- Berat wajib positif dan mendukung desimal.
- Harga diambil dari backend.
- Perhitungan menggunakan Decimal.
- Harga saat setoran disimpan pada detail transaksi.
- Pengelola dapat memeriksa rincian sebelum konfirmasi.
- Transaksi dan saldo tersimpan bersama atau dibatalkan bersama.
- Request ulang dengan kunci idempotensi yang sama tidak menghasilkan transaksi ganda.
- Pengujian kegagalan penyimpanan dan transaksi bersamaan berhasil.

---

### Task 12: Implement Withdrawal Recording

**Status:** Todo

**Description:**  
Mencatat penarikan setelah pembayaran kepada nasabah dilakukan di luar aplikasi.

**Files:**

- `backend/app/modules/transactions/`
- `frontend/src/features/transactions/`

**Dependencies:** Task 11 dan keputusan aturan penarikan.

**Acceptance Criteria:**

- Nominal penarikan positif dan tidak melebihi saldo.
- Petugas wajib mengonfirmasi pembayaran sebelum menyimpan.
- Transaksi dan pengurangan saldo dilakukan secara atomik.
- Request ulang tidak mengurangi saldo dua kali.
- Penarikan bersamaan tidak menyebabkan saldo negatif.
- Identitas petugas dan waktu transaksi tercatat.

---

### Task 13: Implement Dashboard and Transaction History

**Status:** Todo

**Description:**  
Menampilkan dashboard sesuai peran serta saldo dan riwayat transaksi nasabah.

**Files:**

- `frontend/src/features/dashboard/`
- `frontend/src/features/transactions/`
- `backend/app/modules/transactions/`

**Dependencies:** Task 11 dan Task 12.

**Acceptance Criteria:**

- Nasabah dapat melihat saldo terkini.
- Riwayat menampilkan tanggal, jenis transaksi, nominal, dan bank sampah.
- Detail setoran menampilkan jenis, berat, harga, dan nilai sampah.
- Riwayat dapat difilter berdasarkan periode dan menggunakan pagination.
- Nasabah hanya dapat melihat data miliknya.
- Kondisi kosong, pemuatan, dan kegagalan ditangani.

---

## Epic: Supporting Features

### Task 14: Add Waste Sorting Guide

**Status:** Todo  
**Priority:** Should Have

**Description:**  
Menyediakan panduan pemilahan dan persiapan sampah.

**Files:**

- `frontend/src/features/guides/`

**Dependencies:** Konten yang telah disetujui bank sampah mitra.

**Acceptance Criteria:**

- Panduan dapat dibaca tanpa login.
- Panduan memuat contoh dan cara menyiapkan setiap jenis sampah.
- Informasi sesuai ketentuan bank sampah mitra.
- Halaman nyaman digunakan melalui ponsel dan desktop.

---

### Task 15: Implement Operational Reports

**Status:** Todo  
**Priority:** Should Have

**Description:**  
Menyediakan ringkasan operasional dan ekspor CSV berdasarkan periode.

**Files:**

- `backend/app/modules/reports/`
- `frontend/src/features/reports/`

**Dependencies:** Task 11 dan Task 12.

**Acceptance Criteria:**

- Pengelola dapat memilih tanggal awal dan akhir.
- Rentang tanggal tidak valid ditolak.
- Laporan menampilkan jumlah setoran, berat per jenis, nilai setoran, dan total penarikan.
- Hasil sesuai transaksi pada periode dan bank sampah terkait.
- Pengelola dapat mengekspor CSV.
- Kondisi tanpa transaksi ditangani.

---

## Epic: Validation

### Task 16: Run Integration and End-to-End Testing

**Status:** Todo

**Description:**  
Memastikan alur utama dan integritas data berjalan sesuai PRD.

**Files:**

- `backend/tests/`
- `frontend/tests/`

**Dependencies:** Task 4–13, serta Task 14–15 jika masuk cakupan peluncuran.

**Acceptance Criteria:**

- Registrasi, login, dan logout berhasil diuji.
- Pencarian dan detail bank sampah berhasil diuji.
- Setoran menghasilkan saldo dan riwayat yang benar.
- Penarikan menghasilkan pengurangan saldo yang benar.
- Kegagalan transaksi tidak meninggalkan perubahan sebagian.
- Request berulang tidak menghasilkan transaksi ganda.
- Transaksi bersamaan tidak merusak saldo.
- Akses lintas pengguna dan bank sampah tanpa kewenangan ditolak.

---

### Task 17: Run Security and Performance Checks

**Status:** Todo

**Description:**  
Memeriksa keamanan dan pencapaian target performa MVP.

**Files:**

- `backend/tests/`
- `docs/TESTING.md`

**Dependencies:** Task 16.

**Acceptance Criteria:**

- Token tidak valid dan kedaluwarsa ditolak.
- Perlindungan CSRF dan rate limiting login teruji.
- Secret dan data sensitif tidak muncul dalam log.
- Waktu respons API persentil ke-95 kurang dari 500 ms untuk operasi umum pada beban uji 50 pengguna aktif bersamaan.
- Pencarian memberikan hasil kurang dari 2 detik pada lingkungan uji yang disepakati.
- Lingkungan, data, skenario, dan hasil pengujian terdokumentasi.
- Temuan keamanan dan performa dicatat untuk ditindaklanjuti.

---

### Task 18: Conduct User Acceptance Testing

**Status:** Todo

**Description:**  
Melakukan uji penerimaan bersama perwakilan nasabah dan pengelola.

**Files:**

- `docs/UAT.md`
- `TASKS.md`

**Dependencies:** Task 16 dan Task 17.

**Acceptance Criteria:**

- Pengguna menguji skenario utama sesuai perannya.
- Pengujian mencakup penggunaan melalui ponsel dan desktop.
- Temuan dicatat dan ditentukan prioritasnya.
- Bug kritis dan berprioritas tinggi diselesaikan serta diuji ulang.
- Perwakilan pengguna menyetujui kesiapan alur operasional.
- Hasil UAT terdokumentasi.

---

## Epic: Production

### Task 19: Configure Backend Production Deployment

**Status:** Todo

**Description:**  
Menyiapkan backend FastAPI dan MySQL pada hosting terpisah dari frontend Vercel. Backend dijalankan menggunakan Docker dan Nginx sesuai arsitektur proyek.

**Files:**

- `backend/Dockerfile`
- `deployment/nginx.conf`
- `compose.yaml`
- `.env.example`
- `docs/OPERATIONS.md`
- `ARCHITECTURE.md`

**Dependencies:** Task 18, hosting backend, database produksi, dan konfigurasi domain.

**Acceptance Criteria:**

- Backend dapat diakses melalui HTTPS.
- Backend terhubung dengan MySQL produksi.
- Migrasi database berhasil diterapkan.
- Database tidak terbuka langsung ke internet.
- Secret disimpan dalam konfigurasi lingkungan server.
- Health check dan kebijakan restart tersedia.
- Prosedur deployment dan rollback terdokumentasi.
- ARCHITECTURE.md menjelaskan pemisahan frontend Vercel dan hosting backend.

---

### Task 20: Configure Monitoring and Backup

**Status:** Todo

**Description:**  
Menyiapkan pemantauan layanan serta backup dan pemulihan database.

**Files:**

- `backend/app/core/`
- `deployment/`
- `docs/OPERATIONS.md`

**Dependencies:** Lingkungan hosting dan database tersedia.

**Acceptance Criteria:**

- Ketersediaan, waktu respons, dan tingkat kesalahan dipantau.
- Notifikasi gangguan dikonfigurasi dan diuji.
- Backup database berjalan setiap hari.
- Backup disimpan terpisah dari server utama.
- Akses backup dibatasi kepada pihak yang berwenang.
- Pemulihan diuji dengan target kehilangan data maksimal 24 jam dan waktu pemulihan maksimal 4 jam.
- Konsistensi transaksi dan saldo diperiksa setelah pemulihan.
- Prosedur pemulihan terdokumentasi.

---

### Task 21: Complete Documentation and Pilot Launch

**Status:** Todo

**Description:**  
Menyiapkan dokumentasi akhir, melatih petugas, dan meluncurkan MVP terbatas.

**Files:**

- `README.md`
- `docs/API.md`
- `docs/USER_GUIDE.md`
- `docs/OPERATIONS.md`
- `ROADMAP.md`
- `TASKS.md`

**Dependencies:** Task 19, Task 20, Task 22, Task 23, dan kesiapan bank sampah mitra.

**Acceptance Criteria:**

- Dokumentasi API, penggunaan, dan operasional tersedia.
- Petugas menerima pelatihan.
- Data awal bank sampah dan harga telah diverifikasi.
- Migrasi saldo lama, jika diperlukan, diverifikasi sebelum digunakan.
- MVP digunakan secara terbatas oleh bank sampah mitra.
- Pengumpulan success metrics dan masukan pengguna dimulai.
- Penanggung jawab penanganan gangguan ditetapkan.
- Status roadmap diperbarui berdasarkan hasil aktual.

---

### Task 22: Deploy Frontend to Vercel

**Status:** Todo

**Description:**  
Melakukan deployment frontend Next.js EcoCycle ke Vercel dan menghubungkannya dengan backend produksi.

**Files:**

- `frontend/package.json`
- `frontend/next.config.ts`
- `frontend/src/lib/api.ts`
- `.env.example`
- `docs/OPERATIONS.md`
- `ARCHITECTURE.md`

**Dependencies:**

- Task 19.
- Repository Git dan akun Vercel tersedia.
- Frontend berhasil di-build.
- Konfigurasi domain serta autentikasi frontend–backend telah ditentukan.

**Acceptance Criteria:**

- Repository terhubung dengan proyek Vercel.
- Root Directory diatur ke `frontend`.
- Install command dan build command sesuai konfigurasi proyek.
- Environment variables Production dan Preview dikonfigurasi secara terpisah.
- Konfigurasi URL API tidak mengekspos secret melalui variabel `NEXT_PUBLIC_*`.
- Deployment produksi berhasil dan website dapat diakses melalui HTTPS.
- Preview deployment tersedia untuk meninjau perubahan.
- Frontend dapat berkomunikasi dengan backend.
- Login, refresh halaman, akses halaman terlindungi, dan logout berjalan pada domain deployment.
- Cookie autentikasi dan perlindungan CSRF bekerja sesuai konfigurasi domain.
- Halaman informasi, dashboard, setoran, dan penarikan lulus smoke test.
- Jika menggunakan custom domain, DNS dikonfigurasi dan HTTPS aktif.
- Prosedur deployment dan rollback terdokumentasi.

---

### Task 23: Validate Vercel Production Integration

**Status:** Todo

**Description:**  
Memastikan frontend di Vercel terintegrasi dengan backend dan database produksi sesuai kebutuhan EcoCycle.

**Files:**

- `backend/app/core/config.py`
- `backend/app/core/security.py`
- `backend/app/main.py`
- `docs/TESTING.md`
- `docs/OPERATIONS.md`

**Dependencies:** Task 19, Task 20, dan Task 22.

**Acceptance Criteria:**

- Origin yang diizinkan dikonfigurasi secara eksplisit jika menggunakan komunikasi lintas origin.
- Preview deployment tidak terhubung ke data produksi secara default.
- Nasabah hanya dapat mengakses data miliknya.
- Pengelola hanya dapat mengakses bank sampah yang dikelolanya.
- Alur setoran dan penarikan diuji menggunakan akun serta bank sampah uji yang terpisah dari operasional nyata.
- Saldo dan riwayat sesuai dengan transaksi pengujian.
- Request ulang tidak menghasilkan transaksi ganda.
- Kegagalan backend menampilkan pesan yang jelas pada frontend.
- Tidak ada secret atau data sensitif dalam bundle frontend maupun log.
- Hasil pengujian integrasi produksi terdokumentasi.

---

# Bug List

Belum ada bug terverifikasi. Gunakan format berikut saat menemukan bug.

## Bug #[ID]

**Title:** [Judul bug]

**Priority:** [Critical / High / Medium / Low]

**Description:**  
[Perilaku aktual dan dampaknya]

**Steps to Reproduce:**

1. [Langkah pertama]
2. [Langkah berikutnya]

**Expected Result:**  
[Perilaku yang seharusnya]

**Actual Result:**  
[Perilaku yang terjadi]

**Root Cause:**  
[Unknown atau penyebab yang telah diverifikasi]

**Affected Files:**

- [Path file]

**Status:** Todo

**Verification:**  
[Pengujian dan hasil setelah perbaikan]

---

# Technical Debt

Belum ada technical debt terverifikasi. Catat temuan menggunakan format berikut.

## Technical Debt #[ID]

**Title:** [Judul]

**Description:**  
[Masalah teknis yang ditemukan]

**Impact:**  
[Dampak jika ditunda]

**Proposed Improvement:**  
[Usulan perbaikan]

**Affected Files:**

- [Path file]

**Priority:** [High / Medium / Low]

**Status:** Todo

**Acceptance Criteria:**

- [Kriteria penyelesaian yang dapat diverifikasi]

---

# Completed

Pindahkan tugas ke bagian ini hanya setelah acceptance criteria terpenuhi. Sertakan:

- **Completion Date:** tanggal penyelesaian.
- **Owner:** penanggung jawab.
- **Commit / Pull Request:** referensi jika tersedia.
- **Testing:** ringkasan pengujian dan hasilnya.

---

## Task 1: Initialize Project

**Original Epic:** Project Setup

**Completion Date:** 2026-10-06

**Owner:** Belum ditetapkan.

**Commit / Pull Request:** Belum ada commit.

**Testing:**

- `uv run uvicorn app.main:app` berjalan, `GET /api/v1/health` mengembalikan HTTP 200 `{"status": "ok", "service": "EcoCycle API"}`.
- `npm run dev` berjalan, `GET http://localhost:3000` mengembalikan HTTP 200.
- `npm run build` berhasil (TypeScript selesai tanpa error).
- `uv run ruff check .` dan `uv run ruff format --check .` lulus.
- Validator konfigurasi menolak `ENVIRONMENT=production` ketika `SECRET_KEY` masih nilai default.
- Tidak ada file `.env` yang ter-track; `.env` masuk `.gitignore`.

**Acceptance Criteria:**

- Frontend dan backend dapat dijalankan secara lokal.
- Backend menyediakan endpoint health check.
- README memuat panduan instalasi dan menjalankan aplikasi.
- Secret tidak dimasukkan ke repository.

**Files:**

- `frontend/package.json`
- `backend/pyproject.toml`
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/uv.lock`
- `.env.example`
- `README.md`

---

## Task 3: Implement Database Schema

**Original Epic:** Database

**Completion Date:** 2026-10-07

**Owner:** Belum ditetapkan.

**Commit / Pull Request:** Belum ada commit.

**Decisions (2026-10-07):**

- Satu nasabah dapat tergabung dalam banyak bank sampah; saldo disimpan per keanggotaan dengan saldo awal Rp0.
- Harga per kilogram disimpan sebagai tabel riwayat harga (`waste_type_prices`) berikut snapshot harga pada detail transaksi.
- Pengelola terikat pada satu bank sampah melalui kolom `users.waste_bank_id`.
- Database dipindahkan dari PostgreSQL ke MySQL 8.4 (keputusan pengguna, 2026-10-07); seluruh dokumen dan konfigurasi telah diperbarui.

**Testing:**

- `uv run pytest -q` → 12 passed (11 test skema + 1 health check).
- `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy` lulus.
- `uv run alembic upgrade head` pada database MySQL kosong berhasil dijalankan dua kali dari nol.
- Tipe dan default kolom diverifikasi melalui `information_schema` (DECIMAL, `balance` DEFAULT 0.00).

**Acceptance Criteria:**

- ERD dan relasi data terdokumentasi.
- Uang dan berat sampah disimpan menggunakan NUMERIC.
- Foreign key, constraint unik, dan indeks yang relevan tersedia.
- Migrasi dapat diterapkan pada database kosong.
- Saldo awal keanggotaan nasabah baru adalah Rp0.

**Files:**

- `backend/app/db/`
- `backend/app/modules/users/models.py`
- `backend/app/modules/waste_banks/models.py`
- `backend/app/modules/memberships/models.py`
- `backend/app/modules/waste_types/models.py`
- `backend/app/modules/transactions/models.py`
- `backend/migrations/`
- `backend/tests/test_models.py`
- `docs/ERD.md`
- `compose.yaml`
- `.env.example`
# SYSTEM ARCHITECTURE

## Overview

EcoCycle menggunakan arsitektur **modular monolith**, yaitu satu aplikasi backend yang dibagi menjadi modul berdasarkan fungsi. Pendekatan ini sesuai untuk MVP karena memudahkan pengembangan, pengujian, dan pemeliharaan.

Frontend berkomunikasi dengan backend melalui REST API. Backend menangani aturan bisnis dan mengakses MySQL. Seluruh akses database dilakukan melalui backend.

Komponen utama:

- **Frontend:** antarmuka nasabah dan pengelola.
    
- **Backend:** autentikasi, informasi bank sampah, nasabah, transaksi, dan laporan.
    
- **Database:** penyimpanan data operasional.
    
- **Nginx:** menerima koneksi HTTPS dan meneruskan permintaan ke frontend atau backend.
    

---

## Tech Stack

### Backend

- Python dengan FastAPI.
    
- Pydantic untuk validasi request dan response.
    
- SQLAlchemy untuk akses database.
    
- Alembic untuk migrasi database.
    
- JWT untuk autentikasi.
    
- Argon2id untuk hashing kata sandi.
    

### Frontend

- Next.js dengan TypeScript.
    
- Tailwind CSS untuk styling.
    
- Fetch API untuk komunikasi dengan backend.
    

### Database

- MySQL.
    
- Tipe NUMERIC untuk nilai uang dan berat sampah.
    
- Foreign key, constraint, dan indeks untuk menjaga konsistensi serta mendukung pencarian.
    

### Deployment

- Docker untuk mengemas aplikasi.
    
- Docker Compose untuk menjalankan layanan pada satu server saat MVP.
    
- Nginx sebagai reverse proxy dan terminasi HTTPS.
    
- Server hosting yang mendukung Docker.
    
- Penyimpanan backup terpisah dari server utama.
    

---

## Folder Structure

```
ecocycle/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── waste_banks/
│   │   │   ├── memberships/
│   │   │   ├── waste_types/
│   │   │   ├── transactions/
│   │   │   └── reports/
│   │   └── common/
│   ├── migrations/
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── deployment/
│   └── nginx.conf
├── docs/
│   ├── ERD.md
│   └── API.md
├── compose.yaml
├── .env.example
├── README.md
├── ARCHITECTURE.md
├── ROADMAP.md
└── TASKS.md
```

Setiap modul backend memiliki file `router.py`, `schemas.py`, `service.py`, `repository.py`, dan `models.py` sesuai kebutuhan.

---

## System Components

### API Layer

**Responsibilities:**

- Menyediakan endpoint REST API.
    
- Memvalidasi struktur input menggunakan Pydantic.
    
- Memeriksa autentikasi dan hak akses.
    
- Meneruskan permintaan ke business logic.
    
- Menghasilkan response dan kode status HTTP yang konsisten.
    
- Menyediakan dokumentasi OpenAPI.
    

### Business Logic

**Responsibilities:**

- Menjalankan aturan penyetoran dan penarikan.
    
- Menghitung nilai setoran menggunakan Decimal.
    
- Mengambil harga yang berlaku dan menyimpannya pada detail transaksi.
    
- Memastikan penarikan tidak melebihi saldo.
    
- Mengatur pencatatan transaksi dan perubahan saldo secara atomik.
    
- Mencegah pemrosesan ulang transaksi yang sama.
    
- Menghasilkan ringkasan laporan operasional.
    

### Data Layer

**Responsibilities:**

- Mengakses MySQL melalui SQLAlchemy.
    
- Menyimpan dan mengambil data sesuai lingkup bank sampah.
    
- Menjaga relasi, keunikan data, dan constraint.
    
- Mengunci baris saldo saat transaksi agar permintaan bersamaan tidak menghasilkan saldo yang salah.
    
- Mengelola migrasi skema menggunakan Alembic.
    

### Frontend Layer

**Responsibilities:**

- Menampilkan informasi bank sampah dan dashboard sesuai peran.
    
- Menyediakan formulir pendaftaran, setoran, dan penarikan.
    
- Menampilkan validasi, status pemuatan, serta pesan kesalahan.
    
- Meminta konfirmasi sebelum transaksi disimpan.
    
- Menampilkan saldo dan riwayat berdasarkan data backend.
    

### Infrastructure Layer

**Responsibilities:**

- Menjalankan layanan aplikasi melalui Docker.
    
- Mengarahkan trafik melalui Nginx.
    
- Mengelola HTTPS dan konfigurasi lingkungan.
    
- Menyediakan logging, monitoring, serta backup.
    
- Menjalankan pekerjaan terjadwal untuk pemeliharaan dan backup.
    

---

## API Flow

### Alur Umum

1. Pengguna melakukan tindakan melalui frontend.
    
2. Frontend mengirim request HTTPS ke `/api/v1`.
    
3. Nginx meneruskan request ke FastAPI.
    
4. API memvalidasi input, autentikasi, dan hak akses.
    
5. Business logic menjalankan aturan yang diperlukan.
    
6. Data layer membaca atau memperbarui database.
    
7. Backend mengirim response.
    
8. Frontend menampilkan hasil kepada pengguna.
    

### Alur Pencatatan Setoran

1. Pengelola memilih nasabah dan memasukkan jenis serta berat sampah.
    
2. Frontend mengirim request dengan kunci idempotensi yang tetap sama saat request diulang.
    
3. Backend memeriksa hak akses pengelola dan validitas data.
    
4. Backend memulai transaksi database dan mengunci baris saldo nasabah.
    
5. Backend membaca harga yang berlaku dan menghitung nilai setoran.
    
6. Backend menyimpan transaksi, detail setoran, harga saat transaksi, dan perubahan saldo.
    
7. Seluruh perubahan di-commit bersama. Jika gagal, seluruh perubahan dibatalkan.
    
8. Backend mengembalikan rincian transaksi dan saldo terbaru.
    

Kunci idempotensi disimpan dengan constraint unik. Request ulang dengan kunci dan isi yang sama mengembalikan hasil sebelumnya; isi berbeda dengan kunci yang sama ditolak.

---

## Coding Standards

- Python mengikuti PEP 8, menggunakan type hints, dan diperiksa dengan Ruff.
    
- TypeScript menggunakan mode strict serta pemeriksaan ESLint.
    
- Penamaan Python menggunakan `snake_case`; komponen React menggunakan `PascalCase`.
    
- API menggunakan prefix `/api/v1` dan penamaan resource yang konsisten.
    
- Router menangani HTTP, service menangani aturan bisnis, dan repository menangani akses data.
    
- Nilai uang tidak dihitung menggunakan floating-point.
    
- Waktu disimpan dalam UTC dan ditampilkan sesuai zona waktu bank sampah.
    
- Konfigurasi diambil dari environment variables.
    
- Secret tidak dimasukkan ke repository.
    
- Perubahan skema database selalu disertai migrasi.
    
- Log menggunakan format terstruktur dan ID request.
    
- Perubahan kode ditinjau sebelum digabungkan.
    

---

## Security

- Seluruh komunikasi publik menggunakan HTTPS.
    
- Kata sandi di-hash menggunakan Argon2id.
    
- JWT memiliki masa berlaku terbatas dan divalidasi pada endpoint yang dilindungi.
    
- Token browser disimpan dalam cookie `HttpOnly`, `Secure`, dan `SameSite`.
    
- Request yang mengubah data dilindungi dari CSRF melalui validasi origin dan token CSRF.
    
- Hak akses diperiksa di backend berdasarkan peran, kepemilikan data, dan bank sampah.
    
- Endpoint login menerapkan rate limiting.
    
- Query database menggunakan parameterisasi.
    
- Jika frontend dan backend berbeda origin, CORS hanya mengizinkan origin yang ditentukan.
    
- Database tidak dibuka langsung ke internet.
    
- Log tidak menyimpan kata sandi, token, atau data pribadi sensitif.
    
- Setoran, penarikan, dan koreksi transaksi memiliki jejak audit.
    
- Koreksi transaksi keuangan menggunakan transaksi penyesuaian yang merujuk transaksi asal, bukan menghapus riwayat.
    

---

## Testing Strategy

### Unit Testing

- Menguji perhitungan nilai setoran dan pembulatan.
    
- Menguji validasi berat, harga, serta nominal penarikan.
    
- Menguji aturan saldo dan hak akses.
    

### Integration Testing

- Menguji API dengan database MySQL pengujian.
    
- Memastikan transaksi dan saldo berhasil atau dibatalkan bersama.
    
- Menguji request berulang agar tidak menghasilkan transaksi ganda.
    
- Menguji penarikan bersamaan agar saldo tidak menjadi negatif.
    
- Memastikan perubahan harga tidak mengubah transaksi lama.
    

### End-to-End Testing

- Menguji registrasi dan login.
    
- Menguji pencarian informasi bank sampah.
    
- Menguji pengelola mencatat setoran, lalu nasabah melihat saldo dan riwayat.
    
- Menguji pencatatan penarikan serta pembaruan saldo.
    
- Menguji laporan jika termasuk dalam cakupan peluncuran.
    

### Security and Performance Testing

- Memastikan pengguna tidak dapat mengakses data di luar kewenangannya.
    
- Menguji token kedaluwarsa, CSRF, dan pembatasan login.
    
- Menguji waktu respons pada beban 50 pengguna aktif bersamaan.
    
- Menguji pagination menggunakan data transaksi yang representatif.
    

### User Acceptance Testing

- Dilakukan bersama perwakilan nasabah dan pengelola.
    
- Memvalidasi alur terhadap kegiatan operasional bank sampah.
    
- Mencatat masalah penggunaan dan memastikan perbaikan sebelum peluncuran.
    

### Recovery Testing

- Menguji pemulihan database dari backup.
    
- Memastikan data dan saldo tetap konsisten setelah pemulihan.
    
- Memeriksa pencapaian target waktu pemulihan.
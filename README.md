# EcoCycle

Platform digital bank sampah: pencatatan setoran, informasi bank sampah, saldo nasabah, dan Smart Reward System.

Dokumen proyek:

- `PRD.md` — kebutuhan produk.
- `ARCHITECTURE.md` — arsitektur dan standar implementasi.
- `ROADMAP.md` — tahapan pengembangan.
- `TASKS.md` — daftar pekerjaan dan status.

## Tech Stack

| Komponen | Teknologi |
| --- | --- |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy, Alembic |
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Database | MySQL |
| Autentikasi | JWT, Argon2id |

## Prasyarat

- Python 3.10 atau lebih baru
- [uv](https://docs.astral.sh/uv/) (disarankan) atau pip
- Node.js 20 atau lebih baru dan npm
- MySQL (untuk Task 3 ke atas; belum diperlankan untuk menjalankan aplikasi saat ini)

## Setup

### 1. Konfigurasi environment

Salin file contoh environment lalu sesuaikan nilainya. File `.env` tidak boleh masuk ke repository.

```bash
cp .env.example .env
```

Variabel yang tersedia:

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `ENVIRONMENT` | `development` | Nilai `production` mewajibkan `SECRET_KEY` diubah. |
| `DATABASE_URL` | `mysql+pymysql://ecocycle:ecocycle@localhost:3306/ecocycle` | Koneksi MySQL. |
| `SECRET_KEY` | `change-me-in-production` | Kunci penandatangan JWT. Wajib unik di produksi. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Masa berlaku akses token. |
| `CORS_ORIGINS` | `http://localhost:3000` | Daftar origin yang diizinkan, dipisahkan koma. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Base URL API untuk frontend. |

### 2. Backend

```bash
cd backend
uv sync --extra dev        # membuat .venv dan menginstal dependensi
uv run uvicorn app.main:app --reload --port 8000
```

Tanpa uv:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate     # Windows; macOS/Linux: source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Compose (alternatif)

Pastikan Docker dan Docker Compose terpasang, salin `.env.example` ke `.env`, lalu:

```bash
docker compose up --build
```

Layanan yang dijalankan: MySQL (volume `mysql_data`, port hanya dibuka ke `127.0.0.1:3306`), backend, dan frontend. Berhenti dengan `docker compose down`; tambah `-v` jika data MySQL juga ingin dihapus.

## Menjalankan Aplikasi

| Layanan | URL |
| --- | --- |
| Backend API | http://localhost:8000 |
| OpenAPI docs | http://localhost:8000/docs |
| Health check | http://localhost:8000/api/v1/health |
| Frontend | http://localhost:3000 |

Respons health check yang diharapkan:

```json
{"status": "ok", "service": "EcoCycle API"}
```

## Pemeriksaan Kode

```bash
# Backend
cd backend
uv run ruff check .
uv run ruff format .
uv run mypy
uv run pytest

# Frontend
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

Pemeriksaan yang sama dijalankan otomatis oleh GitHub Actions pada `.github/workflows/ci.yml` untuk setiap push ke `main` dan setiap pull request.

## Struktur Proyek

```
ecocycle/
├── frontend/          # Next.js (TypeScript, Tailwind CSS)
├── backend/
│   └── app/
│       ├── main.py    # Entrypoint FastAPI dan health check
│       ├── core/      # Konfigurasi dan keamanan
│       ├── db/        # Koneksi dan model database
│       ├── modules/   # Modul per fitur (auth, transactions, dst.)
│       └── common/    # Utilitas bersama
├── deployment/        # Konfigurasi Nginx dan deployment
├── docs/              # ERD, API, dan dokumentasi lain
├── .env.example       # Contoh environment variables
└── compose.yaml       # Docker Compose (Task 2)
```

Struktur di atas mengikuti `ARCHITECTURE.md`. Beberapa direktori (`db/`, `modules/`, `deployment/`, `docs/`) akan dibuat pada tahap pengembangan berikutnya.

## Keamanan

- Secret hanya disimpan di `.env` (diabaikan oleh Git) atau environment server.
- Gunakan `.env.example` sebagai referensi nama variabel.
- Jangan pernah meng-commit file `.env`.

## Status Pengembangan

Saat ini Phase 1 (Project Setup) sedang berjalan. Rencana lengkap ada di `ROADMAP.md`, daftar pekerjaan di `TASKS.md`.

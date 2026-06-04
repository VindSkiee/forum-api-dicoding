# Forum API

REST API untuk aplikasi forum diskusi berbasis **Node.js**, **Express**, dan **PostgreSQL**.
Project ini menerapkan pemisahan layer (Domain, Application, Infrastructure, Interface) agar kode lebih terstruktur, mudah diuji, dan mudah dikembangkan.

## Fitur Utama

- Registrasi user
- Autentikasi login + refresh token
- Manajemen thread (buat thread & lihat detail thread)
- Manajemen komentar (buat, hapus soft-delete)
- Manajemen balasan/reply (buat, hapus soft-delete)
- Like/unlike komentar (toggle)
- Health check endpoint (`/health`)
- Rate limiting pada endpoint `/threads`

## Teknologi

- Node.js (ES Modules)
- Express 5
- PostgreSQL
- JWT (`jsonwebtoken`)
- `node-pg-migrate` untuk migrasi database
- Vitest + Supertest untuk testing
- ESLint (Dicoding style)

## Arsitektur Proyek

Struktur utama:

```text
src/
├── Applications/    # use case & service layer
├── Commons/         # shared config, exception, utilities
├── Domains/         # entities & repository contracts
├── Infrastructures/ # DB, repository implementation, DI container
└── Interfaces/      # HTTP layer (routes, handlers, middleware)
```

## Daftar Endpoint

| Method | Endpoint | Keterangan | Auth |
|---|---|---|---|
| POST | `/users` | Registrasi user baru | Tidak |
| POST | `/authentications` | Login & dapatkan access/refresh token | Tidak |
| PUT | `/authentications` | Refresh access token | Tidak |
| DELETE | `/authentications` | Logout (hapus refresh token) | Tidak |
| GET | `/health` | Cek kesehatan service | Tidak |
| POST | `/threads` | Buat thread baru | Ya |
| GET | `/threads/:threadId` | Detail thread + komentar + reply | Tidak |
| POST | `/threads/:threadId/comments` | Tambah komentar | Ya |
| DELETE | `/threads/:threadId/comments/:commentId` | Hapus komentar (soft-delete) | Ya |
| PUT | `/threads/:threadId/comments/:commentId/likes` | Toggle like komentar | Ya |
| POST | `/threads/:threadId/comments/:commentId/replies` | Tambah balasan | Ya |
| DELETE | `/threads/:threadId/comments/:commentId/replies/:replyId` | Hapus balasan (soft-delete) | Ya |

## Persiapan & Instalasi

### 1) Prasyarat

- Node.js
- PostgreSQL

### 2) Install dependency

```bash
npm ci
```

### 3) Konfigurasi environment

Salin file contoh environment:

```bash
cp .env.example .env
cp .test.env.example .test.env
```

Isi variabel penting di `.env`:

- `PORT`
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`, `ACCESS_TOKEN_AGE`

Untuk test, pastikan `.test.env` dan `DATABASE_URL` mengarah ke database test.

### 4) Jalankan migrasi

```bash
npm run migrate up
```

Untuk environment test:

```bash
npm run migrate:test up
```

### 5) Jalankan aplikasi

```bash
npm run start:dev
```

Aplikasi berjalan di:

```text
http://localhost:<PORT>
```

## Script yang Tersedia

- `npm run start` : jalankan server production mode
- `npm run start:dev` : jalankan server development mode (nodemon)
- `npm run lint` : lint seluruh project
- `npm run lint:fix` : lint + auto-fix
- `npm test` : jalankan unit/integration test
- `npm run test:coverage` : jalankan test dengan coverage
- `npm run migrate` : migrasi database utama
- `npm run migrate:test` : migrasi database test

## Catatan Pengembangan

- Seluruh response error mengikuti format JSON dengan properti `status` dan `message`.
- Endpoint yang butuh autentikasi menggunakan header Authorization dengan token akses.

## License

ISC

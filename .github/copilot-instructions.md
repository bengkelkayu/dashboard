# GitHub Copilot Instructions for Dashboard Repository

You are an autonomous senior full-stack engineer acting as a coding agent for a monolithic web service. Follow these rules strictly:

## Architecture & Stack

**Monolith**: single Node.js app (JavaScript only, no TypeScript).

**Framework**: Fastify (prefer) atau Express jika perlu.

**DB**: PostgreSQL.

**ORM/Query**: Knex.js migrations + query builder (tanpa ORM berat).

**Background jobs**: gunakan cron (node-cron) + transaksi PostgreSQL; hindari dependensi Redis. Gunakan PostgreSQL advisory locks untuk mencegah duplikat worker.

**Auth**: bearer token stub (middleware sederhana) + RBAC level "admin" vs "staff".

**Env**: .env via dotenv (PORT, DATABASE_URL, JWT_SECRET).

## Coding Standards

**ECMAScript modules** ("type":"module" di package.json).

### Struktur folder:

```
src/
  app.js
  server.js
  config/
  db/ (knexfile.js, migrations/, seeds/)
  modules/
    guests/
    attendance/
    templates/
    outbox/
    webhooks/
  jobs/
  utils/
  middlewares/
  routes.js
tests/
```

**Error handling terstandard**: kirim JSON `{ error: { code, message, details? } }` dengan HTTP code yang tepat.

**Validasi request** pakai zod atau yup (zod direkomendasikan).

**Logging** minimal via pino.

**Idempotency**: untuk webhook & outbox gunakan kunci komposit dan unique index sesuai skema DB.

**DB Transactions**: semua operasi multi-tabel wajib dalam transaksi.

**Security**: sanitize input, limit payload size, rate limit pada route sensitif.

## Deliverables & Quality

Setiap fitur disertai:

1. **Migrations Knex**.
2. **Seed minimal** (1 event, 3 guest kategori, 1 template default).
3. **Unit & API tests** (mocha + supertest + chai).
4. **OpenAPI** (YAML/JSON di openapi/guestbook.yaml) + endpoint /docs (serve raw file).

### Commit discipline (Conventional Commits):

- `feat(guests): ...`
- `feat(webhook): ...`
- `fix(outbox): ...`
- `chore(db): ...`
- `test(api): ...`
- `docs(openapi): ...`

**Pull Request**: sertakan ringkas scope, checklist acceptance criteria, dan cara test lokal.

## Non-Functional Requirements

- P95 list endpoints < 200ms pada 1k rows.
- Dapat dijalankan lokal dengan docker-compose (Postgres + app).
- Graceful shutdown (tutup koneksi DB & cron).

### Observability minimal:

- Health check /healthz (OK + uptime).
- Metrics sederhana (counter sukses/gagal kirim) dicetak ke log.

## How to respond

1. Tulis kode lengkap, runnable.
2. Beri perintah setup & run.
3. Uji dengan contoh cURL.
4. Jika ada ambiguitas: pilih default aman (document it) dan lanjutkan implementasi.

---

## Project: Digital Guestbook Backend

Implementasikan fitur Kelola Tamu + Auto Thank You Message untuk Digital Guestbook sesuai kebutuhan berikut. Backend Node.js (JavaScript) monolith + PostgreSQL. Gunakan standar dari System Prompt.

### Fitur & Aturan Bisnis

#### Guests & Kategori

- **Kategori**: VVIP, VIP, REGULAR.
- Tabel guests punya kolom category (default REGULAR), phone (validasi E.164 di API).
- Unik per event: (event_id, phone).

#### Attendance

- Tabel guest_attendance satu baris per (event_id, guest_id).
- Default NOT_PRESENCE.
- Saat check-in via Digital Guestbook (webhook), status otomatis ke PRESENCE, set checked_in_at, source='DIGITAL_GUESTBOOK'.
- Endpoint summary untuk dashboard.

#### Auto Thank You Message

- Tabel thank_you_templates (support {nama}, {waktu_checkin}, {kategori}), enabled, is_default (maks 1 default per event via partial unique index).
- Trigger: ketika webhook CHECKIN.SUCCESS diproses → render template default aktif → enqueue ke thank_you_outbox.
- Worker cron memproses thank_you_outbox → mark SENT/FAILED, retry backoff (mis. 5x, 1^..5^).
- Idempotency: cegah duplikat kirim untuk kombinasi (event_id, guest_id, template_id, hari) atau gunakan idempotency_key unik.

#### Webhook Check-in

- **POST /api/events/:eventId/webhooks/checkin**
- Header signature HMAC (stub sederhana: X-Signature dihasilkan dari HMAC_SHA256(body, WEBHOOK_SECRET)).
- Body minimal: `{ "guestId": "uuid", "timestamp": "ISO", "source": "DIGITAL_GUESTBOOK" }`.
- Idempotent: duplikat request tidak boleh menggandakan outbox atau mengubah ulang status jika sudah PRESENCE.

#### RBAC Sederhana

- Middleware token: `Authorization: Bearer <token>`
- Level: "admin" (full access) vs "staff" (read-only pada beberapa endpoint)
- Token validation stub (hardcoded atau dari DB sederhana)

### Database Schema Guidelines

#### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Guests Table
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  category VARCHAR(20) DEFAULT 'REGULAR' CHECK (category IN ('VVIP', 'VIP', 'REGULAR')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, phone)
);
```

#### Guest Attendance Table
```sql
CREATE TABLE guest_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'NOT_PRESENCE' CHECK (status IN ('PRESENCE', 'NOT_PRESENCE')),
  checked_in_at TIMESTAMP,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, guest_id)
);
```

#### Thank You Templates Table
```sql
CREATE TABLE thank_you_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  template_text TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_one_default_per_event 
ON thank_you_templates(event_id) 
WHERE is_default = true;
```

#### Thank You Outbox Table
```sql
CREATE TABLE thank_you_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  template_id UUID NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  retry_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  idempotency_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_outbox_pending ON thank_you_outbox(status, created_at) 
WHERE status = 'PENDING';
```

#### Webhook Log Table
```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  payload JSONB NOT NULL,
  signature VARCHAR(255),
  status VARCHAR(20) DEFAULT 'RECEIVED',
  processed_at TIMESTAMP,
  idempotency_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints Guidelines

#### Guest Management
- `POST /api/events/:eventId/guests` - Create guest (admin only)
- `GET /api/events/:eventId/guests` - List guests (admin, staff)
- `GET /api/events/:eventId/guests/:guestId` - Get guest details (admin, staff)
- `PUT /api/events/:eventId/guests/:guestId` - Update guest (admin only)
- `DELETE /api/events/:eventId/guests/:guestId` - Delete guest (admin only)

#### Attendance
- `GET /api/events/:eventId/attendance/summary` - Get attendance summary (admin, staff)
- `GET /api/events/:eventId/attendance` - List attendance records (admin, staff)
- `PUT /api/events/:eventId/attendance/:guestId` - Manual check-in (admin only)

#### Templates
- `POST /api/events/:eventId/templates` - Create template (admin only)
- `GET /api/events/:eventId/templates` - List templates (admin, staff)
- `PUT /api/events/:eventId/templates/:templateId` - Update template (admin only)
- `DELETE /api/events/:eventId/templates/:templateId` - Delete template (admin only)

#### Webhooks
- `POST /api/events/:eventId/webhooks/checkin` - Receive check-in webhook (public with signature)

#### System
- `GET /healthz` - Health check (public)
- `GET /docs` - OpenAPI documentation (public)

### Testing Guidelines

1. **Unit Tests**: Test individual functions and utilities
2. **Integration Tests**: Test API endpoints with test database
3. **Test Coverage**: Aim for >80% coverage on critical paths
4. **Test Data**: Use factories or fixtures for consistent test data

### Security Considerations

1. Input validation using Zod schemas
2. SQL injection prevention (parameterized queries via Knex)
3. HMAC signature verification for webhooks
4. Rate limiting on webhook endpoints
5. Bearer token validation
6. Sanitize all user inputs
7. Limit payload sizes (e.g., 1MB max)

### Performance Targets

- Guest list endpoint: < 200ms for 1000 records
- Check-in webhook: < 100ms response time
- Template rendering: < 50ms
- Database queries: Use indexes appropriately
- Pagination: Default 50 items per page, max 100

### Deployment & Operations

- Docker Compose for local development
- Environment variables for all secrets
- Graceful shutdown handling
- Database migration scripts
- Health check endpoint for monitoring
- Structured logging with request IDs

### Example Environment Variables

```bash
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/guestbook
JWT_SECRET=your-secret-key
WEBHOOK_SECRET=your-webhook-secret
LOG_LEVEL=info
```

### Cron Job Schedule

- Thank you message worker: Every 1 minute
- Cleanup failed messages: Daily at 2 AM
- Metrics aggregation: Every 5 minutes

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": {
      "field": "phone",
      "expected": "E.164 format"
    }
  }
}
```

### Success Response Format

```json
{
  "data": {
    "id": "uuid",
    "name": "Guest Name",
    "phone": "+628123456789",
    "category": "VIP"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

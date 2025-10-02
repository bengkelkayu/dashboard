# System Architecture

## Overview

This is a **monolithic full-stack application** with clear separation between frontend, backend, and database layers.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│                     (Vanilla JavaScript)                     │
├─────────────────────────────────────────────────────────────┤
│  index.html          │  thankyou.html      │  styles.css    │
│  ├─ Guest Table      │  ├─ Template List   │  ├─ Main       │
│  ├─ Add/Edit Modal   │  ├─ Template Editor │  └─ Responsive │
│  ├─ Guest Drawer     │  └─ Preview         │                │
│  └─ Statistics       │                     │  thankyou.css  │
│                      │                     │  └─ Templates  │
│  app.js              │  thankyou.js        │                │
│  └─ UI Logic         │  └─ Template Logic  │  api-client.js │
│                      │                     │  └─ HTTP Client│
└─────────────────────────────────────────────────────────────┘
                              ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│                    (Node.js + Express)                       │
├─────────────────────────────────────────────────────────────┤
│                          Routes                              │
│  /api/guests     /api/attendance    /api/thank-you          │
│  /api/webhook                                                │
│                             ↓                                │
│                       Controllers                            │
│  guestController    attendanceController                     │
│  thankYouController    webhookController                     │
│                             ↓                                │
│                         Models                               │
│  Guest    Attendance    ThankYouTemplate                     │
│  ThankYouOutbox    AuditLog                                  │
│                             ↓                                │
│                       Middleware                             │
│  validate    errorHandler    logger                          │
└─────────────────────────────────────────────────────────────┘
                              ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│                        (PostgreSQL)                          │
├─────────────────────────────────────────────────────────────┤
│  guests ──┬─→ guest_attendance                               │
│           └─→ thank_you_outbox ←─ thank_you_templates       │
│  audit_logs                                                  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Background Worker                       │
│                    (thankYouWorker.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Polls thank_you_outbox table                                │
│  Processes pending messages                                  │
│  Sends via WhatsApp API                                      │
│  Updates status (sent/failed)                                │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. Guest Management Flow

```
User Action: Add Guest
       ↓
[Frontend] User fills form → Validates input
       ↓
[API Client] POST /api/guests { name, phone, category }
       ↓
[Route] /api/guests → validates request
       ↓
[Controller] guestController.createGuest()
       ↓
[Model] Guest.create() → INSERT INTO guests
       ↓
[Model] AuditLog.create() → INSERT INTO audit_logs
       ↓
[Response] { success: true, data: guest }
       ↓
[Frontend] Updates table, closes modal, refreshes stats
```

### 2. Check-in Webhook Flow

```
Digital Guestbook: Guest checks in
       ↓
[Webhook] POST /api/webhook/checkin { phone, name }
       ↓
[Controller] webhookController.handleCheckInWebhook()
       ↓
[Model] Guest.findByPhone() → SELECT FROM guests
       ↓
┌─ Guest exists? ─────────┬─ No ──→ Guest.create() → INSERT
│                         │
└─ Yes ──→ [Continue] ←───┘
       ↓
[Model] Attendance.create() → INSERT INTO guest_attendance
       ↓
[Model] ThankYouTemplate.findEnabled() → SELECT FROM templates
       ↓
[Model] ThankYouTemplate.renderMessage() → Replace placeholders
       ↓
[Model] ThankYouOutbox.create() → INSERT INTO thank_you_outbox
       ↓
[Model] AuditLog.create() → INSERT INTO audit_logs
       ↓
[Response] { success: true, data: { guest, attendance } }
```

### 3. Thank You Worker Flow

```
[Worker] Starts polling (every 10 seconds)
       ↓
[Model] ThankYouOutbox.findPending(limit: 10)
       ↓
┌─ Messages found? ───┬─ No ──→ Wait 10s, poll again
│                     │
└─ Yes ──→ [Process]  │
       ↓              │
For each message:     │
  ├─ Send via WhatsApp API
  ├─ If success: mark as 'sent'
  └─ If error: mark as 'failed', increment retry_count
       ↓              │
[Wait 10 seconds] ←───┘
       ↓
[Poll again...]
```

## Data Model

### Entity Relationship Diagram

```
┌────────────────┐
│    guests      │
├────────────────┤
│ id (PK)        │
│ name           │
│ phone (UNIQUE) │
│ category       │
│ created_at     │
│ updated_at     │
└────────┬───────┘
         │
         │ 1:N
         │
    ┌────┴──────────────────────────┐
    │                               │
    ↓                               ↓
┌───────────────────┐    ┌──────────────────────┐
│ guest_attendance  │    │  thank_you_outbox    │
├───────────────────┤    ├──────────────────────┤
│ id (PK)           │    │ id (PK)              │
│ guest_id (FK)     │    │ guest_id (FK)        │
│ check_in_time     │    │ template_id (FK)     │
│ status            │    │ message              │
│ check_in_source   │    │ phone                │
│ notes             │    │ status               │
│ created_at        │    │ sent_at              │
│ updated_at        │    │ error_message        │
└───────────────────┘    │ retry_count          │
                         │ created_at           │
                         │ updated_at           │
                         └──────────┬───────────┘
                                    │
                                    │ N:1
                                    │
                         ┌──────────┴────────────┐
                         │ thank_you_templates   │
                         ├───────────────────────┤
                         │ id (PK)               │
                         │ name                  │
                         │ message_template      │
                         │ is_enabled            │
                         │ created_at            │
                         │ updated_at            │
                         └───────────────────────┘

┌──────────────────┐
│   audit_logs     │  (No FK - stores entity_type/entity_id)
├──────────────────┤
│ id (PK)          │
│ entity_type      │
│ entity_id        │
│ action           │
│ old_values       │
│ new_values       │
│ user_info        │
│ ip_address       │
│ created_at       │
└──────────────────┘
```

## API Architecture

### RESTful Design

```
Resource: Guests
├─ GET    /api/guests           → List all (with filters)
├─ GET    /api/guests/:id       → Get one (with relations)
├─ GET    /api/guests/stats     → Aggregate stats
├─ POST   /api/guests           → Create one
├─ PATCH  /api/guests/:id       → Update one (partial)
└─ DELETE /api/guests/:id       → Delete one

Resource: Attendance
├─ GET    /api/attendance        → List all (with filters)
├─ GET    /api/attendance/summary → Aggregate stats
├─ POST   /api/attendance        → Create one
└─ PATCH  /api/attendance/:id/status → Update status

Resource: Thank You Templates
├─ GET    /api/thank-you         → List all
├─ GET    /api/thank-you/:id     → Get one
├─ POST   /api/thank-you         → Create one
├─ POST   /api/thank-you/preview → Preview with sample data
├─ PATCH  /api/thank-you/:id     → Update one
├─ PATCH  /api/thank-you/:id/toggle → Toggle enabled
└─ DELETE /api/thank-you/:id     → Delete one

Webhook
└─ POST   /api/webhook/checkin   → Receive check-in event
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Request Pipeline                      │
├─────────────────────────────────────────────────────────┤
│ 1. Helmet.js              → Security Headers            │
│    ├─ Content-Security-Policy                           │
│    ├─ X-Frame-Options                                   │
│    ├─ X-Content-Type-Options                            │
│    └─ Strict-Transport-Security                         │
├─────────────────────────────────────────────────────────┤
│ 2. CORS                   → Cross-Origin Control        │
│    └─ Configured origin                                 │
├─────────────────────────────────────────────────────────┤
│ 3. Body Parser            → Parse JSON/URL-encoded      │
├─────────────────────────────────────────────────────────┤
│ 4. Morgan Logger          → HTTP Request Logging        │
├─────────────────────────────────────────────────────────┤
│ 5. Route Handler          → Route to controller         │
├─────────────────────────────────────────────────────────┤
│ 6. Validation Middleware  → express-validator           │
│    ├─ Input sanitization                                │
│    ├─ Type checking                                     │
│    └─ Format validation                                 │
├─────────────────────────────────────────────────────────┤
│ 7. Controller             → Business logic              │
│    └─ Uses parameterized queries (SQL injection safe)   │
├─────────────────────────────────────────────────────────┤
│ 8. Error Handler          → Catch & format errors       │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────┐
│              Development Machine                 │
├─────────────────────────────────────────────────┤
│  Terminal 1: npm run dev (nodemon)              │
│  Terminal 2: npm run worker (background)        │
│  Browser: http://localhost:3000                 │
│  PostgreSQL: localhost:5432                     │
└─────────────────────────────────────────────────┘
```

### Production Environment (Recommended)

```
┌─────────────────────────────────────────────────┐
│                  Load Balancer                   │
│              (nginx/AWS ALB)                     │
└────────────┬────────────────────────────────────┘
             │
    ┌────────┴─────────┐
    ↓                  ↓
┌─────────┐      ┌─────────┐
│ Server 1│      │ Server 2│
│ (PM2)   │      │ (PM2)   │
│ ├─ API  │      │ ├─ API  │
│ └─Worker│      │ └─Worker│
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              ↓
      ┌──────────────┐
      │  PostgreSQL  │
      │  (Primary)   │
      │      +       │
      │  (Replicas)  │
      └──────────────┘
              ↓
      ┌──────────────┐
      │ Redis Cache  │
      │  (optional)  │
      └──────────────┘
```

## Technology Decisions

### Why Node.js + Express?
- ✅ JavaScript full-stack (same language)
- ✅ Large ecosystem (npm)
- ✅ Fast development
- ✅ Good for I/O-heavy operations
- ✅ Easy deployment

### Why PostgreSQL?
- ✅ ACID compliance
- ✅ Relational data model fits use case
- ✅ Strong data integrity
- ✅ JSON support for audit logs
- ✅ Mature and reliable

### Why Vanilla JavaScript (Frontend)?
- ✅ No build process
- ✅ Fast loading
- ✅ No framework overhead
- ✅ Easy to understand
- ✅ Works everywhere

### Why Database-based Queue?
- ✅ No additional infrastructure (Redis)
- ✅ Transactional guarantees
- ✅ Built-in persistence
- ✅ Easy to query/debug
- ✅ Good for this scale

## Performance Considerations

### Database Optimization
```sql
-- Indexes for fast lookups
CREATE INDEX idx_guests_phone ON guests(phone);
CREATE INDEX idx_guests_category ON guests(category);
CREATE INDEX idx_attendance_guest_id ON guest_attendance(guest_id);
CREATE INDEX idx_attendance_status ON guest_attendance(status);
CREATE INDEX idx_outbox_status ON thank_you_outbox(status);
```

### Query Optimization
- Use parameterized queries (prepared statements)
- Select only needed columns
- Use JOIN instead of multiple queries
- Implement pagination for large lists
- Cache frequently accessed data

### Frontend Optimization
- Minimize DOM manipulation
- Use event delegation
- Lazy load images (if added)
- Compress CSS/JS (for production)
- Use CDN for static assets (for production)

## Scalability Path

### Current: Small Scale (< 1,000 guests)
- Single server
- Single database
- Database-based queue

### Medium Scale (1,000 - 10,000 guests)
- Multiple server instances
- Database connection pooling
- Read replicas
- Redis caching
- CDN for static assets

### Large Scale (> 10,000 guests)
- Load balancer
- Auto-scaling server instances
- Database sharding
- Redis for queue (Bull)
- Message broker (RabbitMQ/Kafka)
- Microservices (if needed)

## Monitoring Strategy

### Application Monitoring
- Request rate
- Response time
- Error rate
- Database query time
- Worker throughput

### Infrastructure Monitoring
- CPU usage
- Memory usage
- Disk I/O
- Network I/O
- Database connections

### Business Metrics
- Total guests
- Check-in rate
- Message delivery rate
- Failed message rate
- Category distribution

## Backup Strategy

### Database Backups
```bash
# Daily full backup
pg_dump wedding_dashboard > backup_$(date +%Y%m%d).sql

# Continuous archiving (WAL)
# Enable in postgresql.conf:
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

### Code Backups
- Git repository (already versioned)
- Multiple remotes (GitHub, GitLab, Bitbucket)

### Configuration Backups
- .env files (encrypted)
- Database credentials (secrets manager)

## Disaster Recovery

### Recovery Time Objective (RTO): 1 hour
- Time to restore service

### Recovery Point Objective (RPO): 1 hour
- Maximum data loss acceptable

### Recovery Steps
1. Provision new server
2. Restore latest database backup
3. Apply WAL logs if available
4. Update DNS/load balancer
5. Verify functionality
6. Monitor for issues

---

**Architecture Version**: 1.0.0
**Last Updated**: 2024
**Status**: Production Ready

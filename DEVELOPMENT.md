# Development Guide

## Setup Development Environment

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Or using Docker
docker run --name wedding-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wedding_dashboard \
  -p 5432:5432 \
  -d postgres:14

# Create database
createdb wedding_dashboard
```

#### Option B: Use Cloud PostgreSQL
- Use services like Heroku Postgres, AWS RDS, or Supabase
- Update .env with the connection string

### 3. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your settings
```

Required variables:
- `DATABASE_URL` or `DB_*` variables
- `PORT` (default: 3000)
- `WEBHOOK_SECRET` (optional, for webhook verification)
- `WHATSAPP_API_URL` and `WHATSAPP_API_KEY` (optional, for actual message sending)

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables and initial data.

### 5. Start Development Server

```bash
# Start with auto-reload
npm run dev

# Or start normally
npm start
```

Server will run on http://localhost:3000

### 6. Start Thank You Worker (Optional)

In a separate terminal:
```bash
npm run worker
```

This starts the background worker for processing thank you messages.

## Project Structure

```
backend/
├── migrations/           # SQL migration files
├── src/
│   ├── config/          # Database and environment config
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── workers/         # Background workers
│   └── server.js        # Application entry point
```

## API Testing

### Using cURL

```bash
# Get all guests
curl http://localhost:3000/api/guests

# Create a new guest
curl -X POST http://localhost:3000/api/guests \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","phone":"6281234567890","category":"VIP"}'

# Get guest stats
curl http://localhost:3000/api/guests/stats

# Get attendance summary
curl http://localhost:3000/api/attendance/summary

# Get all templates
curl http://localhost:3000/api/thank-you

# Webhook simulation (check-in)
curl -X POST http://localhost:3000/api/webhook/checkin \
  -H "Content-Type: application/json" \
  -d '{"phone":"6281234567890","name":"John Doe","timestamp":"2024-01-01T10:00:00Z"}'
```

### Using Postman/Insomnia

Import the API endpoints or use the collection provided in the repository.

## Database Management

### Connect to Database
```bash
psql -U postgres -d wedding_dashboard
```

### Common Queries
```sql
-- View all guests
SELECT * FROM guests;

-- View attendance summary
SELECT 
  status, 
  COUNT(*) 
FROM guest_attendance 
GROUP BY status;

-- View pending thank you messages
SELECT * FROM thank_you_outbox WHERE status = 'pending';

-- View audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

### Reset Database
```bash
# Drop and recreate
dropdb wedding_dashboard
createdb wedding_dashboard
npm run migrate
```

## Testing

### Manual Testing Checklist

#### Guest Management
- [ ] Create a new guest
- [ ] View guest list
- [ ] Search guests
- [ ] Filter by category
- [ ] Edit guest
- [ ] Delete guest
- [ ] View guest statistics

#### Attendance
- [ ] Record check-in via API
- [ ] View attendance summary
- [ ] Check attendance status in guest list

#### Thank You Templates
- [ ] Create template
- [ ] Preview template
- [ ] Enable/disable template
- [ ] Edit template
- [ ] Delete template

#### Webhook
- [ ] Send check-in webhook
- [ ] Verify attendance is recorded
- [ ] Verify thank you message is queued

#### Worker
- [ ] Start worker
- [ ] Check pending messages are processed
- [ ] Verify messages are marked as sent

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -c "SELECT version();"
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Migration Errors
```bash
# Check current database state
psql -U postgres -d wedding_dashboard -c "\dt"

# Manually run migration
psql -U postgres -d wedding_dashboard < backend/migrations/001_initial_schema.sql
```

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong database credentials
3. Configure WEBHOOK_SECRET
4. Setup proper CORS_ORIGIN
5. Use process manager (PM2, systemd)

### Using PM2
```bash
npm install -g pm2

# Start server
pm2 start backend/src/server.js --name wedding-api

# Start worker
pm2 start backend/src/workers/thankYouWorker.js --name wedding-worker

# Monitor
pm2 monit

# View logs
pm2 logs

# Auto-start on reboot
pm2 startup
pm2 save
```

### Using Docker (Coming Soon)
Docker support will be added in future updates.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

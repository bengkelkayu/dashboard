# API Documentation

Base URL: `http://localhost:3000/api`

All endpoints return JSON responses with the following structure:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Or in case of errors:
```json
{
  "success": false,
  "error": "Error message",
  "details": [ /* validation errors if applicable */ ]
}
```

## Guest Management

### Get All Guests
```
GET /api/guests
```

Query Parameters:
- `category` (optional): Filter by category (VVIP, VIP, Regular)
- `search` (optional): Search by name or phone

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "phone": "6281234567890",
      "category": "VVIP",
      "attendance_status": "Presence",
      "last_check_in": "2024-01-01T10:00:00.000Z",
      "created_at": "2024-01-01T08:00:00.000Z",
      "updated_at": "2024-01-01T08:00:00.000Z"
    }
  ]
}
```

### Get Guest by ID
```
GET /api/guests/:id
```

Response includes attendance history:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "phone": "6281234567890",
    "category": "VVIP",
    "attendance_status": "Presence",
    "last_check_in": "2024-01-01T10:00:00.000Z",
    "attendance_history": [
      {
        "id": 1,
        "guest_id": 1,
        "check_in_time": "2024-01-01T10:00:00.000Z",
        "status": "Presence",
        "check_in_source": "Digital Guestbook",
        "notes": "Check-in via webhook"
      }
    ]
  }
}
```

### Get Guest Statistics
```
GET /api/guests/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "total": "150",
    "vvip_count": "20",
    "vip_count": "50",
    "regular_count": "80"
  }
}
```

### Create Guest
```
POST /api/guests
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "6281234567890",
  "category": "VIP"
}
```

Validation rules:
- `name`: Required, minimum 3 characters
- `phone`: Required, must start with "62", 11-15 digits
- `category`: Required, must be one of: VVIP, VIP, Regular

Response:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "John Doe",
    "phone": "6281234567890",
    "category": "VIP",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### Update Guest
```
PATCH /api/guests/:id
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "6281234567890",
  "category": "VVIP"
}
```

Same validation rules as Create Guest.

### Delete Guest
```
DELETE /api/guests/:id
```

Response:
```json
{
  "success": true,
  "message": "Guest deleted successfully"
}
```

## Attendance Management

### Get All Attendance Records
```
GET /api/attendance
```

Query Parameters:
- `status` (optional): Filter by status (Presence, Not Presence)
- `guest_id` (optional): Filter by guest ID

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "guest_id": 1,
      "check_in_time": "2024-01-01T10:00:00.000Z",
      "status": "Presence",
      "check_in_source": "Digital Guestbook",
      "notes": "Check-in via webhook",
      "name": "Budi Santoso",
      "phone": "6281234567890",
      "category": "VVIP"
    }
  ]
}
```

### Get Attendance Summary
```
GET /api/attendance/summary
```

Response:
```json
{
  "success": true,
  "data": {
    "total_check_ins": "100",
    "unique_guests": "85",
    "presence_count": "90",
    "not_presence_count": "10"
  }
}
```

### Create Attendance Record
```
POST /api/attendance
Content-Type: application/json

{
  "guest_id": 1,
  "status": "Presence",
  "check_in_source": "Manual Entry",
  "notes": "Optional notes"
}
```

Note: If status is "Presence", this will automatically queue a thank you message.

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "guest_id": 1,
    "check_in_time": "2024-01-01T10:00:00.000Z",
    "status": "Presence",
    "check_in_source": "Manual Entry",
    "notes": "Optional notes"
  }
}
```

### Update Attendance Status
```
PATCH /api/attendance/:id/status
Content-Type: application/json

{
  "status": "Presence"
}
```

## Thank You Templates

### Get All Templates
```
GET /api/thank-you
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Default Thank You",
      "message_template": "Terima kasih {nama} telah hadir di acara kami! Anda check-in pada {waktu_checkin}.",
      "is_enabled": true,
      "created_at": "2024-01-01T08:00:00.000Z",
      "updated_at": "2024-01-01T08:00:00.000Z"
    }
  ]
}
```

### Get Template by ID
```
GET /api/thank-you/:id
```

### Create Template
```
POST /api/thank-you
Content-Type: application/json

{
  "name": "Casual Thank You",
  "message_template": "Halo {nama}! Makasih ya udah dateng! Check-in kamu tercatat pada {waktu_checkin}.",
  "is_enabled": true
}
```

Available placeholders:
- `{nama}` - Guest name
- `{waktu_checkin}` - Check-in timestamp

Response:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Casual Thank You",
    "message_template": "Halo {nama}! Makasih ya udah dateng!",
    "is_enabled": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### Update Template
```
PATCH /api/thank-you/:id
Content-Type: application/json

{
  "name": "Updated Template",
  "message_template": "Updated message {nama}",
  "is_enabled": false
}
```

### Delete Template
```
DELETE /api/thank-you/:id
```

### Toggle Template Enable/Disable
```
PATCH /api/thank-you/:id/toggle
Content-Type: application/json

{
  "is_enabled": true
}
```

### Preview Template
```
POST /api/thank-you/preview
Content-Type: application/json

{
  "message_template": "Terima kasih {nama}! Check-in pada {waktu_checkin}.",
  "sample_data": {
    "nama": "John Doe",
    "waktu_checkin": "Senin, 1 Januari 2024 pukul 10.00"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "preview": "Terima kasih John Doe! Check-in pada Senin, 1 Januari 2024 pukul 10.00.",
    "sample_data": {
      "nama": "John Doe",
      "waktu_checkin": "Senin, 1 Januari 2024 pukul 10.00"
    }
  }
}
```

## Webhook

### Check-in Webhook
```
POST /api/webhook/checkin
Content-Type: application/json
X-Webhook-Signature: <hmac-sha256-signature> (optional, if WEBHOOK_SECRET is configured)

{
  "phone": "6281234567890",
  "name": "John Doe",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

Behavior:
- If guest exists by phone: Records attendance
- If guest doesn't exist and name is provided: Creates new guest with Regular category, then records attendance
- Automatically queues thank you message if template is enabled

Response:
```json
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "guest": {
      "id": 1,
      "name": "John Doe",
      "phone": "6281234567890",
      "category": "Regular"
    },
    "attendance": {
      "id": 1,
      "guest_id": 1,
      "check_in_time": "2024-01-01T10:00:00.000Z",
      "status": "Presence",
      "check_in_source": "Digital Guestbook"
    }
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "msg": "Name must be at least 3 characters",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Guest not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Failed to fetch guests"
}
```

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider adding rate limiting middleware.

## Authentication

Currently, the API is public. For production use, consider implementing authentication (JWT, API keys, etc.).

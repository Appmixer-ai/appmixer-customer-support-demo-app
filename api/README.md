# API Documentation

This directory contains the backend API endpoints for the Customer Support Demo application.

## Authentication

All API endpoints require authentication via API key in the request header:
```
X-Api-Key: demo-api-key
```

Valid demo API keys: `demo-api-key`, `test-key-123`, `yoursaas-demo`

Optional user identification header:
```
X-User-Id: demo-user
```

## Endpoints

### Customers API (`/api/customers`)

#### Get All Customers
```http
GET /api/customers
```
Returns list of all customers ordered by name.

#### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

### Tickets API (`/api/tickets`)

#### Get All Tickets
```http
GET /api/tickets
```
Returns all tickets with customer information, ordered by creation date (newest first).

#### Get Tickets by Tags
```http
GET /api/tickets?tags=bug,urgent
```
Filter tickets by tags (comma-separated). Returns tickets containing any of the specified tags.

#### Get Popular Tags
```http
GET /api/tickets?action=popular-tags
```
Returns top 10 most used tags with usage counts.

#### Get Ticket Statistics
```http
GET /api/tickets?action=stats
```
Returns ticket statistics including counts by status, response times, etc.

#### Get Specific Ticket
```http
GET /api/tickets?id=TICK-001
```

#### Create Ticket
```http
POST /api/tickets
Content-Type: application/json

{
  "title": "Login Issue",
  "description": "Cannot log into the system",
  "priority": "high",
  "customer_name": "John Doe",
  "customer_email": "john@example.com"
}
```

#### Update Ticket
```http
PATCH /api/tickets?id=TICK-001
Content-Type: application/json

{
  "status": "in-progress",
  "priority": "high",
  "tags": ["bug", "login"]
}
```

---

### Comments API (`/api/comments`)

#### Get Comments for Ticket
```http
GET /api/comments?ticket_id=TICK-001
```

#### Add Comment
```http
POST /api/comments?ticket_id=TICK-001
Content-Type: application/json

{
  "content": "Looking into this issue now",
  "is_internal": false
}
```

#### Update Comment
```http
PATCH /api/comments?comment_id=123
Content-Type: application/json

{
  "content": "Updated comment text"
}
```

#### Delete Comment
```http
DELETE /api/comments?comment_id=123
```

---

### Tags API (`/api/tags`)

#### Get All Tags
```http
GET /api/tags
```
Returns all tags with usage counts, sorted alphabetically.

#### Get Popular Tags
```http
GET /api/tags?popular=true
```
Returns top 10 most used tags.

#### Get Specific Tag
```http
GET /api/tags?id=bug
```

#### Create Tag
```http
POST /api/tags
Content-Type: application/json

{
  "name": "bug",
  "color": "#EF4444",
  "description": "Issues and defects"
}
```

**Note:** Color and description are optional. If not provided, a default color will be auto-generated based on the tag name.

#### Update Tag
```http
PATCH /api/tags?id=bug
Content-Type: application/json

{
  "name": "critical-bug",
  "color": "#DC2626",
  "description": "Critical issues requiring immediate attention"
}
```
**Notes:** 
- All fields are optional in the update request
- Renaming a tag (changing `name`) updates it across all tickets that use this tag
- If no color is provided and the tag is being renamed, a new default color will be generated

#### Delete Tag
```http
DELETE /api/tags?id=bug
```
Removes the tag from all tickets.

---

### Ticket-Tag Relationships API (`/api/tickets/tags`)

#### Get Tags for Ticket
```http
GET /api/tickets/tags?ticket_id=TICK-001
```

#### Add Tag(s) to Ticket
```http
POST /api/tickets/tags
Content-Type: application/json

{
  "ticket_id": "TICK-001",
  "tags": ["bug", "urgent"]
}
```
Or add single tag:
```http
POST /api/tickets/tags
Content-Type: application/json

{
  "ticket_id": "TICK-001",
  "tag": "bug"
}
```

#### Remove Tag from Ticket
```http
DELETE /api/tickets/tags?ticket_id=TICK-001&tag_id=bug
```

---

### Tag Analytics API (`/api/tags/stats`)

#### Get Tag Statistics
```http
GET /api/tags/stats
```
Returns comprehensive tag statistics including:
- Overview (total tags, usage counts, distribution)
- Most/least used tags
- Tag breakdown by status and priority

#### Get Tag Usage Trends
```http
GET /api/tags/stats?action=trends&period=30d&limit=5
```
Returns tag usage trends over time.

**Parameters:**
- `period`: `7d`, `30d`, `90d`, `1y` (default: `30d`)
- `limit`: Number of top tags to analyze (default: `10`)

---

## Response Format

All endpoints return JSON responses in this format:

**Success Response:**
```json
{
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (for DELETE operations)
- `400` - Bad Request
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error (also returned for invalid API key)

## CORS

All endpoints include CORS headers allowing requests from any origin during development.

## Development

Run the development server to test these endpoints:
```bash
npm run dev:api
```

The API will be available at `http://localhost:3001`
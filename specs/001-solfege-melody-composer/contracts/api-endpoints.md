# API Contracts: Solfege Melody Composer

**Feature**: Solfege Melody Composer  
**Date**: 2026-05-07  
**Phase**: Phase 1 - Interface Design  
**Base URL**: `http://localhost:8000/api` (development)

## Authentication

All authenticated endpoints require JWT token in Authorization header:

```
Authorization: Bearer <access_token>
```

### Obtaining JWT Token

**Endpoint**: `POST /api/auth/token/`

**Request**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Errors**:
- 401 Unauthorized: Invalid credentials

---

## Endpoints

### 1. User Registration

**Endpoint**: `POST /api/auth/register/`  
**Authentication**: None (public)  
**Purpose**: Create new user account

#### Request

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Validation**:
- `username`: 3-150 chars, alphanumeric + underscore/hyphen
- `email`: Valid RFC 5322 format
- `password`: Min 8 chars, contains uppercase, lowercase, number

#### Response

**201 Created**:
```json
{
  "id": "uuid",
  "username": "john_musician",
  "email": "john@example.com",
  "created_at": "2026-05-07T14:30:00Z"
}
```

**400 Bad Request** (validation failure):
```json
{
  "username": ["This username is already taken."],
  "password": ["Password must contain at least one uppercase letter."]
}
```

---

### 2. List User's Melodies

**Endpoint**: `GET /api/melodies/`  
**Authentication**: Required (JWT)  
**Purpose**: Retrieve all melodies created by authenticated user

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `page_size` | integer | 50 | Items per page (max 100) |
| `ordering` | string | `-created_at` | Sort field: `created_at`, `-created_at`, `title` |

#### Response

**200 OK**:
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/melodies/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "title": "My First Melody",
      "notation": "do re mi fa sol la si do",
      "key": "C",
      "share_id": "aB3dE5gH9jKl",
      "is_public": true,
      "created_at": "2026-05-07T14:30:00Z",
      "updated_at": "2026-05-07T14:30:00Z",
      "note_count": 8,
      "duration_seconds": 4.0
    }
  ]
}
```

**401 Unauthorized**: Missing or invalid JWT token

---

### 3. Create Melody

**Endpoint**: `POST /api/melodies/`  
**Authentication**: Required (JWT)  
**Purpose**: Save a new melody

#### Request

```json
{
  "title": "string",
  "notation": "string",
  "key": "string",
  "is_public": boolean
}
```

**Field Details**:
- `title` (required): 1-200 characters
- `notation` (required): Space-separated solfege syllables
- `key` (optional): Musical key, default "C"
- `is_public` (optional): Share link enabled, default true

#### Response

**201 Created**:
```json
{
  "id": "uuid",
  "title": "Happy Birthday",
  "notation": "do do re do fa mi",
  "key": "C",
  "share_id": "xY9wZ2aB4cDe",
  "is_public": true,
  "created_at": "2026-05-07T15:45:00Z",
  "updated_at": "2026-05-07T15:45:00Z",
  "note_count": 6,
  "duration_seconds": 3.0
}
```

**400 Bad Request** (validation failure):
```json
{
  "notation": ["Invalid solfege syllables: 'da', 'de'. Valid syllables: do, re, mi, fa, sol, la, si."]
}
```

**401 Unauthorized**: Missing or invalid JWT token

---

### 4. Get Melody Details

**Endpoint**: `GET /api/melodies/{id}/`  
**Authentication**: Required (JWT)  
**Purpose**: Retrieve a specific melody owned by user

#### Path Parameters

- `id` (uuid): Melody unique identifier

#### Response

**200 OK**:
```json
{
  "id": "uuid",
  "title": "My Melody",
  "notation": "do mi sol mi do",
  "key": "G",
  "share_id": "pQ7rS9tU2vWx",
  "is_public": true,
  "created_at": "2026-05-07T10:00:00Z",
  "updated_at": "2026-05-07T11:30:00Z",
  "note_count": 5,
  "duration_seconds": 2.5
}
```

**401 Unauthorized**: Missing or invalid JWT token  
**403 Forbidden**: Melody belongs to different user  
**404 Not Found**: Melody does not exist

---

### 5. Update Melody

**Endpoint**: `PUT /api/melodies/{id}/`  
**Authentication**: Required (JWT)  
**Purpose**: Update an existing melody

#### Path Parameters

- `id` (uuid): Melody unique identifier

#### Request

```json
{
  "title": "string",
  "notation": "string",
  "key": "string",
  "is_public": boolean
}
```

**Note**: `share_id` is immutable and cannot be changed

#### Response

**200 OK**:
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "notation": "do re mi fa sol",
  "key": "D",
  "share_id": "pQ7rS9tU2vWx",
  "is_public": false,
  "created_at": "2026-05-07T10:00:00Z",
  "updated_at": "2026-05-07T16:00:00Z",
  "note_count": 5,
  "duration_seconds": 2.5
}
```

**400 Bad Request**: Validation failure  
**401 Unauthorized**: Missing or invalid JWT token  
**403 Forbidden**: User does not own this melody  
**404 Not Found**: Melody does not exist

---

### 6. Delete Melody

**Endpoint**: `DELETE /api/melodies/{id}/`  
**Authentication**: Required (JWT)  
**Purpose**: Permanently delete a melody

#### Path Parameters

- `id` (uuid): Melody unique identifier

#### Response

**204 No Content**: Melody successfully deleted (no body)

**401 Unauthorized**: Missing or invalid JWT token  
**403 Forbidden**: User does not own this melody  
**404 Not Found**: Melody does not exist

---

### 7. Get Shared Melody (Public)

**Endpoint**: `GET /api/melodies/shared/{share_id}/`  
**Authentication**: None (public)  
**Purpose**: Access publicly shared melody without authentication

#### Path Parameters

- `share_id` (string): 12-character public share identifier

#### Response

**200 OK**:
```json
{
  "id": "uuid",
  "title": "Check out my melody!",
  "notation": "do re mi fa sol la si do",
  "key": "C",
  "share_id": "aB3dE5gH9jKl",
  "created_at": "2026-05-07T14:30:00Z",
  "note_count": 8,
  "duration_seconds": 4.0,
  "author": {
    "username": "john_musician"
  }
}
```

**Note**: `is_public`, `updated_at`, and full user details are not exposed for privacy

**403 Forbidden**: Melody is private (`is_public=false`)  
**404 Not Found**: Share ID does not exist

---

### 8. Transpose Melody

**Endpoint**: `POST /api/melodies/{id}/transpose/`  
**Authentication**: Required (JWT)  
**Purpose**: Calculate transposed pitch values for a different key

#### Path Parameters

- `id` (uuid): Melody unique identifier

#### Request

```json
{
  "target_key": "string"
}
```

**Field Details**:
- `target_key` (required): Musical key (C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B)

#### Response

**200 OK**:
```json
{
  "original_key": "C",
  "target_key": "G",
  "notation": "do re mi fa sol la si do",
  "transposed_pitches": [
    {"solfege": "do", "pitch": "G4", "frequency": 392.0},
    {"solfege": "re", "pitch": "A4", "frequency": 440.0},
    {"solfege": "mi", "pitch": "B4", "frequency": 493.88},
    {"solfege": "fa", "pitch": "C5", "frequency": 523.25},
    {"solfege": "sol", "pitch": "D5", "frequency": 587.33},
    {"solfege": "la", "pitch": "E5", "frequency": 659.25},
    {"solfege": "si", "pitch": "F#5", "frequency": 739.99},
    {"solfege": "do", "pitch": "G5", "frequency": 784.0}
  ]
}
```

**Note**: This endpoint does NOT modify the stored melody. It only computes transposition for client-side playback.

**400 Bad Request**: Invalid target key  
**401 Unauthorized**: Missing or invalid JWT token  
**403 Forbidden**: User does not own this melody  
**404 Not Found**: Melody does not exist

---

### 9. Refresh JWT Token

**Endpoint**: `POST /api/auth/token/refresh/`  
**Authentication**: None (requires refresh token)  
**Purpose**: Obtain new access token using refresh token

#### Request

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Response

**200 OK**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**401 Unauthorized**: Invalid or expired refresh token

---

## Error Response Format

All errors follow consistent structure:

```json
{
  "field_name": ["Error message 1", "Error message 2"],
  "another_field": ["Error message"]
}
```

For non-field errors:

```json
{
  "detail": "Error description"
}
```

### Common HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, POST (non-creation) |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failure, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- All other endpoints: 100 requests per minute per user

**Rate limit headers** (included in all responses):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

**429 Too Many Requests**:
```json
{
  "detail": "Request was throttled. Expected available in 42 seconds."
}
```

---

## CORS Policy

**Allowed Origins** (development):
- `http://localhost:3000`

**Allowed Methods**:
- GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers**:
- Content-Type, Authorization

**Credentials**: Allowed (for JWT in cookies if implemented)

---

## API Versioning

Current version: **v1** (implicit in `/api/` base path)

Future versions will use explicit versioning: `/api/v2/`

---

## OpenAPI Schema

Interactive API documentation available at:
- **Swagger UI**: `http://localhost:8000/api/schema/swagger-ui/`
- **ReDoc**: `http://localhost:8000/api/schema/redoc/`
- **OpenAPI JSON**: `http://localhost:8000/api/schema/`

Generated using **drf-spectacular**

---

## Example Usage

### Complete Flow: Register → Create Melody → Share

```bash
# 1. Register user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "melody_lover",
    "email": "melody@example.com",
    "password": "SecurePass123"
  }'

# 2. Obtain JWT token
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "melody_lover",
    "password": "SecurePass123"
  }'
# Returns: {"access": "...", "refresh": "..."}

# 3. Create melody
curl -X POST http://localhost:8000/api/melodies/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "title": "My Happy Song",
    "notation": "do re mi mi re do",
    "key": "C",
    "is_public": true
  }'
# Returns: {"id": "...", "share_id": "aB3dE5gH9jKl", ...}

# 4. Share melody (public access, no auth)
curl -X GET http://localhost:8000/api/melodies/shared/aB3dE5gH9jKl/
# Returns: melody details for anyone with the link
```

---

## Security Considerations

### Authentication
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Tokens use HS256 signing algorithm
- Secret key stored in environment variables (never in code)

### Authorization
- Users can only modify/delete their own melodies
- Shared melodies (via share_id) are read-only for non-owners
- Private melodies (`is_public=false`) cannot be accessed via share link

### Input Validation
- All inputs sanitized to prevent XSS
- SQL injection prevented by Django ORM parameterization
- File uploads not supported (no XSS via file upload)
- Rate limiting prevents brute force attacks

### HTTPS
- Production deployment MUST use HTTPS
- JWT tokens MUST NOT be transmitted over HTTP
- Secure flag set on cookies in production

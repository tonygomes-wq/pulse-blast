# Architecture Overview - MySQL Migration

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                     http://localhost:8080                        │
├─────────────────────────────────────────────────────────────────┤
│  Pages:                                                          │
│  • Dashboard         • Contacts        • Categories              │
│  • Campaigns         • CampaignDetail  • NewCampaign            │
│  • QuickSend         • Settings        • Auth                   │
│                                                                  │
│  API Client: src/lib/api.ts                                     │
│  • Authentication    • Contacts CRUD                            │
│  • Categories CRUD   • Campaigns CRUD                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API
                         │ (JWT Token in Authorization header)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js/Express)                 │
│                     http://localhost:3001/api                    │
├─────────────────────────────────────────────────────────────────┤
│  Middleware:                                                     │
│  • CORS              • Body Parser     • JWT Auth               │
│                                                                  │
│  Routes:                                                         │
│  • /api/auth         → Auth endpoints  (signup, signin, etc.)   │
│  • /api/contacts     → Contacts CRUD   (get, create, update)   │
│  • /api/categories   → Categories CRUD (get, create, delete)    │
│  • /api/campaigns    → Campaigns API   (create, update, send)   │
│                                                                  │
│  Database Layer: mysql2 connection pool                         │
└────────────────────────┬────────────────────────────────────────┘
                         │ MySQL Protocol
                         │ (TCP connection)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MYSQL DATABASE (Hostgator)                      │
│                    faceso56_wats                                 │
├─────────────────────────────────────────────────────────────────┤
│  Tables:                                                         │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │     users       │  │   contacts   │  │   categories    │   │
│  ├─────────────────┤  ├──────────────┤  ├─────────────────┤   │
│  │ id (PK)         │  │ id (PK)      │  │ id (PK)         │   │
│  │ email (unique)  │  │ user_id (FK) │  │ user_id (FK)    │   │
│  │ password_hash   │  │ name         │  │ name            │   │
│  │ full_name       │  │ whatsapp     │  │ color           │   │
│  └─────────────────┘  └──────────────┘  └─────────────────┘   │
│                                                                  │
│  ┌──────────────────────┐  ┌─────────────────────────────┐    │
│  │ contact_categories   │  │       campaigns             │    │
│  ├──────────────────────┤  ├─────────────────────────────┤    │
│  │ contact_id (FK)      │  │ id (PK)                     │    │
│  │ category_id (FK)     │  │ user_id (FK)                │    │
│  └──────────────────────┘  │ name                        │    │
│                             │ message_template            │    │
│  ┌─────────────────────────┤ status (draft/running/...)  │    │
│  │  campaign_messages      │ total_contacts              │    │
│  ├─────────────────────────┤ sent_count                  │    │
│  │ id (PK)                 │ failed_count                │    │
│  │ campaign_id (FK)        └─────────────────────────────┘    │
│  │ contact_id (FK)                                             │
│  │ status (pending/sent)                                       │
│  │ message_content                                             │
│  │ error_message                                               │
│  └─────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                                                ┌──────────┐
│  Client  │                                                │  Server  │
└────┬─────┘                                                └────┬─────┘
     │                                                           │
     │  1. POST /api/auth/signup                                │
     │     { email, password, full_name }                       │
     ├──────────────────────────────────────────────────────────▶
     │                                                           │
     │                    2. Hash password (bcrypt)              │
     │                    3. Insert into users table             │
     │                    4. Generate JWT token                  │
     │                                                           │
     │  5. Response: { user, token }                            │
     ◀──────────────────────────────────────────────────────────┤
     │                                                           │
     │  6. Store token in localStorage                          │
     │     Store user in localStorage                            │
     │                                                           │
     │  7. All subsequent requests include:                     │
     │     Authorization: Bearer <token>                         │
     ├──────────────────────────────────────────────────────────▶
     │                                                           │
     │                    8. Verify JWT token                    │
     │                    9. Extract user ID                     │
     │                    10. Process request                    │
     │                                                           │
     │  11. Response with user-specific data                    │
     ◀──────────────────────────────────────────────────────────┤
     │                                                           │
```

## Data Flow Example: Creating a Campaign

```
┌────────────┐          ┌─────────────┐          ┌──────────┐
│  Frontend  │          │   Backend   │          │  MySQL   │
└──────┬─────┘          └──────┬──────┘          └────┬─────┘
       │                       │                      │
       │ 1. User fills form    │                      │
       │    - Name             │                      │
       │    - Message          │                      │
       │    - Selects contacts │                      │
       │                       │                      │
       │ 2. POST /api/campaigns/create-with-messages  │
       │    Authorization: Bearer <token>             │
       │    Body: {                                   │
       │      campaign_name,                          │
       │      message_template,                       │
       │      contacts: [...]                         │
       │    }                                         │
       ├──────────────────────▶│                      │
       │                       │                      │
       │                       │ 3. Verify JWT        │
       │                       │    Extract user_id   │
       │                       │                      │
       │                       │ 4. BEGIN TRANSACTION │
       │                       ├─────────────────────▶│
       │                       │                      │
       │                       │ 5. INSERT campaign   │
       │                       ├─────────────────────▶│
       │                       │                      │
       │                       │ 6. Return campaign_id│
       │                       ◀──────────────────────┤
       │                       │                      │
       │                       │ 7. INSERT messages   │
       │                       │    (bulk insert)     │
       │                       ├─────────────────────▶│
       │                       │                      │
       │                       │ 8. COMMIT            │
       │                       ├─────────────────────▶│
       │                       │                      │
       │ 9. Response:          │                      │
       │    { id: campaign_id }│                      │
       ◀──────────────────────┤                      │
       │                       │                      │
       │ 10. Navigate to       │                      │
       │     /campaigns/:id    │                      │
       │                       │                      │
```

## Migration Comparison

### Before (Supabase)
```
Frontend → Supabase Client → Supabase Cloud → PostgreSQL
           (supabase-js)      (REST/Realtime)
```

### After (MySQL)
```
Frontend → API Client → Express Server → MySQL
           (api.ts)     (Node.js)        (Hostgator)
```

## Key Differences

| Feature | Supabase | MySQL Backend |
|---------|----------|---------------|
| **Authentication** | Built-in Auth | Custom JWT-based |
| **Database** | PostgreSQL (cloud) | MySQL (Hostgator) |
| **Real-time** | Built-in subscriptions | Polling required |
| **RLS** | Row Level Security | Middleware checks |
| **Storage** | Included | Separate service needed |
| **Functions** | Edge Functions | Express routes |
| **Client** | `supabase-js` | Custom `api.ts` |
| **Hosting** | Supabase Cloud | Self-hosted |
| **Cost** | Usage-based | Included in hosting |

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

### Backend (backend/.env)
```env
DB_HOST=localhost
DB_USER=faceso56_suporte
DB_PASSWORD=qI08Psb59vVEbHQSiZk8AN234
DB_NAME=faceso56_wats
DB_PORT=3306

JWT_SECRET=<your-secure-random-string>
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## Security Implementation

### Password Hashing
```javascript
// Signup
const password_hash = await bcrypt.hash(password, 10);

// Login verification
const valid = await bcrypt.compare(password, password_hash);
```

### JWT Token
```javascript
// Generate
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify (middleware)
jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) return res.status(403).json({ error: 'Invalid token' });
  req.user = user;
  next();
});
```

### Request Authorization
```javascript
// All protected routes use authenticateToken middleware
router.get('/contacts', authenticateToken, async (req, res) => {
  // req.user contains authenticated user info
  const userId = req.user.id;
  // Query only user's data
});
```

## File Structure Comparison

### Before (Supabase)
```
src/
└── integrations/
    └── supabase/
        ├── client.ts       # Supabase client
        └── types.ts        # Generated types
```

### After (MySQL)
```
src/
└── lib/
    └── api.ts             # Custom API client

backend/                   # NEW
├── database/
├── middleware/
├── routes/
└── server.js
```

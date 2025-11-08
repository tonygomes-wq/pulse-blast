# 🔄 MySQL Migration Complete - Pulse Blast

## ✅ What Has Been Created

I've successfully created a complete MySQL backend migration for your Pulse Blast application. Here's what's been set up:

### 📁 New Files Created

```
pulse-blast-main/
├── backend/                           # NEW Backend API Server
│   ├── database/
│   │   ├── db.js                     # MySQL connection pool
│   │   └── schema.sql                # Complete database schema
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js                   # Authentication endpoints
│   │   ├── contacts.js               # Contacts CRUD operations
│   │   ├── categories.js             # Categories CRUD operations
│   │   └── campaigns.js              # Campaigns & messages operations
│   ├── .env                          # Your MySQL credentials (CONFIGURED)
│   ├── .env.example                  # Template for others
│   ├── package.json                  # Backend dependencies
│   ├── server.js                     # Express server entry point
│   └── README.md                     # Backend documentation
├── src/lib/
│   └── api.ts                        # NEW API client (replaces Supabase)
├── .env                              # Frontend environment config
├── setup-backend.bat                 # Windows setup script
├── MIGRATION_GUIDE.md                # Complete migration guide
└── README-MYSQL-MIGRATION.md         # This file
```

### 🗄️ Database Schema

The MySQL schema has been created with these tables:
- **users** - User authentication (replaces Supabase Auth)
- **contacts** - WhatsApp contacts
- **categories** - Contact categories
- **contact_categories** - Many-to-many relationship
- **campaigns** - Campaign information
- **campaign_messages** - Message queue and status

## 🚀 Quick Start Guide

### Step 1: Set Up MySQL Database

Your database credentials are already configured:
- **Host:** localhost
- **User:** faceso56_suporte
- **Password:** qI08Psb59vVEbHQSiZk8AN234
- **Database:** faceso56_wats

**Action Required:**

1. Log into your Hostgator cPanel
2. Open **phpMyAdmin**
3. Select database `faceso56_wats`
4. Click the **SQL** tab
5. Open file: `backend/database/schema.sql`
6. Copy all the SQL code
7. Paste into phpMyAdmin SQL tab
8. Click **Go** button

This creates all necessary tables in your MySQL database.

### Step 2: Install Backend Dependencies

Open PowerShell or Command Prompt:

```bash
cd "c:\Users\Tony Gomes\Downloads\pulse-blast-main\backend"
npm install
```

Or simply double-click: `setup-backend.bat`

### Step 3: Update JWT Secret

⚠️ **IMPORTANT FOR SECURITY:**

Open `backend\.env` and change this line:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and replace the JWT_SECRET value.

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MySQL Database connected successfully
🚀 Server is running on port 3001
📡 API available at http://localhost:3001
```

### Step 5: Test the Backend

Open your browser and go to:
- http://localhost:3001/health

You should see: `{"status":"OK","message":"Server is running"}`

## 🔧 What Needs to Be Updated Next

The frontend pages still use Supabase. You have two options:

### Option A: Gradual Migration (Recommended)

Update pages one at a time, testing as you go:

1. **Auth page** (`src/pages/Auth.tsx`)
2. **Dashboard** (`src/pages/Dashboard.tsx`)
3. **Contacts** (`src/pages/Contacts.tsx`)
4. **Categories** (`src/pages/Categories.tsx`)
5. **Campaigns** (`src/pages/Campaigns.tsx`)
6. **Campaign Detail** (`src/pages/CampaignDetail.tsx`)
7. **New Campaign** (`src/pages/NewCampaign.tsx`)
8. **Quick Send** (`src/pages/QuickSend.tsx`)
9. **Settings** (no changes needed)
10. **Layout** (`src/components/Layout.tsx`)

### Option B: Quick Complete Migration

I can update all frontend files at once to use the new MySQL API.

**Would you like me to update all frontend files now?**

## 📝 API Usage Examples

### Authentication Example

```typescript
import api from '@/lib/api';

// Sign Up
const { user, token } = await api.auth.signUp(
  'user@example.com',
  'password123',
  'Full Name'
);

// Sign In
const { user, token } = await api.auth.signIn(
  'user@example.com',
  'password123'
);

// Get current user
const { user } = await api.auth.getUser();

// Sign Out
await api.auth.signOut();
```

### Contacts Example

```typescript
// Get all contacts
const contacts = await api.contacts.getAll();

// Create contact
const newContact = await api.contacts.create({
  name: 'John Doe',
  whatsapp: '5511999999999'
});

// Update contact
await api.contacts.update(contactId, {
  name: 'Jane Doe'
});

// Delete contact
await api.contacts.delete(contactId);

// Bulk import
await api.contacts.bulkCreate([
  { name: 'Contact 1', whatsapp: '5511111111111' },
  { name: 'Contact 2', whatsapp: '5511222222222' }
]);
```

### Campaigns Example

```typescript
// Create campaign with messages
const { id } = await api.campaigns.createWithMessages({
  campaign_name: 'Summer Sale',
  message_template: 'Hello {{nome}}, check our sale!',
  contacts: [
    {
      contact_id: 'contact-uuid-1',
      message_content: 'Hello John, check our sale!'
    },
    {
      contact_id: 'contact-uuid-2',
      message_content: 'Hello Mary, check our sale!'
    }
  ]
});

// Get campaign
const campaign = await api.campaigns.getById(campaignId);

// Get messages
const messages = await api.campaigns.getMessages(campaignId);

// Update message status
await api.campaigns.updateMessage(messageId, {
  status: 'sent',
  sent_at: new Date().toISOString()
});
```

## 🌐 Deploying to Production

### Backend Deployment Options

**Option 1: Hostgator Shared Hosting with Node.js**
1. In cPanel, find "Setup Node.js App"
2. Create new application
3. Upload `backend` folder
4. Set entry point: `server.js`
5. Configure environment variables in cPanel

**Option 2: Hostgator VPS**
1. SSH into your VPS
2. Install Node.js
3. Upload backend folder
4. Install PM2: `npm install -g pm2`
5. Start: `pm2 start server.js`

**Option 3: External Service (Recommended)**
- Deploy backend to: Heroku, Railway.app, DigitalOcean, or AWS
- More reliable for Node.js applications
- Better performance and uptime
- Update `VITE_API_URL` to point to hosted backend

### Frontend Deployment

```bash
npm run build
```

Upload `dist` folder contents to your Hostgator `public_html`.

Update `.env` before building:
```env
VITE_API_URL=https://yourdomain.com/api
```

## 🔐 Security Checklist

- [x] MySQL credentials configured
- [ ] JWT_SECRET changed to random secure string
- [ ] HTTPS enabled in production
- [ ] CORS updated for production domain
- [ ] Strong MySQL password
- [ ] `.env` files not in version control
- [ ] Input validation on all endpoints

## 📊 API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login to account
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/signout` - Logout

### Contacts
- `GET /api/contacts` - Get all user contacts
- `POST /api/contacts` - Create single contact
- `POST /api/contacts/bulk` - Import multiple contacts
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `GET /api/contacts/count` - Get total count

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/:id/contacts` - Get contacts in category
- `POST /api/categories/:categoryId/contacts/:contactId` - Assign contact
- `DELETE /api/categories/:categoryId/contacts/:contactId` - Remove contact

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get specific campaign
- `POST /api/campaigns/create-with-messages` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/messages` - Get campaign messages
- `PUT /api/campaigns/messages/:id` - Update message status
- `GET /api/campaigns/stats/count` - Get campaign count
- `GET /api/campaigns/stats/sent` - Get sent messages count

## 🐛 Common Issues & Solutions

### "MySQL connection failed"
- Check credentials in `backend/.env`
- Verify MySQL is running
- Confirm database exists
- Test connection in phpMyAdmin

### "CORS error"
- Update `FRONTEND_URL` in `backend/.env`
- Check CORS configuration in `server.js`
- Ensure frontend URL matches exactly

### "Invalid token" or "Token expired"
- Clear browser localStorage
- Sign in again
- Check JWT_SECRET hasn't changed

### "Cannot connect to API"
- Verify backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env`
- Look at Network tab in browser DevTools

### Port 3001 already in use
- Change PORT in `backend/.env`
- Or kill process: `npx kill-port 3001`

## 📞 Next Steps

1. ✅ MySQL database schema created
2. ✅ Backend API server ready
3. ✅ API client library created
4. ⏳ Frontend pages need updating
5. ⏳ Testing and deployment

**Ready to update the frontend pages?** Let me know and I'll migrate all the frontend code to use the new MySQL API!

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [JWT Best Practices](https://jwt.io/introduction)
- [Hostgator Node.js Guide](https://www.hostgator.com/help/article/how-to-install-nodejs)

---

**Questions? Issues?** Check the MIGRATION_GUIDE.md for detailed instructions or review the backend/README.md for API documentation.

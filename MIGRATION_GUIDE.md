# Migration Guide: Supabase to MySQL (Hostgator)

This guide explains how to migrate your Pulse Blast application from Supabase to MySQL on Hostgator.

## 📋 Prerequisites

- Node.js installed (v16 or higher)
- Access to your Hostgator cPanel
- MySQL database credentials

## 🗄️ Step 1: Set Up MySQL Database

### 1.1 Create Database Schema

1. Log into your Hostgator cPanel
2. Go to **phpMyAdmin**
3. Select your database: `faceso56_wats`
4. Click on **SQL** tab
5. Copy and paste the contents of `backend/database/schema.sql`
6. Click **Go** to execute

This will create all necessary tables:
- `users` (replaces Supabase auth)
- `contacts`
- `categories`
- `contact_categories`
- `campaigns`
- `campaign_messages`

## 🔧 Step 2: Configure Backend

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

The `.env` file is already configured with your database credentials:

```env
DB_HOST=localhost
DB_USER=faceso56_suporte
DB_PASSWORD=qI08Psb59vVEbHQSiZk8AN234
DB_NAME=faceso56_wats
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

**⚠️ IMPORTANT:** Change `JWT_SECRET` to a random secure string before deploying to production!

You can generate a secure secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Test Backend Locally

```bash
npm run dev
```

You should see:
```
✅ MySQL Database connected successfully
🚀 Server is running on port 3001
📡 API available at http://localhost:3001
```

## 🌐 Step 3: Configure Frontend

### 3.1 Update Frontend Dependencies

The frontend already has the new API client at `src/lib/api.ts`.

### 3.2 Environment Configuration

Create/update `.env` in the project root:

```env
VITE_API_URL=http://localhost:3001/api
```

For production on Hostgator:
```env
VITE_API_URL=https://yourdomain.com/api
```

## 🔄 Step 4: Update Frontend Code

All frontend pages need to be updated to use the new API instead of Supabase. The main changes are:

### Authentication
- Replace `supabase.auth.signIn()` with `api.auth.signIn()`
- Replace `supabase.auth.getUser()` with `api.auth.getUser()`
- Replace `supabase.auth.signOut()` with `api.auth.signOut()`

### Data Fetching
- Replace `supabase.from('table').select()` with `api.contacts.getAll()` (etc.)
- Replace `supabase.from('table').insert()` with `api.contacts.create()` (etc.)

## 🚀 Step 5: Deploy to Hostgator

### 5.1 Deploy Backend

Since Hostgator uses cPanel, you'll need to:

**Option 1: Use Node.js App Manager (if available)**
1. In cPanel, go to **Setup Node.js App**
2. Create a new application
3. Upload your `backend` folder
4. Set the startup file to `server.js`
5. Install dependencies via terminal

**Option 2: Use a subdomain with Node.js**
1. Create a subdomain (e.g., `api.yourdomain.com`)
2. Upload the `backend` folder to the subdomain's root
3. Configure Node.js application
4. Update `.env` with production settings

**Option 3: Use a VPS or Cloud Server**
- Consider using a service like DigitalOcean, AWS, or Heroku for the backend
- Update `VITE_API_URL` to point to your hosted backend

### 5.2 Deploy Frontend

```bash
npm run build
```

Upload the contents of the `dist` folder to your Hostgator public_html directory.

## 📝 Step 6: Data Migration (Optional)

If you have existing data in Supabase:

1. Export data from Supabase tables (CSV or SQL format)
2. Import into MySQL using phpMyAdmin
3. Ensure UUIDs are properly formatted (VARCHAR(36))

## 🧪 Testing

### Test Authentication
1. Go to `/auth` page
2. Create a new account
3. Sign in
4. Verify redirect to dashboard

### Test Contacts
1. Add a new contact
2. Import contacts via CSV
3. Edit and delete contacts

### Test Campaigns
1. Create a new campaign
2. Select contacts
3. Send test message

## 🔒 Security Checklist

- [ ] Changed JWT_SECRET to a secure random string
- [ ] Enabled HTTPS on production
- [ ] Updated CORS settings for production domain
- [ ] Secured MySQL database (strong password, limited access)
- [ ] Removed `.env` files from version control
- [ ] Validated all user inputs on backend

## 🐛 Troubleshooting

### Backend won't connect to database
- Verify MySQL credentials in `.env`
- Check if MySQL server is running
- Ensure database exists and schema is created

### CORS errors
- Update `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `server.js`

### Authentication not working
- Clear browser localStorage
- Check JWT_SECRET is set
- Verify token is being sent in headers

### API requests failing
- Check `VITE_API_URL` in frontend `.env`
- Verify backend is running
- Check network tab in browser DevTools

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signout` - Logout

### Contacts Endpoints
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create contact
- `POST /api/contacts/bulk` - Bulk import
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Categories Endpoints
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/:id/contacts` - Get contacts by category

### Campaigns Endpoints
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `POST /api/campaigns/create-with-messages` - Create campaign with messages
- `PUT /api/campaigns/:id` - Update campaign
- `GET /api/campaigns/:id/messages` - Get campaign messages
- `PUT /api/campaigns/messages/:id` - Update message status

## 🆘 Support

For issues or questions, check:
- MySQL error logs
- Node.js console output
- Browser DevTools console
- Network tab for failed requests

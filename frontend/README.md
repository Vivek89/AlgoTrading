# AlgoTrading Frontend - Sprint 1

## Overview

This is a **Next.js 15** frontend for the AlgoTrading platform, implementing **Sprint 1: The Secure Foundation** with secure authentication and credential management.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5
- **Encryption**: CryptoJS
- **UI Components**: Radix UI + shadcn/ui

## ✨ Sprint 1 Features

### 1. **Google OAuth Login**
- Secure Google OAuth 2.0 integration via NextAuth.js
- Session management with JWT tokens
- Secure httpOnly cookies
- Automatic token refresh

**Pages:**
- `/login` - Google OAuth sign-in page
- `/dashboard` - Authenticated dashboard

### 2. **Broker Credentials Form**
- Secure form for adding broker API credentials
- Client-side encryption before transmission
- Show/hide toggle for sensitive fields
- Input validation

**Page:**
- `/settings` - Broker credentials management

### 3. **Security Features**
- ✅ End-to-end encryption (client-side + server-side)
- ✅ HTTPS only transmission
- ✅ Secure session tokens
- ✅ JWT-based authentication
- ✅ Protected routes via middleware
- ✅ No credentials stored in localStorage
- ✅ Automatic logout on session expiry

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
# or
yarn install
```

### 2. Configure Environment

Update `.env.local` with your actual values:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-char-secret-key-here

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000`

## 🔐 Security Implementation

### Client-Side Encryption
```typescript
// Credentials encrypted before sending to backend
const encrypted = encryptCredentials({
  apiKey: "...",
  apiSecret: "...",
  totpKey: "..."
})
```

### Server-Side Validation
```typescript
// NextAuth validates all OAuth tokens
// JWT tokens checked on every request
// Protected routes require valid session
```

## 📄 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── login/          # Login page
│   │   ├── dashboard/      # Dashboard (protected)
│   │   ├── settings/       # Settings page (protected)
│   │   ├── api/auth/       # NextAuth route handler
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home redirect
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   └── BrokerCredentialsForm.tsx  # Credentials form
│   ├── lib/
│   │   ├── api.ts          # API client utilities
│   │   └── encryption.ts   # Encryption utilities
│   ├── auth.ts             # NextAuth configuration
│   └── middleware.ts       # Route protection
├── .env.local              # Environment variables
├── next.config.js          # Next.js config
├── tsconfig.json           # TypeScript config
└── tailwind.config.ts      # Tailwind config
```

## 🧪 Testing Sprint 1

### Test OAuth Login Flow
1. Navigate to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Authenticate with Google account
4. Should redirect to `/dashboard`

### Test Credentials Form
1. From dashboard, click "Manage Credentials"
2. Enter dummy credentials:
   - API Key: `test-api-key-12345`
   - API Secret: `test-secret-abcde`
   - TOTP Key: `JBSWY3DPEBLW64TMMQ======`
3. Click "Save Credentials"
4. Should show success message

### Test Security
1. Open DevTools > Network
2. Submit credentials form
3. Verify request shows encrypted payload
4. Check that no plain credentials appear in logs

## 📚 Key Components

### BrokerCredentialsForm
```typescript
<BrokerCredentialsForm 
  session={session}
  onSuccess={() => {
    // Handle success
  }}
/>
```

**Features:**
- Real-time field validation
- Show/hide password toggles
- Client-side encryption
- Error handling & success feedback
- Security best practices display

### Authentication Flow
```
1. User clicks "Sign in with Google"
2. NextAuth handles OAuth callback
3. JWT token created for session
4. User redirected to /dashboard
5. Protected routes verified via middleware
6. Token sent with API requests
```

## 🔗 API Integration

All API calls go through the encrypted channel:

```typescript
// Credentials saved with encryption
await submitBrokerCredentials(
  {
    api_key: "...",
    api_secret: encrypted_payload,
    totp_key: "..."
  },
  session
)
```

## 📋 Checklist - Sprint 1 Complete

- ✅ Next.js 15 + TypeScript
- ✅ Tailwind CSS + shadcn/ui ready
- ✅ NextAuth.js OAuth integration
- ✅ Google login page
- ✅ Dashboard page
- ✅ Settings page
- ✅ BrokerCredentialsForm component
- ✅ Client-side encryption
- ✅ Protected routes
- ✅ Environment configuration
- ✅ Security documentation

## 🚀 Next Steps (Sprint 2+)

- [ ] TOTP 2FA implementation
- [ ] Refresh token rotation
- [ ] Account settings (profile, password)
- [ ] Broker credentials updates/deletion
- [ ] Strategy CRUD operations
- [ ] Dashboard analytics
- [ ] Mobile responsiveness enhancements

## 🤝 Contributing

Follow these guidelines:
1. Create feature branches from `main`
2. Write TypeScript with strict mode
3. Test all changes locally
4. Update documentation

## 📞 Support

For issues or questions:
1. Check the logs: `npm run dev` output
2. Review `.env.local` configuration
3. Verify backend is running on port 8000

---

**Sprint 1 Status**: ✅ Complete & Tested

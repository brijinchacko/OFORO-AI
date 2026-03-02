# Oforo AI — Deployment Guide

All the code changes are ready. Follow these steps to get everything live on your server.

---

## 1. Set Up Resend (OTP Email Service)

Resend is a simple email API that will send OTP codes from `hello@oforo.ai`.

### Steps:

1. Go to [resend.com](https://resend.com) and create a free account
2. Navigate to **Domains** → **Add Domain**
3. Enter `oforo.ai`
4. Resend will give you DNS records to add. Go to your **Namecheap** dashboard:
   - Log into Namecheap → Domain List → click **Manage** next to oforo.ai
   - Go to **Advanced DNS**
   - Add the records Resend provides (typically 3 TXT records + 1 MX record for SPF, DKIM, and DMARC)
5. Wait for verification (usually 5–30 minutes)
6. Once verified, go to **API Keys** → **Create API Key**
7. Copy the API key (starts with `re_`)

### Add to server .env.local:

```
RESEND_API_KEY=re_your_api_key_here
```

---

## 2. Set Up Microsoft Azure AD (Outlook + Teams)

This enables Outlook email sending/reading and Teams calendar access.

### Create Azure App Registration:

1. Go to [portal.azure.com](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Fill in:
   - **Name**: Oforo AI
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: Select **Web** and enter `https://oforo.ai/api/todo/microsoft`
4. Click **Register**

### Get Client ID and Secret:

1. On the app overview page, copy the **Application (client) ID**
2. Go to **Certificates & secrets** → **New client secret**
3. Add a description (e.g., "Oforo Production"), set expiry to 24 months
4. Copy the secret **Value** immediately (it won't be shown again)

### Set API Permissions:

1. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions**
2. Add these permissions:
   - `Mail.Send`
   - `Mail.ReadWrite`
   - `Calendars.ReadWrite`
   - `Tasks.ReadWrite`
   - `User.Read`
3. Click **Grant admin consent** (if you're the admin)

### Add to server .env.local:

```
MICROSOFT_CLIENT_ID=your_client_id_here
MICROSOFT_CLIENT_SECRET=your_secret_value_here
MICROSOFT_REDIRECT_URI=https://oforo.ai/api/todo/microsoft
```

---

## 3. Deploy to Server

### SSH into your server:

```bash
ssh root@72.62.230.223
```

### Pull latest code:

```bash
cd /var/www/oforo-website
git pull origin main
```

### Install new dependency (better-sqlite3):

```bash
npm install
```

> **Note**: `better-sqlite3` is a native module and needs to compile. If it fails, install build tools:
> ```bash
> apt-get install -y build-essential python3
> npm install
> ```

### Create database directory:

```bash
mkdir -p /var/www/oforo-website/data
chmod 755 /var/www/oforo-website/data
```

### Update .env.local on server:

```bash
nano /var/www/oforo-website/.env.local
```

Add these lines (keep existing variables):

```
RESEND_API_KEY=re_your_api_key_here
MICROSOFT_CLIENT_ID=your_client_id_here
MICROSOFT_CLIENT_SECRET=your_secret_value_here
MICROSOFT_REDIRECT_URI=https://oforo.ai/api/todo/microsoft
```

### Build and restart:

```bash
npm run build
pm2 restart oforo-website
```

### Verify it's running:

```bash
pm2 logs oforo-website --lines 20
```

---

## 4. Verify Everything Works

### Auth Flow:
1. Go to `https://oforo.ai/auth`
2. **Sign Up**: Enter email → receive OTP at that email → enter code → set name + password
3. **Sign In**: Enter email → receive OTP → enter code → logged in

### Friends:
1. Create two accounts
2. Search for the other account by email
3. Send a friend request
4. Log into the other account and accept
5. Both should see each other in the friends list

### Microsoft (after Azure setup):
1. Go to settings/integrations
2. Click "Connect Microsoft"
3. Authorize with your Microsoft account
4. Test sending an email and viewing calendar

---

## Summary of What Changed

| Area | Before | After |
|------|--------|-------|
| **Database** | In-memory Map (lost on restart) | SQLite persistent database |
| **Auth** | Password only, broke on PM2 restart | OTP email verification + password |
| **OTP Emails** | None | Sent via Resend from hello@oforo.ai |
| **Friends** | Fake demo bots | Real user connections with requests |
| **Chat Input** | Cluttered with focus mode buttons | Clean: Web toggle + Attach + Send |
| **Model Selector** | Large font with icons | Smaller font, no icons, cleaner |
| **Microsoft** | Basic Tasks only | Email + Calendar + Tasks |

---

## Troubleshooting

**OTP emails not arriving:**
- Check Resend dashboard for delivery status
- Verify domain DNS records are propagated: `dig TXT oforo.ai`
- Check spam folder
- Ensure `RESEND_API_KEY` is set in `.env.local`

**Database errors:**
- Check directory exists: `ls -la /var/www/oforo-website/data/`
- Check permissions: `chmod 755 /var/www/oforo-website/data`
- Check logs: `pm2 logs oforo-website`

**better-sqlite3 build fails:**
- Install build tools: `apt-get install -y build-essential python3`
- Clear node_modules: `rm -rf node_modules && npm install`

**Microsoft OAuth fails:**
- Verify redirect URI matches exactly: `https://oforo.ai/api/todo/microsoft`
- Check all permissions are granted in Azure portal
- Ensure client secret hasn't expired

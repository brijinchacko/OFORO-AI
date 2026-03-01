# Oforo AI — Deployment Guide

## Server: Hostinger VPS (72.62.230.223)
## Domain: oforo.ai (Namecheap)
## Existing site: ladx.ai (must not be affected)

---

## Step 1: Push to GitHub

Run these commands on your local machine (where the code is):

```bash
cd /path/to/oforo-website

# Create the repo on GitHub (requires GitHub CLI)
gh repo create oforo-ai --private --source=. --remote=origin

# Or manually: go to https://github.com/new
#   - Repository name: oforo-ai
#   - Private
#   - Don't initialise with README
# Then:
git remote add origin https://github.com/brijinchacko/oforo-ai.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 2: Namecheap DNS Setup

1. Log in to **Namecheap** → **Domain List** → click **oforo.ai** → **Advanced DNS**
2. Delete any existing A records for `@` and `www`
3. Add these records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | 72.62.230.223 | Automatic |
| A Record | www | 72.62.230.223 | Automatic |

4. If there's a **CNAME** for `www` pointing to something else, delete it first
5. DNS propagation takes 5–30 minutes (sometimes up to 48 hours)

**Verify DNS (from any terminal):**
```bash
dig oforo.ai +short
# Should return: 72.62.230.223
```

---

## Step 3: Server Setup

SSH into your VPS:

```bash
ssh root@72.62.230.223
```

### 3a. Check what's currently running

```bash
# Check Node.js version
node -v

# Check if PM2 is installed and what's running
pm2 list

# Check Nginx config
nginx -t
ls /etc/nginx/sites-enabled/

# Check what's on port 3000 (likely LADX)
ss -tlnp | grep -E '300[0-9]'
```

**Important:** Note which port LADX is using (likely 3000). Oforo will use **port 3001**.

### 3b. Install Node.js 20 (if not already v20+)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # Should show v20.x
```

### 3c. Install PM2 (if not already installed)

```bash
npm install -g pm2
```

---

## Step 4: Clone & Build Oforo

```bash
# Create web directory
sudo mkdir -p /var/www/oforo-website
sudo chown $USER:$USER /var/www/oforo-website

# Clone the repo
cd /var/www
git clone https://github.com/brijinchacko/oforo-ai.git oforo-website
cd oforo-website

# Install dependencies
npm ci --production=false

# Create the production environment file
cp .env.production.example .env.local
```

### 4a. Edit .env.local with your actual values

```bash
nano .env.local
```

Set these values:

```env
# Use the SAME OpenRouter API key as LADX
OPENROUTER_API_KEY=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

# Generate a secure JWT secret
JWT_SECRET=<run: openssl rand -hex 32>

# Production URL
NEXT_PUBLIC_SITE_URL=https://oforo.ai

# Node environment
NODE_ENV=production
```

Generate the JWT secret:
```bash
openssl rand -hex 32
# Copy the output and paste it as JWT_SECRET
```

### 4b. Build the production app

```bash
npm run build
```

This creates the optimised `.next` folder. Should take 1–3 minutes.

### 4c. Test locally on the server

```bash
PORT=3001 npm start
# Visit http://72.62.230.223:3001 in browser to verify
# Ctrl+C to stop
```

---

## Step 5: Start with PM2

```bash
cd /var/www/oforo-website

# Start the app
pm2 start ecosystem.config.js

# Verify it's running
pm2 list
# Should show "oforo-ai" with status "online"

# Check logs
pm2 logs oforo-ai --lines 20

# Save PM2 config so it restarts on server reboot
pm2 save
pm2 startup
# Run the command it outputs (if not already done for LADX)
```

**Useful PM2 commands:**
```bash
pm2 restart oforo-ai     # Restart
pm2 stop oforo-ai        # Stop
pm2 logs oforo-ai        # View logs
pm2 monit                # Real-time monitoring
```

---

## Step 6: Nginx Configuration

### 6a. Copy the Nginx config

```bash
sudo cp /var/www/oforo-website/nginx/oforo.ai.conf /etc/nginx/sites-available/oforo.ai
```

### 6b. Get SSL certificate FIRST (before enabling HTTPS config)

```bash
# Install Certbot if not already installed
sudo apt install -y certbot python3-certbot-nginx

# Get SSL cert (DNS must be pointed to this server first!)
sudo certbot certonly --nginx -d oforo.ai -d www.oforo.ai
```

If certbot gives an error because the nginx config references certs that don't exist yet, use standalone mode:

```bash
# Temporarily stop nginx
sudo systemctl stop nginx

# Get cert in standalone mode
sudo certbot certonly --standalone -d oforo.ai -d www.oforo.ai

# Restart nginx
sudo systemctl start nginx
```

### 6c. Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/oforo.ai /etc/nginx/sites-enabled/

# Test the config
sudo nginx -t

# If test passes, reload
sudo nginx -s reload
```

### 6d. Verify LADX is unaffected

```bash
# Check LADX is still running
pm2 list
curl -I https://ladx.ai
```

---

## Step 7: SSL Auto-Renewal

Certbot sets up auto-renewal by default. Verify:

```bash
sudo certbot renew --dry-run
```

---

## Final Verification Checklist

```bash
# 1. Check both apps are running
pm2 list
# Should show: ladx (or similar) AND oforo-ai

# 2. Check Nginx
sudo nginx -t
# Should show: syntax is ok / test is successful

# 3. Test Oforo
curl -I https://oforo.ai
# Should return: HTTP/2 200

# 4. Test LADX is unaffected
curl -I https://ladx.ai
# Should return: HTTP/2 200

# 5. Check SSL
curl -vI https://oforo.ai 2>&1 | grep "SSL certificate"
```

Visit **https://oforo.ai** in your browser — you should see the Oforo AI homepage!

---

## Updating After Code Changes

When you push new code to GitHub:

```bash
ssh root@72.62.230.223
cd /var/www/oforo-website
git pull
npm ci --production=false
npm run build
pm2 restart oforo-ai
```

---

## Troubleshooting

**Port conflict:**
```bash
ss -tlnp | grep 3001
# If something else is on 3001, change the port in ecosystem.config.js
```

**Build fails:**
```bash
# Check Node version (needs 18+)
node -v
# Check memory
free -h
# If low memory, add swap:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**502 Bad Gateway:**
```bash
# Check if the app is running
pm2 list
pm2 logs oforo-ai --lines 50
# Restart if needed
pm2 restart oforo-ai
```

**SSL issues:**
```bash
sudo certbot certificates
# Re-issue if needed:
sudo certbot certonly --nginx -d oforo.ai -d www.oforo.ai
sudo nginx -s reload
```

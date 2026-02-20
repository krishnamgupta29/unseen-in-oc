# 🚀 UNSEEN App Deployment Guide

Complete guide to deploy your UNSEEN app to production.

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub repository: https://github.com/krishnamgupta29/unseen-in-oc
- ✅ Supabase account and project
- ✅ Environment variables ready

---

## 🎯 Recommended Deployment: Vercel (Easiest & Free)

Vercel is the best choice for Next.js apps - it's made by the Next.js team!

### Step 1: Prepare Supabase Database

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Navigate to SQL Editor**
3. **Run the database schema**:
   - Copy content from `supabase-schema.sql`
   - Paste into SQL Editor
   - Click "Run"
   - This creates all tables (users, posts, messages, etc.)

4. **Enable Storage Buckets**:
   - Go to Storage section
   - Create bucket: `avatars` (public)
   - Create bucket: `voice-messages` (public)

5. **Get your credentials** (you already have these):
   ```
   Project URL: https://pddzlalxucwmvlhzeltk.supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**:
   - Search for: `krishnamgupta29/unseen-in-oc`
   - Click "Import"

5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

6. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://pddzlalxucwmvlhzeltk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZHpsYWx4dWN3bXZsaHplbHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDMyNTIsImV4cCI6MjA4NzE3OTI1Mn0.c_kzaUZHvuwjQAynfWDOyDH9lp4VCkzcr5bN2X0iIQM
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

7. **Click "Deploy"**
   - Vercel will build and deploy your app
   - Takes 2-3 minutes
   - You'll get a URL like: `https://unseen-in-oc.vercel.app`

8. **Done!** 🎉
   - Your app is live!
   - Auto-deploys on every git push

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: unseen-in-oc
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add JWT_SECRET

# Deploy to production
vercel --prod
```

---

## 🌐 Alternative Deployment Options

### Option 2: Netlify

1. **Go to Netlify**: https://netlify.com
2. **Sign in** with GitHub
3. **Click "Add new site" → "Import an existing project"**
4. **Connect to GitHub**:
   - Select: `krishnamgupta29/unseen-in-oc`
5. **Configure Build Settings**:
   ```
   Build command: npm run build
   Publish directory: .next
   ```
6. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add the same variables as Vercel
7. **Click "Deploy site"**

### Option 3: Railway

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select**: `krishnamgupta29/unseen-in-oc`
5. **Add Environment Variables** in Settings
6. **Deploy automatically**

### Option 4: Self-Hosted (VPS/Cloud)

#### Requirements:
- Ubuntu/Debian server
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy

#### Steps:

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone repository
git clone https://github.com/krishnamgupta29/unseen-in-oc.git
cd unseen-in-oc

# 5. Create .env.local file
nano .env.local
# Add your environment variables

# 6. Install dependencies
npm install

# 7. Build the app
npm run build

# 8. Start with PM2
pm2 start npm --name "unseen-app" -- start
pm2 save
pm2 startup

# 9. Configure Nginx
sudo nano /etc/nginx/sites-available/unseen

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/unseen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Environment Variables Explained

### Required Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pddzlalxucwmvlhzeltk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Optional: OpenAI for AI Chat (if you want AI features)
OPENAI_API_KEY=sk-...
```

### How to Generate JWT_SECRET:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online
# Visit: https://generate-secret.vercel.app/32
```

---

## ✅ Post-Deployment Checklist

### 1. Test Core Features
- [ ] Visit your deployed URL
- [ ] Test signup (create new account)
- [ ] Test login
- [ ] Create a post
- [ ] Like a post
- [ ] Comment on a post
- [ ] Send a message
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test on desktop

### 2. Verify Database
- [ ] Check Supabase dashboard
- [ ] Verify users table has data
- [ ] Verify posts table has data
- [ ] Check device_tracking table

### 3. Performance Check
- [ ] Run Lighthouse audit
- [ ] Check page load speed
- [ ] Test on slow 3G network
- [ ] Verify images load properly

### 4. Security Check
- [ ] Verify JWT_SECRET is strong
- [ ] Check CORS settings
- [ ] Test authentication flow
- [ ] Verify device limit (3 accounts max)
- [ ] Test auto-ban system (10 reports)

---

## 🎨 Custom Domain Setup

### For Vercel:

1. **Go to your project settings**
2. **Click "Domains"**
3. **Add your domain**: `unseen.app` or `yourdomain.com`
4. **Update DNS records** at your domain registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. **Wait for DNS propagation** (5-30 minutes)
6. **SSL certificate** auto-generated by Vercel

### For Netlify:

1. **Go to Site settings → Domain management**
2. **Add custom domain**
3. **Update DNS records**:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

---

## 📊 Monitoring & Analytics

### Add Analytics (Optional):

1. **Vercel Analytics** (Built-in):
   ```bash
   npm install @vercel/analytics
   ```
   
   Add to `src/app/layout.tsx`:
   ```tsx
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. **Google Analytics**:
   - Get tracking ID from Google Analytics
   - Add to environment variables
   - Install `react-ga4`

3. **Sentry** (Error Tracking):
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```

---

## 🔄 Continuous Deployment

### Automatic Deployment (Vercel/Netlify):

Every time you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Your site automatically rebuilds and deploys! 🎉

### Manual Deployment:

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---

## 🐛 Troubleshooting

### Build Fails:

1. **Check build logs** in Vercel/Netlify dashboard
2. **Common issues**:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

**Fix**:
```bash
# Locally test build
npm run build

# If it works locally, check environment variables on platform
```

### Database Connection Issues:

1. **Verify Supabase URL** is correct
2. **Check anon key** is valid
3. **Ensure database schema** is created
4. **Check Supabase project** is not paused

### App Loads but Features Don't Work:

1. **Open browser console** (F12)
2. **Check for errors**
3. **Verify API routes** are working
4. **Test Supabase connection**:
   ```javascript
   // In browser console
   fetch('/api/auth/me')
     .then(r => r.json())
     .then(console.log)
   ```

---

## 🚀 Performance Optimization

### After Deployment:

1. **Enable Vercel Edge Functions** (automatic)
2. **Enable Image Optimization** (automatic with Next.js)
3. **Add CDN caching**:
   ```javascript
   // next.config.ts
   export default {
     images: {
       domains: ['pddzlalxucwmvlhzeltk.supabase.co'],
     },
   };
   ```

4. **Enable compression** (automatic on Vercel)

---

## 📱 PWA Setup (Optional)

Make your app installable on mobile:

```bash
# Install next-pwa
npm install next-pwa

# Update next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // your config
});
```

Create `public/manifest.json`:
```json
{
  "name": "UNSEEN",
  "short_name": "UNSEEN",
  "description": "Anonymous social platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0f1c",
  "theme_color": "#4a7cc9",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🎯 Quick Start (TL;DR)

**Fastest way to deploy:**

1. Go to https://vercel.com
2. Sign in with GitHub
3. Import `krishnamgupta29/unseen-in-oc`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT_SECRET`
5. Click Deploy
6. Done! 🎉

**Your app will be live in 3 minutes!**

---

## 📞 Support

If you encounter issues:
1. Check build logs
2. Verify environment variables
3. Test locally first: `npm run build && npm start`
4. Check Supabase dashboard for database issues

---

## 🎉 Success!

Once deployed, your UNSEEN app will be:
- ✅ Live on the internet
- ✅ Accessible from any device
- ✅ Auto-deploying on git push
- ✅ SSL secured (HTTPS)
- ✅ Globally distributed (CDN)
- ✅ Mobile optimized
- ✅ Production ready

**Congratulations on deploying your app! 🚀**

---

**Recommended**: Start with Vercel - it's the easiest and free for personal projects!

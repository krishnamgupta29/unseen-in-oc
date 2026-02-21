# 🚀 Deploy UNSEEN App in 5 Minutes

## Easiest Method: Vercel (Recommended)

### Step 1: Setup Supabase Database (2 minutes)

1. **Open Supabase**: https://supabase.com/dashboard
2. **Go to SQL Editor** (left sidebar)
3. **Copy & Paste** the content from `supabase-schema.sql`
4. **Click "Run"** ✅

### Step 2: Deploy to Vercel (3 minutes)

1. **Go to Vercel**: https://vercel.com
2. **Click "Add New Project"**
3. **Import Git Repository**:
   - Sign in with GitHub
   - Select: `krishnamgupta29/unseen-in-oc`
   - Click "Import"

4. **Add Environment Variables**:
   
   Click "Environment Variables" and add these 3 variables:
   
   ```
   Variable 1:
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://pddzlalxucwmvlhzeltk.supabase.co
   
   Variable 2:
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZHpsYWx4dWN3bXZsaHplbHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDMyNTIsImV4cCI6MjA4NzE3OTI1Mn0.c_kzaUZHvuwjQAynfWDOyDH9lp4VCkzcr5bN2X0iIQM
   
   Variable 3:
   Name: JWT_SECRET
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZHpsYWx4dWN3bXZsaHplbHRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTYwMzI1MiwiZXhwIjoyMDg3MTc5MjUyfQ.lpGazp--jR-w-_LmTbg4JY5uFa627pLLZ7HpqlWSpMg
   ```

5. **Click "Deploy"** 🚀

6. **Wait 2-3 minutes** ⏳

7. **Done!** 🎉 Your app is live!

---

## 🎯 Your Live URL

After deployment, you'll get a URL like:
```
https://unseen-in-oc.vercel.app
```

Or with your custom domain:
```
https://yourdomain.com
```

---

## ✅ Test Your Deployment

1. Open your live URL
2. Click "Create Account"
3. Generate a username (dice button)
4. Enter password
5. Click "Join Quietly"
6. Create your first post!

---

## 🔄 Auto-Deploy on Updates

Every time you push to GitHub, Vercel automatically rebuilds and deploys:

```bash
git add .
git commit -m "Update app"
git push origin main
```

Your site updates automatically! 🎉

---

## 📱 Mobile Access

Your app is already mobile-optimized! Just:
1. Open the URL on your phone
2. Works on iPhone, Android, tablets
3. Add to home screen for app-like experience

---

## 🆘 Need Help?

**Build Failed?**
- Check environment variables are correct
- Verify Supabase database schema is created
- Check build logs in Vercel dashboard

**App Loads but Doesn't Work?**
- Open browser console (F12)
- Check for errors
- Verify Supabase connection

**Database Issues?**
- Go to Supabase dashboard
- Check if tables exist
- Verify project is not paused

---

## 🎨 Add Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records at your registrar
5. Wait 5-30 minutes for DNS propagation
6. Done! SSL certificate auto-generated

---

## 🚀 That's It!

Your UNSEEN app is now:
- ✅ Live on the internet
- ✅ Mobile optimized
- ✅ SSL secured (HTTPS)
- ✅ Globally distributed
- ✅ Auto-deploying
- ✅ Production ready

**Enjoy your deployed app! 🎉**

---

## 📚 More Details

For advanced deployment options, see: `DEPLOYMENT_GUIDE.md`

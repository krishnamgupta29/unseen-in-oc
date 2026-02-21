# 🖥️ Running UNSEEN App Locally

## ✅ Your App is Now Running!

### 🌐 Access Your App:
Open your browser and go to:
```
http://localhost:3000
```

---

## 🎯 What's Running:

- **Development Server**: Next.js dev server with hot reload
- **Port**: 3000
- **Environment**: Development mode
- **Database**: Connected to Supabase (cloud)

---

## 🔥 Features Available:

### ✅ Hot Reload
- Edit any file in `src/`
- Changes appear instantly in browser
- No need to restart server

### ✅ Full Backend
- All API routes working
- Supabase database connected
- Authentication system active
- Real-time features ready

### ✅ Mobile Testing
- Open on your phone: `http://YOUR_IP:3000`
- Test responsive design
- Test touch interactions

---

## 🛠️ Development Commands

### Start Development Server
```bash
npm run dev
```
Server runs on: http://localhost:3000

### Build for Production
```bash
npm run build
```
Creates optimized production build

### Start Production Server
```bash
npm run build
npm start
```
Runs production build locally

### Run Linter
```bash
npm run lint
```
Check code quality

---

## 📱 Test on Mobile Device

### Option 1: Same WiFi Network
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   ```

2. On your phone, open browser and go to:
   ```
   http://192.168.1.100:3000
   ```

### Option 2: Use ngrok (Public URL)
```bash
# Install ngrok
npm install -g ngrok

# Create tunnel
ngrok http 3000

# Use the https URL provided
```

---

## 🔍 Development Tools

### Browser DevTools
- Press `F12` to open
- Check Console for errors
- Use Network tab for API calls
- Use React DevTools extension

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier

---

## 📂 Project Structure

```
unseen-main/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes (backend)
│   │   ├── page.tsx      # Main page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── AuthScreen.tsx
│   │   ├── Feed.tsx
│   │   ├── Chat.tsx
│   │   └── ...
│   ├── lib/              # Utilities
│   │   ├── supabase.ts   # Database client
│   │   ├── auth.ts       # Auth helpers
│   │   └── api-client.ts # API client
│   └── context/          # React context
├── public/               # Static files
├── .env.local           # Environment variables
└── package.json         # Dependencies
```

---

## 🐛 Common Issues & Solutions

### Port 3000 Already in Use
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
npm run dev -- -p 3001
```

### Module Not Found Error
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Database Connection Error
1. Check `.env.local` file exists
2. Verify Supabase URL and key are correct
3. Check internet connection
4. Verify Supabase project is active

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 🔄 Making Changes

### Edit Components
1. Open file in `src/components/`
2. Make changes
3. Save file
4. Browser auto-refreshes

### Edit API Routes
1. Open file in `src/app/api/`
2. Make changes
3. Save file
4. API route updates automatically

### Edit Styles
1. Open `src/app/globals.css`
2. Make changes
3. Save file
4. Styles update instantly

---

## 🧪 Testing Features

### Test Authentication
1. Go to http://localhost:3000
2. Click "Create Account"
3. Generate username (dice button)
4. Enter password
5. Click "Join Quietly"

### Test Posts
1. After login, you'll see the feed
2. Click "+" button (bottom nav on mobile)
3. Write a post
4. Click "Share"
5. Post appears in feed

### Test Messages
1. Click Messages tab
2. Select a conversation
3. Type a message
4. Press Enter or click Send

### Test Profile
1. Click Profile tab (bottom nav)
2. View your profile
3. Edit profile (settings icon)
4. Update bio/display name

---

## 📊 Monitor Performance

### Check Build Size
```bash
npm run build
# Shows bundle sizes
```

### Check for Errors
```bash
npm run lint
# Shows code quality issues
```

### Check TypeScript
```bash
npx tsc --noEmit
# Shows type errors
```

---

## 🔐 Environment Variables

Your `.env.local` file contains:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://pddzlalxucwmvlhzeltk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=unseen_jwt_secret_key_change_in_production_2024
```

**Note**: These are already configured and working!

---

## 🚀 Ready for Production?

When you're ready to deploy:
1. See `DEPLOY_NOW.md` for quick deployment
2. See `DEPLOYMENT_GUIDE.md` for detailed guide
3. Push to GitHub: `git push origin main`
4. Deploy to Vercel (auto-deploys)

---

## 💡 Development Tips

### 1. Use React DevTools
- Install React DevTools browser extension
- Inspect component tree
- Check props and state

### 2. Use Console Logs
```javascript
console.log('Debug:', data);
```

### 3. Use Breakpoints
- Open DevTools (F12)
- Go to Sources tab
- Click line number to add breakpoint

### 4. Check Network Requests
- Open DevTools (F12)
- Go to Network tab
- See all API calls

### 5. Test Mobile View
- Open DevTools (F12)
- Click device icon (Ctrl+Shift+M)
- Select device (iPhone, Android)

---

## 📝 Quick Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Install dependencies
npm install

# Add new package
npm install package-name

# Update packages
npm update

# Check for outdated packages
npm outdated
```

---

## 🎨 Customization

### Change Colors
Edit `src/app/globals.css`:
```css
:root {
  --primary: #4a7cc9;  /* Change this */
  --secondary: #3b5ca8; /* And this */
}
```

### Change Fonts
Edit `src/app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font');
```

### Add New Components
1. Create file in `src/components/`
2. Export component
3. Import in page/component

---

## 🆘 Need Help?

### Check Logs
- Terminal shows server logs
- Browser console shows client logs
- Check both for errors

### Common Error Messages

**"Module not found"**
→ Run `npm install`

**"Port already in use"**
→ Kill process or use different port

**"Cannot connect to database"**
→ Check `.env.local` file

**"Build failed"**
→ Check for TypeScript errors

---

## ✨ Your App is Running!

**Local URL**: http://localhost:3000

**Features Working**:
- ✅ Authentication (signup/login)
- ✅ Feed (create, like, comment posts)
- ✅ Messages (send/receive)
- ✅ Profile (view/edit)
- ✅ Explore (discover users)
- ✅ Settings (customize)
- ✅ Mobile responsive
- ✅ Real-time updates

**Happy coding! 🚀**

---

## 🔄 Stop Development Server

To stop the server:
- Press `Ctrl + C` in terminal
- Or close the terminal window

To restart:
```bash
npm run dev
```

# 🚀 QUICK START - klaproth Web Deployment

**TL;DR:** 4 commands to deploy klaproth to Netlify.

---

## ⚡ Fast Track (5 Minutes)

```bash
# 1. Install dependencies (2-3 min)
cd /workspaces/Anamnese-A
npm install --legacy-peer-deps

# 2. Build for web (1-2 min)
npm run build:web

# 3. Test locally (optional)
npx serve build/web
# Open http://localhost:3000 in browser

# 4. Deploy to Netlify (1 min)
npm install -g netlify-cli
netlify login
netlify init  # Site name: klaproth
netlify deploy --prod --dir=build/web
```

**Done!** Your app is live at https://klaproth.netlify.app 🎉

---

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm 9+ installed
- ✅ Git repository pushed to GitHub (optional)
- ✅ Netlify account (free tier OK)

---

## 🎯 Step-by-Step (First Time)

### Step 1: Install Dependencies
```bash
cd /workspaces/Anamnese-A
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
React version mismatch between 18.2.0 and 18.3.1. This is safe.

**Expected Output:**
```
added 1234 packages in 2m
```

### Step 2: Build
```bash
npm run build:web
```

**What happens:**
- ✅ Webpack compiles TypeScript → JavaScript
- ✅ Bundles React Native components for web
- ✅ Optimizes and minifies code
- ✅ Creates `build/web/` directory

**Expected Output:**
```
webpack 5.x compiled successfully in 45s
```

**Build Size:** ~500KB-1MB (gzipped)

### Step 3: Test Locally (Recommended)
```bash
npx serve build/web
```

**Open:** http://localhost:3000

**Check:**
- ✅ App loads without errors
- ✅ Navigation works
- ✅ UI looks correct
- ✅ Browser console has no errors

Press `Ctrl+C` to stop server.

### Step 4: Deploy to Netlify

#### First Time Setup
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify (opens browser)
netlify login

# Initialize site
netlify init
```

**Interactive Prompts:**
```
? What would you like to do? 
  → Create & configure a new site

? Team: 
  → [Your Team]

? Site name (optional): 
  → klaproth

? Your build command: 
  → npm run build:web

? Directory to deploy: 
  → build/web

? Netlify functions folder: 
  → [press enter to skip]
```

#### Deploy
```bash
netlify deploy --prod --dir=build/web
```

**Expected Output:**
```
✔ Deploying to live site URL...
✔ Finished uploading files
✔ Deploy complete!

Live URL: https://klaproth.netlify.app
```

**Done!** 🎉 Visit your live URL.

---

## 🔄 Subsequent Deployments

After first-time setup, deploying is just:

```bash
npm run build:web
netlify deploy --prod --dir=build/web
```

Or use the automation script:
```bash
bash scripts/build-and-deploy.sh
```

---

## 🌐 Alternative: GitHub + Netlify (CI/CD)

**No CLI needed!** Netlify auto-deploys on Git push.

### Setup (One Time)
1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub → Select repo
5. Configure:
   - Branch: `mobile-app-only`
   - Build command: `npm run build:web`
   - Publish directory: `build/web`
6. Click "Deploy site"

### Usage
```bash
git add .
git commit -m "Update app"
git push
```

Netlify auto-builds & deploys! ✨

---

## 🐛 Common Issues

### "npm install fails"
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### "webpack not found"
```bash
npm install --save-dev webpack webpack-cli
```

### "Netlify command not found"
```bash
npm install -g netlify-cli
```

### "Build succeeds but site is blank"
- Check browser console for errors
- Ensure `build/web/index.html` exists
- Verify `netlify.toml` has correct paths

---

## 📊 Verification

After deployment, check:

- [ ] Site loads: https://klaproth.netlify.app
- [ ] HTTPS enabled (🔒 in address bar)
- [ ] No JavaScript errors (F12 → Console)
- [ ] Navigation works
- [ ] Responsive on mobile
- [ ] Language switching works

---

## 📚 More Info

- **Detailed Guide:** [WEB_DEPLOYMENT.md](WEB_DEPLOYMENT.md)
- **Step-by-Step:** [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)
- **Implementation Details:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Technical Log:** [memory_log.md](memory_log.md)

---

## 🆘 Need Help?

### Check These First:
1. [WEB_DEPLOYMENT.md](WEB_DEPLOYMENT.md) - Troubleshooting section
2. Browser console (F12) - Look for errors
3. Netlify deploy logs - Check build output

### Still Stuck?
- Check Netlify docs: https://docs.netlify.com
- React Native Web docs: https://necolas.github.io/react-native-web/

---

## ⏱️ Time Estimates

| Step | First Time | Subsequent |
|------|-----------|-----------|
| Install Dependencies | 2-3 min | - |
| Build | 1-2 min | 1-2 min |
| Local Test | 1 min | 1 min |
| Netlify Setup | 3-5 min | - |
| Deploy | 1-2 min | 30 sec |
| **TOTAL** | **8-13 min** | **2-3 min** |

---

## 🎯 Success Criteria

✅ All green? You're done!

- [ ] `npm install` completed without errors
- [ ] `npm run build:web` created `build/web/` directory
- [ ] Local test shows working app
- [ ] `netlify deploy` succeeded
- [ ] Live URL loads app correctly
- [ ] No errors in browser console

---

**Ready? Run the 4 commands above!** 🚀

---

_Quick Start Guide by Senior Architect Agent_
_Last Updated: 2026-01-31_

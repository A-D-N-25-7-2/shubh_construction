# Quick Deployment Setup (5 Minutes)

## 1️⃣ On Render (Backend)

- Dashboard: https://dashboard.render.com
- Service: `shubh-construction-v8rh`
- Go to **Settings** → **Environment Variables**
- Update variable: `ALLOWED_ORIGINS`
  ```
  http://localhost:3000,http://localhost:5000,https://www.shubhconstructions.com,https://shubhconstructions.com,https://YOUR-VERCEL-DOMAIN.vercel.app
  ```

## 2️⃣ On Vercel (Frontend)

- Dashboard: https://vercel.com/dashboard
- Project: Select your project
- Go to **Settings** → **Environment Variables**
- Add variable: `NEXT_PUBLIC_API_URL`
  - **Development**: `http://localhost:5000`
  - **Preview**: `https://shubh-construction-v8rh.onrender.com`
  - **Production**: `https://shubh-construction-v8rh.onrender.com`

## 3️⃣ Deploy

```bash
# Push your code (files already updated locally)
git add .
git commit -m "Production deployment ready with env variables"
git push
```

## 4️⃣ Test

Visit your production site → Careers → Try submitting an application

- Should NOT show CORS error
- Should receive email at HR inbox

---

## Your Vercel URL

**You'll get something like**: `https://shubh-construction-xxxxx.vercel.app`

**Use this in Render's ALLOWED_ORIGINS** ↑

## Files Modified

✅ `backend/server.js` - CORS configuration updated  
✅ `backend/.env` - ALLOWED_ORIGINS added  
✅ `frontend/app/careers/page.tsx` - Uses env variable  
✅ `frontend/.env.local` - Development setup  
✅ `frontend/.env.production` - Production setup

---

## Troubleshooting

**Still getting CORS error?**

1. Make sure Render domain is in ALLOWED_ORIGINS (Render settings)
2. Hard refresh browser (Ctrl+Shift+R)
3. Wait 1-2 minutes for Render to restart

**API URL showing as undefined?**

1. Redeploy in Vercel (Deployments → Redeploy Latest)
2. Clear browser cache
3. Check that variable name is exactly `NEXT_PUBLIC_API_URL`

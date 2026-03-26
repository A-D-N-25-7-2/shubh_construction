# Production Deployment Guide

## Overview

- **Frontend**: Deployed on Vercel (https://www.shubhconstructions.com)
- **Backend**: Deployed on Render (https://shubh-construction-v8rh.onrender.com)

## Issues Fixed

### ✅ 1. CORS Error (Fixed)

**Problem**: Frontend couldn't access backend API due to missing CORS headers
**Solution**: Updated backend to support environment-based CORS configuration

### ✅ 2. Hardcoded API URLs (Fixed)

**Problem**: Frontend had hardcoded backend URL, not flexible for different environments
**Solution**: Updated to use `NEXT_PUBLIC_API_URL` environment variable

### ✅ 3. Backend Configuration (Fixed)

**Problem**: Backend CORS origin wasn't using environment variables
**Solution**: Updated to read `ALLOWED_ORIGINS` from environment

---

## Environment Variables Setup

### Backend (Render)

#### Step 1: Set Environment Variables on Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service (`shubh-construction-v8rh`)
3. Go to **Settings** → **Environment**
4. Add the following environment variable:

| Variable Name       | Value                                                                                                                                              | Description                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `ALLOWED_ORIGINS`   | `http://localhost:3000,http://localhost:5000,https://www.shubhconstructions.com,https://shubhconstructions.com,https://YOUR-VERCEL-URL.vercel.app` | Comma-separated list of allowed frontend URLs |
| `PORT`              | `5000`                                                                                                                                             | Server port                                   |
| `MJ_APIKEY_PUBLIC`  | `e663184a357a6393707724ebb12dffc4`                                                                                                                 | Mailjet public key (already set)              |
| `MJ_APIKEY_PRIVATE` | `f65bf312be645c47c28069ae6d8acb3d`                                                                                                                 | Mailjet private key (already set)             |
| `MJ_SENDER_EMAIL`   | `xdave053@gmail.com`                                                                                                                               | Sender email (already set)                    |
| `RECEIVER_EMAIL`    | `j.talpada@shubhconstructions.com`                                                                                                                 | HR email (already set)                        |

**Important**: Replace `YOUR-VERCEL-URL` with your actual Vercel deployment URL

#### Step 2: Update Local .env File (for development)

File: `backend/.env`

```
PORT=5000
MJ_APIKEY_PUBLIC=e663184a357a6393707724ebb12dffc4
MJ_APIKEY_PRIVATE=f65bf312be645c47c28069ae6d8acb3d
MJ_SENDER_EMAIL=xdave053@gmail.com
RECEIVER_EMAIL=j.talpada@shubhconstructions.com
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000,https://www.shubhconstructions.com,https://shubhconstructions.com,https://YOUR-VERCEL-URL.vercel.app
```

---

### Frontend (Vercel)

#### Step 1: Set Environment Variables on Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`shubh-construction` or similar)
3. Go to **Settings** → **Environment Variables**
4. Add the following environment variable:

| Variable Name                     | Development                | Preview                                        | Production                                     |
| --------------------------------- | -------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_API_URL`             | `http://localhost:5000`    | `https://shubh-construction-v8rh.onrender.com` | `https://shubh-construction-v8rh.onrender.com` |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID`  | (Your EmailJS Service ID)  | (Your EmailJS Service ID)                      | (Your EmailJS Service ID)                      |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | (Your EmailJS Template ID) | (Your EmailJS Template ID)                     | (Your EmailJS Template ID)                     |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`  | (Your EmailJS Public Key)  | (Your EmailJS Public Key)                      | (Your EmailJS Public Key)                      |

**How to add in Vercel**:

- For each variable, enter the name (e.g., `NEXT_PUBLIC_API_URL`)
- Choose which environments it applies to (Development, Preview, Production)
- Enter the value for each environment
- Click "Save"

#### Step 2: Local Development Environment Files

Already created for you:

**File: `frontend/.env.local` (Development)**

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**File: `frontend/.env.production` (Production)**

```
NEXT_PUBLIC_API_URL=https://shubh-construction-v8rh.onrender.com
```

#### Step 3: Deploy to Vercel

```bash
cd frontend
git add .
git commit -m "Production deployment ready with environment variables"
git push
```

Vercel will automatically deploy when you push to the main branch.

---

## How to Find Your Vercel URL

After deploying to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Look at the main URL (e.g., `https://shubh-construction-36ox-git-main-devs-projects-2cb83b69.vercel.app`)
4. Add this URL (removing `/api/...` part) to backend's `ALLOWED_ORIGINS`

---

## Deployment Checklist

### Before Deploying Backend to Render:

- [ ] Update `ALLOWED_ORIGINS` environment variable with all frontend URLs
- [ ] Verify Mailjet credentials are set in environment
- [ ] Test locally with `npm start` or `npm run dev`

### Before Deploying Frontend to Vercel:

- [ ] Ensure `NEXT_PUBLIC_API_URL` is set in Vercel environment variables
- [ ] Confirm EmailJS credentials are configured in Vercel
- [ ] Test locally with `npm run dev`
- [ ] Run build test: `npm run build`

### After Deployment:

- [ ] Test the job application form on your production site
- [ ] Verify emails are being sent to the HR email
- [ ] Check browser console for CORS errors
- [ ] Monitor Render and Vercel logs for any issues

---

## Testing the Integration

### Local Testing

1. Start backend:

   ```bash
   cd backend
   npm start
   ```

2. Start frontend (in another terminal):

   ```bash
   cd frontend
   npm run dev
   ```

3. Go to http://localhost:3000 → Careers → Submit an application
4. Check console for no CORS errors

### Production Testing

1. Visit https://www.shubhconstructions.com
2. Go to Careers page
3. Submit a test application
4. Verify no CORS errors in browser console
5. Verify email was received at the HR email address

---

## Common Issues & Fixes

### Issue: "CORS blocked request from origin"

**Solutions**:

- [ ] Verify frontend URL is in `ALLOWED_ORIGINS` on Render
- [ ] Check for typos in the URL
- [ ] Ensure trailing slashes are consistent (or don't include them)

### Issue: API response shows "Failed to send application"

**Solutions**:

- [ ] Check backend logs on Render console
- [ ] Verify Mailjet credentials are correct
- [ ] Check that resume file is being uploaded (< 5MB)

### Issue: Environment variables not loading in Vercel

**Solutions**:

- [ ] Variables must start with `NEXT_PUBLIC_` to be visible in frontend
- [ ] Redeploy after adding variables: Vercel → Deployments → Redeploy Latest
- [ ] Clear browser cache and hard refresh

### Issue: `.env` files not uploading to git

**Solutions**:

- [ ] `.env` files should NOT be committed (they contain secrets)
- [ ] `.env.local` and `.env.production` need to be in git for reference
- [ ] Secrets should ONLY be added via platform dashboards (Vercel/Render)

---

## Security Notes

### ✅ Good Practices Implemented:

- Environment variables are used instead of hardcoded URLs
- Sensitive keys (Mailjet credentials) are kept out of git
- CORS is properly configured to only allow trusted origins
- Frontend uses `NEXT_PUBLIC_` prefix for public variables

### ⚠️ Additional Security Considerations:

1. **Never commit `.env` files with secrets** - Use `.gitignore`
2. **Rotate Mailjet keys periodically** - Go to Mailjet account settings
3. **Monitor API logs** - Check for suspicious requests in Render logs
4. **Add rate limiting** - Consider adding rate limiting to prevent abuse
5. **Validate all form inputs** - Both frontend and backend currently validate

---

## File Changes Summary

1. **backend/server.js** - Updated CORS to use environment variable
2. **backend/.env** - Added `ALLOWED_ORIGINS` configuration
3. **frontend/app/careers/page.tsx** - Updated to use `NEXT_PUBLIC_API_URL`
4. **frontend/.env.local** - Created for development
5. **frontend/.env.production** - Created for production

---

## Next Steps

1. Update `ALLOWED_ORIGINS` in Render with your Vercel URL
2. Update `NEXT_PUBLIC_API_URL` in Vercel environment variables
3. Deploy backend: Push to Render (it auto-deploys)
4. Deploy frontend: Push to Vercel (it auto-deploys)
5. Test the complete flow end-to-end

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs/concepts/projects/environment-variables
- **Render Docs**: https://render.com/docs/environment-variables
- **CORS Guide**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Environment Variables Best Practices**: https://12factor.net/config

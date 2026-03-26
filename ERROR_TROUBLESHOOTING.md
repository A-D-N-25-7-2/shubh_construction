# 500 Error Troubleshooting Guide

## What Causes a 500 Error?
The 500 error from the job application endpoint usually means:
- **Mailjet API credentials are invalid or missing**
- **Environment variables are not properly set on Render**
- **Mailjet account has reached API call limits**
- **Email service is experiencing outages**

## Quick Fix Checklist

### Step 1: Verify Render Environment Variables ✅
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service (`shubh-construction-v8rh`)
3. Go to **Settings** → **Environment**
4. Verify these variables are set:
   - `MJ_APIKEY_PUBLIC` (starts with letters/numbers)
   - `MJ_APIKEY_PRIVATE` (starts with letters/numbers)
   - `MJ_SENDER_EMAIL` (valid email format)
   - `RECEIVER_EMAIL` (valid email format)
   - `ALLOWED_ORIGINS` (comma-separated URLs)

**If missing:** Add them and **redeploy**

### Step 2: Check Mailjet Credentials
1. Visit [Mailjet Account Settings](https://app.mailjet.com/account/settings)
2. Go to **Account** → **API Keys**
3. Verify that your API keys are **active** and **not suspended**
4. Copy the correct **Public Key** and **Secret Key**
5. Update them in Render environment variables

### Step 3: Redeploy on Render
1. After updating environment variables:
   - Go to **Deployments**
   - Click **Redeploy Latest**
   - Wait for it to complete (check the "Recent Deploys" log)
2. Backend should now have the new environment variables loaded

### Step 4: Test the Job Application Form
1. Visit your production site
2. Go to Careers page
3. Fill out the form and submit
4. Check browser console for any errors (F12)

## Advanced Debugging

### Check Render Logs
1. Go to Render Dashboard → Your Service → **Logs**
2. Look for error messages like:
   - `❌ Missing required environment variable`
   - `❌ Failed to send HR email`
   - `❌ Mailjet credentials not configured`

### Check Mailjet Status
- Visit [Mailjet Status Page](https://status.mailjet.com/)
- Verify service is operational
- Check if your account has enough API credits

### Test Locally First
```bash
# Start backend locally with proper env vars
cd backend

# Create a test .env file with valid Mailjet credentials
# Then run:
npm start

# Test in another terminal:
curl -X POST http://localhost:5000/api/job-application
```

## Common Error Messages & Solutions

### "Email service not configured"
**Cause:** Mailjet environment variables are missing on Render  
**Fix:**
1. Add all Mailjet variables to Render environment
2. Redeploy the service
3. Wait 2-3 minutes for changes to take effect

### "Failed to send HR notification: Invalid API key"
**Cause:** Mailjet API keys are incorrect  
**Fix:**
1. Double-check API keys from [Mailjet Settings](https://app.mailjet.com/account/settings)
2. Ensure no extra spaces before/after the key
3. Update in Render and redeploy

### "Invalid recipient"
**Cause:** `RECEIVER_EMAIL` is not in correct format  
**Fix:**
1. Verify email format: `example@domain.com`
2. Update in Render environment variables
3. Redeploy

### "API request failed"
**Cause:** Network issue or Mailjet service down  
**Fix:**
1. Check [Mailjet Status](https://status.mailjet.com/)
2. Wait a few minutes and retry
3. Check internet connectivity

## Verification Steps After Fix

✅ **Can you see "✅ All Mailjet environment variables are configured" in Render logs?**
- If yes: Environment variables are correctly set
- If no: Re-check all variables in Render settings

✅ **Can you see "✅ HR email sent successfully" in logs after form submission?**
- If yes: Application is working correctly
- If no: Mailjet API is rejecting requests (check credentials)

✅ **Did you receive an email in your HR inbox?**
- If yes: Everything is working!
- If no: Check RECEIVER_EMAIL is correct and not in spam folder

## Contact Support

If issues persist:
1. **Mailjet Help:** [support.mailjet.com](https://support.mailjet.com)
2. **Render Help:** [render.com/docs](https://render.com/docs)
3. Check error logs and note the exact error message

---

## File Changes Made
- Enhanced error handling in `backend/server.js`
- Added environment variable validation
- Added detailed logging for debugging
- Improved error messages to user

Redeploy to Render after reviewing the code changes!

# Resend Email Service Setup Guide

## Overview
Your application has been migrated from **Mailjet** to **Resend** for sending emails. Resend is a modern email API service that's designed for developers.

## Step 1: Get Your Resend API Key

1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Sign up for a free account (if you don't have one)
3. Go to **API Keys** section
4. Create a new API key
5. Copy the API key (starts with `re_`)

## Step 2: Configure Resend Domain

### For Development (Testing)
Resend provides a test email address. You can send emails from `onboarding@resend.dev` for testing purposes.

### For Production (Real Emails)
1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Click **Domains**
3. Click **Add Domain**
4. Enter your domain (e.g., `mail.shubhconstructions.com` or use a subdomain)
5. Add the DNS records that Resend provides
   - TXT record for DKIM
   - MX record (optional)
   - Follow the verification steps
6. Once verified, use this domain for `SENDER_EMAIL`

## Step 3: Update Local Environment Variables

Update `backend/.env`:

```env
PORT=5000

# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
SENDER_EMAIL=onboarding@resend.dev
RECEIVER_EMAIL=j.talpada@shubhconstructions.com

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000,https://www.shubhconstructions.com,https://shubhconstructions.com,https://your-vercel-domain.vercel.app
```

**Important Notes:**
- Replace `re_your_api_key_here` with your actual API key from Resend
- For development: Use `onboarding@resend.dev` as `SENDER_EMAIL`
- For production: Use your verified domain (e.g., `noreply@yourdomain.com`)

## Step 4: Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Go to **Settings** → **Environment Variables**
4. Update these variables:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | `re_your_api_key_from_resend` |
| `SENDER_EMAIL` | `noreply@yourdomain.com` (or `onboarding@resend.dev` for testing) |
| `RECEIVER_EMAIL` | `j.talpada@shubhconstructions.com` |
| `ALLOWED_ORIGINS` | Same as backend/.env |

5. **Redeploy** the service after updating

## Step 5: Test the Integration

### Local Testing
```bash
cd backend
npm start
```

1. Go to `http://localhost:3000` → Careers page
2. Fill out the form and submit
3. Check console for logs like:
   - `✅ HR email sent successfully for: applicant@email.com`
   - `✅ Auto-reply email sent to: applicant@email.com`

### Production Testing
1. Visit `https://www.shubhconstructions.com`
2. Go to Careers page
3. Submit a test application
4. Check your HR inbox for the email

## Resend Features

### Free Tier Includes:
- ✅ 100 emails/day
- ✅ Excellent deliverability
- ✅ Real-time tracking (paid feature)
- ✅ Beautiful email templates
- ✅ Webhook support

### Benefits over Mailjet:
- ✅ Simpler API (easier to use)
- ✅ Better documentation for developers
- ✅ No SMTP configuration needed
- ✅ SDK-based approach (resend package)
- ✅ Better error messages
- ✅ Native attachment support without Base64 conversion

## Common Issues & Solutions

### Issue: "Invalid API Key"
**Solution:**
- Verify the API key starts with `re_`
- Check for extra spaces in the key
- Generate a new key if needed
- Update in Render and redeploy

### Issue: "Invalid recipient"
**Solution:**
- Use valid email addresses
- For testing, use `onboarding@resend.dev` as sender
- For production, verify your domain in Resend

### Issue: "Domain not verified"
**Solution:**
- If using a custom domain, verify it in Resend dashboard
- Add all DNS records (DKIM, MX if needed)
- Wait 15-30 minutes for DNS propagation
- Use `onboarding@resend.dev` for testing

### Issue: "Email not received"
**Solution:**
- Check spam/junk folder
- Verify recipient email is correct
- Check Resend dashboard for failed deliveries
- Review email content for spam triggers

## Verification in Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Click **Emails** to see sent emails
3. View delivery status, open rate, click rate
4. Check for any bounces or errors

## Environment Variables Summary

**Development (.env file):**
```
RESEND_API_KEY=re_your_test_key
SENDER_EMAIL=onboarding@resend.dev
```

**Production (Render):**
```
RESEND_API_KEY=re_your_production_key
SENDER_EMAIL=noreply@yourdomain.com
```

## Useful Links

- **Resend Documentation:** https://resend.com/docs
- **Resend Dashboard:** https://resend.com/dashboard
- **Resend API Reference:** https://resend.com/docs/api-reference
- **SDK Guide:** https://resend.com/docs/send-email

## Migration Summary

✅ Removed Mailjet (node-mailjet package)
✅ Added Resend (resend package)
✅ Updated backend/server.js with Resend API calls
✅ Simplified environment configuration
✅ Improved error handling
✅ Better email formatting

## Next Steps

1. ✅ Get API key from Resend
2. ✅ Update local `.env` file
3. ✅ Test locally
4. ✅ Update Render environment variables
5. ✅ Redeploy backend
6. ✅ Test in production
7. ✅ Monitor emails in Resend dashboard

# PocketBase Setup Guide

## Running PocketBase

The backend now uses PocketBase instead of a custom Node server.

```bash
cd /Users/mikelast/Desktop/class123-clone
pocketbase serve --http=127.0.0.1:4002
```

## Initial Setup

1. Access the admin dashboard: http://127.0.0.1:4002/_/
2. Create your superuser account when prompted

## Email Configuration

PocketBase needs SMTP credentials to send verification emails.

### Configure via Admin Dashboard

1. Go to Settings > Mail Settings
2. Add your SMTP credentials:
   - **SMTP Host**: smtp.gmail.com (or your provider)
   - **SMTP Port**: 587
   - **SMTP Username**: your-email@gmail.com
   - **SMTP Password**: your-app-password (use App Password, not regular password)
   - **From Email**: noreply@yourdomain.com

### For Gmail:
1. Enable 2FA on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use that app password in SMTP Password field

### Alternative: Use Ethereal (Test Email Service)

For testing without real email:
1. Visit: https://ethereal.email/
2. Create a free test account
3. Add those SMTP credentials to PocketBase
4. Verification emails will be logged (not actually sent)

## Collections

PocketBase automatically creates these collections:

- **users** (auth collection): Handles user registration, login, and email verification
- **behaviors**: Stores classroom behavior types (positive/negative)
- **classes**: Stores classroom data with students and tasks

## How Email Verification Works

1. User signs up → PocketBase creates user with `emailVerified: false`
2. Verification email is sent to their inbox
3. User clicks the link in email
4. Email is verified and they can log in

## API Endpoints Used

- `POST /api/collections/users/records` - Register
- `POST /api/collections/users/auth-with-password` - Login
- `POST /api/collections/users/request-verification` - Request verification email
- `POST /api/collections/users/confirm-verification` - Confirm verification link

## Troubleshooting

### Emails not sending
- Check Settings > Mail Settings in admin dashboard
- Verify SMTP credentials are correct
- Check "test emails" feature in PocketBase admin

### Users can't login after signup
- They need to click the verification link in their email first
- Check spam folder
- Use resend verification option

### Collections not created
- Collections are created automatically by the API
- Check admin dashboard > Collections tab
- Delete and recreate if issues occur

## Production Deployment

For production, set environment variables:
```bash
POCKETBASE_SMTP_HOST=smtp.gmail.com
POCKETBASE_SMTP_PORT=587
POCKETBASE_SMTP_USERNAME=your-email@gmail.com
POCKETBASE_SMTP_PASSWORD=your-app-password
POCKETBASE_SMTP_FROM=noreply@yourdomain.com
```

Or configure via admin dashboard (persistent storage in database).

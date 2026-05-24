# README.md

# Physio मंत्र - Deployment Checklist

## Quick Deploy to Netlify

1. **Drag and drop**: Simply drag the entire `physio-mantra` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect via Git: Push to GitHub/GitLab and import to Netlify

## Environment Variables (Set in Netlify Dashboard)

Go to Site settings → Build & deploy → Environment → Edit variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin operations) | Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for notifications | No |
| `TELEGRAM_CHAT_ID` | Telegram chat ID for notifications | No |
| `RESEND_API_KEY` | Resend API key for email notifications | No |
| `ADMIN_EMAIL` | Email address to receive notifications | No |

## Update Supabase Configuration

1. Create a Supabase project
2. Run this SQL to create the `requests` table:

```sql
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    visit_type TEXT NOT NULL,
    service TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);
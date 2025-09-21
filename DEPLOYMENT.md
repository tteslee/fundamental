# Deployment Instructions

## Vercel Deployment

### Environment Variables Required

Set these environment variables in your Vercel dashboard:

1. **DATABASE_URL**: PostgreSQL connection string
   - Example: `postgresql://username:password@host:port/database`
   - You can use Vercel Postgres, Supabase, or any PostgreSQL provider

2. **OPENAI_API_KEY**: Your OpenAI API key
   - Get from: https://platform.openai.com/api-keys

3. **NEXTAUTH_URL**: Your production URL
   - Example: `https://your-app.vercel.app`

4. **NEXTAUTH_SECRET**: Random secret for NextAuth
   - Generate with: `openssl rand -base64 32`

### Database Setup

1. Create a PostgreSQL database (Vercel Postgres, Supabase, etc.)
2. Set the `DATABASE_URL` environment variable
3. Run database migrations: `npx prisma db push`

### Build Process

The app is configured to:
- Generate Prisma client during build
- Use PostgreSQL for production
- Use SQLite for local development

### Local Development

1. Copy `.env.local` and add your variables
2. Run `npm install`
3. Run `npx prisma generate`
4. Run `npm run dev`

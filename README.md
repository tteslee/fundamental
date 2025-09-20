# Fundamental App

Empowering people to set core habits for a healthier life.

## Overview

Fundamental is a health tracking application that helps users record and visualize their daily habits including sleep, food intake, and medication. The app provides insights into patterns that impact well-being and offers AI-powered analysis of personal records.

## Features

### MVP Features
- **Korean-first UI** with English terms for sleep, food, and medication
- **User profile and registration** (private space for records)
- **Record tracking** for sleep, food, and medication with time/duration
- **Visualization** of records in daily and weekly views
- **Edit/delete functionality** for existing records
- **LLM integration** for AI-powered analysis and advice
- **Export functionality** (CSV and PDF)

### UI Components
- **Weekly View**: Main home screen with vertical timeline visualization
- **Add Record Modal**: Bottom sheet for adding new records
- **Time Selector**: Horizontal time ruler for precise time selection
- **Date Selector**: Month and day picker with scrollable selectors
- **Memo Input**: Text input for additional notes

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui + Radix primitives
- **State**: Server Components + React Query
- **Forms**: React Hook Form + Zod validation
- **Auth**: NextAuth.js (Credentials + OAuth)
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **LLM**: OpenAI API
- **Exports**: papaparse (CSV), pdf-lib (PDF)
- **i18n**: next-intl (Korean-first)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Color Scheme

- **Sleep**: #565DFF (Blue)
- **Food**: #F3411A (Red)
- **Medication**: #0A9D3C (Green)

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## Development Status

This is a working prototype/MVP with the core UI components implemented. The application currently uses mock data and includes:

- ✅ Weekly timeline visualization
- ✅ Add record modal with multi-step flow
- ✅ Time and date selection
- ✅ Memo input functionality
- ✅ Basic record management

## Next Steps

- [ ] Database setup with Prisma and Supabase
- [ ] Authentication implementation
- [ ] AI review feature
- [ ] Export functionality
- [ ] Edit/delete record functionality
- [ ] Internationalization setup

# Fundamental - Daily Habit Tracking App

A modern, mobile-first web application for tracking core daily habits including sleep, meals, and medication. Built with Next.js 15, TypeScript, and Tailwind CSS.

## 🎯 Features

### Core Functionality
- **Sleep Tracking**: Record sleep duration with start and end times
- **Food Logging**: Track meal times and add memos
- **Medication Reminders**: Log medication intake with timestamps
- **Timeline Views**: Weekly and daily visualizations of your habits
- **AI Review**: Get insights and recommendations (mock implementation)
- **Data Export**: Export your data as CSV or PDF (mock implementation)

### User Experience
- **Korean-First Design**: Optimized for Korean users with English technical terms
- **Mobile-Optimized**: Touch-friendly interface with swipe gestures
- **Modern UI**: Clean, minimalist design inspired by 20th-century modern graphics
- **Responsive**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instant feedback and smooth animations

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui + Radix** - Accessible UI components
- **React Query** - Data fetching and caching
- **React Hook Form + Zod** - Form handling and validation

### Backend
- **NextAuth.js** - Authentication
- **Prisma ORM** - Database management
- **PostgreSQL** - Primary database (via Supabase)
- **Supabase Storage** - File storage
- **OpenAI API** - AI-powered insights

### Development
- **next-intl** - Internationalization
- **Sentry** - Error monitoring and logging
- **ESLint + Prettier** - Code quality and formatting

## 📱 User Interface

### Weekly View (Default)
- 7-day timeline with hourly grid
- Visual representation of sleep, food, and medication records
- Average sleep time calculation
- Quick access to AI review and export

### Daily View
- Detailed daily timeline
- Individual record management
- Swipe gestures for edit/delete actions

### Record Management
- **Add Records**: Multi-step modal with time, date, and memo selection
- **Edit Records**: Full editing capability with time preservation
- **Delete Records**: Swipe-to-delete functionality
- **Time Selection**: 24-hour range with 15-minute intervals
- **Date Selection**: Korean calendar with month/day pickers

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fundamental-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/fundamental"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   OPENAI_API_KEY="your-openai-key"
   SUPABASE_URL="your-supabase-url"
   SUPABASE_ANON_KEY="your-supabase-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── WeeklyView.tsx     # Weekly timeline view
│   ├── DailyView.tsx      # Daily timeline view
│   ├── AddRecordModal.tsx # Add record flow
│   ├── EditRecordModal.tsx # Edit record flow
│   ├── TimeSelector.tsx   # Time selection component
│   ├── DateSelector.tsx   # Date selection component
│   └── RecordCard.tsx     # Individual record display
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database utilities
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
└── messages/              # Internationalization files
```

## 🎨 Design System

### Colors
- **Sleep**: Purple (#8B5CF6)
- **Food**: Pink (#EC4899) 
- **Medication**: Green (#10B981)

### Typography
- **Font**: Inter (Google Fonts)
- **Korean**: Optimized for Korean text display
- **Hierarchy**: Clear visual hierarchy with consistent spacing

### Components
- **Modals**: Bottom sheet style with rounded corners
- **Buttons**: Rounded with hover states
- **Timeline**: Clean grid with subtle lines
- **Records**: Color-coded with consistent sizing

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured for Next.js and React
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Static site generation
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment

## 📊 Database Schema

### Users
- `id` - Unique identifier
- `email` - User email
- `name` - Display name
- `createdAt` - Account creation date

### Records
- `id` - Unique identifier
- `type` - Record type (sleep, food, medication)
- `startTime` - Start timestamp
- `endTime` - End timestamp (for sleep)
- `duration` - Duration in minutes
- `memo` - Optional notes
- `userId` - Foreign key to user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from 20th-century modern graphic design
- New York City subway design system
- Korean user experience best practices
- Next.js and React community

## 📞 Support

For support, email support@fundamental-app.com or create an issue in the repository.

---

**Fundamental** - Empowering people to set core habits for a healthier life. 🌟
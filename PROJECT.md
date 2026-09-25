# Travel Expense Tracker

A full-stack travel expense tracking application built with React, TypeScript, and Supabase.

## 📋 Project Overview

This application helps travelers track their expenses across multiple trips, organized by categories and currencies.

### Key Features

- ✅ User authentication with email/password
- ✅ Create and manage multiple trips
- ✅ Track expenses with categories
- ✅ Multi-currency support (16+ currencies)
- ✅ Expense summary and analytics
- ✅ Responsive mobile-friendly design
- ✅ Real-time data synchronization
- ✅ Secure with Row-Level Security

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **CSS Modules** - Scoped styling

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Auth.js** - Authentication

## 📁 Project Structure

```
travel-expense-tracker/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   ├── Select.tsx
│   │   ├── TripCard.tsx
│   │   └── ExpenseItem.tsx
│   ├── pages/               # Page components
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── Home.tsx
│   │   ├── CreateTrip.tsx
│   │   ├── TripDetail.tsx
│   │   ├── AddExpense.tsx
│   │   └── EditExpense.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useLocalStorage.ts
│   ├── lib/                 # Utility functions
│   │   ├── auth.ts         # Authentication functions
│   │   ├── trips.ts        # Trip API functions
│   │   ├── expenses.ts     # Expense API functions
│   │   ├── format.ts       # Formatting utilities
│   │   └── supabase.ts     # Supabase client
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx             # Main app component
│   ├── App.css
│   └── main.tsx            # App entry point
├── supabase/
│   ├── functions/          # Supabase Edge Functions
│   ├── migrations/         # travel_expenses schema migrations
│   └── apply-migrations.sh # Schema-specific migration runner
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/davidelib/travel-expense-tracker.git
   cd travel-expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials

4. **Apply database migrations**
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push --linked
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will open at `http://localhost:3000`

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types
- `supabase/apply-migrations.sh` - Apply pending travel_expenses migrations

## 🗄️ Database Schema

### Tables

#### trips
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `destination` (VARCHAR) - Trip destination
- `start_date` (DATE) - Trip start date
- `end_date` (DATE) - Trip end date
- `currency` (VARCHAR) - Currency code (default: USD)
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

#### expenses
- `id` (UUID) - Primary key
- `trip_id` (UUID) - Foreign key to trips
- `user_id` (UUID) - Foreign key to auth.users
- `amount` (DECIMAL) - Expense amount
- `category` (VARCHAR) - Expense category
- `description` (VARCHAR) - Expense description
- `expense_date` (DATE) - Date of expense
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

#### categories
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Category name (unique)
- `created_at` (TIMESTAMP) - Record creation time

### Default Categories
- Accommodation
- Food & Dining
- Transportation
- Entertainment
- Shopping
- Activities
- Other

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Authentication** - Email/password authentication via Supabase Auth
- **Encrypted connections** - All data transmitted over HTTPS
- **SQL Injection Protection** - Parameterized queries using Supabase client

## 💱 Supported Currencies

USD, EUR, GBP, JPY, CHF, CAD, AUD, NZD, INR, IDR, THB, SGD, MYR, PHP, VND, CNY

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop browsers (1200px+)
- Tablets (768px - 1200px)
- Mobile phones (< 768px)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🎯 Future Enhancements

- Currency conversion with real-time exchange rates
- Expense sharing between travelers
- Receipt image upload
- PDF report generation
- Trip templates
- Budget alerts
- Recurring expenses
- Advanced analytics and charts

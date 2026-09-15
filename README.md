# Travel Expense Tracker

A responsive web-based travel expense tracker built with React, TypeScript, and Supabase.

## Features

- 🔐 **Secure Authentication** - Sign up and log in with email and password
- ✈️ **Trip Management** - Create and manage multiple trips
- 💰 **Expense Tracking** - Add, edit, and delete expenses by category
- 📊 **Expense Summary** - View total expenses and breakdown by category
- 🌍 **Multi-Currency Support** - Track expenses in 16 different currencies
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI Components**: Custom built with Lucide React icons

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/davidelib/travel-expense-tracker.git
cd travel-expense-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run migrate
```

4. Start the development server:
```bash
npm run dev
```

The app will open at http://localhost:3000

## Project Structure

```
src/
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and API calls
├── pages/            # Page components
├── types/            # TypeScript types
└── App.tsx           # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run migrate` - Run database migrations

## Database Schema

### Tables

- **trips** - User travel trips
- **expenses** - Trip expenses
- **categories** - Expense categories

### Default Categories

- Accommodation
- Food & Dining
- Transportation
- Entertainment
- Shopping
- Activities
- Other

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own trips and expenses
- All sensitive data is encrypted in transit

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please open an issue on GitHub.

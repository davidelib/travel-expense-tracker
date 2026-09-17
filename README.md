# Travel Expense Tracker

A React + TypeScript web application for tracking travel expenses across multiple trips with multi-currency support.

## Features

- **User Authentication**: Secure sign up and login with Supabase
- **Trip Management**: Create and manage multiple trips with dates and destinations
- **Expense Tracking**: Add, edit, and delete expenses for each trip
- **Category Breakdown**: Organize expenses by category (Accommodation, Food, Transportation, etc.)
- **Multi-Currency Support**: Track expenses in 16+ different currencies
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Database synced with Supabase

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS Modules
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── lib/                # Library functions (auth, API, formatting)
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Environment Variables

Create a `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) and [IPHONE_DEPLOYMENT.md](./IPHONE_DEPLOYMENT.md) for detailed deployment instructions.

## License

MIT

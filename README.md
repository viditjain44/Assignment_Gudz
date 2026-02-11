# TechBook - Technician Booking Platform

A full-stack web application for customers to register, log in, and book technicians online.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **TanStack Router** - File-based routing with type safety
- **TanStack Query** - Data fetching and caching
- **ShadCN UI** - Component library
- **Tailwind CSS** - Styling
- **BetterAuth** - Authentication client

### Backend
- **Node.js** with Express.js
- **TypeScript** - Type safety
- **MongoDB** - Database
- **BetterAuth** - Authentication framework
- **Nodemailer** - Email notifications

## Features

### User Authentication
- Email/password registration and login
- Session management with BetterAuth
- Protected routes
- Password validation (minimum 8 characters)

### Dashboard
- Welcome overview with user stats
- Upcoming bookings display
- Quick actions for booking and viewing history
- Responsive sidebar navigation

### Technician Booking
- Browse available technicians
- Search by name
- Filter by skill and rating
- View technician details (name, skill, rating, bio, hourly rate)
- Select time slots for booking
- Confirmation modal before finalizing
- Email notifications to technicians on booking
- Email confirmations to users

### Booking Management
- View all bookings with status filters
- Cancel confirmed bookings
- View booking details and notes

### Profile Management
- View and edit personal information
- Account status display

## Project Structure

```
Assignment_Gudz/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   ├── controllers/
│   │   │   ├── auth.controllers.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── technician.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── lib/
│   │   │   └── auth.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── models/
│   │   │   ├── Booking.ts
│   │   │   ├── Technician.ts
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   ├── auth.route.ts
│   │   │   ├── booking.route.ts
│   │   │   ├── technician.route.ts
│   │   │   ├── user.route.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── sendEmail.ts
│   │   ├── api.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ui/
    │   ├── lib/
    │   │   ├── api.ts
    │   │   ├── auth-client.ts
    │   │   ├── auth-context.tsx
    │   │   └── utils.ts
    │   ├── routes/
    │   │   ├── _authenticated/
    │   │   │   ├── dashboard.tsx
    │   │   │   ├── technicians.tsx
    │   │   │   ├── bookings.tsx
    │   │   │   └── profile.tsx
    │   │   ├── __root.tsx
    │   │   ├── _authenticated.tsx
    │   │   ├── index.tsx
    │   │   ├── login.tsx
    │   │   └── register.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── vercel.json
```

## API Endpoints

### Authentication (BetterAuth - /api/auth/*)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register new user |
| POST | `/api/auth/sign-in/email` | Login user |
| POST | `/api/auth/sign-out` | Logout user |
| GET | `/api/auth/session` | Get current session |

### Custom Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user (protected) |

### Technicians
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/technicians` | List all technicians |
| GET | `/api/technicians?skill=X&rating=Y&search=Z` | Filter technicians |
| GET | `/api/technicians/:id` | Get single technician |
| POST | `/api/technicians` | Create technician |
| PUT | `/api/technicians/:id` | Update technician |

### Bookings (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/user` | Get user's bookings |
| GET | `/api/bookings/upcoming` | Get upcoming bookings |
| POST | `/api/bookings` | Create booking |
| DELETE | `/api/bookings/:id` | Cancel booking |
| PUT | `/api/bookings/:id/reschedule` | Reschedule booking |

### Users (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |

## Database Schema

### User (BetterAuth managed)
```typescript
{
  id: string
  email: string
  name: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Technician
```typescript
{
  _id: ObjectId
  name: string
  skill: string
  rating: number (1-5)
  email: string
  availability: Date[]
  bio?: string
  hourlyRate?: number
  createdAt: Date
  updatedAt: Date
}
```

### Booking
```typescript
{
  _id: ObjectId
  userId: string
  technician: ObjectId (ref: Technician)
  slot: Date
  status: 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or Atlas)
- Gmail account for email notifications

### Backend Setup

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URI=mongodb+srv://your-connection-string
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:5000
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

4. Start development server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

4. Start development server:
```bash
npm run dev
```

Application runs on `http://localhost:5173`

### Seeding Technicians

To add sample technicians, make POST requests to `/api/technicians`:

```bash
curl -X POST http://localhost:5000/api/technicians \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "skill": "Plumber",
    "email": "john@example.com",
    "rating": 4.8,
    "bio": "10 years experience in residential plumbing",
    "hourlyRate": 50
  }'
```

## Deployment

### Backend (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd Backend
vercel
```

3. Add environment variables in Vercel dashboard

### Frontend (Vercel)

1. Deploy:
```bash
cd frontend
vercel
```

2. Add `VITE_API_URL` environment variable pointing to your backend URL

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Secret for BetterAuth sessions |
| `BETTER_AUTH_URL` | Backend URL |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_PASS` | Gmail app password |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

## Gmail App Password Setup

1. Go to Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in `GMAIL_PASS`

## License

MIT

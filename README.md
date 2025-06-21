# Stub'din - Artist-First Ticketing & Booking Marketplace

> Fair, transparent ticketing and venue booking for artists, venues, and fans. No hidden fees, no middlemen.

## 🎵 Vision

Stub'din is transforming the live music industry by giving artists and independent venues full control over ticketing and booking, eliminating hidden fees and middle-men while delivering a fair, transparent fan experience.

## 🚀 Core Features

### For Artists
- **Event Management**: Create, publish, and manage live events
- **Revenue Control**: Keep more of your ticket sales with transparent ≤7% platform fee
- **Fan Data Ownership**: Own your fan data for future marketing
- **Flexible Resale Rules**: Set your own resale policies to protect your community
- **Venue Discovery**: Connect with venues through the booking marketplace

### For Venues
- **Artist Discovery**: Find and book amazing talent through the marketplace
- **Automated Operations**: Streamlined booking, settlement, and reporting
- **Analytics**: Detailed insights into your venue's performance
- **Revenue Share**: Fair and transparent revenue splits

### For Fans
- **Transparent Pricing**: "What you see is what you pay" - no hidden fees
- **Anti-Bot Protection**: Fair queueing and verified purchases
- **Ethical Resale**: Artist-controlled resale policies
- **Direct Support**: Your money goes directly to artists and venues

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based sessions with bcrypt
- **Payments**: Stripe integration for ticket sales and payouts
- **UI**: Tailwind CSS with Radix UI components
- **Type Safety**: Full TypeScript coverage

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stubdin
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/stubdin"
   
   # Authentication
   AUTH_SECRET="your-auth-secret-key"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # App
   BASE_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate database migrations
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # (Optional) Seed with sample data
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗 Project Structure

```
stubdin/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── page.tsx      # Fan dashboard
│   │       ├── artist/       # Artist-specific pages
│   │       └── venue/        # Venue-specific pages
│   ├── (login)/             # Authentication pages
│   ├── api/                 # API routes
│   │   ├── events/          # Event management
│   │   ├── artist/          # Artist endpoints
│   │   ├── venue/           # Venue endpoints
│   │   └── tickets/         # Ticket operations
│   └── page.tsx             # Landing page
├── components/              # Reusable UI components
├── lib/
│   ├── db/                  # Database schema and queries
│   ├── auth/                # Authentication utilities
│   └── payments/            # Stripe integration
└── README.md
```

## 🎭 User Roles & Flows

### 1. Music Fans
- Sign up and discover events
- Purchase tickets with transparent pricing
- Manage ticket collection
- Transfer/resell tickets (when allowed by artist)

### 2. Artists
- Complete profile setup with stage name, bio, and social links
- Create and manage events
- Set ticket prices and resale policies
- View analytics and revenue
- Receive booking requests from venues

### 3. Venue Owners
- Set up venue profile with capacity and amenities
- Browse and book artists
- Manage event calendar
- Track revenue and analytics

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration with role selection

### Events
- `GET /api/events/upcoming` - Public upcoming events
- `GET /api/artist/events` - Artist's events
- `POST /api/events` - Create new event

### Artist
- `GET /api/artist/profile` - Artist profile
- `GET /api/artist/stats` - Dashboard statistics
- `GET /api/artist/bookings` - Booking requests

### Tickets
- `GET /api/tickets/mine` - User's tickets
- `POST /api/tickets/purchase` - Buy tickets

## 💳 Payment Integration

Stub'din uses Stripe for secure payment processing:

- **Platform Fee**: ≤7% of ticket face value (configurable)
- **Payouts**: Automated to artist and venue Stripe accounts
- **Refunds**: Handled through Stripe with artist approval
- **International**: Multi-currency support planned

## 🚀 Deployment

### Production Setup

1. **Database**: Set up PostgreSQL (recommend Railway, Supabase, or similar)
2. **Environment**: Configure production environment variables
3. **Stripe**: Set up live Stripe account with webhooks
4. **Deploy**: Deploy to Vercel, Railway, or your preferred platform

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="production-secret"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_live_..."
BASE_URL="https://yourdomain.com"
```

## 🔧 Development

### Database Commands
```bash
pnpm db:generate    # Generate migrations from schema changes
pnpm db:migrate     # Apply migrations to database
pnpm db:studio      # Open Drizzle Studio for database inspection
pnpm db:seed        # Seed database with sample data
```

### Development Commands
```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run linting
```

## 🎯 Roadmap

### MVP (Current)
- [x] User authentication with role selection
- [x] Basic artist, venue, and fan dashboards
- [x] Event creation and management
- [ ] Ticket purchasing flow
- [ ] Basic booking marketplace

### Phase 2
- [ ] Mobile check-in app with QR scanning
- [ ] Advanced resale controls
- [ ] Artist payout automation
- [ ] Venue calendar integration

### Phase 3
- [ ] Global expansion (multi-currency, i18n)
- [ ] White-label self-hosting
- [ ] Advanced analytics and reporting
- [ ] Mobile apps (iOS/Android)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to:

- Report bugs
- Suggest new features
- Submit pull requests
- Follow our code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎵 The Mission

Stub'din exists to create a fairer, more transparent live music ecosystem where:
- Artists keep more of their revenue
- Fans pay honest prices
- Venues discover amazing talent
- The community thrives together

Join us in transforming live music! 🎤✨

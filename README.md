# Ylang Guest Vault

Ylang Guest Vault is a luxury guest management app for Ylang Ylang.
It helps your team keep guest data in one place so you can build strong direct relationships.

## What this app can do

- Save full guest profiles (contact details, preferences, VIP, notes)
- Track stay history (arrival, departure, room, source, travel agent, spend)
- Auto-calculate repeat stays, nights, lifetime spend, and VIP flags
- Add guest tags (VIP, honeymoon, family, influencer, returning guest, corporate, anniversary guest)
- Show smart dashboard stats (total guests, repeat %, top countries, monthly arrivals, growth)
- Create and save seasonal templates (Eid, Christmas, New Year, birthday, anniversary)
- Personalize templates with:
  - `{{guest_name}}`
  - `{{villa_name}}`
  - `{{stay_year}}`
- Schedule greetings by email or WhatsApp channel
- Search and filter guests by name, phone, email, nationality, VIP, repeat status
- Export guest reports to CSV, Excel, and PDF
- Secure admin login + protected routes

## Tech stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- ShadCN-style UI components
- Framer Motion
- Supabase (database + backend)
- Vercel-ready deployment

## 1) Setup in simple steps

1. Install packages

```bash
npm install
```

2. Copy env file

```bash
cp .env.example .env.local
```

3. Fill `.env.local`

- Add your Supabase URL and service role key
- Add a long `AUTH_SECRET`
- Add admin users in this format:
  - `email:password:role;email:password:role`

4. Create database tables

- Open Supabase SQL editor
- Run `supabase/schema.sql`

5. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## 2) Required scripts

```bash
npm run build
npm run lint
npm run type-check
```

## 3) Main pages

- `/login` secure admin login
- `/dashboard` smart hospitality dashboard
- `/guests` guest profiles + search/filtering
- `/stays` stay history tracking
- `/templates` message template manager
- `/greetings` seasonal greeting scheduling
- `/reports` export center (CSV/Excel/PDF)

## 4) API routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET, POST /api/guests`
- `GET, POST /api/stays`
- `GET, POST /api/templates`
- `GET, POST /api/greetings`
- `GET /api/dashboard`
- `GET /api/export?format=csv|excel|pdf`

## 5) Security

- JWT cookie-based session
- Protected admin routes via middleware
- Role included in token payload for role-based access expansion
- Secrets loaded from environment variables only

## 6) Deploy to Vercel

1. Push repo to GitHub
2. Import project into Vercel
3. Add all env variables from `.env.example`
4. Deploy

After deploy, your app is live.

# Flex Living Backend API

Express server for the Reviews Dashboard.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and update the MongoDB connection string if needed:
```bash
cp .env.example .env
# Edit .env to point to your MongoDB deployment
```

`.env` (lines 1-2) define:
- `PORT` – server port (default 5000)
- `MONGODB_URI` – MongoDB connection string

3. Make sure MongoDB is running locally or update `MONGODB_URI` in `.env`

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/manager/signin` - Manager sign in
- `POST /api/manager/approve` - Approve/unapprove reviews (requires managerId)
- `GET /api/reviews/hostaway` - Fetch and normalize reviews from Hostaway API
- `POST /api/reviews/approve` - Approve/unapprove reviews (requires managerId)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017/flexliving)

## Database

The application uses MongoDB with Mongoose. On startup, it automatically seeds:
- Manager user: `manager@flexliving.com` / `admin123`
- Super Admin user: `admin@flexliving.com` / `admin123`

### Manual migration / seeding

If you need to re-run the migration (or add the default users) manually:
```bash
cd backend
cp .env.example .env   # if you haven't already; update the Mongo URI inside
npm run seed:users
```
This script reads the MongoDB URI from `.env` (lines 1-2) and ensures the super-admin and manager accounts exist:
- Super Admin: `superadmin@flexliving.com` / `admin123`
- Manager: `manager@flexliving.com` / `admin123`

## User Model

- `name` - User's name
- `email` - User's email (unique)
- `password` - User's password
- `role` - User role: `guest`, `manager`, or `super-admin`

## Build + Run (Option A)

To build the frontend, copy the build into `backend/build`, and start the backend in one command (Windows PowerShell):

```powershell
# from repository root
cd .\backend
npm run build-and-start-local
```

The `build-and-start-local` script will:
- install frontend dependencies and run `npm run build` in `../frontend`
- copy `../frontend/build` into `./backend/build`
- install backend dependencies and run `npm start`

If you prefer manual steps, run:

```powershell
# build frontend
cd .\frontend
npm install
npm run build

# copy into backend
Copy-Item -Recurse -Force .\build ..\backend\build

# start backend
cd ..\backend
npm install
npm start
```


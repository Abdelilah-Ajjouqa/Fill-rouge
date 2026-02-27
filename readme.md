# Fill Rouge — Gym Management Platform

A full-stack gym management application built with **NestJS** (backend) and **Next.js** (frontend).

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Backend  | NestJS, MongoDB (Mongoose), Passport JWT, Multer |
| Frontend | Next.js 16, Tailwind CSS v4, Shadcn/UI        |
| Auth     | JWT (access token), bcrypt password hashing    |

## Project Structure

```
Fill-rouge/
├── backend/          # NestJS API
│   └── src/
│       ├── auth/         # Login, register, JWT strategy, guards
│       ├── users/        # User CRUD (Admin, Coach, Receptionist)
│       ├── activities/   # Activity CRUD with schedule management
│       ├── members/      # Member registration with file uploads
│       └── config/       # MongoDB configuration
├── frontend/         # Next.js App
│   └── src/
│       ├── app/
│       │   ├── login/              # Login page
│       │   └── dashboard/          # Protected dashboard
│       │       ├── users/          # User management (Admin only)
│       │       ├── activities/     # Activity management
│       │       └── members/        # Member management
│       ├── services/       # API client services
│       └── types/          # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

The API runs on `http://localhost:3000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3001`.

### Environment Variables

**Backend** (`.env`):
```
MONGODB_URI=mongodb://localhost:27017/fill-rouge
JWT_SECRET=your-secret-key
```

**Frontend** (`.env`):
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

## Roles & Permissions

| Role          | Capabilities                                               |
| ------------- | ---------------------------------------------------------- |
| Admin         | Full access: manage users, activities, members             |
| Coach         | View assigned activities, view members                     |
| Receptionist  | Register/manage members                                    |
| Member        | View dashboard                                             |

## API Endpoints

### Auth
- `POST /auth/login` — Login with email/password
- `POST /auth/register` — Register new user (Admin only)

### Users
- `GET /users` — List all users (Admin only)
- `GET /users/:id` — Get user by ID
- `PATCH /users/:id` — Update user (Admin only)
- `DELETE /users/:id` — Delete user (Admin only)

### Activities
- `GET /activities` — List activities (filtered by coach if role is Coach)
- `GET /activities/:id` — Get activity by ID
- `POST /activities` — Create activity (Admin only)
- `PATCH /activities/:id` — Update activity (Admin only)
- `DELETE /activities/:id` — Delete activity (Admin only)

### Members
- `GET /members` — List all members
- `GET /members/:id` — Get member by ID
- `POST /members` — Register member with file uploads (Admin/Receptionist)
- `PATCH /members/:id` — Update member (Admin/Receptionist)
- `DELETE /members/:id` — Delete member (Admin/Receptionist)

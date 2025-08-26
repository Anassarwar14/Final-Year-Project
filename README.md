# 🎓 FYP Project

A full-stack web application built with **Next.js**, **React**, **Bun**, **Supabase (Postgres)**, **Prisma**, **Better Auth**, and **Hono**.  
This repository serves as the main codebase for our Final Year Project (FYP).  


## ⚡ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) + [React](https://react.dev)  
- **Runtime**: [Bun](https://bun.sh) (✨ 4x faster, lighter alternative to Node.js, with built-in bundler, test runner, and Node.js-compatible package manager)  
- **API Framework (backend)**: [Hono](https://hono.dev) (🔥 ultra-fast, minimal framework — preferred over Express for performance & edge readiness)  
- **Database**: [Supabase (PostgreSQL)](https://supabase.com)  
- **ORM**: [Prisma](https://www.prisma.io)  
- **Authentication**: [Better Auth](https://better-auth.com)  
- **Language**: TypeScript  

## 🛠️ Project Setup

Clone the project and install Bun (if not already installed)
```bash
git clone https://github.com/Anassarwar14/Final-Year-Project.git
cd Final Year Project

npm install -g bun
bun install
```

### Configure Environment Variables

Create a .env file in the project root and add:
```bash
DATABASE_URL=                # Main database connection
DIRECT_URL=                  # Direct connection to the database (used for migrations)
BETTER_AUTH_SECRET=          # Secret key for Better Auth
BETTER_AUTH_URL=http://localhost:3000   # Auth server URL

NEXT_PUBLIC_API_URL=http://localhost:3000   # Public API URL for the frontend
```
### Setup Prisma

From the server/ directory, run:
```bash
cd server
bunx prisma generate      # Generate Prisma Client
bunx prisma migrate dev   # Apply existing migrations
```

> Only the schema owner creates new migrations using:
> ```bash
> bunx prisma migrate dev --name <migration-name>
> ```
### Start Development Server

From the project root:
```bash
bun dev
```
## 👥 Team Workflow

To ensure smooth collaboration, we follow a branching and pull request (PR) workflow:

### 1. Main Branch Protection

- main is always kept stable.

- Direct commits to main are not allowed.

- All changes must go through pull requests.

### 2. Feature Branches

Each developer works on a dedicated branch for their task/feature.

Branch naming convention:
```bash
feature/<feature-name>
fix/<bug-description>
chore/<maintenance-task>
```
Example: `feature/user-auth`, `fix/login-bug`, `chore/update-deps`
### 3. Pull Requests

Once a feature is ready, create a PR into main.

At least one teammate must review and approve before merging.

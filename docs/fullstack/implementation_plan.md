# Fullstack Migration Plan (Docker + Prisma + PostgreSQL)

## Goal
Migrate the data persistence layer from `localStorage` to a PostgreSQL database running in Docker. Ensure seamless integration with Next.js using Server Actions and Prisma ORM.

## User Review Required
- **Authentication Strategy**: Currently, we will use an **Anonymous ID** (stored in cookies/localStorage) to link stamps to a user without requiring explicit login/password. This maintains the "easy start" experience while preparing for real auth later.

## Proposed Changes

### Environment
#### [NEW] [docker-compose.yml](file:///Users/admin/Desktop/DEV/stamp-working/docker-compose.yml)
- Define PostgreSQL service.
- Persist data to a local volume.

#### [NEW] [schema.prisma](file:///Users/admin/Desktop/DEV/stamp-working/prisma/schema.prisma)
- Define `Stamp` model:
  - `id`: Int/String (PK)
  - `userId`: String (to link to the anonymous user)
  - `date`: DateTime/String (The stamped date)
  - `createdAt`: DateTime

### Backend (Server Actions)
#### [NEW] `src/lib/db.ts`
- Singleton instance of PrismaClient to prevent connection exhaustion in dev.

#### [NEW] `src/actions/stamp.ts`
- `getStamps(userId: string)`: Fetch all stamps for a user.
- `toggleStamp(userId: string, date: string)`: Add or remove a stamp.

### Frontend
#### [MODIFY] `src/context/ExerciseContext.tsx`
- Replace `localStorage` logic with calls to `getStamps` and `toggleStamp`.
- Generate/retrieve `userId` on mount (if keeping anonymous) to pass to actions.

## Verification Plan
1. **Docker check**: Ensure `docker-compose up` starts DB successfully.
2. **Prisma check**: `prisma studio` or querying DB allows seeing data.
3. **UI check**: Toggling stamps updates the UI and persists after refresh.
4. **Persistence check**: Verify data exists in DB even after closing browser/clearing partial cache (as long as userId persists).

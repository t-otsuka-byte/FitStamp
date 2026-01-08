# Fullstack Migration Task List

- [/] Environment Setup <!-- id: 1 -->
    - [x] Create `docker-compose.yml` for PostgreSQL <!-- id: 2 -->
    - [x] Configure `.env` variables <!-- id: 3 -->
    - [x] Initialize Prisma (`npx prisma init`) <!-- id: 4 -->
- [/] Database Schema & Migration <!-- id: 5 -->
    - [x] Define `Stamp` model in `schema.prisma` <!-- id: 6 -->
    - [x] Run initial migration <!-- id: 7 -->
- [/] Backend Implementation (Server Actions) <!-- id: 8 -->
    - [x] Create `src/lib/db.ts` (Prisma Client singleton) <!-- id: 9 -->
    - [/] Create `src/actions/stamp.ts` (Server Actions for getting/toggling stamps) <!-- id: 10 -->
- [ ] Frontend Integration <!-- id: 11 -->
    - [ ] Update `ExerciseContext` to use Server Actions instead of LocalStorage <!-- id: 12 -->
    - [ ] Implement user identification (UUID via cookie or localStorage) for DB association <!-- id: 13 -->
- [ ] Verification <!-- id: 14 -->
    - [ ] Verify stamps are saved to DB <!-- id: 15 -->
    - [ ] Verify data persists across browser clear (if cookie/ID preserved) <!-- id: 16 -->

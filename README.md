# Chatty Backend

Chatty is a real-time, AI-based chat application backend built with **NestJS**, **TypeScript**, and **Prisma ORM**.

## Tech Stack
- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: MySQL via [Prisma ORM](https://www.prisma.io/)
- **Testing**: Jest & Supertest (Unit & E2E)
- **Static Assets**: `@nestjs/serve-static` & `@nestjs/platform-express` (Multer) for image uploads

## Prerequisites
- **Node.js** (v18+ recommended)
- **MySQL** Server

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Ensure you have a `.env` file in the root directory containing your Database URL.
   ```env
   DATABASE_URL="mysql://<user>:<password>@localhost:3306/chatty"
   ```

3. **Database Setup**
   Run the Prisma migrations to synchronize your MySQL database and generate the Prisma Client bindings:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Running the Application**
   ```bash
   # development
   npm run start

   # watch mode
   npm run start:dev

   # production mode
   npm run start:prod
   ```

## Features Implemented
- **Chatrooms (CRUD)**: Create, View, Update, and Delete customized DB Chatrooms. Native file uploading handles saving profile images seamlessly locally into `src/assets` and hosts them via `.baseUrl`.
- **Messages Management**: Send user messages to the AI and read chat histories attached securely to specific Chatroom constraints.
- **Robust Testing**: Comprehensive Unit tests and End-to-End (E2E) Integration Tests spanning live Database evaluations (`/test/chatrooms.e2e-spec.ts` & `/test/messages.e2e-spec.ts`).

## Running Tests

```bash
# Unit tests
npm run test

# End-to-End (E2E) integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Linter & Formatter

```bash
# Run linting
npm run lint
```

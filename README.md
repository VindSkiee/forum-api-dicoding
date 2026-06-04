# Forum API

A production-oriented REST API for a discussion forum built with **Node.js**, **Express 5**, **PostgreSQL**, and **JWT Authentication**. The project follows **Clean Architecture** principles, separating business rules, application use cases, infrastructure, and interfaces to maintain scalability and testability.

## Features

- User registration
- JWT-based authentication
- Access token & refresh token flow
- Create discussion threads
- View thread details
- Add comments to threads
- Delete comments (soft delete)
- Add replies to comments
- Delete replies (soft delete)
- Like / unlike comments
- Rate limiting protection
- Health check endpoint
- Unit & integration testing with Vitest
- PostgreSQL database migrations
- CI/CD workflows with GitHub Actions

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | PostgreSQL |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Dependency Injection | instances-container |
| Testing | Vitest, Supertest |
| Migration | node-pg-migrate |
| Linting | ESLint |
| CI/CD | GitHub Actions |
| Reverse Proxy | Nginx |

---

## Project Structure

```text
src/
├── Applications/
│   ├── security/
│   └── use_case/
│
├── Commons/
│   ├── exceptions/
│   └── config.js
│
├── Domains/
│   ├── authentications/
│   ├── comments/
│   ├── likes/
│   ├── replies/
│   ├── threads/
│   └── users/
│
├── Infrastructures/
│   ├── database/
│   ├── http/
│   ├── repository/
│   ├── security/
│   └── container.js
│
└── Interfaces/
    └── http/
```

### Architecture Layers

#### Domains
Contains enterprise business rules, entities, repositories contracts, and validation logic.

#### Applications
Contains use cases that orchestrate business processes.

#### Infrastructures
Contains implementation details such as PostgreSQL repositories, JWT manager, password hashing, HTTP server, and dependency injection.

#### Interfaces
Contains REST API handlers, routes, and request/response mapping.

---

## API Endpoints

### Health

| Method | Endpoint |
|----------|----------|
| GET | `/health` |

---

### Users

| Method | Endpoint |
|----------|----------|
| POST | `/users` |

#### Register User

```json
{
  "username": "johndoe",
  "password": "secret",
  "fullname": "John Doe"
}
```

---

### Authentication

| Method | Endpoint |
|----------|----------|
| POST | `/authentications` |
| PUT | `/authentications` |
| DELETE | `/authentications` |

#### Login

```json
{
  "username": "johndoe",
  "password": "secret"
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

---

### Threads

| Method | Endpoint | Auth |
|----------|----------|------|
| POST | `/threads` | Yes |
| GET | `/threads/:threadId` | No |

#### Create Thread

```json
{
  "title": "Thread Title",
  "body": "Thread Content"
}
```

---

### Comments

| Method | Endpoint | Auth |
|----------|----------|------|
| POST | `/threads/:threadId/comments` | Yes |
| DELETE | `/threads/:threadId/comments/:commentId` | Yes |
| PUT | `/threads/:threadId/comments/:commentId/likes` | Yes |

#### Add Comment

```json
{
  "content": "This is a comment"
}
```

---

### Replies

| Method | Endpoint | Auth |
|----------|----------|------|
| POST | `/threads/:threadId/comments/:commentId/replies` | Yes |
| DELETE | `/threads/:threadId/comments/:commentId/replies/:replyId` | Yes |

#### Add Reply

```json
{
  "content": "This is a reply"
}
```

---

## Authentication Flow

```text
Register
   │
   ▼
Login
   │
   ├── Access Token
   └── Refresh Token
          │
          ▼
Refresh Token Endpoint
          │
          ▼
New Access Token
```

---

## Environment Variables

Create a `.env` file:

```env
HOST=localhost
PORT=3000

PGHOST=localhost
PGUSER=postgres
PGDATABASE=forum_api
PGPASSWORD=password
PGPORT=5432

ACCESS_TOKEN_KEY=your_access_secret
REFRESH_TOKEN_KEY=your_refresh_secret
ACCESS_TOKEN_AGE=3000
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/forum-api.git
cd forum-api
```

### Install Dependencies

```bash
npm install
```

### Setup Database

```bash
npm run migrate
```

### Run Development Server

```bash
npm run start:dev
```

### Run Production Server

```bash
npm start
```

---

## Testing

Run all tests:

```bash
npm test
```

Generate coverage report:

```bash
npm run test:coverage
```

Run Postman collection:

```bash
npm run postman:test
```

---

## Quality Assurance

- ESLint for static analysis
- Vitest for unit testing
- Supertest for API integration testing
- GitHub Actions CI pipeline
- Coverage reporting

---

## Security Considerations

- Password hashing using bcrypt
- JWT authentication
- Refresh token revocation support
- Route authorization middleware
- Request rate limiting
- Input validation at domain layer

---

## Deployment

The repository already includes:

- Nginx configuration
- GitHub Actions workflows
- Environment-based configuration
- PostgreSQL migration support

Typical deployment flow:

```text
GitHub Push
      │
      ▼
GitHub Actions
      │
      ▼
Run Tests
      │
      ▼
Build & Deploy
      │
      ▼
Nginx Reverse Proxy
      │
      ▼
Forum API
```

---

## License

This project is available for educational and portfolio purposes.

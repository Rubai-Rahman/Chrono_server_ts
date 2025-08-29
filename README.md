# Backend Template

A comprehensive TypeScript Node.js backend template with Express, MongoDB, and Mongoose following a modular architecture pattern.

## 🚀 Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Express.js**: Web framework with middleware support
- **MongoDB & Mongoose**: Database integration with ODM
- **Input Validation**: Request validation using Zod
- **Error Handling**: Centralized error handling middleware
- **Logging**: Structured logging with different levels
- **Security**: Helmet, CORS, rate limiting, and password hashing
- **Testing**: Jest testing framework setup
- **Code Quality**: ESLint and Prettier configuration
- **Development**: Hot reload with tsx

## 📁 Project Structure

```
src/
├── app.ts              # Express app setup
├── server.ts           # Server entry point
├── config/             # Configuration files
│   ├── database.ts     # Database configuration
│   └── env.ts          # Environment variables
├── middleware/         # Custom middleware
│   ├── auth.ts         # Authentication middleware
│   ├── errorHandler.ts # Error handling middleware
│   ├── notfound.middleware.ts # Not found handling middleware
│   └── validation.ts   # Validation middleware
├── modules/            # Feature modules
│   └── user/           # User module example
│       ├── user.controller.ts
│       ├── user.interface.ts
│       ├── user.model.ts
│       ├── user.route.ts
│       ├── user.service.ts
│       └── user.validation.ts
└── utils/              # Utility functions
    ├── AppError.ts     # Custom error class
    ├── logger.ts       # Logging utility
    └── response.ts     # Response utility
```

## 🎯 Quick Start

### 1. Create from Template

**Option A: Using GitHub Template**

1. Go to the template repository on GitHub
2. Click the "Use this template" button
3. Name your repository (e.g., `my-todo-api`)
4. Choose visibility (Public/Private)
5. Click "Create repository from template"

**Option B: Clone Directly**

```bash
git clone https://github.com/your-username/backend-template.git my-project
cd my-project
rm -rf .git
git init
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### 4. Start Development

```bash
# Development with hot reload
yarn dev

# Production build
yarn build
yarn start
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/your-database-name


# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

| Variable         | Description               | Default               | Required |
| ---------------- | ------------------------- | --------------------- | -------- |
| `PORT`           | Server port               | 5000                  | No       |
| `NODE_ENV`       | Environment mode          | development           | No       |
| `MONGODB_URI`    | MongoDB connection string | -                     | Yes      |
| `CORS_ORIGIN`    | CORS origin               | http://localhost:3000 | No       |

## 📚 API Documentation

### Health Check

- `GET /health` - Application health status

### User Module

- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user


## 🛠️ Available Scripts

```bash
# Development
yarn dev          # Start development server with hot reload
yarn build        # Build TypeScript to JavaScript
yarn start        # Start production server

# Code Quality
yarn lint         # Run ESLint
yarn lint:fix     # Fix ESLint issues
yarn format       # Format code with Prettier
yarn type-check   # Run TypeScript type checking

# Testing
yarn test         # Run tests
yarn test:watch   # Run tests in watch mode
yarn test:coverage # Run tests with coverage

# Database
yarn db:seed      # Seed database with sample data
yarn db:reset     # Reset database
```

## 🏗️ Architecture Overview

This template follows a **modular architecture pattern**:

### Module Structure

Each feature module contains:

- **Controller**: Handles HTTP requests and responses
- **Service**: Contains business logic and data processing
- **Model**: Defines database schema and validation
- **Route**: Defines API endpoints and middleware
- **Interface**: TypeScript type definitions
- **Validation**: Input validation schemas

### Key Components

#### Controllers

Handle HTTP requests and responses, delegating business logic to services:

```typescript
// user.controller.ts
export const createUser = async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);
  res.status(201).json(result);
};
```

#### Services

Contain business logic and interact with the database:

```typescript
// user.service.ts
export const createUser = async (userData: IUser) => {
  const user = await User.create(userData);
  return user;
};
```

#### Models

Define database schemas using Mongoose:

```typescript
// user.model.ts
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});
```

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express apps
- **Input Validation**: Zod schemas for request validation

## 🧪 Testing

The template includes Jest setup for testing:

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:coverage
```

Example test structure:

```typescript
describe('User Service', () => {
  it('should create a user successfully', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    const user = await UserService.createUser(userData);
    expect(user.name).toBe(userData.name);
  });
});
```

## 📝 Adding New Modules

1. Create a new directory in `src/modules/`
2. Add the following files:
   - `module.controller.ts`
   - `module.service.ts`
   - `module.model.ts`
   - `module.route.ts`
   - `module.interface.ts`
   - `module.validation.ts`
3. Register routes in `src/app.ts`

## 🚀 Deployment

### Using Docker

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN yarn build
EXPOSE 8000
CMD ["yarn", "start"]
```

### Using PM2

```bash
# Install PM2 globally
yarn global add pm2

# Start application
pm2 start dist/server.js --name "backend-app"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

- Check the [Issues](https://github.com/Rubai-Rahman/express-ts-template/issues) page
- Create a new issue if your problem isn't already addressed
- Review the documentation and examples

## 📋 Roadmap

- [ ] Add WebSocket support
- [ ] Implement caching with Redis
- [ ] Add Swagger/OpenAPI documentation
- [ ] Email service integration
- [ ] File upload handling
- [ ] GraphQL support option
- [ ] Docker Compose for development

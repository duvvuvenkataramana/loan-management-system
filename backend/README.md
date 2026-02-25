# Loan Management System - Backend

A complete Node.js + Express backend with MongoDB for the Loan Management System.

## Features

- **User Authentication**: Register, Login with JWT tokens
- **Three User Roles**: Admin, Lender, Borrower
- **Loan Management**: Apply for loans, view loan history
- **Admin/Lender Features**: Approve/reject loans, view all applications, dashboard statistics
- **Role-based Access**: Admin, Lender, and Borrower roles
- **Secure Passwords**: Bcrypt password hashing
- **RESTful API**: Clean API structure with proper error handling

## User Roles

| Role | Description |
|------|-------------|
| **Admin** | Full access to all features, can approve/reject loans, view all data |
| **Lender** | Can view all loan applications, approve/reject loans, view dashboard |
| **Borrower** | Can apply for loans, view their own loan history |

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |

### Loans
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/loans/apply` | Apply for a loan | Private (Borrower) |
| GET | `/api/loans/my-loans` | Get user's loans | Private (Borrower) |
| GET | `/api/loans` | Get all loans | Private (Admin/Lender) |
| GET | `/api/loans/:id` | Get loan by ID | Private |
| PUT | `/api/loans/:id/status` | Update loan status | Private (Admin/Lender) |
| GET | `/api/loans/stats/dashboard` | Get dashboard stats | Private (Admin/Lender) |

## Setup Instructions

### 1. Install Dependencies
```
bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update the values:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### 3. Run the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a new cluster (free tier)
3. Create a database user with read/write permissions
4. Get your connection string
5. Replace `username`, `password`, and `cluster` in the connection string

## Example Usage

### Register a Borrower
```
json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "borrower"
}
```

### Register a Lender
```
json
POST /api/auth/register
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "lender"
}
```

### Register an Admin
```
json
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Login
```
json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Apply for Loan (Borrower)
```
json
POST /api/loans/apply
Authorization: Bearer <token>

{
  "amount": 10000,
  "duration": 12,
  "purpose": "business"
}
```

### Approve/Reject Loan (Admin/Lender)
```
json
PUT /api/loans/:id/status
Authorization: Bearer <token>

{
  "status": "approved"
}
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv
- **CORS**: cors middleware

## Project Structure

```
backend/
├── config/
│   └── db.js           # MongoDB connection
├── middleware/
│   └── authMiddleware.js  # JWT authentication middleware
├── models/
│   ├── User.js         # User model
│   └── Loan.js         # Loan model
├── routes/
│   ├── authRoutes.js   # Authentication routes
│   └── loanRoutes.js   # Loan management routes
├── .env.example        # Environment variables template
├── package.json        # Dependencies
└── server.js          # Express server entry point
```

## Error Handling

All API responses follow a consistent format:
```
json
{
  "success": true,
  "message": "Response message",
  "data": {}
}
```

## License

MIT

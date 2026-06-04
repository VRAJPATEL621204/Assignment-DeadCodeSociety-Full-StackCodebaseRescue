# 🚚 LogiTrack API v2.0.0

Welcome to the **LogiTrack** backend! A production-ready logistics and shipment tracking API, refactored with modern best practices and MVC architecture.

## 📦 What is LogiTrack?
LogiTrack is a comprehensive logistics management system that enables businesses to track shipments, manage users with role-based access, and maintain real-time status updates across their supply chain.

## ✨ What's New in v2.0

- � **Security Hardened**: Replaced MD5 with bcrypt for secure password hashing
- 🏗️ **MVC Architecture**: Clean separation of concerns with routes, controllers, and services
- ✅ **Joi Validation**: Comprehensive input validation preventing NoSQL injection
- 🔐 **JWT Middleware**: Reusable authentication middleware eliminating code duplication
- ⚡ **N+1 Query Fix**: Implemented populate() for efficient database queries
- �️ **Error Handling**: Centralized error handling with custom error classes
- 📝 **JSDoc Documentation**: Full API documentation for all exported functions
- � **Async/Await**: Modern JavaScript patterns replacing promise chains

## 🏗️ Project Structure

```
src/
├── app.js                 # Application entry point
├── routes/               # Route definitions
│   ├── index.js         # Route aggregator
│   ├── authRoutes.js    # Authentication routes
│   ├── shipmentRoutes.js # Shipment routes
│   └── statusRoutes.js   # System status routes
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── shipmentController.js
│   └── statusController.js
├── services/            # Business logic
│   ├── authService.js
│   └── shipmentService.js
├── middlewares/         # Express middleware
│   ├── auth.js         # JWT authentication
│   └── errorHandler.js # Error handling
├── validators/          # Joi validation schemas
│   └── index.js
├── utils/              # Utility functions
│   ├── constants.js    # Application constants
│   ├── errors.js       # Custom error classes
│   └── password.js    # Password hashing
└── models/             # Mongoose models (at root)
    ├── User.js
    └── Shipment.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 14.0.0
- MongoDB >= 4.4

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd logitrack-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## � API Documentation

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: <your-jwt-token>
```

### Endpoints

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register` | Create a new account | No |
| POST | `/api/login` | Authenticate and get token | No |
| GET | `/api/profile` | Get current user profile | Yes |

#### Shipments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/shipments` | List all shipments for user | Yes |
| GET | `/api/shipments/:id` | Get single shipment details | Yes |
| POST | `/api/shipments` | Create new shipment | Yes |
| PATCH | `/api/shipments/:id/status` | Update shipment status | Yes* |
| DELETE | `/api/shipments/:id` | Delete a shipment | Yes |

\* Only admins can mark shipments as "delivered"

#### System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/status` | System status information | No |
| GET | `/api/ping` | Health check | No |

### Request/Response Examples

#### Register User
```bash
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

Response:
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Create Shipment
```bash
POST /api/shipments
Authorization: <token>
Content-Type: application/json

{
  "origin": "New York",
  "destination": "Los Angeles",
  "weight": 25.5,
  "carrier": "FedEx"
}
```

## � Security Features

- **bcrypt Password Hashing**: Industry-standard password hashing with salt rounds
- **Joi Validation**: Prevents NoSQL injection and validates all inputs
- **JWT Authentication**: Stateless, secure authentication
- **Role-Based Access Control**: Admin and user role separation
- **Error Sanitization**: Operational errors exposed; programming errors hidden

## ⚙️ Configuration

### Environment Variables
Create a `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/logitrack

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Security
BCRYPT_SALT_ROUNDS=12
```

## 🧪 Testing

```bash
# Run the application
npm start

# Test endpoints
curl http://localhost:3000/api/ping
```

## � Migration from v1.0

If upgrading from v1.0:
1. Update dependencies: `npm install`
2. Ensure `JWT_SECRET` is set (no fallback)
3. Passwords are now bcrypt-hashed (users need to reset passwords)

## 📄 Documentation

- [AUDIT.md](./AUDIT.md) - Code audit report and smell documentation
- [CHANGELOG.md](./CHANGELOG.md) - Version history and changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📜 License

ISC License - See LICENSE file for details

---

**Maintained by the Dead Code Society** 🧹✨

*Clean code is happy code!*

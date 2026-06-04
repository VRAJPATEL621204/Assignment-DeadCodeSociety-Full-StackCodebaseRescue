# Changelog

All notable changes to the LogiTrack Backend project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-06-04

### Summary
Major refactoring completed as part of the Dead Code Society assignment. This release transforms the codebase from a monolithic structure with security vulnerabilities to a production-ready MVC architecture with modern best practices.

### Security
- **CRITICAL**: Replaced MD5 password hashing with bcrypt (12 salt rounds)
  - MD5 was cryptographically broken and vulnerable to rainbow table attacks
  - bcrypt provides adaptive hashing resistant to brute force attacks
- **CRITICAL**: Fixed NoSQL injection vulnerability via Joi validation
  - Spread operator `{ ...req.body }` allowed arbitrary field injection
  - Joi schemas now whitelist and validate all input fields
- **CRITICAL**: Removed hardcoded JWT secret fallback
  - Application now throws error if JWT_SECRET is not configured
- **CRITICAL**: Fixed timing attack vulnerability in password comparison
  - Using bcrypt.compare() with constant-time comparison
- **CRITICAL**: Added permission checks to delete shipment endpoint
  - Previously any authenticated user could delete any shipment
  - Now only shipment owner or admin can delete

### Architecture
- **BREAKING**: Restructured project into MVC pattern:
  ```
  src/
  ├── routes/        # Route definitions
  ├── controllers/   # HTTP request handlers
  ├── services/      # Business logic layer
  ├── middlewares/   # Reusable middleware
  ├── validators/    # Joi validation schemas
  └── utils/         # Utility functions
  ```
- Extracted JWT authentication into reusable middleware
- Created centralized error handling with custom error classes
- Implemented asyncHandler wrapper for consistent async error handling

### Code Quality
- Converted all `var` declarations to `const`/`let`
- Converted all promise chains to async/await
- Added comprehensive JSDoc documentation to all exported functions
- Removed unused imports (path, fs, http, os)
- Removed dead code (commented blocks, useless loops)

### Performance
- Fixed N+1 query problem in `/api/shipments` endpoint
  - Previously made N+1 database queries for N shipments
  - Now uses Mongoose populate() for single query with joins
- Added database indexes on frequently queried fields

### Dependencies
- **Removed**: `md5`, `body-parser` (deprecated)
- **Added**: `bcrypt` (^5.1.0), `joi` (^17.9.0)
- **Updated**: All dependencies to latest stable versions
  - express: ^4.17.1 → ^4.18.0
  - mongoose: ^5.10.0 → ^7.0.0
  - jsonwebtoken: ^8.5.1 → ^9.0.0
  - dotenv: ^8.2.0 → ^16.0.0

### API Changes
#### New Features
- Added proper 404 handling for undefined routes
- Added request/response sanitization
- Added comprehensive validation error messages

#### Breaking Changes
- Authentication errors now return 401/403 status codes instead of 200 with error message
- Registration errors return 409 for duplicate email instead of 200
- Password requirements: minimum 8 characters
- All protected routes now require valid JWT (no fallback secret)

### Documentation
- Created `AUDIT.md` with comprehensive code smell documentation
- Rewrote `README.md` with setup instructions and API documentation
- Added inline JSDoc comments to all modules

---

## [1.0.0] - 2019-XX-XX

### Initial Release
- Basic user registration and login
- Shipment CRUD operations
- JWT-based authentication
- MongoDB integration
- Express server setup

### Known Issues (Fixed in 2.0.0)
- MD5 password hashing (insecure)
- No input validation (NoSQL injection possible)
- Hardcoded JWT secret fallback
- N+1 query problem on shipments endpoint
- Missing error handling in several routes
- No permission checks on delete operations
- Promise chains instead of async/await
- Using `var` instead of `const`/`let`

---

## Migration Guide: 1.0.0 → 2.0.0

### Step 1: Update Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Ensure `.env` contains:
```env
JWT_SECRET=your-super-secret-key-min-32-characters
```

### Step 3: Database Migration
**Note**: Passwords are now bcrypt-hashed instead of MD5
- Existing users will need to reset their passwords
- Or implement a migration that re-hashes on next login

### Step 4: API Client Updates
- Update error handling to expect proper HTTP status codes (401, 403, 409)
- JWT tokens now strictly require configured secret

---

*Released by the Dead Code Society - Making code cleaner, one refactor at a time!*

# Git Commit Sequence - Dead Code Society Rescue

Below is the exact sequence of git commits required for the assignment, organized by logical phases.

---

## Phase 1: Audit and Documentation

### Commit 1: Add SMELL comments to all source files
```bash
git add src/app.js src/routes.js models/User.js models/Shipment.js
git commit -m "audit: Add SMELL comments with severity levels to all files

- Added 25+ SMELL comments across all source files
- Identified CRITICAL issues: MD5 hashing, NoSQL injection, hardcoded secrets
- Identified HIGH issues: N+1 queries, DRY violations, missing error handling
- Identified MEDIUM issues: var usage, promise chains
- Identified LOW issues: unused imports, dead code, magic strings"
```

### Commit 2: Create AUDIT.md
```bash
git add AUDIT.md
git commit -m "docs: Create comprehensive code audit report

- Documented 17 distinct code smells
- Categorized by severity: CRITICAL (5), HIGH (4), MEDIUM (3), LOW (5)
- Provided detailed impact analysis for each issue
- Created refactoring priority phases
- Added remediation strategies"
```

---

## Phase 2: Project Setup and Dependencies

### Commit 3: Install new dependencies and update package.json
```bash
# Run: npm remove md5 body-parser
# Run: npm install bcrypt joi
git add package.json package-lock.json
git commit -m "deps: Replace MD5 with bcrypt, add Joi validation

- Removed insecure md5 package
- Removed deprecated body-parser (using express built-in)
- Added bcrypt ^5.1.0 for secure password hashing
- Added joi ^17.9.0 for input validation
- Updated all dependencies to latest stable versions
- Bumped version to 2.0.0"
```

### Commit 4: Create MVC directory structure
```bash
# Directories created:
# src/controllers, src/services, src/middlewares, src/utils, src/routes, src/validators
git add src/controllers src/services src/middlewares src/utils src/routes src/validators
git commit -m "chore: Create MVC folder structure

- Added routes/ for route definitions
- Added controllers/ for HTTP request handlers
- Added services/ for business logic layer
- Added middlewares/ for reusable Express middleware
- Added utils/ for utility functions and constants
- Added validators/ for Joi validation schemas"
```

---

## Phase 3: Core Infrastructure

### Commit 5: Create centralized error handling
```bash
git add src/utils/errors.js
git commit -m "feat: Add centralized error handling with custom error classes

- Created AppError base class for operational errors
- Added BadRequestError (400) for validation failures
- Added UnauthorizedError (401) for authentication failures
- Added ForbiddenError (403) for authorization failures
- Added NotFoundError (404) for missing resources
- Added ConflictError (409) for duplicate entries
- All errors include isOperational flag for safe client exposure"
```

### Commit 6: Create utility modules
```bash
git add src/utils/constants.js src/utils/password.js
git commit -m "feat: Add utility modules

- Created constants.js with application constants:
  - SHIPMENT_STATUS enum values
  - USER_ROLES enum values
  - JWT_EXPIRES_IN and BCRYPT_SALT_ROUNDS
- Created password.js with bcrypt utilities:
  - hashPassword() with 12 salt rounds
  - comparePassword() with constant-time comparison
  - Proper error handling for invalid inputs"
```

### Commit 7: Create error handler middleware
```bash
git add src/middlewares/errorHandler.js
git commit -m "feat: Add error handling middleware

- Created globalErrorHandler for centralized error responses
- Differentiates between operational and programming errors
- Logs detailed error info for debugging
- Sanitizes error messages sent to clients
- Added notFoundHandler for 404 responses
- Added asyncHandler wrapper for async route handlers"
```

### Commit 8: Create JWT authentication middleware
```bash
git add src/middlewares/auth.js
git commit -m "feat: Add JWT authentication middleware

- Created authenticate() middleware for token verification
- Removed hardcoded JWT secret fallback
- Attaches userId and userRole to request object
- Returns 401 for missing or invalid tokens
- Created requireAdmin() for role-based access control
- Eliminates DRY violations from routes"
```

---

## Phase 4: Validation Layer

### Commit 9: Create Joi validation schemas and middleware
```bash
git add src/validators/index.js
git commit -m "feat: Add Joi validation schemas and middleware

- Created registerSchema for user registration
  - Name: 2-100 chars, required
  - Email: valid format, required
  - Password: min 8 chars, required
  - Role: optional, enum validation
- Created loginSchema for authentication
- Created createShipmentSchema for shipment creation
- Created updateStatusSchema with status enum
- Created objectIdSchema for route param validation
- Added validate() middleware for request body
- Added validateParams() middleware for route params
- Returns 400 with detailed error messages"
```

---

## Phase 5: Business Logic Layer (Services)

### Commit 10: Create authentication service
```bash
git add src/services/authService.js
git commit -m "feat: Add authentication service

- Implemented register() with bcrypt password hashing
  - Checks for duplicate emails (409 Conflict)
  - Returns user without password field
- Implemented login() with secure password comparison
  - Returns 401 for invalid credentials
  - Uses constant-time comparison to prevent timing attacks
- Implemented getProfile() for user retrieval
  - Excludes password from response
  - Returns 404 if user not found"
```

### Commit 11: Create shipment service with N+1 fix
```bash
git add src/services/shipmentService.js
git commit -m "feat: Add shipment service with N+1 query fix

- Implemented getUserShipments() using populate()
  - Fixed N+1 query problem
  - Fetches user details in single query
  - Supports admin view of all shipments
- Implemented getShipmentById() with permission checks
- Implemented createShipment() with tracking ID generation
- Implemented updateShipmentStatus() with admin validation
  - Only admins can mark as delivered
- Implemented deleteShipment() with ownership verification
  - Only owner or admin can delete
  - Returns 404 if shipment not found"
```

---

## Phase 6: Controller Layer

### Commit 12: Create authentication controller
```bash
git add src/controllers/authController.js
git commit -m "feat: Add authentication controller

- Implemented register() endpoint
  - Returns 201 on successful creation
  - Uses asyncHandler for error catching
- Implemented login() endpoint
  - Generates JWT token on successful auth
  - Returns token and user data
- Implemented getProfile() endpoint
  - Returns current authenticated user
- All endpoints use async/await pattern"
```

### Commit 13: Create shipment controller
```bash
git add src/controllers/shipmentController.js
git commit -m "feat: Add shipment controller

- Implemented getShipments() endpoint
  - Returns shipments with user details
  - Includes result count
- Implemented getShipmentById() endpoint
  - Validates shipment access permissions
- Implemented createShipment() endpoint
  - Returns 201 on successful creation
- Implemented updateStatus() endpoint
  - Validates admin role for delivered status
- Implemented deleteShipment() endpoint
  - Returns success message on deletion
- All endpoints properly wrapped with asyncHandler"
```

### Commit 14: Create status controller
```bash
git add src/controllers/statusController.js
git commit -m "feat: Add status controller

- Implemented getStatus() endpoint
  - Returns OS info, uptime, memory usage
  - Includes Node.js version
- Implemented ping() endpoint
  - Health check for monitoring
  - Returns active status with timestamp"
```

---

## Phase 7: Route Configuration

### Commit 15: Create modular routes
```bash
git add src/routes/index.js src/routes/authRoutes.js src/routes/shipmentRoutes.js src/routes/statusRoutes.js
git commit -m "feat: Add modular route configuration

- Created authRoutes.js
  - POST /register with validation
  - POST /login with validation
  - GET /profile with authentication
- Created shipmentRoutes.js
  - All routes protected by authenticate middleware
  - GET / for listing shipments
  - GET /:id with ObjectId validation
  - POST / with shipment validation
  - PATCH /:id/status with status validation
  - DELETE /:id with ObjectId validation
- Created statusRoutes.js
  - GET /status for system info
  - GET /ping for health checks
- Created index.js to aggregate all routes"
```

---

## Phase 8: Model Improvements

### Commit 16: Refactor User model
```bash
git add models/User.js
git commit -m "refactor: Update User model with JSDoc and improvements

- Converted var to const declarations
- Added comprehensive JSDoc documentation
- Added validation constraints:
  - Name: minlength 2, trim
  - Email: lowercase, trim, unique
  - Password: minlength 8, select: false
  - Role: enum validation (user, admin)
- Exports named User variable"
```

### Commit 17: Refactor Shipment model
```bash
git add models/Shipment.js
git commit -m "refactor: Update Shipment model with JSDoc and improvements

- Converted var to const declarations
- Added STATUS_VALUES constant for enum
- Added validation constraints:
  - All string fields: trim
  - Weight: min 0
  - Status: enum validation
  - Required fields with custom messages
- Added indexes on trackingId and userId
- Added JSDoc for pre-save hook
- Exports named Shipment variable"
```

---

## Phase 9: Application Entry Point

### Commit 18: Refactor app.js
```bash
git add src/app.js
git commit -m "refactor: Rewrite app.js with modern patterns

- Converted all var to const/let
- Replaced promise chains with async/await
- Extracted connectDatabase() function
- Added proper error handling for DB connection
- Replaced body-parser with express built-ins
- Added 404 not found handler
- Added global error handler (last middleware)
- Added JSDoc documentation
- Removed unused imports"
```

---

## Phase 10: Documentation

### Commit 19: Update README.md
```bash
git add README.md
git commit -m "docs: Rewrite README with comprehensive documentation

- Added v2.0.0 feature highlights
- Documented MVC project structure
- Added detailed API endpoint documentation
- Added authentication instructions
- Added request/response examples
- Documented security features
- Added configuration instructions
- Added migration guide from v1.0"
```

### Commit 20: Create CHANGELOG.md
```bash
git add CHANGELOG.md
git commit -m "docs: Create CHANGELOG with version history

- Documented v2.0.0 changes (current)
  - Security improvements (MD5→bcrypt, etc.)
  - Architecture changes (MVC structure)
  - Code quality improvements
  - Performance fixes (N+1 query)
  - Dependency updates
- Documented v1.0.0 (initial release)
- Added migration guide
- Follows Keep a Changelog format"
```

---

## Final Commit Summary

### View all commits
```bash
git log --oneline --all
```

### Expected output
```
20 chars: docs: Create CHANGELOG with version history
19 chars: docs: Rewrite README with comprehensive...
18 chars: refactor: Rewrite app.js with modern...
17 chars: refactor: Update Shipment model with...
16 chars: refactor: Update User model with JSDoc...
15 chars: feat: Add modular route configuration...
14 chars: feat: Add status controller
13 chars: feat: Add shipment controller
12 chars: feat: Add authentication controller
11 chars: feat: Add shipment service with N+1...
10 chars: feat: Add authentication service
9 chars: feat: Add Joi validation schemas...
8 chars: feat: Add JWT authentication middleware
7 chars: feat: Add error handling middleware
6 chars: feat: Add utility modules
5 chars: feat: Add centralized error handling...
4 chars: chore: Create MVC folder structure
3 chars: deps: Replace MD5 with bcrypt, add Joi...
2 chars: docs: Create comprehensive code audit...
1 chars: audit: Add SMELL comments with severity...
```

---

## Quick Command Reference

### Create all commits at once (script)
```bash
#!/bin/bash
# Run these commands in sequence

git add src/app.js src/routes.js models/User.js models/Shipment.js
git commit -m "audit: Add SMELL comments with severity levels to all files"

git add AUDIT.md
git commit -m "docs: Create comprehensive code audit report"

git add package.json package-lock.json
git commit -m "deps: Replace MD5 with bcrypt, add Joi validation"

git add src/controllers src/services src/middlewares src/utils src/routes src/validators
git commit -m "chore: Create MVC folder structure"

git add src/utils/errors.js
git commit -m "feat: Add centralized error handling with custom error classes"

git add src/utils/constants.js src/utils/password.js
git commit -m "feat: Add utility modules"

git add src/middlewares/errorHandler.js
git commit -m "feat: Add error handling middleware"

git add src/middlewares/auth.js
git commit -m "feat: Add JWT authentication middleware"

git add src/validators/index.js
git commit -m "feat: Add Joi validation schemas and middleware"

git add src/services/authService.js
git commit -m "feat: Add authentication service"

git add src/services/shipmentService.js
git commit -m "feat: Add shipment service with N+1 query fix"

git add src/controllers/authController.js
git commit -m "feat: Add authentication controller"

git add src/controllers/shipmentController.js
git commit -m "feat: Add shipment controller"

git add src/controllers/statusController.js
git commit -m "feat: Add status controller"

git add src/routes/index.js src/routes/authRoutes.js src/routes/shipmentRoutes.js src/routes/statusRoutes.js
git commit -m "feat: Add modular route configuration"

git add models/User.js
git commit -m "refactor: Update User model with JSDoc and improvements"

git add models/Shipment.js
git commit -m "refactor: Update Shipment model with JSDoc and improvements"

git add src/app.js
git commit -m "refactor: Rewrite app.js with modern patterns"

git add README.md
git commit -m "docs: Rewrite README with comprehensive documentation"

git add CHANGELOG.md
git commit -m "docs: Create CHANGELOG with version history"
```

---

*This commit sequence follows best practices for atomic commits, with each commit representing a single logical change.*

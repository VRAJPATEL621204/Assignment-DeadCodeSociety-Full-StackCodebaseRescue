# Code Audit Report - Dead Code Society Rescue

**Project:** LogiTrack Backend  
**Audit Date:** June 2026  
**Auditor:** Dead Code Society  

---

## Executive Summary

This audit identifies **25+ code smells** across the LogiTrack backend codebase. The issues range from **CRITICAL** security vulnerabilities to **LOW** severity code quality issues. This document serves as the foundation for the refactoring effort.

---

## Severity Legend

| Severity | Description |
|----------|-------------|
| **CRITICAL** | Security vulnerabilities that could lead to data breaches or system compromise |
| **HIGH** | Serious issues that impact performance, reliability, or maintainability |
| **MEDIUM** | Code quality issues that should be addressed for best practices |
| **LOW** | Minor code smells that affect readability or cleanliness |

---

## Code Smells by Category

### Security Vulnerabilities (CRITICAL)

#### 1. MD5 Password Hashing
**Location:** `src/routes.js:14`, `src/routes.js:47`, `src/routes.js:78-83`  
**Severity:** CRITICAL  
**Description:** The application uses MD5 for password hashing, which is cryptographically broken and unsuitable for password storage. MD5 is vulnerable to rainbow table attacks and can be cracked at billions of hashes per second on modern hardware.  
**Impact:** User passwords can be easily compromised if the database is leaked.  
**Remediation:** Replace MD5 with bcrypt using a salt round of 10-12.

#### 2. NoSQL Injection via Spread Operator
**Location:** `src/routes.js:42`, `src/routes.js:220-226`  
**Severity:** CRITICAL  
**Description:** User input is directly spread into MongoDB documents using `{ ...req.body }`, enabling NoSQL injection attacks. Attackers can inject malicious operators like `$ne`, `$gt`, or `$where`.  
**Impact:** Attackers can bypass authentication, modify arbitrary data, or extract sensitive information.  
**Remediation:** Use Joi validation to whitelist allowed fields before saving to database.

#### 3. Hardcoded JWT Secret
**Location:** `src/routes.js:30`  
**Severity:** CRITICAL  
**Description:** The JWT secret has a hardcoded fallback value `'secret123'` if the environment variable is not set.  
**Impact:** Attackers can forge authentication tokens if the default secret is used.  
**Remediation:** Remove the fallback and throw an error if JWT_SECRET is not configured.

#### 4. Timing Attack Vulnerability
**Location:** `src/routes.js:83`  
**Severity:** CRITICAL  
**Description:** Password comparison uses the `===` operator, which is vulnerable to timing attacks. Different execution times for matching vs non-matching passwords leak information.  
**Impact:** Attackers can potentially guess passwords through timing analysis.  
**Remediation:** Use bcrypt.compare() which uses constant-time comparison.

#### 5. Missing Permission Check on Delete
**Location:** `src/routes.js:298-305`  
**Severity:** CRITICAL  
**Description:** The delete shipment endpoint only checks if the user is authenticated, not if they own the shipment.  
**Impact:** Any authenticated user can delete any other user's shipments.  
**Remediation:** Verify that `shipment.userId` matches `req.userId` or the user has admin role.

---

### Performance Issues (HIGH)

#### 6. N+1 Query Problem
**Location:** `src/routes.js:137-161`  
**Severity:** HIGH  
**Description:** The `/shipments` endpoint fetches all shipments, then loops through them making individual database queries for each user. With N shipments, this results in N+1 database queries.  
**Impact:** Severe performance degradation with scale. 100 shipments = 101 database queries.  
**Remediation:** Use Mongoose's `populate()` method or aggregation pipeline to fetch users in a single query.

#### 7. Silent Promise Failures
**Location:** `src/routes.js:158`  
**Severity:** HIGH  
**Description:** The inner `User.findById()` promise inside the loop has no `.catch()` handler. If the query fails, the error is silently swallowed.  
**Impact:** Users receive incomplete data without knowing an error occurred. Server memory leaks possible.  
**Remediation:** Add proper error handling to all promises or use async/await with try-catch.

#### 8. Missing Error Handling on Profile Route
**Location:** `src/routes.js:329-333`  
**Severity:** HIGH  
**Description:** The `/profile` route's `User.findById()` has no `.catch()` handler.  
**Impact:** Unhandled promise rejections can crash the Node.js process.  
**Remediation:** Add `.catch()` handler or use async/await with try-catch.

---

### Code Quality Issues (MEDIUM)

#### 9. Using `var` Instead of `const`/`let`
**Location:** Throughout all files (`src/app.js`, `src/routes.js`, `models/*.js`)  
**Severity:** MEDIUM  
**Description:** The codebase uses `var` for all variable declarations. `var` has function scope (not block scope) and allows redeclaration, leading to bugs.  
**Impact:** Variable hoisting can cause unexpected behavior; harder to reason about code.  
**Remediation:** Replace all `var` with `const` (for values that don't change) or `let` (for values that do).

#### 10. Promise Chains Instead of async/await
**Location:** Throughout `src/routes.js`  
**Severity:** MEDIUM  
**Description:** All asynchronous operations use `.then()`/.catch()` chains, creating callback hell and deeply nested code.  
**Impact:** Code is harder to read, debug, and maintain. Error handling is inconsistent.  
**Remediation:** Convert all promise chains to async/await with try-catch blocks.

#### 11. Repeated Auth Code Blocks (Not DRY)
**Location:** `src/routes.js:112-120`, `src/routes.js:180-190`, `src/routes.js:213-223`, `src/routes.js:254-264`, `src/routes.js:286-296`, `src/routes.js:317-327`  
**Severity:** HIGH  
**Description:** The JWT verification logic is copy-pasted in every protected route.  
**Impact:** Code duplication makes maintenance difficult; security fixes must be applied in multiple places.  
**Remediation:** Extract JWT verification into a reusable middleware function.

---

### Minor Issues (LOW)

#### 12. Unused Imports
**Location:** `src/app.js:13`, `src/routes.js:18-24`  
**Severity:** LOW  
**Description:** The modules `path`, `fs`, `http`, and `os` are imported but never used.  
**Impact:** Increases bundle size slightly; indicates incomplete cleanup.  
**Remediation:** Remove all unused imports.

#### 13. Magic Strings
**Location:** `src/routes.js:226`, `src/routes.js:253`  
**Severity:** LOW  
**Description:** Status values like `'pending'` and `'delivered'` are hardcoded as strings throughout the code.  
**Impact:** Typos in status values can cause bugs; difficult to maintain consistent values.  
**Remediation:** Define constants for status values (e.g., `const STATUS_PENDING = 'pending'`).

#### 14. Dead Code in Comments
**Location:** `src/routes.js:338-348`  
**Severity:** LOW  
**Description:** Old code blocks are commented out with "DO NOT DELETE" notes.  
**Impact:** Clutters the codebase; version control should be used for history.  
**Remediation:** Delete commented code; it's preserved in git history.

#### 15. Useless Loop
**Location:** `src/routes.js:375-377`  
**Severity:** LOW  
**Description:** A loop that runs 200 times but does nothing except increment a counter.  
**Impact:** Code bloat; potentially confusing to new developers.  
**Remediation:** Delete the loop entirely.

#### 16. TODO Comments Instead of Implementation
**Location:** `src/routes.js:380-383`  
**Severity:** LOW  
**Description:** TODO comments list needed improvements but have not been addressed.  
**Impact:** Technical debt accumulates; TODOs often become stale.  
**Remediation:** Either implement the TODOs or create proper tickets in the issue tracker.

---

## Summary by Severity

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| HIGH | 4 |
| MEDIUM | 3 |
| LOW | 5 |
| **Total** | **17 distinct smells** |

---

## Refactoring Priority

### Phase 1: Security (Must Fix)
1. Replace MD5 with bcrypt
2. Add Joi validation to prevent NoSQL injection
3. Remove hardcoded JWT secret fallback
4. Fix permission checks on delete endpoint

### Phase 2: Architecture (Should Fix)
1. Extract JWT middleware
2. Create centralized error handling
3. Implement proper MVC structure
4. Fix N+1 query problem

### Phase 3: Code Quality (Nice to Fix)
1. Convert var to const/let
2. Convert promises to async/await
3. Remove dead code and unused imports
4. Add JSDoc comments

---

## Files Affected

| File | Smell Count | Primary Issues |
|------|-------------|----------------|
| `src/routes.js` | 20+ | Security, Performance, DRY violations |
| `src/app.js` | 8 | Code style, async patterns |
| `models/User.js` | 3 | Code style |
| `models/Shipment.js` | 2 | Code style |

---

*End of Audit Report*

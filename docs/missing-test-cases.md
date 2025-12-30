# Missing Test Cases

This document tracks test cases that should be implemented to improve test coverage for the user authentication system.

## Account Lockout Tests (Priority: High)

The schema includes lockout fields (`failedLoginAttempts`, `lockoutUntil`, `lastFailedLoginAt`) and config has lockout settings, but the following scenarios need test coverage:

- [ ] Progressive lockout after failed attempts (15 failures triggers lockout)
- [ ] Lockout duration increases progressively (15m → 30m → 60m → max 24h)
- [ ] Lockout clearing after successful login
- [ ] Concurrent login attempts during active lockout period
- [ ] Lockout state persistence across service restarts

## Security Tests (Priority: High)

### XSS/Injection Testing
- [ ] Malicious input in form fields (`<script>alert('xss')</script>`)
- [ ] JavaScript URLs in inputs (`javascript:alert('xss')`)
- [ ] Event handler injection (`onload=alert('xss')`)
- [ ] Stored XSS via name/email fields

### Rate Limiting
- [ ] Login rate limit (5 req/min) - test enforcement and window reset
- [ ] Password reset rate limit (3 req/min)
- [ ] Forgot password rate limit (3 req/min)
- [ ] Rate limit headers in response
- [ ] Rate limit bypass attempts (header manipulation)

### Input Boundary Testing
- [ ] Name field max length (100 characters)
- [ ] Email field max length (254 characters)
- [ ] Password max length (128 characters)
- [ ] Behavior at boundary conditions (exactly at limit, one over)
- [ ] Unicode/emoji handling in text fields

## Integration Tests (Priority: Medium)

### Route Protection
- [ ] Protected routes reject unauthenticated requests
- [ ] Protected routes accept valid JWT tokens
- [ ] Expired JWT tokens are properly rejected
- [ ] Invalid JWT tokens return appropriate error codes
- [ ] CSRF token validation for state-changing endpoints

### Token Security
- [ ] CSRF token reuse detection across multiple requests
- [ ] Token replay attack prevention
- [ ] Refresh token rotation security
- [ ] Concurrent token refresh limiting (max 3)

## Email Rate Limiting Tests (Priority: Medium)

- [ ] Email verification rate limit (5 per hour per user)
- [ ] Password reset email rate limit
- [ ] Rate limit counter reset after time window
- [ ] Different users have independent rate limits

## Edge Cases (Priority: Low)

- [ ] Session behavior during clock skew
- [ ] Token expiry at exact boundary
- [ ] Database connection failures during auth
- [ ] Malformed JWT handling
- [ ] Empty/null field validation

---

## Implementation Notes

When implementing these tests:

1. Use the existing test patterns in `prompt-service/src/services/__tests__/`
2. Mock external dependencies (database, email service)
3. Use timing-safe comparisons in test assertions where applicable
4. Consider using factories for test data generation
5. Ensure tests are deterministic and don't depend on execution order

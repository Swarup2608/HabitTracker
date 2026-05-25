# Security Policy

## Overview

Loop Atom implements **enterprise-grade security measures** to protect user data and maintain system integrity. This document outlines our security practices, policies, and how to report vulnerabilities.

![Security Layers - Authentication, Data Protection, Request Security, Audit](https://via.placeholder.com/1200x400?text=Security%3A+Authentication+%7C+Data+Protection+%7C+Audit)

---

## Security Features

### Authentication & Authorization

| Feature                | Implementation         | Details                           |
| ---------------------- | ---------------------- | --------------------------------- |
| **Password Storage**   | bcrypt (12-round salt) | Never stored in plain text        |
| **Access Tokens**      | JWT (15-min expiry)    | Stored in httpOnly cookies        |
| **Refresh Tokens**     | JWT (14-day expiry)    | jti-based tracking for revocation |
| **Token Rotation**     | Automatic on refresh   | New jti on each rotation          |
| **Account Lockout**    | 5 failed attempts      | 30-minute lockout period          |
| **Email Verification** | Required (production)  | 24-hour token expiry              |
| **Password Reset**     | Token-based            | 30-minute expiry, one-time use    |

### Data Protection

| Layer              | Measure       | Details                                           |
| ------------------ | ------------- | ------------------------------------------------- |
| **In Transit**     | HTTPS/TLS     | All traffic encrypted, HSTS enabled               |
| **At Rest**        | Encryption    | MongoDB encryption, secure password hashing       |
| **Access Control** | JWT + CSRF    | Token validation, CSRF tokens on mutations        |
| **Sensitive Data** | Hashing       | Tokens hashed before storage                      |
| **Audit Logging**  | Comprehensive | All state changes logged with timestamp, user, IP |

### Request Security

| Measure                 | Details                               |
| ----------------------- | ------------------------------------- |
| **CSRF Protection**     | Token validation on POST/PATCH/DELETE |
| **Rate Limiting**       | Per-endpoint limits with Redis        |
| **Input Validation**    | Zod schemas on all endpoints          |
| **SQL/NoSQL Injection** | Parameterized queries via Mongoose    |
| **XSS Prevention**      | Helmet CSP headers, sanitized output  |
| **CORS**                | Whitelist-based origin validation     |
| **Security Headers**    | Helmet.js with strict policies        |

---

## Configuration

### Environment Security

**Required in Production**

```env
NODE_ENV=production
COOKIE_SECURE=true
COOKIE_DOMAIN=yourdomain.com
JWT_ACCESS_SECRET=<64+ character random string>
JWT_REFRESH_SECRET=<64+ character random string>
MONGODB_URI=<production-database-uri>
REDIS_URL=<production-redis-url>
```

**Generate Strong Secrets**

```bash
# Generate a random 64-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Cookie Settings

**Production (Secure)**

```typescript
cookie: {
  httpOnly: true,    // Never accessible to JavaScript (prevents XSS)
  secure: true,      // Only sent over HTTPS
  sameSite: 'lax',   // Protects against CSRF
  domain: 'yourapp.com',
  path: '/',
  maxAge: 1209600000 // 14 days
}
```

**Development (Testing Only)**

```typescript
cookie: {
  httpOnly: true,
  secure: false,     // Allow HTTP for local development
  sameSite: 'lax',
  maxAge: 1209600000
}
```

### Database Security

**MongoDB Atlas**

- ✅ Enable encryption at rest
- ✅ Enable audit logging
- ✅ Use network access control
- ✅ Enable backup encryption
- ✅ Rotate credentials quarterly

**Redis**

- ✅ Enable AUTH password
- ✅ Use Redis Cloud for managed security
- ✅ Or: Deploy behind VPC
- ✅ Use TLS if publicly exposed

---

## Threat Model & Mitigations

### 1. Brute Force Attacks

**Threat**: Attacker tries many passwords
**Mitigation**:

- Account lockout after 5 failed attempts
- 30-minute lockout window
- Rate limiting (3-5 login attempts/minute)
- Audit logging of failed attempts

### 2. Session Hijacking

**Threat**: Attacker steals and reuses session token
**Mitigation**:

- Short-lived access tokens (15 minutes)
- httpOnly cookies (not accessible to JavaScript)
- Refresh token rotation (new jti on each use)
- Token revocation on logout

### 3. CSRF Attacks

**Threat**: Attacker tricks user into malicious action
**Mitigation**:

- CSRF tokens on all state-changing requests
- SameSite=Lax on cookies
- Validate origin header

### 4. XSS Attacks

**Threat**: Attacker injects malicious JavaScript
**Mitigation**:

- Content Security Policy headers
- React's built-in escaping
- No `dangerouslySetInnerHTML` in codebase
- Input validation and sanitization

### 5. Password Reset Abuse

**Threat**: Attacker resets victim's password
**Mitigation**:

- Email verification required
- 30-minute token expiry
- Tokens hashed in database
- One-time use only
- No user enumeration (same response for existing/non-existing)

### 6. SQL/NoSQL Injection

**Threat**: Attacker manipulates database queries
**Mitigation**:

- Parameterized queries via Mongoose
- Input validation with Zod
- No string concatenation in queries

### 7. Data Breach

**Threat**: Unauthorized access to database
**Mitigation**:

- Encryption at rest (MongoDB)
- Password hashing (bcrypt)
- Token hashing (reset tokens)
- Minimal sensitive data storage
- Regular backups with encryption

---

## Vulnerability Reporting

### 🔐 Responsible Disclosure

If you discover a security vulnerability, please **do not** open a public GitHub issue. Instead:

1. **Email**: security@yourcompany.com
2. **Subject**: `[SECURITY] Vulnerability Description`
3. **Include**:
   - Vulnerability type and severity
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

### Response Timeline

- **Acknowledgment**: Within 24 hours
- **Investigation**: Within 1 week
- **Fix Release**: ASAP, typically within 2 weeks
- **Disclosure**: After patch is released

### Bug Bounty

We appreciate security researchers! Please report responsibly and we'll:

- Credit you in security advisories
- Add you to our Hall of Gratitude
- Consider rewards for critical vulnerabilities

---

## Security Checklist

### Before Deployment

- [ ] `NODE_ENV=production`
- [ ] `COOKIE_SECURE=true`
- [ ] HTTPS enabled
- [ ] CORS configured for specific domains
- [ ] MongoDB encryption enabled
- [ ] Redis AUTH enabled
- [ ] JWT secrets generated (64+ chars)
- [ ] Email service configured
- [ ] Backup plan documented
- [ ] Error monitoring set up (Sentry recommended)

### After Deployment

- [ ] Monitor logs for suspicious activity
- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate JWT secrets quarterly
- [ ] Perform security audits semi-annually
- [ ] Test disaster recovery plan annually

### Ongoing Maintenance

**Monthly**

```bash
npm audit
npm update
```

**Quarterly**

- Rotate JWT secrets
- Review and update security policies
- Audit user access logs

**Annually**

- Third-party security audit
- Penetration testing
- Disaster recovery testing
- Team security training

---

## Compliance & Standards

This project aims to comply with:

- **OWASP Top 10**: Addresses all major web vulnerabilities
- **NIST Cybersecurity Framework**: Risk management approach
- **CWE/SANS Top 25**: Common weakness enumeration
- **GDPR**: Data protection regulations
- **PCI DSS**: If processing payments (not currently)

---

## Security Best Practices for Users

If you're self-hosting Loop Atom, follow these practices:

### Server Security

- Keep OS and packages updated
- Use firewall to restrict access
- Enable SSH key authentication
- Disable root login
- Use fail2ban for brute force protection

### Network Security

- Use VPC for database and cache
- Enable network access control
- Use private subnets where possible
- Monitor network traffic

### Access Control

- Limit admin access
- Use strong passwords for infrastructure
- Rotate credentials quarterly
- Audit user access regularly

### Monitoring

- Set up error monitoring (Sentry, etc.)
- Monitor database queries and locks
- Track API response times
- Alert on failed login attempts

---

## Security Headers

Loop Atom uses Helmet.js to set security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' *.vercel.app; style-src 'self' 'unsafe-inline'
```

---

## Incident Response

### If a Vulnerability is Exploited

1. **Contain**: Immediately revoke affected tokens
2. **Investigate**: Review audit logs for scope
3. **Notify**: Inform affected users
4. **Fix**: Deploy security patch
5. **Monitor**: Watch for additional incidents

### Incident Timeline

- **T+0**: Detection and containment
- **T+1h**: Assessment and notification
- **T+4h**: Patch deployed
- **T+1d**: Post-incident review

---

## Questions or Concerns?

- **Security Issues**: security@yourcompany.com
- **General Questions**: GitHub Discussions
- **Other**: [your-email]@example.com

---

**Last Updated**: January 2024
**Version**: 1.0.0

Thank you for helping keep Loop Atom secure! 🔒

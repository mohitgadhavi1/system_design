# Phase 6 — Security & Data Safety (Design Level)

**Not implementation—architecture.**

---

## 6.1 Authentication & Authorization

### Stateless Auth

**Stateful authentication:**
```
1. User logs in
2. Server creates session, stores in database
3. Server returns session ID
4. Every request: Server looks up session in database
```
- Requires database lookup per request
- Doesn't scale well

**Stateless authentication (JWT):**
```
1. User logs in
2. Server creates signed token (JWT)
3. Server returns token to user
4. Every request: Server verifies token signature (no database lookup)
```
- No server-side state
- Scales horizontally
- Token contains user info

**JWT structure:**
```
Header.Payload.Signature
```

**Trade-offs:**
- Stateless: Faster, but can't revoke tokens easily
- Stateful: Slower, but immediate revocation

### Token Lifetimes

**Short-lived tokens (15 minutes):**
- Less damage if stolen
- Better security
- User re-authenticates frequently (bad UX)

**Long-lived tokens (30 days):**
- Better UX
- Greater risk if stolen

**Solution: Refresh tokens**
```
1. Short-lived access token (15 min)
2. Long-lived refresh token (30 days)
3. Access token expires → Use refresh token to get new access token
4. Refresh token stolen? Can be revoked
```

**Security vs convenience trade-off.**

### Trust Boundaries

**Trust boundary**: Line between trusted and untrusted code/data.

**Examples:**

**External trust boundary:**
```
Internet (untrusted) → Load Balancer → API Server (trusted)
```
- Validate all input
- Authenticate requests
- Rate limit

**Internal trust boundary:**
```
API Server (trusted) → Database (more trusted)
```
- Still validate data
- Least privilege access

**No trust boundary:**
```
Microservice A → Microservice B
```
- Both trusted
- Still validate, but less strict

**Principle:** Validate at trust boundaries, sanitize data crossing boundaries.

---

## 6.2 Data Protection

### Encryption at Rest vs In Transit

**Encryption at rest:**
- Data stored on disk is encrypted
- Protects against: Disk theft, unauthorized access to backups

**Encryption in transit:**
- Data transmitted over network is encrypted (TLS/SSL)
- Protects against: Network sniffing, man-in-the-middle attacks

**Both are needed:**
- At rest: Protects stored data
- In transit: Protects data moving between systems

**Common mistake:** Encrypt in transit but not at rest (or vice versa).

### Key Management Concepts

**Symmetric encryption:**
- One key encrypts and decrypts
- Fast
- Key must be kept secret

**Asymmetric encryption:**
- Public key encrypts
- Private key decrypts
- Slower, but safer key distribution

**Key management challenges:**
- Where to store keys? (Not in code!)
- How to rotate keys?
- How to revoke compromised keys?

**Solutions:**
- Key Management Service (KMS): AWS KMS, Google Cloud KMS
- Hardware Security Modules (HSM)
- Envelope encryption: Encrypt data with data key, encrypt data key with master key

**Never:**
- Store keys in source code
- Store keys in environment variables (without secrets manager)
- Use same key for everything

### Least Privilege

**Least privilege**: Grant minimum permissions necessary.

**Bad:**
```
Application has:
- Read database
- Write database
- Drop tables
- Create users
```

**Good:**
```
Application has:
- Read specific tables
- Write specific tables
- No admin permissions
```

**Examples:**

**Database access:**
- Read-only service: Read-only database user
- Admin panel: Full access database user

**API access:**
- User can read own data
- User cannot read others' data
- Admin can read all data

**File storage:**
- Service can write to own folder
- Service cannot write to others' folders

**Design principle:** Default to no access, explicitly grant only what's needed.

---

## 6.3 Abuse & Threat Modeling

### Rate Limiting

**Rate limiting**: Restrict number of requests per time period.

**Without rate limiting:**
```
Attacker sends 1 million requests
Server processes all 1 million
Server crashes or becomes expensive
```

**With rate limiting:**
```
Limit: 100 requests per minute per user
Attacker sends 1 million requests
Server processes 100, rejects rest
Server stays healthy
```

**Rate limit strategies:**

**Per-IP:**
- Limit requests per IP address
- Can be bypassed with VPN/proxies

**Per-user:**
- Limit requests per authenticated user
- Doesn't protect login endpoint

**Per-API-key:**
- Limit requests per API key
- Good for third-party integrations

**Global:**
- Limit total requests to system
- Protects against DDoS

**Implementation:**
- Token bucket
- Sliding window
- Fixed window

### DDoS Basics

**DDoS (Distributed Denial of Service)**: Overwhelm system with traffic.

**Volumetric attack:**
- Send massive traffic (Gbps)
- Saturate network bandwidth
- Solution: CDN, DDoS protection service (Cloudflare)

**Application-layer attack:**
- Send many expensive requests
- Overwhelm application servers
- Solution: Rate limiting, CAPTCHA, caching

**Defense in depth:**
1. CDN (absorbs volumetric attacks)
2. Rate limiting (per-IP, per-user)
3. CAPTCHA (distinguish bots from humans)
4. Autoscaling (handle legitimate spikes)
5. Graceful degradation (shed non-critical features)

**No single solution**: Layer defenses.

### Internal vs External Threats

**External threats:**
- Hackers
- Bots
- Script kiddies
- Focus: Authentication, rate limiting, input validation

**Internal threats:**
- Malicious employees
- Compromised accounts
- Accidental misuse
- Focus: Least privilege, audit logs, access control

**Design for both:**

**External:**
- Strong authentication
- Public-facing attack surface minimized
- Input validation

**Internal:**
- Principle of least privilege
- Audit all sensitive actions
- Separate admin access from user access
- Multi-factor authentication for admin

**Example: Database access**
- External: No direct database access from internet
- Internal: Developers have read-only prod access, write access requires approval

---

## Outcome

**Learner stops treating security as an afterthought.**

You now understand:
- How to authenticate and authorize
- How to protect data
- How to prevent abuse
- Why security is a design decision, not a feature

Next: [Phase 7 — Observability & Operations](phase-7-observability.md)
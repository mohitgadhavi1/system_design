# Phase 8 — Case Studies (Synthesis)

**Now we combine everything.**

Each case study includes:
- Requirements
- Constraints
- Architecture
- Trade-offs
- Failure analysis

---

## 1. URL Shortener

### Requirements

**Functional:**
- Shorten long URLs to short codes
- Redirect short codes to original URLs
- Track click statistics

**Non-functional:**
- 100 million URLs shortened per month
- 1000 reads per write
- High availability (99.9%)
- Low latency (<100ms for redirects)

### Constraints

- 7-character short codes (62^7 ≈ 3.5 trillion combinations)
- Store for 5 years
- Read-heavy (1000:1 read:write ratio)

### Architecture

**Components:**

**1. API Server:**
- POST /shorten → Generate short URL
- GET /:code → Redirect to original URL

**2. Database:**
- Store: short_code → original_url mapping
- Schema: `(short_code, original_url, created_at, click_count)`

**3. Cache:**
- Cache popular short codes
- 80% of traffic hits 20% of URLs
- High cache hit rate

**4. Short Code Generation:**
- Option A: Random (check for collision)
- Option B: Counter-based (distributed counter)
- Option C: Hash (MD5 → base62, handle collision)

**Flow:**
```
Shorten:
  Client → API → Generate code → Database → Return code

Redirect:
  Client → API → Cache check → (miss) Database → Redirect
```

### Trade-offs

**Short code strategy:**
- Random: Simple, but collision possible
- Counter: No collision, but needs coordination
- Hash: Deterministic, but collisions for same URL

**Cache:**
- Store all URLs: Expensive, but no database load
- Store popular URLs: Cheaper, occasional database hit

**Analytics:**
- Real-time: Complex, expensive
- Batch processing: Simpler, delayed metrics

### Failure Analysis

**Database down:**
- Reads fail (can't redirect)
- Solution: Cache hit rate critical, replicate database

**Cache stampede:**
- Popular URL expires
- 1000 requests hit database simultaneously
- Solution: Lock-based refresh, serve stale

**Hot URLs:**
- Celebrity tweets short URL
- 1 million requests in 1 minute
- Solution: CDN, aggressive caching

---

## 2. Chat System

### Requirements

**Functional:**
- One-on-one messaging
- Real-time delivery
- Message history
- Online/offline status

**Non-functional:**
- 10 million daily active users
- 100 messages per user per day
- <1 second message delivery
- 99.9% availability

### Constraints

- Messages must be delivered even if recipient offline
- Message order must be preserved
- Mobile clients (battery constraints)

### Architecture

**Components:**

**1. WebSocket Server:**
- Persistent connections for real-time messaging
- Route messages between users

**2. Message Queue:**
- Store messages for offline users
- Deliver when user comes online

**3. Database:**
- Persistent message storage
- Query message history

**4. Presence Service:**
- Track online/offline status
- Heartbeat mechanism

**Flow:**
```
Send Message:
  User A → WebSocket Server → User B (if online)
                             → Queue (if offline)

Retrieve History:
  User → API → Database → Message history
```

### Trade-offs

**Connection protocol:**
- WebSocket: Real-time, but server must maintain connection
- Long polling: Compatible, but inefficient
- HTTP/2 Server Push: Modern, but limited support

**Message delivery guarantee:**
- At-most-once: Fast, but messages can be lost
- At-least-once: Reliable, but duplicates possible
- Exactly-once: Complex, requires idempotency

**Message storage:**
- Store all messages: Expensive, full history
- Store recent only: Cheaper, limited history

### Failure Analysis

**WebSocket server crash:**
- Active connections lost
- Users reconnect to different server
- Solution: Stateless servers, reconnect logic

**Message queue full:**
- Can't accept new messages
- Solution: Backpressure, reject sends with retry

**Network partition:**
- Users can't reach server
- Messages queued locally
- Solution: Offline mode, sync when reconnected

---

## 3. Feed System (News Feed / Timeline)

### Requirements

**Functional:**
- Users post content
- Users see feed of posts from people they follow
- Personalized ranking

**Non-functional:**
- 100 million users
- 10% post daily, 90% read
- <500ms to load feed
- Eventually consistent (stale feed acceptable)

### Constraints

- Users follow 100s of people
- Some users have millions of followers
- Feed must be fresh (recent posts first)

### Architecture

**Two approaches:**

**Approach 1: Fanout-on-Write (Push)**
```
User posts:
1. Store post in database
2. Push post to all followers' feeds
3. Followers read from pre-built feed
```

**Pros:** Fast reads (feed pre-built)
**Cons:** Slow writes (celebrity with 1M followers)

**Approach 2: Fanout-on-Read (Pull)**
```
User reads feed:
1. Fetch list of followed users
2. Fetch recent posts from each
3. Merge and rank posts
```

**Pros:** Fast writes
**Cons:** Slow reads (must query many users)

**Hybrid Approach:**
- Normal users: Fanout-on-write
- Celebrities: Fanout-on-read
- Best of both worlds

### Trade-offs

**Consistency:**
- Strong: See post immediately after posting
- Eventual: Post appears in feed after delay (acceptable)

**Ranking:**
- Chronological: Simple, fast
- ML-based: Better engagement, slower, complex

**Storage:**
- Store full feed: Fast reads, expensive storage
- Store references: Slower reads, cheaper storage

### Failure Analysis

**Database overload:**
- Too many reads during peak hours
- Solution: Aggressive caching, read replicas

**Celebrity posts:**
- 1M followers, fanout takes minutes
- Solution: Hybrid model, async fanout

**Feed staleness:**
- User sees old posts
- Solution: Cache invalidation, TTL

---

## 4. File Storage (Object Storage)

### Requirements

**Functional:**
- Upload files
- Download files
- Delete files
- List files

**Non-functional:**
- 1 PB total storage
- 10,000 uploads per second
- 100,000 downloads per second
- 99.99% durability (no data loss)

### Constraints

- Files range from 1KB to 1GB
- Most files are small (<10MB)
- Read-heavy (10:1 read:write ratio)

### Architecture

**Components:**

**1. API Server:**
- Handle upload/download requests
- Generate pre-signed URLs (direct upload to storage)

**2. Metadata Database:**
- Store file metadata (name, size, location, owner)
- Fast lookups

**3. Object Storage:**
- Store file blobs
- Partitioned by file hash
- Replicated for durability

**4. CDN:**
- Cache popular files
- Reduce load on origin

**Flow:**
```
Upload:
  Client → API → Generate ID → Storage → Save metadata

Download:
  Client → API → Metadata lookup → Storage URL → Redirect
```

### Trade-offs

**Storage:**
- Single server: Simple, limited capacity
- Distributed: Scalable, complex coordination

**Replication:**
- 3x replication: High durability, expensive
- Erasure coding: Lower overhead, complex

**Access control:**
- Public files: CDN cacheable, no auth needed
- Private files: Auth required, can't cache aggressively

### Failure Analysis

**Storage node failure:**
- Files on that node unavailable
- Solution: Replicate files across nodes

**Metadata database down:**
- Can't locate files
- Solution: Cache metadata, replicate database

**Hot files:**
- Popular file downloaded 1M times
- Solution: CDN, aggressive caching

---

## 5. Payment Processing

### Requirements

**Functional:**
- Process credit card payments
- Refund payments
- Transaction history

**Non-functional:**
- 1000 transactions per second
- <2 second latency
- Strong consistency (no duplicate charges)
- 99.99% availability

### Constraints

- Must integrate with payment gateway (Stripe, PayPal)
- PCI compliance required
- No storing credit card numbers

### Architecture

**Components:**

**1. API Server:**
- Receive payment requests
- Validate requests

**2. Payment Gateway:**
- External service (Stripe)
- Handles credit card processing

**3. Database:**
- Store transaction records
- Idempotency keys to prevent duplicates

**4. Queue:**
- Retry failed payments asynchronously

**Flow:**
```
Payment:
  Client → API → Validate → Payment Gateway → Store transaction
  
Retry:
  Failed payment → Queue → Retry with backoff
```

### Trade-offs

**Idempotency:**
- Store request ID, detect duplicates
- Trade: Storage cost vs duplicate prevention

**Retries:**
- Retry failed payments: Better success rate, risk of duplicate charge
- No retries: Fail fast, user must retry manually

**Consistency:**
- Strong: Slower, but accurate
- Eventual: Faster, but reconciliation needed

### Failure Analysis

**Payment gateway timeout:**
- Uncertain if charge succeeded
- Solution: Idempotency key, query gateway status

**Database failure:**
- Can't store transaction
- Solution: Queue transaction, persist later, replicate database

**Duplicate charge:**
- Network failure, user retries
- Solution: Idempotency key (same request ID = same result)

---

## 6. Rate-Limited API

### Requirements

**Functional:**
- Provide REST API
- Enforce rate limits per user

**Non-functional:**
- 10,000 requests per second
- Rate limit: 100 requests per minute per user
- <50ms latency

### Architecture

**Components:**

**1. API Server:**
- Handle API requests
- Check rate limit before processing

**2. Rate Limiter:**
- Track request count per user
- Redis-based (shared state)

**3. Response headers:**
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 45`
- `X-RateLimit-Reset: 1609459200`

**Algorithms:**

**Token Bucket:**
- Bucket has N tokens
- Each request consumes 1 token
- Refill at fixed rate

**Sliding Window:**
- Count requests in rolling time window
- More accurate, but more expensive

### Trade-offs

**Rate limit granularity:**
- Per-user: Fair, but needs user tracking
- Per-IP: Simple, but shared IPs penalized

**Storage:**
- In-memory: Fast, but lost on crash
- Redis: Persistent, shared across servers

### Failure Analysis

**Redis down:**
- Can't check rate limits
- Solution: Fail open (allow all) or fail closed (deny all)

**Clock skew:**
- Servers have different times
- Rate limit windows misaligned
- Solution: Centralized time source (NTP)

---

## 7. Notification System

### Requirements

**Functional:**
- Send email, SMS, push notifications
- Template-based messages
- Scheduled delivery

**Non-functional:**
- 1 million notifications per day
- <10 seconds delivery time
- 99% delivery rate

### Architecture

**Components:**

**1. API:**
- Accept notification requests

**2. Queue:**
- Buffer notifications
- Decouple sending from request

**3. Workers:**
- Pull from queue
- Send via providers (SendGrid, Twilio)

**4. Database:**
- Store notification status
- Track delivery success/failure

**Flow:**
```
Request:
  Client → API → Validate → Queue → Worker → Provider → Send
```

### Trade-offs

**Delivery guarantee:**
- At-most-once: Fast, but messages can be lost
- At-least-once: Reliable, but duplicates possible (user gets 2 emails)

**Priority:**
- FIFO: Fair, but urgent messages delayed
- Priority queue: Urgent messages first, but complex

**Retry:**
- Retry failures: Better delivery rate, more load
- No retry: Fail fast, lower delivery rate

### Failure Analysis

**Provider outage:**
- Can't send emails
- Solution: Fallback provider, queue for retry

**Worker crash:**
- Notifications stuck in queue
- Solution: Auto-scale workers, health checks

**Duplicate notifications:**
- Retry after network failure
- Solution: Idempotency key, deduplication

---

## Outcome

**Learner can synthesize all concepts into real-world solutions.**

You now understand:
- How to decompose problems
- How to choose appropriate architectures
- How to reason about trade-offs
- How to anticipate failures

**You're ready to design systems.**
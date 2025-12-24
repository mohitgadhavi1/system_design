# Phase 5 — Reliability & Failure Engineering

**This is senior-level thinking.**

---

## 5.1 Failure Is Normal

### Partial Failures

**Partial failure**: Some components work, others don't.

**Scenario:**
```
API Server: Working
Database: Working  
Cache: DOWN
Email Service: Working
```

**System must handle:**
- Cache miss fallback to database
- Degraded performance, but still functional

**Key principle:** Design for partial failures, not just complete failures.

**Strategies:**
- Fallback mechanisms
- Graceful degradation
- Circuit breakers

### Cascading Failures

**Cascading failure**: One failure triggers more failures.

**Example:**
```
1. Cache goes down
2. All requests hit database
3. Database overloaded
4. Database response time increases
5. API servers time out waiting
6. API servers use all threads on waiting
7. API servers stop accepting new requests
8. Load balancer marks API servers unhealthy
9. Total system failure
```

**Started with cache, ended with complete outage.**

**Prevention:**
- Timeouts (fail fast)
- Circuit breakers
- Bulkheads (isolate failures)
- Rate limiting

### Blast Radius

**Blast radius**: How much of the system fails when one component fails.

**Small blast radius:**
```
User uploads → Image Processing Service fails
Result: User uploads down, rest of site works
```

**Large blast radius:**
```
Shared database fails
Result: Entire site down
```

**Reducing blast radius:**
- Separate databases per service
- Regional isolation (US failure doesn't affect EU)
- Gradual rollouts (canary deployments)

**Design goal:** Minimize dependencies, isolate failures.

---

## 5.2 Timeouts, Retries, and Circuit Breakers

### Retry Storms

**Retry storm**: Many clients retry simultaneously, overwhelming system.

**Scenario:**
```
1. Service becomes slow (not down)
2. Clients timeout, retry immediately
3. More load on already-struggling service
4. Service gets slower
5. Even more timeouts and retries
6. Service collapses under retry load
```

**Prevention:**
- Exponential backoff
- Jitter (randomize retry timing)
- Max retries limit

### Exponential Backoff

**Exponential backoff**: Increase delay between retries.

**Without backoff:**
```
Attempt 1: 0s
Attempt 2: 0s
Attempt 3: 0s
(Immediate retries hammer the service)
```

**With exponential backoff:**
```
Attempt 1: 0s
Attempt 2: 1s
Attempt 3: 2s
Attempt 4: 4s
Attempt 5: 8s
```

**With jitter:**
```
Attempt 1: 0s
Attempt 2: 0.5-1.5s (random)
Attempt 3: 1.5-2.5s (random)
Attempt 4: 3.5-4.5s (random)
```

**Jitter prevents thundering herd** when many clients retry.

### When Retries Make Things Worse

**Don't retry:**
- **400 Bad Request**: Client error, retry won't help
- **401 Unauthorized**: Auth issue, retry won't help
- **Non-idempotent operations**: Duplicate side effects

**Example: Payment processing**
```
1. Charge credit card: Success
2. Network fails before acknowledgment
3. Client retries
4. Charge credit card again (double charge!)
```

**Solution:**
- Idempotency keys
- Store request ID, check if already processed

**Retry only when:**
- Transient errors (503, timeout)
- Idempotent operations
- Safe to duplicate

---

## 5.3 Redundancy and Fault Tolerance

### Active-Active vs Active-Passive

**Active-Passive:**
```
Primary Server: Handles traffic
Standby Server: Idle, waiting
```
- On failure: Standby takes over
- Wastes standby capacity
- Failover delay

**Active-Active:**
```
Server 1: Handles traffic
Server 2: Handles traffic
```
- Both servers handle requests
- On failure: Remaining server handles all traffic
- Better resource utilization
- No failover delay

**Trade-offs:**
- Active-Active: More complex (data consistency)
- Active-Passive: Simpler, wasted resources

### Multi-Region Trade-Offs

**Single region:**
- Low latency
- Datacenter failure = total outage

**Multi-region:**
- Survives regional failure
- Higher latency (cross-region traffic)
- Data replication lag
- More expensive

**Strategies:**

**Active-Passive multi-region:**
- Primary region handles traffic
- Secondary region standby
- Failover on primary region failure

**Active-Active multi-region:**
- Users routed to nearest region
- Both regions active
- Complex data consistency

**When to go multi-region:**
- Need very high availability (99.99%+)
- Global user base (latency benefits)
- Regulatory requirements (data residency)

### Cold vs Hot Standby

**Cold standby:**
- Backup exists but not running
- Must be started manually
- Cheapest
- Slowest recovery (minutes to hours)

**Warm standby:**
- Backup running but not serving traffic
- Data replicated, slightly behind
- Moderate cost
- Medium recovery (minutes)

**Hot standby:**
- Backup running and fully synced
- Can take over immediately
- Most expensive
- Fastest recovery (seconds)

**Choose based on:**
- Recovery time objective (RTO)
- Recovery point objective (RPO)
- Budget

---

## 5.4 Graceful Degradation

### Feature Shedding

**Feature shedding**: Disable non-critical features under load.

**Example: E-commerce site under heavy load**

**Shed:**
- Product recommendations (ML model)
- Real-time inventory updates (eventual consistency okay)
- Detailed analytics tracking

**Keep:**
- Add to cart
- Checkout
- Payment processing

**Implementation:**
- Feature flags
- Circuit breakers
- Load-based toggles

### Read-Only Modes

**Read-only mode**: Allow reads, reject writes.

**Use case: Database overloaded**

**Normal mode:**
- Reads: Allowed
- Writes: Allowed

**Read-only mode:**
- Reads: Allowed
- Writes: Rejected (HTTP 503)

**Benefits:**
- System stays partially functional
- Prevents further overload
- Users can browse, not purchase

**Communication:**
- Show banner: "We're experiencing issues, purchases temporarily disabled"

### Fail Soft, Not Hard

**Fail hard:**
- Error occurs
- Return 500 Internal Server Error
- User sees blank page

**Fail soft:**
- Error occurs
- Return cached data (slightly stale)
- Show degraded UI (some features disabled)
- User still gets value

**Examples:**

**Recommendation engine fails:**
- Hard fail: Empty page
- Soft fail: Show popular items instead

**User profile service fails:**
- Hard fail: Can't load site
- Soft fail: Show generic user icon, limited profile

**Search service fails:**
- Hard fail: Error page
- Soft fail: Show trending searches, cached results

**Design principle:** Degrade gracefully, don't collapse entirely.

---

## Outcome

**Learner designs for bad days, not demos.**

You now understand:
- Failures are inevitable
- How failures cascade
- When retries help vs harm
- How to degrade gracefully

Next: [Phase 6 — Security & Data Safety (Design Level)](phase-6-security.md)
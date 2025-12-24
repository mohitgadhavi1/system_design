# Phase 7 — Observability & Operations

**A system you can't see is already broken.**

---

## 7.1 Metrics

### Golden Signals

**Four golden signals** (Google SRE):

**1. Latency**
- How long does a request take?
- Track: p50, p95, p99
- Example: API response time

**2. Traffic**
- How much demand is on your system?
- Track: Requests per second (QPS)
- Example: HTTP requests/sec

**3. Errors**
- What percentage of requests fail?
- Track: Error rate (%)
- Example: 500 errors, timeouts

**4. Saturation**
- How full is your system?
- Track: CPU, memory, disk, connection pool usage
- Example: 80% CPU utilization

**Why these four?**
- Latency: User experience
- Traffic: System load
- Errors: Failures
- Saturation: Capacity

**Monitor these, you catch most problems.**

### What to Measure vs What Not to

**Measure:**
- **User-facing metrics**: Request latency, error rate
- **Saturation**: CPU, memory, disk I/O
- **Business metrics**: Sign-ups, purchases, active users
- **Dependencies**: Database latency, cache hit rate, queue depth

**Don't measure:**
- Metrics you won't use
- Vanity metrics (irrelevant to decisions)
- Too many metrics (alert fatigue)

**Guideline:**
- "If this metric alerts, what action will I take?"
- If no action, don't alert on it

### Alert Fatigue

**Alert fatigue**: Too many alerts → Ignored alerts → Missed real issues.

**Bad alerting:**
```
03:00 AM: CPU at 81% (alert threshold 80%)
03:15 AM: CPU at 79% (resolved)
03:30 AM: CPU at 81% (alert)
03:45 AM: CPU at 78% (resolved)
(Repeat forever)
```

Engineer stops checking alerts.

**Good alerting:**
- **Severity levels**: Critical, Warning, Info
- **Critical**: Wake someone up (system down)
- **Warning**: Check during business hours
- **Info**: Log, but don't alert

**Alert on symptoms, not causes:**
- Bad: "Disk 90% full" (maybe normal)
- Good: "API latency > 500ms" (user impact)

**Alert tuning:**
- Use hysteresis (alert at 90%, resolve at 80%)
- Use time windows (alert if above threshold for 5 minutes)
- Reduce noise, increase signal

---

## 7.2 Logs & Tracing

### Structured Logging

**Unstructured log:**
```
User john_doe logged in from IP 192.168.1.1 at 2025-12-24 10:30:00
```
- Hard to parse
- Hard to search
- Hard to aggregate

**Structured log (JSON):**
```json
{
  "timestamp": "2025-12-24T10:30:00Z",
  "event": "user_login",
  "user_id": "john_doe",
  "ip": "192.168.1.1",
  "status": "success"
}
```
- Easy to parse
- Easy to search (`user_id=john_doe`)
- Easy to aggregate (count logins by user)

**Benefits:**
- Query logs: "Show all failed logins from this IP"
- Aggregate: "How many users logged in today?"
- Dashboard: Graph logins over time

### Correlation IDs

**Problem:** Track a single request across multiple services.

**Without correlation ID:**
```
Service A: Received request
Service B: Processing request
Service C: Error occurred
(Which request failed?)
```

**With correlation ID:**
```
Service A: [req-12345] Received request
Service B: [req-12345] Processing request
Service C: [req-12345] Error occurred
(req-12345 failed in Service C)
```

**Implementation:**
1. Generate unique ID when request enters system
2. Pass ID to all downstream services
3. Include ID in all logs

**Searching logs:**
```
Search: correlation_id="req-12345"
Result: Complete trace of request across all services
```

### Distributed Tracing Mental Model

**Distributed tracing**: Visualize a request's journey through system.

**Request flow:**
```
API Gateway (50ms)
  → Auth Service (10ms)
  → User Service (100ms)
    → Database (80ms)
  → Recommendation Service (200ms)
    → Cache (5ms)
    → ML Model (180ms)
```

**Trace visualization:**
- Shows entire request path
- Shows time spent in each service
- Identifies bottlenecks (ML Model: 180ms!)

**Tools:**
- Jaeger
- Zipkin
- AWS X-Ray

**Use cases:**
- "Why is this request slow?" (Trace shows: Database query took 5 seconds)
- "Which service is failing?" (Trace shows: Service C returned 500)

---

## 7.3 Operating at Scale

### Deployments

**Deployment strategies:**

**1. Blue-Green Deployment**
```
Blue Environment: Old version (live)
Green Environment: New version (idle)

Deploy:
1. Deploy to Green
2. Test Green
3. Switch traffic to Green
4. Keep Blue as rollback
```

**Pros:** Instant rollback, minimal downtime
**Cons:** Requires double infrastructure

**2. Rolling Deployment**
```
10 servers total:
1. Deploy to 2 servers
2. Test those 2 servers
3. Deploy to next 2 servers
4. Repeat until all 10 servers updated
```

**Pros:** No extra infrastructure
**Cons:** Slow, mixed versions temporarily

**3. Canary Deployment**
```
1. Deploy to 5% of servers
2. Monitor metrics (errors, latency)
3. If good: Deploy to 25%
4. If good: Deploy to 100%
5. If bad: Rollback immediately
```

**Pros:** Catch issues early, low risk
**Cons:** Complex setup

### Rollbacks

**Rollback**: Revert to previous version when deployment fails.

**Fast rollback strategies:**

**1. Keep old version running:**
- Blue-green: Switch back to blue
- Fast (seconds)

**2. Redeploy old version:**
- Pull previous Docker image
- Moderate (minutes)

**3. Database migrations:**
- More complex (schema changes)
- Plan migrations carefully (backward compatible)

**When to rollback:**
- Error rate spike
- Latency increase
- Customer reports
- Health check failures

**Automated rollback:**
- Monitor error rate
- If errors > threshold: Auto-rollback
- Don't wait for human decision

### Feature Flags

**Feature flag**: Toggle features on/off without redeploying.

**Use cases:**

**1. Gradual rollout:**
```
if (feature_flag("new_checkout", user)) {
  // New checkout flow
} else {
  // Old checkout flow
}
```
- Enable for 1% of users
- Monitor metrics
- Gradually increase to 100%

**2. A/B testing:**
- 50% see variant A
- 50% see variant B
- Compare metrics

**3. Kill switch:**
- New feature causing issues?
- Disable via flag (no deployment)

**4. Ops flags:**
- Disable expensive features under load
- Enable read-only mode

**Benefits:**
- Decouple deployment from release
- Fast rollback (toggle flag)
- Test in production safely

**Implementation:**
- LaunchDarkly
- Unleash
- Custom solution with config service

---

## Outcome

**Learner can run systems, not just design them.**

You now understand:
- What metrics matter
- How to debug distributed systems
- How to deploy safely
- How to operate at scale

Next: [Phase 8 — Case Studies (Synthesis)](phase-8-case-studies.md)
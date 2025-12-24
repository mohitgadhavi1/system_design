# Phase 1 — Core Building Blocks

**These are the atoms. Everything later is recombination.**

---

## 1.1 Latency, Throughput, and Load

### Latency Budgets

**Latency** is the time it takes to complete one operation.

A typical web request budget:
- DNS lookup: 10ms
- TCP connection: 10ms
- TLS handshake: 20ms
- Server processing: 50ms
- Database query: 30ms
- Response transfer: 10ms
- **Total: 130ms**

Every component consumes part of your budget.

### p50 vs p95 vs p99

**Percentiles** tell you what most users experience:

- **p50 (median)**: 50% of requests are faster than this
- **p95**: 95% of requests are faster than this (1 in 20 is slower)
- **p99**: 99% of requests are faster than this (1 in 100 is slower)

Example:
- p50: 50ms
- p95: 200ms
- p99: 1000ms

This means: most requests are fast, but some users have terrible experiences.

### Why Averages Lie

Average latency: 100ms sounds good.

But the distribution might be:
- 90% of requests: 50ms
- 10% of requests: 550ms
- Average: (90×50 + 10×550) / 100 = 100ms

**Half your users are waiting 10x longer than average.**

Always look at percentiles, not averages.

### Tail Latency Amplification

When one request depends on multiple backend calls:

**Single service:**
- p99 = 100ms
- 99% of requests finish in 100ms

**Request calls 10 services in parallel:**
- Probability all finish in 100ms: 0.99^10 ≈ 90%
- 10% of requests now hit tail latency

**Fan-out makes tail latency your typical latency.**

---

## 1.2 Networking Basics for Designers

### DNS

**Domain Name System**: Translates names to IP addresses.

```
user requests: api.example.com
DNS returns: 192.0.2.1
User connects to: 192.0.2.1
```

**Important for design:**
- DNS responses are cached (TTL: 60s to 1 hour)
- Changing DNS takes time to propagate
- DNS can be used for load balancing (Round-robin DNS)

### TCP vs UDP (Only What Matters)

**TCP (Transmission Control Protocol)**
- Reliable: Guarantees delivery
- Ordered: Packets arrive in sequence
- Connection-based: Handshake required
- Use for: HTTP, databases, APIs

**UDP (User Datagram Protocol)**
- Unreliable: No delivery guarantee
- No ordering: Packets can arrive out of order
- Connectionless: No handshake
- Use for: Video streaming, gaming, DNS

**Design impact:**
- TCP adds latency (handshake, retries)
- UDP is faster but you handle reliability

### Load Balancers (L4 vs L7)

**L4 Load Balancer (Transport Layer)**
- Routes based on IP + Port
- Doesn't inspect packet content
- Fast, simple
- Example: TCP load balancer

**L7 Load Balancer (Application Layer)**
- Routes based on HTTP headers, URL path, cookies
- Can inspect and modify requests
- Slower, but more flexible
- Example: Route /api/* to API servers, /static/* to CDN

**When to use:**
- L4: High throughput, simple routing
- L7: Content-based routing, SSL termination

### Reverse Proxies

A **reverse proxy** sits between clients and servers:

```
Client → Reverse Proxy → Backend Servers
```

**Responsibilities:**
- SSL termination
- Caching
- Compression
- Request routing
- Rate limiting

Popular: Nginx, HAProxy, Envoy

---

## 1.3 Storage Fundamentals

### Disk vs Memory

| Property | Disk (SSD) | Memory (RAM) |
|----------|------------|--------------|
| Speed | ~100 µs | ~100 ns |
| Capacity | TB | GB |
| Cost | Cheap | Expensive |
| Persistence | Yes | No (volatile) |

**Design implications:**
- Use memory for hot data (frequently accessed)
- Use disk for cold data (rarely accessed)
- Cache in memory, persist to disk

### Sequential vs Random I/O

**Sequential I/O**: Reading/writing contiguous blocks
- Fast on spinning disks (~100 MB/s)
- Very fast on SSDs (~500 MB/s)

**Random I/O**: Reading/writing scattered blocks
- Slow on spinning disks (~100 IOPS)
- Fast on SSDs (~10,000 IOPS)

**Design implications:**
- Logs are sequential writes (fast)
- Database indexes are random reads (slower)
- Append-only structures perform better

### Read-Heavy vs Write-Heavy Systems

**Read-Heavy Systems:**
- Social media feeds
- News sites
- Video streaming

**Optimization:**
- Aggressive caching
- Read replicas
- CDNs

**Write-Heavy Systems:**
- Logging systems
- Analytics pipelines
- IoT data ingestion

**Optimization:**
- Write buffering
- Batch writes
- Async processing

---

## 1.4 Databases (Conceptual, Not Vendor-Specific)

### Relational vs NoSQL

**Relational (SQL):**
- Structured schema
- ACID transactions
- Joins across tables
- Strong consistency
- Examples: PostgreSQL, MySQL

**NoSQL:**
- Flexible schema
- Eventual consistency (usually)
- No joins (denormalize)
- Horizontal scaling
- Types: Key-value, Document, Column-family, Graph

**Choose relational when:**
- Complex queries with joins
- Strict consistency required
- Structured, predictable data

**Choose NoSQL when:**
- Simple key-based access
- Massive scale
- Flexible or evolving schema

### Indexes (What They Cost)

**Index**: A data structure that speeds up reads.

**Without index:**
- Full table scan
- O(n) time

**With index:**
- Binary search tree / B-tree
- O(log n) time

**Cost of indexes:**
- Storage space (duplicate data)
- Slower writes (must update index)
- More complex maintenance

**Rule:** Index only what you query frequently.

### Transactions & Isolation

**Transaction**: A group of operations that succeed or fail together.

**ACID Properties:**
- **Atomicity**: All or nothing
- **Consistency**: Valid state to valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed data persists

**Isolation Levels** (weakest to strongest):
1. Read Uncommitted (dirty reads possible)
2. Read Committed (no dirty reads)
3. Repeatable Read (no non-repeatable reads)
4. Serializable (fully isolated)

**Trade-off**: Stronger isolation = lower throughput.

### When Joins Hurt

Joins are expensive at scale:
- Multiple tables scanned
- Large result sets
- Distributed databases can't join efficiently

**Solutions:**
- Denormalize data (duplicate instead of join)
- Cache joined results
- Application-level joins (fetch separately, merge in code)

---

## Outcome

**Learner understands why systems slow down.**

You now know:
- How latency compounds
- Why networks and storage matter
- What databases cost at scale
- Where bottlenecks hide

Next: [Phase 2 — Scaling Reads and Writes](phase-2-scaling.md)
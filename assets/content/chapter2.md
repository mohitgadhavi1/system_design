# Phase 2 — Scaling Reads and Writes

**Now scale hurts. Good.**

---

## 2.1 Caching

### What Caching Actually Saves

**Without cache:**
- Every request hits the database
- Database is the bottleneck
- High latency, limited throughput

**With cache:**
- Most requests hit memory
- Database gets fewer requests
- Lower latency, higher throughput

**Cache hit ratio matters:**
- 90% hit rate: 10x fewer database queries
- 99% hit rate: 100x fewer database queries

### Cache Placement (Client, CDN, Server)

**Client-side cache:**
- Browser cache, mobile app cache
- Controlled by headers (Cache-Control, ETag)
- Fast, but stale data possible

**CDN (Content Delivery Network):**
- Distributed edge servers
- Caches static assets (images, CSS, JS)
- Reduces origin server load

**Server-side cache:**
- Application-level (Redis, Memcached)
- Caches database queries, computed results
- Shared across requests

**Multiple layers:**
```
Client Cache → CDN → Server Cache → Database
```

### TTLs, Eviction, Consistency

**TTL (Time To Live):**
- How long data stays in cache
- Short TTL: Fresher data, more database hits
- Long TTL: Stale data, fewer database hits

**Eviction Policies:**
- **LRU (Least Recently Used)**: Remove oldest unused item
- **LFU (Least Frequently Used)**: Remove least accessed item
- **FIFO**: Remove first item added

**Cache Consistency Problem:**
- Database updated
- Cache still has old value
- Users see stale data

**Solutions:**
- **Write-through**: Update cache when database updates
- **Write-behind**: Update cache first, database later (async)
- **Cache invalidation**: Delete cache entry on update

### Cache Stampede

**Problem:**
- Popular cache entry expires
- 1000 requests arrive simultaneously
- All 1000 hit the database
- Database overloaded

**Solution 1: Lock-based**
- First request gets a lock
- Other requests wait for lock holder to refresh cache

**Solution 2: Probabilistic early expiration**
- Refresh cache slightly before TTL expires
- Reduces simultaneous expirations

**Solution 3: Serve stale**
- Return stale data while refreshing in background

---

## 2.2 Load Balancing

### Algorithms (Round-Robin, Least Connections, Hashing)

**Round-Robin:**
- Distribute requests in order: Server 1, Server 2, Server 3, repeat
- Simple, fair distribution
- Doesn't account for server load

**Least Connections:**
- Send request to server with fewest active connections
- Better for long-lived connections
- Requires tracking state

**Hashing (Consistent Hashing):**
- Hash user ID → same server
- Useful for caching (same user hits same cache)
- Sticky sessions

**Weighted Distribution:**
- More powerful servers get more requests
- Server 1 (10 units), Server 2 (5 units)

### Sticky Sessions

**Problem:**
- User's session data stored on Server 1
- Next request goes to Server 2
- User appears logged out

**Solution: Sticky sessions**
- Route same user to same server
- Use cookies or IP hashing

**Downside:**
- Uneven load distribution
- Server failures lose sessions

**Better solution:**
- Store session in shared cache (Redis)
- Any server can handle any request

### Health Checks

Load balancer must know which servers are alive:

**Active health check:**
- Load balancer pings server every N seconds
- No response = mark server down

**Passive health check:**
- Monitor actual request failures
- Too many errors = mark server down

**Health check endpoint:**
```
GET /health
Response: 200 OK if healthy
```

### Failure Scenarios

**Server goes down:**
- Health check detects failure
- Load balancer stops routing to it
- Remaining servers handle load

**Load balancer goes down:**
- Single point of failure
- Solution: Multiple load balancers (Active-Passive or Active-Active)

**Network partition:**
- Load balancer can't reach servers
- False positive: servers are fine, network is broken

---

## 2.3 Data Partitioning (Sharding)

### Horizontal vs Vertical Partitioning

**Vertical Partitioning (split by columns):**
- Table: Users (id, name, email, bio, photo)
- Partition 1: Users (id, name, email)
- Partition 2: UserProfiles (id, bio, photo)
- Reduces row size, not row count

**Horizontal Partitioning (split by rows):**
- Shard 1: Users with ID 1-1,000,000
- Shard 2: Users with ID 1,000,001-2,000,000
- Scales to more data and traffic

### Shard Keys (The Hardest Part)

**Shard key** determines which shard holds data.

**Common strategies:**

**Range-based:**
- User ID 1-1M → Shard 1
- User ID 1M-2M → Shard 2
- Simple, but can create hot shards

**Hash-based:**
- hash(user_id) % num_shards
- Even distribution
- Hard to add/remove shards

**Geographic:**
- US users → US shard
- EU users → EU shard
- Low latency, but uneven distribution

**Good shard key properties:**
- Even distribution
- Predictable lookup (don't scan all shards)
- Minimal cross-shard queries

### Hot Shards

**Problem:**
- Celebrity user on Shard 3
- All followers' requests hit Shard 3
- Shard 3 is overloaded, others idle

**Solutions:**
- Further partition hot entities
- Cache heavily accessed data
- Use a different shard key

### Rebalancing Pain

**Adding a new shard:**
- Existing: 4 shards
- New: 5 shards
- hash(key) % 4 changes to hash(key) % 5
- Almost all data moves to different shards

**Solution: Consistent Hashing**
- Adding a shard moves only ~1/N data
- Removing a shard moves only that shard's data

---

## 2.4 Replication

### Leader–Follower

**Architecture:**
- One leader (primary): handles writes
- Multiple followers (replicas): handle reads
- Leader replicates changes to followers

**Writes:**
```
Client → Leader → Followers
```

**Reads:**
```
Client → Any Follower
```

**Benefits:**
- Scale reads horizontally
- Fault tolerance (promote follower if leader dies)

### Read Replicas

**Read replicas** are followers optimized for reads:
- No writes accepted
- May be geographically distributed
- May lag behind leader

**Use case:**
- Analytics queries on replica (doesn't slow down production)
- Serve users from nearest replica (low latency)

### Replication Lag

**Lag**: Time between leader write and follower update.

Example:
- User posts a tweet (writes to leader)
- User refreshes page (reads from follower)
- Follower hasn't caught up yet
- User doesn't see their own tweet

**Factors:**
- Network latency
- Follower load
- Replication queue backlog

**Typical lag:**
- Same datacenter: <1 second
- Cross-region: 1-5 seconds
- Under load: 10+ seconds

### Read-Your-Writes Problems

**Problem:**
- User writes data
- Immediately reads data
- Reads from lagging replica
- Data not visible yet

**Solutions:**

**1. Read from leader after write:**
- Write to leader
- Next read also goes to leader
- Guaranteed consistency for that user

**2. Monotonic reads:**
- Same user always reads from same replica
- Won't see data "go backwards"

**3. Wait for replication:**
- Write returns only after replicas acknowledge
- Slower writes, consistent reads

---

## Outcome

**Learner can design for traffic, not hope.**

You now understand:
- How to cache strategically
- How to distribute load
- How to partition data
- How replication works and fails

Next: [Phase 3 — Distributed System Realities](phase-3-distributed-systems.md)
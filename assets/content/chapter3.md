# Phase 3 — Distributed System Realities

**This is where illusions die.**

---

## 3.1 Consistency Models

### Strong vs Eventual Consistency

**Strong Consistency:**
- Every read sees the most recent write
- All nodes agree on current state
- Example: Bank account balance

**Eventual Consistency:**
- Writes propagate asynchronously
- Temporary inconsistencies allowed
- Eventually all nodes converge
- Example: Social media likes count

**Trade-off:**
- Strong consistency: Slower, simpler reasoning
- Eventual consistency: Faster, complex reasoning

### Stale Reads

**Stale read**: Reading old data that's been updated elsewhere.

**Scenario:**
```
Time 0: balance = $100
Time 1: User withdraws $50 (writes to primary)
Time 2: User checks balance (reads from replica)
Time 3: Replica still shows $100 (stale)
Time 4: Replication completes, replica shows $50
```

**When stale reads matter:**
- Financial transactions
- Inventory management
- Read-your-writes scenarios

**When stale reads are acceptable:**
- View counts
- Follower counts
- News feeds

### Monotonic Reads

**Monotonic reads** guarantee you never see data go backwards in time.

**Without monotonic reads:**
```
Time 1: Read from Replica A: balance = $50
Time 2: Read from Replica B: balance = $100 (stale)
Time 3: User confused (balance increased?)
```

**With monotonic reads:**
- Same user always reads from same replica
- Or wait until all replicas caught up

**Implementation:**
- Sticky sessions to replicas
- Version vectors

### Why Users Notice Inconsistency Faster Than Latency

**100ms latency:**
- Noticeable, but acceptable
- "The app is a bit slow"

**Seeing your post disappear:**
- Confusing and broken
- "The app is broken"

**Users have mental models:**
- "I just posted this, so it should be here"
- Violating causality feels like a bug

**Design principle:** Preserve causality for user-facing operations.

---

## 3.2 CAP Theorem (Properly Explained)

### What CAP Actually Says

**CAP Theorem**: In a distributed system with network partitions, you can have at most 2 of 3:

- **C (Consistency)**: Every read sees the most recent write
- **A (Availability)**: Every request gets a response (success or failure)
- **P (Partition Tolerance)**: System works despite network failures

**During a partition, choose:**
- **CP**: Reject requests (unavailable) to maintain consistency
- **AP**: Serve requests (potentially stale data) to maintain availability

### What It Does Not Say

**CAP is not a spectrum:**
- You don't "tune" CAP
- It's a constraint during network partitions

**CAP doesn't mean:**
- "Pick 2 and forget the 3rd"
- You always want partition tolerance
- During normal operation (no partition), you get CA

**CAP applies only during network failures**, which are rare but inevitable.

### Availability in Real Systems

**Availability** doesn't mean "always returns success":
- It means "returns a response" (success or failure)
- Returning "error: data unavailable" is still available

**Real-world availability:**
- 99.9% (three nines): 8.76 hours downtime/year
- 99.99% (four nines): 52.56 minutes downtime/year
- 99.999% (five nines): 5.26 minutes downtime/year

**Cost vs benefit:**
- Each additional nine is exponentially harder
- Diminishing returns

### Choosing Sacrifices Consciously

**Choose CP (consistency over availability):**
- Banking systems
- Inventory management
- Booking systems
- Anything where wrong data causes real harm

**Choose AP (availability over consistency):**
- Social media feeds
- Analytics dashboards
- Logging systems
- Anything where stale data is acceptable

**Example:**
- Bank transfer: CP (reject if uncertain)
- Like button: AP (eventual consistency okay)

---

## 3.3 Distributed Coordination

### Locks

**Distributed lock**: Ensure only one process performs an action.

**Use case:**
- Multiple workers processing job queue
- Only one should process each job

**Challenge:**
- Process acquires lock
- Process crashes before releasing lock
- Lock is stuck forever

**Solution: Locks with TTL (time to live):**
- Lock auto-releases after N seconds
- Process must renew lock periodically

**Problem with TTL:**
- Process thinks it has lock
- Lock expires (process was slow)
- Another process gets lock
- Both processes execute simultaneously

**Better: Fencing tokens** (unique, incrementing ID)

### Leader Election

**Leader election**: Multiple nodes elect one leader.

**Use cases:**
- Database primary
- Job scheduler
- Distributed cache coordinator

**Algorithms:**
- Raft
- Paxos
- ZooKeeper (uses Zab)

**Process:**
1. Nodes vote for themselves or others
2. Node with majority votes becomes leader
3. Leader sends heartbeats
4. If leader dies, re-elect

### Heartbeats

**Heartbeat**: Periodic "I'm alive" message.

```
Leader → Followers: "I'm still alive"
```

**Failure detection:**
- Leader stops sending heartbeats
- Followers detect timeout
- New election triggered

**Tuning:**
- Fast heartbeats: Quick failure detection, more network traffic
- Slow heartbeats: Slow detection, less traffic

**False positives:**
- Network is slow (not failed)
- Heartbeat times out
- Unnecessary election

### Split-Brain Scenarios

**Split-brain**: Network partition creates multiple leaders.

**Scenario:**
```
Before partition: Leader A, Followers B, C, D
After partition: 
  - Partition 1: A, B (minority)
  - Partition 2: C, D (minority)
```

Both partitions elect leaders → two leaders.

**Solution: Quorum**
- Require majority (N/2 + 1) to elect leader
- Partition 1: 2 nodes, no quorum
- Partition 2: 2 nodes, no quorum
- No new leader elected

**Only one partition can have quorum.**

---

## 3.4 Time and Ordering

### Clock Skew

**Clock skew**: Different machines have different times.

**Causes:**
- NTP drift
- Misconfigured timezone
- Hardware clock drift

**Impact:**
- Timestamp-based ordering wrong
- TTLs expire at different times
- Distributed logs out of order

**Magnitude:**
- Well-configured NTP: ~1-10ms skew
- Misconfigured: seconds to minutes

**Design implications:**
- Don't rely on wall-clock time for ordering
- Use logical clocks

### Logical Clocks

**Logical clock**: Orders events without wall-clock time.

**Lamport Timestamp:**
- Each node has a counter
- On event: increment counter
- On message send: include counter
- On message receive: set counter = max(local, received) + 1

**Property:** If A happened before B, then timestamp(A) < timestamp(B).

**Limitation:** Opposite not true (concurrent events may have different timestamps).

**Vector Clocks:**
- Track causality more precisely
- Each node maintains vector of all nodes' counters

### Idempotency

**Idempotent operation**: Running it multiple times has same effect as once.

**Examples:**
- **Idempotent**: SET balance = 100
- **Not idempotent**: ADD 100 to balance

**Why it matters:**
- Network failures cause retries
- Message delivery might be duplicated
- Idempotency makes retries safe

**Making operations idempotent:**
- Use unique request IDs
- Check if operation already completed
- Store result, return cached result on retry

### Exactly-Once (Why It's a Lie)

**Delivery guarantees:**

**At-most-once:**
- No retries
- Might lose messages

**At-least-once:**
- Retry until acknowledged
- Might deliver duplicates

**Exactly-once:**
- The holy grail
- Impossible in general case

**Why exactly-once is impossible:**
- Message delivered and processed
- Acknowledgment lost
- Sender retries (message processed again)

**"Exactly-once" in practice:**
- Actually "at-least-once + idempotency"
- Or "effectively once" (transactional systems)
- Marketing term, not technical reality

---

## Outcome

**Learner stops believing in "perfect systems".**

You now understand:
- Consistency is a spectrum
- Networks fail in surprising ways
- Time is relative
- Perfect delivery is impossible

Next: [Phase 4 — Asynchronous & Event-Driven Design](phase-4-async-events.md)
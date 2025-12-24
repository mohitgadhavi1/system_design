# Phase 0 — How to Think in Systems (Foundation)

**Most courses skip this. They shouldn't.**

---

## 0.1 What Is System Design, Really?

### Systems vs Programs
- **Programs**: Single-purpose, running on one machine, with predictable inputs
- **Systems**: Multiple components, distributed across machines, with unpredictable scale

A program becomes a system when:
- It needs to handle more traffic than one machine can serve
- It needs to be available when hardware fails
- It needs to coordinate between multiple services or data stores

### Requirements vs Assumptions
**Requirements** are what you're told or asked for:
- "Build a URL shortener"
- "Support 1 million users"

**Assumptions** are what you fill in:
- How many URLs per user?
- Read-heavy or write-heavy?
- Geographic distribution?

Never design on assumptions alone. Always clarify.

### Functional vs Non-Functional Requirements

**Functional Requirements**: What the system does
- Shorten URLs
- Redirect users
- Track clicks

**Non-Functional Requirements**: How well the system does it
- Latency < 100ms
- 99.9% availability
- Handle 10,000 QPS

Non-functional requirements drive architecture decisions.

### Why "It Depends" Is Not a Cop-Out

Every design decision is a trade-off:
- Want low latency? You might sacrifice consistency.
- Want strong consistency? You might sacrifice availability.
- Want horizontal scaling? You might sacrifice simplicity.

"It depends" is the right answer when you need to know:
- Traffic patterns
- Budget constraints
- Team expertise
- Acceptable trade-offs

---

## 0.2 Reading a Problem Like an Engineer

### Asking Clarifying Questions

Good questions expose hidden requirements:

**Scale Questions:**
- How many users?
- How many requests per second?
- Read-to-write ratio?
- Data growth rate?

**Behavior Questions:**
- What happens if...?
- Do we need real-time or eventual consistency?
- What's acceptable downtime?
- What's more important: latency or throughput?

**Constraint Questions:**
- Existing infrastructure?
- Budget limits?
- Team size and expertise?
- Compliance requirements?

### Identifying Bottlenecks Early

Common bottlenecks:
- **Database**: Too many reads/writes
- **Network**: Bandwidth saturation
- **CPU**: Computation-heavy operations
- **Memory**: Large datasets, caching limits
- **Disk I/O**: Sequential vs random access patterns

Ask: "What will break first at 10x scale?"

### Estimation Basics (QPS, Storage, Bandwidth)

**Back-of-the-envelope calculations:**

**QPS (Queries Per Second):**
- 1 million daily active users
- Each user makes 10 requests/day
- 10 million requests/day
- ~120 requests/second average
- Peak traffic (3x): ~360 QPS

**Storage:**
- 1 million users
- Each user stores 1KB of data
- 1GB total storage
- Over 5 years with 20% annual growth: ~2.5GB

**Bandwidth:**
- 1000 QPS
- Average response size: 10KB
- 10MB/s outbound bandwidth

**Use approximations:**
- 1 million ≈ 10^6
- 1 billion ≈ 10^9
- 2^10 ≈ 1000

### Designing on a Whiteboard vs Reality

**Whiteboard designs are clean.** Real systems are not.

Whiteboard:
- Single database
- Perfect network
- No failures

Reality:
- Database replication lag
- Network partitions
- Partial failures

Design on a whiteboard, but think in reality:
- "What if the database goes down?"
- "What if network is slow?"
- "What if one region fails?"

---

## Outcome

**Learner stops panicking when given vague problems.**

You now understand:
- How to decompose a problem
- What questions to ask
- How to estimate scale
- Why trade-offs are inevitable

Next: [Phase 1 — Core Building Blocks](phase-1-building-blocks.md)
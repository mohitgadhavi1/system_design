# Phase 4 — Asynchronous & Event-Driven Design

**Systems breathe when decoupled.**

---

## 4.1 Queues

### When Queues Help

**Without queue:**
```
Client → Service A → Service B → Service C
```
- Synchronous chain
- Client waits for all services
- One slow service blocks everything

**With queue:**
```
Client → Service A → Queue → Service B → Service C
```
- Client gets immediate response
- Background processing continues asynchronously
- Services work at their own pace

**Use queues when:**
- Response doesn't need to be immediate
- Processing is slow or resource-intensive
- Traffic spikes would overwhelm downstream services

**Examples:**
- Email sending
- Image processing
- Report generation
- Webhook delivery

### Backpressure

**Backpressure**: Slow consumer can't keep up with fast producer.

**Without backpressure handling:**
```
Producer: 1000 msg/sec
Consumer: 100 msg/sec
Queue grows unbounded → Out of memory
```

**Solutions:**

**1. Bounded queue:**
- Max queue size
- Producer blocks or errors when full
- "Sorry, try again later"

**2. Rate limiting:**
- Limit producer to consumer's rate
- Smooth out spikes

**3. Scale consumers:**
- Add more consumer instances
- Parallel processing

**4. Drop messages:**
- Least important messages dropped first
- Example: Analytics events (not critical)

### Message Durability

**Durability**: Messages survive crashes.

**In-memory queue:**
- Fast
- Messages lost on crash
- Use for non-critical data

**Persistent queue:**
- Messages written to disk
- Survive crashes
- Slower, but safe
- Use for critical data

**Configuration trade-offs:**
- **Durability + Replication**: Safest, slowest
- **Durability only**: Moderate safety, moderate speed
- **In-memory only**: Fast, data loss risk

### Consumer Scaling

**Scaling consumers:**

**Single consumer:**
```
Queue → Consumer
```
- Simple
- Limited throughput

**Multiple consumers (competing consumers):**
```
Queue → Consumer 1
     ↘ Consumer 2
     ↘ Consumer 3
```
- Higher throughput
- Must ensure each message processed once

**Partitioned queue:**
```
Partition 1 → Consumer 1
Partition 2 → Consumer 2
Partition 3 → Consumer 3
```
- Parallel processing
- Order preserved within partition

---

## 4.2 Pub/Sub Systems

### Fan-Out

**Pub/Sub (Publish/Subscribe)**: One message delivered to many subscribers.

```
Publisher → Topic → Subscriber 1
                  ↘ Subscriber 2
                  ↘ Subscriber 3
```

**Use cases:**
- User posts photo → Notify followers, Update feed, Process for search
- Order placed → Send email, Update inventory, Log analytics

**Fan-out ratio:**
- 1 event → N subscribers
- Can create thundering herd

### Event Ordering

**Problem**: Multiple events, each published to subscribers.

**Without ordering guarantees:**
```
Event A: User created
Event B: User updated
Subscriber receives: B, A (wrong order)
Result: User doesn't exist when update arrives
```

**Solutions:**

**1. Global order:**
- Single partition
- All events ordered
- Low throughput

**2. Partition by key:**
- Hash(user_id) → Partition
- Events for same user are ordered
- Events across users are not

**3. Version numbers:**
- Each event has version
- Subscriber ignores out-of-order events

### At-Least-Once Delivery

**At-least-once**: Message delivered one or more times.

**Scenario:**
```
1. Subscriber receives message
2. Subscriber processes message
3. Subscriber about to acknowledge
4. Network failure before ack
5. Message redelivered
6. Subscriber processes again (duplicate)
```

**Handling duplicates:**
- Make processing idempotent
- Track message IDs (deduplication)
- Design for eventual consistency

### Replayability

**Replayability**: Re-process old events.

**Use cases:**
- Bug fix: Reprocess with corrected logic
- New subscriber: Catch up on historical events
- Disaster recovery: Rebuild state from events

**Implementation:**
- Retain messages for N days/weeks
- Subscribers track their position (offset)
- Subscribers can reset to earlier offset

**Event sourcing:**
- Events are source of truth
- Current state derived from events
- Always replayable

---

## 4.3 Background Processing

### Workers

**Worker pattern**: Pull jobs from queue, process them.

```
Queue → Worker 1
     ↘ Worker 2
     ↘ Worker 3
```

**Job distribution:**
- Workers poll queue
- First worker to claim job processes it
- Job removed from queue after completion

**Scaling:**
- Add more workers for higher throughput
- Remove workers during low traffic

**Considerations:**
- Worker crashes mid-processing (job not completed)
- Solution: Job timeout, requeue if not finished

### Retry Strategies

**Retry**: Reprocess failed jobs.

**Immediate retry:**
- Retry immediately after failure
- Fast for transient errors
- Can overwhelm system if failure persists

**Exponential backoff:**
```
Attempt 1: Fail, wait 1 second
Attempt 2: Fail, wait 2 seconds
Attempt 3: Fail, wait 4 seconds
Attempt 4: Fail, wait 8 seconds
```
- Reduces load on failing system
- Gives time for recovery

**Max retries:**
- Retry 3-5 times, then give up
- Move to dead-letter queue

**Jitter:**
- Add randomness to backoff
- Prevents thundering herd on retry

### Poison Messages

**Poison message**: Message that always causes processing failure.

**Scenario:**
```
1. Worker processes message
2. Bug in worker code
3. Processing fails
4. Message requeued
5. Repeat forever (worker stuck)
```

**Detection:**
- Track retry count per message
- If retries exceed threshold, it's poison

**Handling:**
- Move to dead-letter queue
- Log for manual inspection
- Alert team

### Dead-Letter Queues

**Dead-letter queue (DLQ)**: Holds messages that can't be processed.

**Purpose:**
- Prevent poison messages from blocking queue
- Preserve failed messages for debugging
- Allow manual intervention

**Process:**
```
Main Queue → Processing fails → DLQ
```

**Monitoring:**
- Alert when DLQ size grows
- Regularly review and fix issues
- Replay fixed messages back to main queue

---

## Outcome

**Learner designs systems that absorb spikes gracefully.**

You now understand:
- How queues decouple systems
- How to handle backpressure
- How events enable scalability
- How to process work asynchronously

Next: [Phase 5 — Reliability & Failure Engineering](phase-5-reliability.md)
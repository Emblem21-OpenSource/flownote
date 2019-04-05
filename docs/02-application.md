# The Application Concept

Applications contain Flows (which represent your business logic.) and an Event Queue (for Event progression).

## Event Queue

The Event Queue receives Events from Nodes, Milestones, and Channels and properly executes the Actions within each.

### Custom Queue Types

You can also create wrappers for custom queues such as Redis, ZeroMQ, or queuing services. See the [MemoryQueue](../src/queues/memoryQueue.js) as an example of how to create a valid Queue Class.  Once you create your queue, you can register it with the application with a call to `app.registerQueueType(<name of the queue type>, <Your new Queue Class>)` like [this code does.]()

## Examples

To see more isolated examples, check out the [flowExamples.js](../tests/flowExamples.js) test.

##### Documentation

( 
[Installation](01-installation.md) | 
[Features](07-features.md) | 
Application | 
[Flow](03-flow.md) | 
[Nodes](04-nodes.md) | 
[Channels](05-channels.md) | 
[Use Cases](06-use-cases.md) | 
[Language](08-language.md) | 
[Contribution Overview](09-contribution.md) | 
[Roadmap](10-roadmap.md) | 
[Known Problems](11-known-problems.md)
)
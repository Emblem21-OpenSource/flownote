# The Channel Concept

![Channels](docs/images/Channels.png)

Channels are how information is passed between Nodes and Milestones. They accept specific events to manage Event progression. If a Node or Milestone throws an error and the preceding Channel had retry options set, the failed Event will be retried via a RetryChannel upon the exception-throwing Node or Milestone a number of times according to those options. RetryChannels will undo any changes to the Request state before retrying the node. Channels can also have one or more Actions.  RetryChannels can be manually designated outside of the implied retry functionality, allowing error-throwing nodes to retry to any location you desire.

## Retry options

* `retry`  can be a number of retries to attempt or a string of an Action name to use to generate a number of retries.returns a number.
* `retryDelay` can be a number of milliseconds to wait between retry attempts or a string of an Action name to use to generate a millisecond number.

## Examples

Coming soon!

##### Documentation

( 
[Installation](01-installation.md) | 
[Features](07-features.md) | 
[Use Cases](06-use-cases.md) | 
[Language](08-language.md) | 
[Application](02-application.md) | 
[Flow](03-flow.md) | 
[Nodes](04-nodes.md) | 
Channels | 
[Contribution Overview](09-contribution.md) | 
[Roadmap](10-roadmap.md) | 
[Known Problems](11-known-problems.md)
)
# The Node Concept

Nodes contain Actions and connect to one or more Channels. Node Actions are responsible for explicitly `dispatch`ing events for intended Channels. Node Actions can fire `dispatch` multiple times per execution, initiating a parallel Event progression through a Flow. Node Actions can also `schedule` future Actions for Milestones.

### Milestones

Milestones will execute all of their Actions and any Actions that have been `schedule`d prior to the Milestone. Once all `schedule`d Actions are executed, the schedule will be emptied.  It is HIGHLY recommended to `schedule` future Actions in previous Node Actions that are related to retrieving or committing information to persistent and/or non-idempotent services.  If you don't do this, you will experience difficult-to-reverse transactional situations during parallel processing. Like Nodes, Milestones also connect to one or more Channels and are responsible for their own `dispatch`ing.

## Actions

Actions are individual axioms about your business rules.  Within an action, you can `dispatch` Event progression, `set` and `get` values to a Request, `schedule` Actions to perform at a Milestone, and `waitFor` Nodes, Channels, and/or Milestones to process an Event.  Each Node, Channel, or Milestone can have one or more Actions that will be sequentially executed when an Event is passed between them.

## Examples

Coming soon!

##### Documentation

( 
[Installation](01-installation.md) | 
[Features](07-features.md) | 
[Application](02-application.md) | 
[Flow](03-flow.md) | 
Nodes | 
[Channels](05-channels.md) | 
[Use Cases](06-use-cases.md) | 
[Language](08-language.md) | 
[Contribution Overview](09-contribution.md) | 
[Roadmap](10-roadmap.md) | 
[Known Problems](11-known-problems.md)
)
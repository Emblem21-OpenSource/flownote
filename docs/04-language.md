# FlowNote Language

FlowNote is designed to simplify event-driven development by representing [flow-based programming](https://en.wikipedia.org/wiki/Flow-based_programming concepts linguistically.  Event-driven code is notoriously scattered, difficult to reason about, and very exception driven.  By breaking down our Applications into Flows, Nodes, Milestones, Actions, and Channels, we can cleanly represent event-driven Applications in a human-friendly manner.

For the conceptual documentation, we will be referring to the Application flow below throughout the remainder of the documetation:

![Flow](images/Flow.png)

This flow can be represented via the following FlowNote code:

```java
// Define Nodes that execute a series of Actions
Node getClick = extractClickData, extractPlayerId
Node extractXY = getXYCoordsFromClickData
Node movePlayer = getPlayerById, detectPlayerMovementEvents, movePlayer, dispatchPlayerMovementEvents
Node displayBoundaryError = getPlayerById, sendBoundaryError
Node notifyRoom = getBroadcastMessage, getRoomByPlayerId, broadcastToRoom

// Create a Flow that can be accessed via GET /click
// The first node in the Flow will be the getClick Node.
// getClick has been silenced ($) and will not emit events.
// getClick connects via a StandardChannel (->) to an extractXY Node.
// The extractXY Node is given an instance name of "clickBranch"
Flow click(GET /click) = getClick$ -> extractXY#clickBranch

// Using the "clickBranch" instance name, we attach a Coordinates Channel and its options (-Coordinates{ ... }>) to the extractXY Node within the click Flow.
// Then we connect the Coordinates Channel to a movePlayer Node and allow the Channel to retry exceptions from movePlayer three times.
// The movePlayer Node is given an instance name of "move".
// The movePlayer also will have a Milestone after it (*) to commit all accumulated Actions.
clickBranch -Coordinates{ retry: 3 }> movePlayer*#move

// Using the "clickBranch" instance name, we attach an ErrorChannel (-ErrorChannel!) to the extractXY Node within the click Flow that accepts BoundaryErrors.
// The displayBoundaryError Node is the recipent of errors passed through the BoundaryError channel.
clickBranch -BoundaryError! displayBoundaryError

// Using the "clickBranch" instance name, we attach a notifyRoom node to the extractXY in the click Flow via a StandardChannel. (->)
// Ensure that notifyRoom waits (...) for the movePlayer Node within the click Flow to complete before performing its actions.
clickBranch -> notifyRoom ... move

```

In nine lines of code, we can orchestrate how multiple functions interact with one another together with retry functionality, error handling, sane transactional persistence, dynamic dependencies, and expose them for usage very easily.

##### Behavior Driven-Design (Coming soon!)

Additionally, FlowNote allows for Behavior Driven-Design grammar as well to allow non-developer conceptualization of how an Application should world. This is a English BDD example of the above code:

```java
GetClick Node is ExtractClickData and ExtractPlayerId
ExtractXY Node is GetXYCoordsFromClickData
MovePlayer Node is GetPlayerById, DetectPlayerMovementEvents, MovePlayer and DispatchPlayerMovementEvents
DisplayBoundaryError Node is GetPlayerById and SendBoundaryError
NotifyRoom Node is GetBroadcastMessage, GetRoomByPlayerId and BroadcastToRoom

Click Flow (GET /click) is a silent GetClick that connects to ExtractXY (as ClickBranch)
ClickBranch connects with Coordinates (retries 3 times) to MovePlayer then commits (as Move)
ClickBranch errors with BoundaryError to DisplayBoundaryError
ClickBranch connects to NotifyRoom but waits for Move
```

## Examples

* [A .flow file for the above code.](https://github.com/Emblem21-OpenSource/flownote/blob/master/compiler/test.flow)

##### Documentation

( 
[Installation](01-installation.md) | 
[Features](02-features.md) | 
[Use Cases](03-use-cases.md) | 
Language | 
[Application](05-application.md) | 
[Flow](06-flow.md) | 
[Nodes](07-nodes.md) | 
[Channels](08-channels.md) | 
[Contribution Overview](09-contribution.md) | 
[Roadmap](10-roadmap.md) | 
[Known Problems](11-known-problems.md)
)
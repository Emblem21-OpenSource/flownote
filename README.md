# FlowNote

FlowNote is a programming language designed to help reason about and represent flow-based paradigms.

## _Getting Started_

### Installation

`npm install flownote`

### Example

```javascript
import {
  Application,
  Flow,
  StandardNode,
  StandardChannel,
  Action
} from 'flownote'

const app = new Application(undefined, 'Test App', {
  logLevel: 3
})

const doubleXAction = new Action(app, undefined, 'doubleX', function doubleX () {
  this.set('x', this.get('x') * 2)
})

const halveXAction = new Action(app, undefined, 'halveX', function halveX () {
  this.set('x', this.get('x') / 2)
})

const addXAndYAction = new Action(app, undefined, 'addXAndY', function addXAndY () {
  this.set('x', this.get('x') + this.get('y'))
})

const subtractXFromYAction = new Action(app, undefined, 'subtractXFromY', function subtractXFromY () {
  this.set('y', this.get('x') - this.get('y'))
})

app.registerAction(doubleXAction.name, doubleXAction)
app.registerAction(halveXAction.name, halveXAction)
app.registerAction(addXAndYAction.name, addXAndYAction)
app.registerAction(subtractXFromYAction.name, subtractXFromYAction)

const flow = new Flow(app, undefined, 'Test Flow', {}, undefined, 'GET', '/testFlow', [ 'x', 'y' ])
app.setPublicFlow(flow)

const doubleXNode = new StandardNode(app, undefined, 'Double X', [], [], [ app.getAction('doubleX') ])
const channelA = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, [])
const addXAndYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('addXAndY') ])
const channelB = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, [])
const halveXNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('halveX') ])
const channelC = new StandardChannel(app, undefined, 'Channel', undefined, [], undefined, [])
const subtractXFromYNode = new StandardNode(app, undefined, 'Add X and Y', [], [], [ app.getAction('subtractXFromY') ])

flow.connect(doubleXNode)
doubleXNode.connect(channelA)
channelA.connect(addXAndYNode)
addXAndYNode.connect(channelB)
channelB.connect(halveXNode)
halveXNode.connect(channelC)
channelC.connect(subtractXFromYNode)

const result = await app.request('GET', '/testFlow', {
  x: 2,
  y: 10
})
```

To see more isolated examples, check out the [flowExamples.js](tests/flowExamples.js) test.

## _Concepts_

### Application

Applications contain Flows (which represent your business logic.) and an Event Queue (for Event progression).  Applications have a `request(httpMethod, httpRoute, parameters)` method which will pass a request through the corresponding Flow. Applications also can take input and send output to pipes. By default, Applications receive input from  `stdin` and emit all Events progression to `stdout` and `stderr` accordingly.  Input pipe chunks are processed by the callback passed into `setOnInput()`. If the input pipe closes, the callback passed into `setOnShutdown()` will fire.

### Flows

Flows contain Nodes and Milestones that are connected together via Channels. Flows can also connect to Flows to maximize reuse of business logic.

### Event Queue

The Event Queue receives Events from Nodes, Milestones, and Channels and properly executes the Actions within each.

### Actions

Actions are individual axioms about your business rules.  Within an action, you can `dispatch` Event progression, `set` and `get` values to a Request, `schedule` Actions to perform at a Milestone, and `waitFor` Nodes, Channels, and/or Milestones to process an Event.  Each Node, Channel, or Milestone can have one or more Actions that will be sequentially executed when an Event is passed between them.

### Nodes

Nodes contain Actions and connect to one or more Channels. Node Actions are responsible for explicitly `dispatch`ing events for intended Channels. Node Actions can fire `dispatch` multiple times per execution, initiating a parallel Event progression through a Flow. Node Actions can also `schedule` future Actions for Milestones.

### Milestones

Milestones will execute all of their Actions and any Actions that have been `schedule`d prior to the Milestone. Once all `schedule`d Actions are executed, the schedule will be emptied.  It is HIGHLY recommended to `schedule` future Actions in previous Node Actions that are related to retrieving or committing information to persistent and/or non-idempotent services.  If you don't do this, you will experience difficult-to-reverse transactional situations during parallel processing. Like Nodes, Milestones also connect to one or more Channels and are responsible for their own `dispatch`ing.

### Channels

Channels are how information is passed between Nodes and Milestones. They accept specific events to manage Event progression. If a Node or Milestone throws an error and the preceding Channel had retry options set, the failed Event will be retried upon the exception-throwing Node or Milestone a number of times according to those options. Channels can also have one or more Actions.

## _Features_

### Output Emission

When a Request is started, a Request is finished, a Flow is started, a Flow has reached an end, a Node/Milestone/Channel Action is being run, a Request variable is `change`d, or an Error is thrown, a JSON object about that Event is printed to the Application's output/error pipes. This is designed primarily for Unity or other render-only platforms to have total transparency into the lifecycle of a FlowNote process.

### Error Pathing

If a Node or Milestone throws an error, `ErrorChannel`s can be imported and `connect`ed to determine which Node or Milestone handles the error. That error path can be reconnected with future Nodes in the flow as well. It's also possible that a Node or Milestone can throw an error and engage in intended Event progression as well.

### Event Delegation

To prevent memory leaks, `EventEmitter` is not used. Instead, we use `SetImmediate` as the core of our Event Queue.

### JSON Hydration

FlowNote is designed to represent an Application as a pure state machine.  This means the Application can be reduced down to a JSON object and be fully restored at any given time. This means the Application object, the Event Queue and all pending Events, all Flows and their Nodes, Channels, and Milestones (even if they are self-referential or eventually circularly connected), and all code that makes up all Actions are representable as a JSON. That JSON can be transmitted to child threads/processes or external resources for scalable processing. This can be incredibly useful for debugging, testing, snapshots, scaling, and versioning.

### Parallel Processing

FlowNote naturally allows for parallel processing and has a useful feature to prevent deadlocking. Actions can use `waitFor` to delay Event progression until other Nodes, Channels, or Milestones execute. If the target had already executed for that Request, `waitFor` will progress, otherwise, it will wait until that target executes.

### Request History

Within Actions, variables of the Request can be `set` or `get`. Instead of overwriting values, `set` commits the value to the Request and which Application, Flow, and Node/Channel/Milestone initiated the `set`. Additionally, the Request keeps track of which path it took through a Flow. This is incredibly useful for debugging and other activities for render clients.  The full history of `set` commits can be boiled down to a single Object with unique keys via the Request's `getState()`.

### Cyclical Detection

If you accidentally connect Nodes, Milestones, in a Channel that results in a cyclical loop, FlowNote will detect it and throw a `CyclicalError`.

### Domain Specific Language (Coming soon!)

FlowNote is designed to bring the linguistic part of our brains to help reason about and design flow-based programming tasks.  As a result, it has grammar. It's currently experimental, so check back later.  To generate the following Flow:

![](docs/flowExample.png)

... you can use the following code:

```java
// clickHandler.flow

clickEndpoint = getClick -> extractXY
clickEndpoint xyChannel{ retry:3 }> movePlayer*
clickEndpoint BoundaryError> displaySyntaxError

clickFlow(GET /click) = clickEndpoint
```

In this example, we assume that all Nodes are predefined with predefined Actions.  This example will establish a Flow that can be reached via a `GET /click` Request. The Flow starts with `getClick`, which gets click data from the input pipe. That data is then passed to the `extractXY` via a `StandardChannel`. These connected Nodes are stored into a `clickEndpoint` variable. From there, we use an `xyChannel` to attach the `movePlayer` Node to `extractXY` (at the end of `clickEndpoint`). `xyChannel` has retry options and the `movePlayer` has an asterik, which means it is to act as a `Milestone` since it is committing changes to a player's location.  Additionally, we would also like to handle any BoundaryErrors `extractXY` can generate, so we use a `BoundaryError` Channel to connect the `extractXY` Node to the `displaySyntaxError` Node.  Finally, we attach the clickEndpoint to the clickFlow and expose the clickFlow to `GET /click` Requests.

In four lines of code, we can orchestrate multiple functions together with retry functionality, error handling, sane transactional persistence, and expose them for usage very easily. As a Request moves through Nodes and Channels and Milestones and its values are `set`, the output pipe of the Application will emit JSONs of all Event Progression.

## _Future_

* Fuzz test the Event Queue to ensure memory leaks aren't happening
* Allow alternative Event Queues to be utilized.
* Allow Event retries to have a programmatic number of attempts.
* Allow Event retries to have programmatic delays for throttling compliance.
* Allow for endpoints and Requests to specify what data they return. (State, variable history, and flow navigation)
* Allow Applications to easily integrate into HTTPable services or their middleware.
* Begin testing the lexer and parser for simplified FlowNote notation.
* Build basic library of common Actions that integrate into popular services.
* Provide robust documentation designed for onboarding.
* Integrate announcement of line coverage for tests via Travis CI.
* Allow for browser-friendly implementation.

## _Porting_

For those interested in porting FlowNote to another language, here are the dependencies that are optional:

* Node [v8.11.1](https://nodejs.org/en/blog/release/v8.11.1/): Host language
* Colors [v1.2.0-rc0](https://github.com/Marak/colors.js/tree/v1.2.0-rc0): Cross-terminal coloring tool
* ESM [v3.2.10](https://github.com/standard-things/esm/tree/3.2.10): Easy import/export support
* Fast Safe Stringify [v2.0.6](https://github.com/davidmarkclements/fast-safe-stringify/tree/v2.0.6): Fast JSON representation (Event emissions)

These dependencies are needed and will also have to be ported or similar alternatives:

* Ohm [v0.14.0](https://github.com/harc/ohm/tree/v0.14.0): Parser, lexer, and compiler
* Flatted [v2.0.0](https://github.com/WebReflection/flatted/tree/v2.0.0): Safely represents and restores circular JSON (Application snapshots)
* HyperID [v1.4.1](https://github.com/mcollina/hyperid/tree/ad1ccf743358ed6d79fad9ffbbf470645f8da612): Fast GUID generation
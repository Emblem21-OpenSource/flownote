# Features

FlowNote has many features baked into it to assist with event-driven development.

### Snapshots & Hydration

FlowNote Applications are state machines. They receive Requests at Endpoints which then become a series of Events transmitting between subsequent Nodes, Channels, and Milestones. Snapshots of the Application capture the state of the Application. (Nodes, Channels, Milestone, Flows, Action code, and active Events) Snapshots can be rehydrated back into functional applications on demand.  Snapshots are saved as a cyclical-resistant JSON. (via [flatted](https://github.com/WebReflection/flatted#readme))  This allows for simple saving/restoration functionality as well as transmission of state to a separate process/resource for scaling.

### Request Lifecycle Events

As Events propagate between Flows, Nodes, Channels, Action, and Milestones, FlowNote will emit lifecycle information to its outbound stream.  Lifecycle information will also be dispatched whenever a variable is `set` within an Action.  This allows listening processes (render engines, loggers, etc) full transparency into where and what FlowNote is doing with a request. FlowNote can also be assigned custom streams for outputs and uses `process.stdout` by default.

### Error Pathing and Retries

If a Node or Milestone throws an exception, the retry rules within the preceding path determine how an Event is retried upon the Node/Milestone.  The `retry` option can be a number or an Action name that returns a number.  The `retryDelay` option can be an amount of milliseconds or an Action that returns an amount of milliseconds.  The original state of the Event is used for each retry attempt.  When all retries are exhausted, any Error channels attached to the exception-throwing Node propagate the Event.

### Event Delegation

To prevent memory leaks, `EventEmitter` is not used. Instead, we use event delegation via `SetImmediate` as the primary driver of queue drain.  By default, the Event Queue is a [MemoryQueue](../src/queues/memoryQueue.js), but you can also [create and register custom queues](https://github.com/Emblem21-OpenSource/flownote/blob/e6457d6b406104cdf3c98eaa276537c9852bc6dd/src/eventQueue.js#L11) such as Redis, ZeroMQ, or queuing services.  [`SetImmediate` is used to ensure reliable queue drain priority between browsers since they having inconsistant execution order regarding microtasks.](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)

### Parallel Processing

FlowNote naturally allows for parallel processing and has a useful feature to prevent deadlocking. Actions can use `waitFor` to delay Event progression until other Nodes or Milestones execute. If the target had already executed for that Request, `waitFor` will progress, otherwise, it will wait until that target executes.  (This feature currently isn't fully tested yet)

### Request History

Within Actions, the Request can `set` its state or `get` its state. Instead of overwriting state, `set` will add the newest state of a variable while keeping track of all of its past values and which Application, Flow, and Node/Channel/Milestone set the value. Additionally, the Request keeps track of which path it took through an Endpoint. This is incredibly useful for debugging and other activities for render clients.  Endpoints can be made to return the history of all value changes by setting the Application or Flow configuration for `showChanges` to `true`.  The path the request took can be returned by setting the Application or Flow configuration for `showTrace` to `true`.

### Cyclical Detection

If you accidentally connect Nodes/Milestones with Channels in a manner that results in a cyclical loop, FlowNote will detect it and throw a `CyclicalError`.

### Profiling

FlowNote uses [Clinic](https://clinicjs.org/) to perform profiling. Developers can profile the performance of FlowNote by running `npm run profiler` for a simple overview and `npm run profiler-explorer` for a comprehensive profile breakdown.

### Custom Streaming

By default, Applications receive input from  `stdin` and emits all lifecycle information to `stdout` and `stderr` accordingly.  Custom streams can passed into the Application's constructor. A handler for input Requests can be established by passing a callback into an Application's `setOnInput(callback)` method. When the input strean closes, the callback passed into the Application's `setOnShutdown(callback)` will fire. To active Request handling for an Application, call its `listen()` method.  To stop taking Requests, call `unlisten()`

### HTTP Server Integration

To make a FlowNote Application to offer its Endpoints as HTTP endpoints, your http module of choice can simply make a call to it's `createServer` method like this:

```javascript
const FlowNote = require('flownote')
const http = require('http')

const app = new FlowNote.Application()
// @TODO: Add Node, Channel, and Action definitions and connections here.
const httpServer = http.createServer(app.httpRequestHandler())
httpServer.listen()
```

Endpoints will attempt to map to Flows that use exact methods and route combinations.  If a Flow is not found, a 404 will be returned. Any errors will return a 500. Otherwise, a 200 and the state of the Request after running through the flow will be returned.

### Browser-Friendly

FlowNote can be ran in the browser as well! Go [here](https://htmlpreview.github.io/?https://github.com/Emblem21-OpenSource/flownote/blob/master/dist/index.html) and checkout the console and network tabs! If you'd like to test out the browser builds locally, run `npm run browser-test` and open `http://localhost:1000`.

##### Documentation

( 
[Installation](01-installation.md) | 
Features | 
[Use Cases](03-use-cases.md) | 
[Language](04-language.md) | 
[Application](05-application.md) | 
[Flow](06-flow.md) | 
[Nodes](07-nodes.md) | 
[Channels](08-channels.md) | 
[Contribution Overview](09-contribution.md) | 
[Roadmap](10-roadmap.md) | 
[Known Problems](11-known-problems.md)
)
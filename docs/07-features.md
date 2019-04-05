# Features

### Output Emission

When a Request is started, a Request is finished, a Flow is started, a Flow has reached an end, a Node/Milestone/Channel Action is being run, a Request variable is `change`d, or an Error is thrown, a JSON object about that Event is printed to the Application's output/error streams. This is designed primarily for Unity or other render-only platforms to have total transparency into the lifecycle of a FlowNote process.

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

### Profiling

FlowNote uses [Clinic](https://clinicjs.org/) to perform profiling. You can run a profile with `npm run profiler` for a simple overview and `npm run profiler-explorer` for a comprehensive profile breakdown.

### Custom Streaming

By default, Applications receive input from  `stdin` and emits all progression Events to `stdout` and `stderr` accordingly.  Custom streams can passed into the Application's constructor. Input data events are passed to the callback set with `setOnInput()`. When the input strean closes, the callback passed into `setOnShutdown()` will fire. You have to manually activate input stream listening with a call to `listen()`. To stop taking input stream events, use `unlisten()`

### HTTP Server Integration

Applications initiate requests into Flows with the `request(httpMethod, httpRoute, parameters)` method. which will pass a request through the corresponding Flow. To simplify usage, HTTP frameworks can simply call `http.createServer(app/httpRequestHandler())` and HTTP requests will map to Flows according to their method and route definitions.  HTTP GET/DELETE queries and POST/PUT bodies are converted into parameters automatically. If a Flow is not found, a 404 will be returned. Any errors will return a 500. Otherwise, a 200 will be returned.

### Browser-Friendly

FlowNote can be ran in the browser as well! Go [here](https://htmlpreview.github.io/?https://github.com/Emblem21-OpenSource/flownote/blob/master/dist/index.html) and checkout the console and network tabs! If you'd like to test out the browser builds locally, run `npm run browser-test` and open `http://localhost:1000`.

##### Documentation

( 
[Installation](01-installation.md) | 
Features | 
[Application](02-application.md) | 
[Flow](03-flow.md) | 
[Nodes](04-nodes.md) | 
[Channels](05-channels.md) | 
[Use Cases](06-use-cases.md) | 
[Language](08-language.md) | 
[Contribution Overview](09-contribution.md) | 
[Roadmap](10-roadmap.md) | 
[Known Problems](11-known-problems.md)
)
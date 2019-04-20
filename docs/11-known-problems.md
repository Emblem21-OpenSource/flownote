# Known Problems and Shortcomings

* `waitFor` functionality is not working completely in many scenarios.
* The queue drain is based on [`setImmediate`, which is very slow](https://github.com/Emblem21-OpenSource/flownote/blob/09480e60cd2738ea011d236da18f36cd7515c78b/src/eventQueue.js#L58) but stable.
* `npm run browser-test` gets a `EACCES` error in Ubuntu.
* The callback argument in an Action definition *cannot* be arrow function. ([*.call()* does not like arrow functions](https://github.com/Emblem21-OpenSource/flownote/blob/09480e60cd2738ea011d236da18f36cd7515c78b/src/action.js#L66))
* `./flownote update-dockerhub` does not work.
* `./flownote start-docker-stdin` probably doesn't work everywhere correctly.
* `./flownote start-stdin` probably doesn't work everywhere correctly.
* [Outstanding bugs](https://github.com/Emblem21-OpenSource/flownote/labels/bug)

##### Documentation

( 
[Installation](01-installation.md) | 
[Features](02-features.md) | 
[Use Cases](03-use-cases.md) | 
[Language](04-language.md) | 
[Application](05-application.md) | 
[Flow](06-flow.md) | 
[Nodes](07-nodes.md) | 
[Channels](08-channels.md) | 
[Contribution Overview](09-contribution.md) | 
[Roadmap](10-roadmap.md) | 
Known Problems
)
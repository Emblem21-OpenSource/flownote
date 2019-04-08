# Use Cases

## See all runtime options

`./flownote`

## Run a FlowNote Server that listens to stdin requests

`./flownote start-stdin --flow=<pathToApp.flow>`

## Run a FlowNote Server that listens to HTTP requests

`./flownote start-http --host=<hostname> --port=<port> --flow=<pathToApp.flow>`

## Compile a FlowNote file to its Application JSON 

`./flownote compile <pathToApp.flow>`

## Stream a FlowNote file into its Application JSON

`cat <pathToApp.flow` > ./compile`

## Create your own stdin application using the FlowNote module (Using Promises)

```javascript
import { Application } from 'flownote'
import {
  getAccount,
  changeEmail,
  emailBoss
} from './yourActions'

Application.compile('Name of your app', 'path/to/app.flow', {
  // Configuration options
  logLevel: 4
}, [
  // Register Actions for your App here
  getAccount,
  changeEmail,
  emailBoss
]).then(app => {
  app.listen()
})
```

## Create your own HTTP application using the FlowNote module (Using Promises)

```javascript
import { Application } from 'flownote'
import Http from 'http'
import {
  getAccount,
  changeEmail,
  emailBoss
} from './yourActions'

Application.compile('Name of your app', 'path/to/app.flow', {
  // Configuration options
  logLevel: 4
}, [
  // Register Actions for your App here
  getAccount,
  changeEmail,
  emailBoss
]).then(app => {
  const httpServer = http.createServer(app.httpRequestHandler())
  httpServer.listen()
})
```

##### Documentation

( 
[Installation](01-installation.md) | 
[Features](07-features.md) | 
Use Cases | 
[Language](08-language.md) | 
[Application](02-application.md) | 
[Flow](03-flow.md) | 
[Nodes](04-nodes.md) | 
[Channels](05-channels.md) | 
[Contribution Overview](09-contribution.md) | 
[Roadmap](10-roadmap.md) | 
[Known Problems](11-known-problems.md)
)
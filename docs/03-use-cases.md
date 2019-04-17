# Use Cases

## See all runtime options

`./node_modules/.bin/flownote`

## Run a FlowNote Server that listens to stdin requests

`./node_modules/.bin/flownote start-stdin --flow=<pathToApp.flow>`

## Run a FlowNote Server that listens to HTTP requests

`./node_modules/.bin/flownote start-http --host=<hostname> --port=<port> --flow=<pathToApp.flow>`

## Compile a FlowNote file to its Application JSON 

`./node_modules/.bin/flownote compile <pathToApp.flow>`

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
import http from 'http'
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
[Features](02-features.md) | 
Use Cases | 
[Language](04-language.md) | 
[Application](05-application.md) | 
[Flow](06-flow.md) | 
[Nodes](07-nodes.md) | 
[Channels](08-channels.md) | 
[Contribution Overview](09-contribution.md) | 
[Roadmap](10-roadmap.md) | 
[Known Problems](11-known-problems.md)
)
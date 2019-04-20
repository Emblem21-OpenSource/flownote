# Use Cases

Here are a variety of common use cases for FlowNote.

## As an External Application

### Run a Standalone Process that listens to stdin requests

```bash
./node_modules/.bin/flownote standalone-stdin --flow=<pathToApp.flow> --actions=<pathToActionDefinitions.js>
```

### Run Standalone Process that listens to HTTP requests

```bash
./node_modules/.bin/flownote standalone-http --flow=<pathToApp.flow> --actions=<pathToActionDefinitions.js>
```

### Run a Standalone Docker Process that listens to stdin requests

```bash
./node_modules/.bin/flownote start-docker-stdin --flow=<pathToApp.flow> --actions=<pathToActionDefinitions.js>
```

### Run Standalone Docker Process that listens to HTTP requests

```bash
./node_modules/.bin/flownote start-docker-http --flow=<pathToApp.flow> --actions=<pathToActionDefinitions.js>
```

### Within a Dockerfile

Coming soon!

### From DockerHub

`docker pull emblem21/flownote` (Coming soon!)

## As a Module

### Single-request Application using FlowNote code and ECMAScript to toy with FlowNote

Here's an example of how it to make a temporary app for a single request in NodeJS project:

```javascript
const FlowNote = require('flownote')

// Define the Application
const app = new FlowNote.Application(undefined, 'App Name', {
  logLevel: 2
}, undefined, undefined, [
  // Register Actions for the application
  new FlowNote.Action(undefined, undefined, 'validateX', function someAction () {
    this.set('x', parseInt(this.get('x')))
  }),
  new FlowNote.Action(undefined, undefined, 'multiplyXByTwo', function someAction () {
    this.set('x', this.get('x') * 2)
  })
])

async function start () {
  // Compile FlowNote code into the app
  await new FlowNote.Compiler(undefined, undefined, app).compile(`
    node doubleX = validateX, multiplyXByTwo

    flow click(GET /timesFour) = doubleX -> doubleX
  `)

  // Request the /timesFour endpoint
  return app.request('GET', '/xTimesFour', {
    x: 5
  })
}

console.log(start())
```

### Single-request Application using FlowNote code and EJS to toy with FlowNote

For EJS with `import/export` support, use the following:

```javascript
import {
  Action,
  Application,
  Compiler
} from 'flownote'

// Define the Application
const app = new Application(undefined, 'App Name', {
  logLevel: 2
}, undefined, undefined, [
  // Register Actions for the application
  new Action(undefined, undefined, 'validateX', function someAction () {
    this.set('x', parseInt(this.get('x')))
  }),
  new Action(undefined, undefined, 'multiplyXByTwo', function someAction () {
    this.set('x', this.get('x') * 2)
  })
])

async function start () {
  // Compile FlowNote code into the app
  await new Compiler(undefined, undefined, app).compile(`
    node doubleX = validateX, multiplyXByTwo

    flow click(GET /timesFour) = doubleX -> doubleX
  `)

  // Request the /timesFour endpoint
  return app.request('GET', '/xTimesFour', {
    x: 5
  })
}

console.log(start())
```

### Running a stdin Application from a FlowNote file

You can run a FlowNote app from a file:

```javascript
const FlowNote = require('flownote')

// Define the Application
const app = new FlowNote.Application(undefined, 'App Name', {
  logLevel: 2
}, undefined, undefined, [
  // Register Actions for the application
  new FlowNote.Action(undefined, undefined, 'validateX', function someAction () {
    this.set('x', parseInt(this.get('x')))
  }),
  new FlowNote.Action(undefined, undefined, 'multiplyXByTwo', function someAction () {
    this.set('x', this.get('x') * 2)
  })
])

async function start () {
  // Compile FlowNote code into the app
  await new FlowNote.Compiler(undefined, undefined, app).compileFromFile('pathToCode.flow')

  // Listen for requests
  app.listen()
}

start()
```

This will create an app that responds to stdin reqeusts.

### Running a stdin Application from a FlowNote file (Condensed)

```javascript
import { Application } from 'flownote'
import {
  getAccount,
  changeEmail,
  emailBoss
} from './yourActions'

Application.compile('Name of your app', 'path/to/app.flow', {
  // Configuration options
  logLevel: 2
}, [
  // Register Actions for your App here
  getAccount,
  changeEmail,
  emailBoss
]).then(app => {
  app.listen()
})
```

This will create an app that responds to stdin reqeusts.

## Running a HTTP Application from a FlowNote file

You can run a FlowNote app from a file:

```javascript
const FlowNote = require('flownote')
const http = require('http')

// Define the Application
const app = new FlowNote.Application(undefined, 'App Name', {
  logLevel: 2
}, undefined, undefined, [
  // Register Actions for the application
  new FlowNote.Action(undefined, undefined, 'validateX', function someAction () {
    this.set('x', parseInt(this.get('x')))
  }),
  new FlowNote.Action(undefined, undefined, 'multiplyXByTwo', function someAction () {
    this.set('x', this.get('x') * 2)
  })
])

async function start () {
  // Compile FlowNote code into the app
  await new FlowNote.Compiler(undefined, undefined, app).compileFromFile('pathToCode.flow')

  // Listen for requests
  const httpServer = http.createServer(app.httpRequestHandler())
  httpServer.listen(3000, 'localhost')
}

start()
```

This will create an app that responds to HTTP requests on `http://localhost:3000`.

### Running a HTTP Application from a FlowNote file (Condensed)

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

This will create an app that responds to HTTP requests on `http://localhost:3000`.

### Into a Basic Browser Project

Add this tag to your HTML <head>:

```html
<script type="text/javascript" src="https://gitcdn.xyz/repo/Emblem21-OpenSource/flownote/master/dist/flownote.min.js"></script>
```

Here's an example of how it would be used in a basic HTML template:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your App</title>
    <script type="text/javascript" src="https://gitcdn.xyz/repo/Emblem21-OpenSource/flownote/master/dist/flownote.min.js"></script>
  </head>
  <body>
    <script>
      // Define the Application
      var app = new FlowNote.Application(undefined, 'App Name', {
        logLevel: 2
      }, undefined, undefined, [
        // Register Actions for the application
        new FlowNote.Action(undefined, undefined, 'validateX', function someAction () {
          this.set('x', parseInt(this.get('x')))
        }),
        new FlowNote.Action(undefined, undefined, 'multiplyXByTwo', function someAction () {
          this.set('x', this.get('x') * 2)
        })
      ])

      async function start () {
        // Compile FlowNote code into the app
        await new FlowNote.Compiler(undefined, undefined, app).compile(`
          node doubleX = validateX, multiplyXByTwo

          flow click(GET /timesFour) = doubleX -> doubleX
        `)

        // Request the /timesFour endpoint
        return app.request('GET', '/xTimesFour', {
          x: 5
        })
      }

      console.log(start())
    </script>
  </body>
<html>
```

## For FlowNote interal development

### See all runtime options

`./node_modules/.bin/flownote`

### Run a FlowNote Server that listens to stdin requests

`./node_modules/.bin/flownote start-stdin --flow=<pathToApp.flow> --actions=<pathToActionDefinitions.js>`

### Run a FlowNote Server that listens to HTTP requests

`./node_modules/.bin/flownote start-http --host=<hostname> --port=<port> --flow=<pathToApp.flow> --actions=<pathToActionDefinitions.js>`

### Output the Application JSON of compiled FlowNote code.

`./node_modules/.bin/flownote compile <pathToApp.flow>`

### Stream FlowNote code into the compiler

`cat <pathToApp.flow > ./compile`

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
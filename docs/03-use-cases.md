# Use Cases

FlowNote can be used as a standalone application, a Docker process, as a module for the server or browser, or as a command-line tool.

Before we begin, you should get familiar with [how a FlowNote application is structured](05-application.md), [make a few Actions](07-nodes.md#Actiosn), and [write some FlowNote code](04-language.md).

Here are a variety of common use cases for FlowNote.

## As an Standalone Application

If you wish for FlowNote to be a standalone server, here are four ways you can do it:

### Run a stdin server from your project

```bash
./node_modules/.bin/flownote start-stdin --standalone --flow=<pathToApp.flow>
```

### Run a HTTP server from your project

```bash
./node_modules/.bin/flownote start-http --standalone --flow=<pathToApp.flow>
```

### Run a watch-restarting stdin server from your project

```bash
./node_modules/.bin/flownote start-stdin --standalone --watch --flow=<pathToApp.flow>
```

### Run a watch-restarting HTTP server from your project

```bash
./node_modules/.bin/flownote start-http --standalone --watch --flow=<pathToApp.flow>
```

### Run a stdin server via Docker

```bash
./node_modules/.bin/flownote start-docker-stdin --flow=<pathToApp.flow>
```

### Run a HTTP server via Docker

```bash
./node_modules/.bin/flownote start-docker-http --flow=<pathToApp.flow>
```

### Within a Dockerfile

Coming soon!

### From DockerHub

`docker pull emblem21/flownote` (Coming soon!)

## As a Module

If you want to bring FlowNote as an module into your project, here are a variety of ways to do it:

### Run FlowNote to execute a single request

Here's an example of how it to make a temporary app for a single request in NodeJS project:

```javascript
const esm = require('esm')
require = esm(module)
const FlowNote = require('flownote')

// Define the Application
const app = new FlowNote.Application(undefined, 'App Name', {
  logLevel: 2
}, undefined, undefined, function actionGenerator () {
  return [
    // Register Actions for the application
    new FlowNote.Action(undefined, undefined, 'validateX', function someAction () {
      this.set('x', parseInt(this.get('x')))
    }),
    new FlowNote.Action(undefined, undefined, 'multiplyXByTwo', function someAction () {
      this.set('x', this.get('x') * 2)
    })
  ]
})

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

### Run FlowNote (with EJS) to execute a single request

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
}, undefined, undefined, function actionGenerator () {
  return [
    // Register Actions for the application
    new Action('validateX', function someAction () {
      this.set('x', parseInt(this.get('x')))
    }),
    new Action('multiplyXByTwo', function someAction () {
      this.set('x', this.get('x') * 2)
    })
  ]
})

async function start () {
  // Compile FlowNote code into the app
  const compiler = new Compiler(undefined, undefined, app)
  await compiler.loadSemantics()
  compiler.compile(`
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
const esm = require('esm')
require = esm(module)
const FlowNote = require('flownote')

// Define the Application
const app = new FlowNote.Application(undefined, 'App Name', {
  logLevel: 2
}, undefined, undefined, function actionGenerator () {
  return [
    // Register Actions for the application
    new FlowNote.Action(undefined, undefined, 'validateX', function someAction () {
      this.set('x', parseInt(this.get('x')))
    }),
    new FlowNote.Action(undefined, undefined, 'multiplyXByTwo', function someAction () {
      this.set('x', this.get('x') * 2)
    })
  ]
})

async function start () {
  // Compile FlowNote code into the app
  await new FlowNote.Compiler(undefined, undefined, app).compileFromFile('pathToCode.flow')

  // Listen for requests
  app.listen()
}

start()
```

This will create an app that responds to stdin reqeusts.

### Running a stdin Application (with EJS) from a FlowNote file

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
}, function actionGenerator () {
  return [
    // Register Actions for your App here
    getAccount,
    changeEmail,
    emailBoss
  ]
}).then(app => {
  app.listen()
})
```

This will create an app that responds to stdin reqeusts.

### Running a HTTP Application from a FlowNote file

You can run a FlowNote app from a file:

```javascript
const esm = require('esm')
require = esm(module)
const FlowNote = require('flownote')
const http = require('http')

// Define the Application
const app = new FlowNote.Application(undefined, 'App Name', {
  logLevel: 2
}, undefined, undefined, function actionGenerator () {
  return [
    // Register Actions for the application
    new FlowNote.Action(undefined, undefined, 'validateX', function someAction () {
      this.set('x', parseInt(this.get('x')))
    }),
    new FlowNote.Action(undefined, undefined, 'multiplyXByTwo', function someAction () {
      this.set('x', this.get('x') * 2)
    })
  ]
})

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

### Running a HTTP Application (with EJS) from a FlowNote file

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
}, function () {
  return [
    // Register Actions for your App here
    getAccount,
    changeEmail,
    emailBoss
  ]
}).then(app => {
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
      }, undefined, undefined, function actionGenerator () {
        return [
          // Register Actions for the application
          new FlowNote.Action(undefined, undefined, 'validateX', function someAction () {
            this.set('x', parseInt(this.get('x')))
          }),
          new FlowNote.Action(undefined, undefined, 'multiplyXByTwo', function someAction () {
            this.set('x', this.get('x') * 2)
          })
        ]
      })

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

IF you are doing work on FlowNote's internals, here's some handy commands you can use to confirm your work:

### See all runtime options

```shell
./node_modules/.bin/flownote
```

### Run a FlowNote Server that listens to stdin requests

```shell
./node_modules/.bin/flownote start-stdin --flow=<pathToApp.flow>
```

### Run a FlowNote Server that listens to HTTP requests

```shell
./node_modules/.bin/flownote start-http --host=<hostname> --port=<port> --flow=<pathToApp.flow>
```

### Output the Application JSON of compiled FlowNote code.

```shell
./node_modules/.bin/flownote compile <pathToApp.flow>
```

### Stream FlowNote code into the compiler

```shell
cat <pathToApp.flow > ./compile
```

### Run tests to make sure you haven't broken anything

```shell
./flownote test
```

### Run tests every time you change a file

```shell
./flownote test-watch
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
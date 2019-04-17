# Installation

FlowNote can be added to any NodeJS project with NPM or Yarn:

```bash
npm install flownote --production --save
```

```bash
yarn add flownote --production
```

## Into a NodeJS or Babel/Webpack/CommonJS Project

Here's an example of how it to make a temporary app that lives for a single call in NodeJS project:

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

## From a FlowNote File

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

## As an HTTP server

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

## As a Command Line Compiler

You can write FlowNode code to a file and stream the App JSON where ever you want:

`./node_modules/.bin/flownote compile <pathToApp.flow>`

## Into a Basic Browser Project

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

## As a Standalone Docker Process

```Docker
./node_modules/bin/flownote build-docker
./node_modules/bin/flownote start-docker --port=<port>
```

## Within a Dockerfile

Coming soon!

## From DockerHub

`docker pull emblem21/flownote`

More coming soon!

##### Documentation

( 
Installation | 
[Features](02-features.md) | 
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
# Installation

## Into a NodeJS Project

FlowNote can be added to any project with this simple command, based upon your package manager:

```bash
npm install flownote --production --save
```

```bash
yarn add flownote --production
```

Here's an example of how it would be used in a standard NodeJS project:

```javascript
const FlowNote = require('flownote')

const application = new FlowNote.Application(/* args */)
const flow = new FlowNote.Flow(/* args */)
const node = new FlowNote.Node(/* args */)
const standardNode = new FlowNote.StandardNode(/* args */)
const channel = new FlowNote.Channel(/* args */)
const standardChannel = new FlowNote.StandardChannel(/* args */)
const retryChannel = new FlowNote.RetryChannel(/* args */)
const errorChannel = new FlowNote.ErrorChannel(/* args */)
const milestone = new FlowNote.Milestone(/* args */)
const standardMilestone = new FlowNote.StandardMilestone(/* args */)
const action = new FlowNote.Action(/* args */)
const event = new FlowNote.Event(/* args */)     
const request = new FlowNote.Request(/* args */)
const spider = new FlowNote.Spider(/* args */)
const compiler = new FlowNote.Compiler(/* args */)
```

For EJS with `import/export` support, use the following:

```javascript
import {
  Action,
  Application,
  Channel,
  Event,
  Flow,
  Milestone,
  StandardMilestone,
  Node,
  Request,
  Spider,
  StandardChannel,
  RetryChannel,
  StandardNode,
  ErrorChannel,
  Compiler
} from 'flownote'
```

## As a Standalone Compiler

Coming soon!

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
      var application = new FlowNote.Application(/* args */)
      var flow = new FlowNote.Flow(/* args */)
      var node = new FlowNote.Node(/* args */)
      var standardNode = new FlowNote.StandardNode(/* args */)
      var channel = new FlowNote.Channel(/* args */)
      var standardChannel = new FlowNote.StandardChannel(/* args */)
      var retryChannel = new FlowNote.RetryChannel(/* args */)
      var errorChannel = new FlowNote.ErrorChannel(/* args */)
      var milestone = new FlowNote.Milestone(/* args */)
      var standardMilestone = new FlowNote.StandardMilestone(/* args */)
      var action = new FlowNote.Action(/* args */)
      var event = new FlowNote.Event(/* args */)     
      var request = new FlowNote.Request(/* args */)
      var spider = new FlowNote.Spider(/* args */)
      var compiler = new FlowNote.Compiler(/* args */)
    </script>
  </body>
<html>
```

## Into a ReactJS Browser Project (Coming soon!)

```javascript
import {
  Action,
  Application,
  Channel,
  Event,
  Flow,
  Milestone,
  StandardMilestone,
  Node,
  Request,
  Spider,
  StandardChannel,
  RetryChannel,
  StandardNode,
  ErrorChannel,
  Compiler
} from 'flownote'

const application = new FlowNote.Application(/* args */)
const flow = new FlowNote.Flow(/* args */)
const node = new FlowNote.Node(/* args */)
const standardNode = new FlowNote.StandardNode(/* args */)
const channel = new FlowNote.Channel(/* args */)
const standardChannel = new FlowNote.StandardChannel(/* args */)
const retryChannel = new FlowNote.RetryChannel(/* args */)
const errorChannel = new FlowNote.ErrorChannel(/* args */)
const milestone = new FlowNote.Milestone(/* args */)
const standardMilestone = new FlowNote.StandardMilestone(/* args */)
const action = new FlowNote.Action(/* args */)
const event = new FlowNote.Event(/* args */)     
const request = new FlowNote.Request(/* args */)
const spider = new FlowNote.Spider(/* args */)
const compiler = new FlowNote.Compiler(/* args */)
```

## As a Docker Image

Coming soon!

##### Documentation

( 
Installation | 
[Features](07-features.md) | 
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
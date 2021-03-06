# Installation

FlowNote can be added to any NodeJS project with NPM or Yarn:

```bash
npm install esm flownote@next --production --save
```

```bash
yarn add esm flownote@next --production
```

After that, copy the default `.env` file to your directory with:

```bash
cp node_modules/flownote/.env .env
```

If you already have a `.env` file, do the following:

```bash
cat node_modules/flownote/.env >> .env
```

Then open the `.env` and change the variables according to the documentation within.

## Docker

If you'd like to install FlowNote as a standalone server for Docker, do the following:

```bash
./node_modules/.bin/flownote flownote-docker
```

## Quick Start

```bash
mkdir ~/someFlowNoteProject
cd ~/someFlowNoteProject
npm init
npm install esm flownote@next --production --save
cp node_modules/flownote/.env .env

# Change this file to make the actions you want
cp node_modules/flownote/compiler/testActions.js actions.js

# Change this file for the FlowNote code you want
cp node_modules/flownote/compiler/test.flow app.flow
```

From here, replace the first line in the `actions.js` file with:

```javascript
const esm = require('esm')
require = esm(module)
const { Action } = require('flownote')
```

Then run:

```bash
./node_modules/.bin/flownote start-http --standalone --flow=app.flow
```

## Use Cases

You're ready to begin!  Check out the common [use cases of FlowNote](03-use-cases.md) to learn how to get started.

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
# Installation

FlowNote can be added to any NodeJS project with NPM or Yarn:

```bash
npm install flownote --production --save
```

```bash
yarn add flownote --production
```

## Docker

Once FlowNote is installed, create your `.env` file in the following manner:

```bash
cp ./node_modules/flownote/.env .env
```

Then open the `.env` and change the variables according to the documentation within.  Finally, build the docker image with:

```bash
./node_modules/.bin/flownote flownote-docker
```

## Use Cases

Once you've prepared everything, find the right [Use Case](03-use-cases.md) to use FlowNote.

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
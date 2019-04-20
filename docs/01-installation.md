# Installation

FlowNote can be added to any NodeJS project with NPM or Yarn:

```bash
npm install flownote@next --production --save
```

```bash
yarn add flownote@next --production
```

After that, copy the default `.env` file to your directory with:

```bash
cp ./node_modules/flownote/.env .env
```

Then open the `.env` and change the variables according to the documentation within.

## Docker

Once that's done, you can do this to start building FlowNote apps for Docker:

```bash
./node_modules/.bin/flownote flownote-docker
```

## Use Cases

You're read to being.  Review common [Use Cases](03-use-cases.md) to specify how you intend to use FlowNote.

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
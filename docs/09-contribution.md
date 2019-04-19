# Contribution Guidelines

## Community

Chat us up on Gitter! [![Chat us up on Gitter](https://badges.gitter.im/flownote/community.svg)](https://gitter.im/flownote/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Testing

Before submitting a Pull Request, make sure the following commands pass:

* `npm test`
* `npm run browser-test` then go to `http://localhost:1000`
* `npm run profiler`
* `npm run browser-build`

## Pull Requests

When you're ready to submit pull requests, make sure you create a new branch off of `master`.  We'll eventually have a `next` branch as the project increases in popularity.

## Porting

It might be worthwhile to port FlowNote to Python, Go, or Rust.  If someone wants to take up that task, here's a list of optional dependencies FlowNote uses.

* [Node v11.12.0](https://nodejs.org/en/blog/release/v11.12.0/): Host language
* [Colors](https://github.com/Marak/colors.js): Cross-terminal coloring tool
* [ESM](https://github.com/standard-things/esm): Easy import/export support
* [Fast Safe Stringify](https://github.com/davidmarkclements/fast-safe-stringify): Fast JSON representation (Event emissions)
* [ClinicJS](https://github.com/nearform/node-clinic): Profiling tool

These dependencies will have to be ported as well.

* [OhmJS](https://github.com/harc/ohm): Parser, lexer, and compiler
* [Flatted](https://github.com/WebReflection/flatted): Safely represents and restores circular JSON (Application snapshots)
* [HyperID](https://github.com/mcollina/hyperid): Fast GUID generation

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
Contribution Overview | 
[Roadmap](10-roadmap.md) | 
[Known Problems](11-known-problems.md)
)
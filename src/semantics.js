const fs = require('fs')
const ohm = require('ohm-js')

/**
 * @TODO
 * @return {AST}
 */
const semantics = (() => {
  let privateProps = new WeakMap()

  /**
   * @TODO
   */
  class Semantics {
    constructor (grammarFilePath) {
      privateProps.set(this, {
        grammar: undefined,
        grammarFilePath
      })
    }

    /**
     * Loads a grammar file into the Semantics
     */
    async loadGrammar () {
      if (!this.isGrammarLoaded()) {
        return new Promise((resolve, reject) => {
          fs.readFile(privateProps.get(this).grammarFilePath, 'utf8', (err, contents) => {
            if (err) {
              reject(err)
            } else {
              privateProps.set(this, 'grammar', ohm.grammar(contents))
              resolve(contents)
            }
          })
        })
      }
    }

    /**
     * Returns if the grammar file has been properly loaded
     */
    isGrammarLoaded () {
      return privateProps.get(this).grammar !== undefined
    }

    /**
     * Determines if the content is valid FlowNote grammar
     */
    isValid (content) {
      if (this.isGrammarLoaded()) {
        const match = privateProps.get(this).grammar.match(content)
        return match.succeeded()
      }
    }

    /**
     * Returns the Ohm grammar trace of a string.
     */
    trace (content) {
      if (this.isGrammarLoaded()) {
        return privateProps.get(this).grammar.trace(content)
      }
    }

    /**
     * Returns a valid FlowNote structure
     * @TODO
     * @param  {String} content
     * @return {Flow}
     */
    evaluate (content) {
      const grammar = privateProps.get(this).grammar
      const semantics = grammar.createSemantics().addOperation('eval', {
        Flow: (entities) => {
          return entities.eval()
        },
        Assignment: (label, eq, path) => {
          return path.eval()
        },
        Path: (connections) => {
          return connections.eval()
        },
        Nodes: (node) => {
          return node.eval()
        },
        MetaNode: (label, start, nodes, end) => {
          return nodes.eval()
        },
        Node: (node) => {
          return node.eval()
        },
        JumpNode: (at, node) => {
          return node.eval()
        },
        SuppressedNode: (node, star) => {
          return node.eval()
        },
        IdentityNode: (node, hash, identity) => {
          return node.eval()
        },
        StandardNode: (label, properties) => {
          return properties.eval()
        },
        Channel: (channel) => {
          return channel.eval()
        },
        ErrorChannel: (label, properties, symbol) => {
          return properties.eval()
        },
        PlainChannel: (label, properties, symbol) => {
          return properties.eval()
        },
        NamedChannel: (label, properties, symbol) => {
          return properties.eval()
        },
        Properties: (start, properties, end) => {
          return properties.eval()
        },
        Property: (key, colon, value) => {
          return value.eval()
        },
        label: (label) => {
          return label.eval()
        },
        string: (start, content, end) => {
          return content.eval()
        },
        number: (value, dot, remainder) => {
          return value.eval()
        },
        space: (x) => {
          return x.eval()
        },
        comment: (start, content, stop) => {
          return content.eval()
        }
      })

      const match = grammar.match(content)
      return semantics(match).eval()
    }
  }

  return Semantics
})()

module.exports = semantics

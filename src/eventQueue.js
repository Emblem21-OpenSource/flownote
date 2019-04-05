import Event from './event'
import Spider from './spider'
import ActionContext from './actionContext'
import MemoryQueue from './queues/memoryQueue'

const CommonClass = require('./utils/commonClass')
const Log = require('./utils/log')

const queueTypes = new Map()

queueTypes.set('memory', MemoryQueue)

// const numCPUs = require('os').cpus().length

/**
 * Every Application instance has its own EventQueue.
 */
class EventQueue extends CommonClass {
  /**
   * [constructor description]
   * @return {[type]} [description]
   */
  constructor (application, queue) {
    super()
    this.application = application

    if (queue !== undefined) {
      this.fromJSON({
        queue: queue
      })
    }
  }

  /**
   * [push description]
   * @param  {[type]} source      [description]
   * @param  {[type]} eventName   [description]
   * @param  {[type]} event       [description]
   * @param  {[type]} destination [description]
   * @return {[type]}             [description]
   */
  push (event, enqueue = true) {
    this.log.debug('Pushing event to queue...')
    this.queue.push(event)

    if (enqueue) {
      this.log.debug('Scheduling event queue processing...')
      /*
      return new Promise(resolve => {
        resolve(this.process())
      })
      /*
      Promise.resolve().then(() => {
        return this.process()
      })
      */
      setImmediate(() => {
        return this.process()
      })
    }
  }

  /**
   * [process description]
   * @return {[type]} [description]
   */
  async process () {
    this.log.debug('Processing event queue...')
    const remaining = this.queue.count()
    if (remaining > 0) {
      this.log.debug(`Event queue has ${remaining} events remaining...`)
      const event = this.queue.pop()

      if (event && event instanceof Event) {
        this.log.debug(`Processing event ${event.type} -> with target: ${event.from.name}`)

        if (event.from && event.from.process) {
          this.log.debug(`Preparing Action Context from ${event.from.name}`)
          const actionContext = new ActionContext(this.application, event.flow, event.from, event.request)
          this.log.debug('Processing event step...')

          try {
            await event.from.process(event, actionContext)
            event.request.addStep(this.application, event.flow, event.from)
          } catch (e) {
            this.log.debug('Caught error...')
            // An error has occured, go get the last step
            let retryCount = event.from.retry || 0
            let retryDelay = event.from.retryDelay || 0
            let lastStep

            if (event.from.accepts === undefined) {
              // Dealing with a step, not a channel
              const previousStep = event.request.steps[event.request.steps.length - 1]

              if (previousStep && this.application.id === previousStep.appId) {
                const lastFlow = new Spider().search(this.application, previousStep.flowId)
                if (lastFlow) {
                  lastStep = new Spider().search(lastFlow, previousStep.stepId)
                  if (lastStep && lastStep.retry) {
                    retryCount = lastStep.retry
                    retryDelay = lastStep.retryDelay
                  }
                }
              }
            }

            if (typeof retryCount === 'string') {
              // Retry is an Action, not a number
              const action = this.application.getAction(retryCount)
              if (!action) {
                throw new Error(`${retryCount} isn't a retry action for ${event.from.name} node`)
              }

              retryCount = await action.execute(actionContext)
            }

            if (typeof retryDelay === 'string') {
              // Retry is an Action, not a number
              const action = this.application.getAction(retryDelay)
              if (!action) {
                throw new Error(`${retryDelay} isn't a rety action for ${event.from.name} node`)
              }

              retryDelay = await action.execute(actionContext)
            }

            // The step has retry instructions
            if (event.retries <= retryCount - 1) {
              if (retryDelay > 0) {
                // @TODO This is probably pretty naive
                setTimeout(() => {
                  this.log.debug('Retrying...')
                  this.application.dispatch('RetryChannel', event.request, event.flow, lastStep || event.from, event.retries + 1)
                }, retryDelay)
              } else {
                this.log.debug('Retrying...')
                this.application.dispatch('RetryChannel', event.request, event.flow, lastStep || event.from, event.retries + 1)
              }
            } else {
              // No more retries, bail
              this.log.debug('Dispatching error...', e.name)
              this.application.dispatch(e.name, event.request, event.flow, event.from, event.retries, e)
            }
          }

          return event.request
        } else {
          throw new Error('Event.from does not have a process() method.')
        }
      } else {
        throw new Error('Event in Event Queue is not an Event class.')
      }
    }
  }

  /**
   * [registerQueueTypes description]
   * @param  {[type]} name      [description]
   * @param  {[type]} queueType [description]
   * @return {[type]}           [description]
   */
  registerQueueTypes (name, queueType) {
    queueTypes.set(name, queueType)
  }

  /**
   * [toJSON description]
   * @return {[type]} [description]
   */
  toJSON () {
    return {
      queue: this.queue
    }
  }

  /**
   * [fromJSON description]
   * @param  {[type]} json [description]
   * @return {[type]}      [description]
   */
  fromJSON (json) {
    let result

    if (typeof json === 'string') {
      result = this.loadFlattened(json)
    } else if (json instanceof Object && !(json instanceof Array)) {
      result = json
    } else {
      throw new Error(`Expected Event JSON to be a string or an object, but got a ${typeof json} instead`)
    }

    this.log = new Log(this.application.id, 'EventQueue', this.application.name, this.application.config.logLevel, this.application.outputPipe, this.application.errorPipe)

    const QueueType = queueTypes.get(result.queue.type)

    if (!QueueType) {
      throw new Error(`Unknown queue type ${result.queueType}`)
    }

    this.queue = new QueueType(this.application, result.queue.pendingEvents)

    return this
  }
}

module.exports = EventQueue

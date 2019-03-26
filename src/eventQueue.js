import Event from './event'
import Spider from './spider'
import ActionContext from './actionContext'

const CommonClass = require('./utils/commonClass')
const Log = require('./utils/log')
// const numCPUs = require('os').cpus().length

const pendingEventsMap = new WeakMap()

/**
 * Every Application instance has its own EventQueue.
 */
class EventQueue extends CommonClass {
  /**
   * [constructor description]
   * @return {[type]} [description]
   */
  constructor (application, pendingEvents) {
    super()
    this.application = application
    if (pendingEvents !== undefined) {
      this.fromJSON({
        pendingEvents: pendingEvents || []
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
    pendingEventsMap.get(this.application).push(event)

    if (enqueue) {
      this.log.debug('Scheduling event queue processing...')
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
    const pendingEvents = pendingEventsMap.get(this.application)

    if (pendingEvents) {
      if (pendingEvents.length > 0) {
        this.log.debug(`Event queue has ${pendingEvents.length} events remaining...`)
        const event = pendingEvents.shift()

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
                    }
                  }
                }
              }

              // The step has retry instructions
              if (event.retries < retryCount - 1) {
                this.log.debug('Retrying...')
                this.application.dispatch(event.type, event.request, event.flow, lastStep || event.from, event.retries + 1)
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
    } else {
      throw new Error('Event Queue does not have a bound application.')
    }
  }

  /**
   * [toJSON description]
   * @return {[type]} [description]
   */
  toJSON () {
    return {
      pendingEvents: pendingEventsMap.get(this.application).entries()
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

    pendingEventsMap.set(this.application, result.pendingEvents)
  }
}

module.exports = EventQueue

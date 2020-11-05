
import { config } from './hyper63.config'
import { initPorts } from './utils'

const ports = initPorts(config.ports)

console.log(ports)

/**
 * A PoC of calling a port method to demonstrate the plugin
 * API in hyper63.config.js and to demonstrate the chainable nature
 * of plugins.
 *
 * call TracingPlugin -> RedisCachePlugin -> TracingPlugin -> call
 */
ports.cache.createStore('foobar')
  .then(() => console.log('done creating'))
  .then(() => ports.cache.destroyStore('foobar')) // notice this method isn't wrapped by tracing in logs
  .then(() => console.log('done destroying'))


import { applyTo, filter, compose, map, is, reduce, defaultTo, fromPairs, reverse } from 'ramda'

/**
 * Given a list of plugins, compose the plugin.load()
 * resulting in a portConfig obj
 *
 * @param {[]} plugins - a list of plugins
 */
function loadPortConfig (plugins = []) {
  return compose(
    reduce((acc, plugin) => defaultTo(acc, plugin.load(acc)), {}),
    filter(plugin => is(Function, plugin.load))
  )(plugins)
}

/**
 * Given a list of plugins, and the portConfig built as a result
 * of composing plugin.load(), compose the plugin.link(), resulting in
 * a port interface
 *
 * ? should we build the entire interface?
 *
 * @param {[]} plugins - a list of plugins
 * @param {{}} portConfig - the config obj for the port
 */
function linkPlugins (plugins, portConfig) {
  return compose(
    links => links.reduce((a, b) => ({
      /**
       * We spread here, so that plugins may just partially implement
       * a port interface. This allows the use of multiple plugins
       * to produce the *complete* port interface, while also achieving the
       * "Onion" wrapping of each method
       */
      ...a,
      ...b(a)
    }), {}),
    reverse,
    map(
      applyTo(portConfig)
    ),
    map(plugin => plugin.link.bind(plugin)),
    filter(plugin => is(Function, plugin.link))
  )(plugins)
}

function initPort (portNode) {
  const { plugins } = portNode

  return compose(
    portConfig => linkPlugins(plugins, portConfig),
    loadPortConfig
  )(plugins || [])
}

/**
 * Given a list of port nodes, generate a port for each node, keyed
 * off of the port field on each node
 *
 * @param {[]} ports - a list of port nodes from a hyper63 config
 */
export function initPorts (ports) {
  return compose(
    fromPairs,
    map(portNode => [portNode.port, initPort(portNode)])
  )(ports)
}

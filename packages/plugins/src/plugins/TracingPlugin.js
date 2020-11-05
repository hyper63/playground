
import { reduce } from 'ramda'
import { v4 } from 'uuid'
/**
 * Given a set of method names, return a plugin that wraps those methods
 * of the next plugin in the chain with "tracing"
 *
 * @param {string[]} methodsToTrace - the method names to encapsulate with tracing
 */
export function TracingPlugin (methodsToTrace) {
  return {
    id: 'hyper63-plugin-tracing',
    link: () => next => reduce(
      (acc, methodName) => ({
        ...acc,
        [methodName]: options => {
          const label = `plugin-tracing-${methodName}-${v4()}`
          console.log(`Starting trace: ${label}`)
          console.time(label)
          const res = next[methodName](options)
          console.timeEnd(label)

          return res
        }
      }),
      {},
      methodsToTrace
    )
  }
}


import { assocPath } from 'ramda'

/**
 * Given an environment, set the env for the given port
 * to be made available for the lifetime of the port
 *
 * @param {string} port - the type of port
 * @param {any} env - the environment to set for the given port type
 */
export function EnvironmentPlugin (env) {
  return {
    id: 'hyper63-plugin-environment',
    load: portConfig => assocPath(
      ['env'],
      env,
      portConfig
    )
  }
}


// Using mock redis
import redis from 'redis-mock'
import Async from 'crocks/Async'
import { append, always, lensPath, view, ifElse } from 'ramda'

const envLens = port => lensPath(['ports', port, 'env'])

/* eslint-disable no-unused-vars */

const createKey = (store, key) => `${store}_${key}`

export function RedisCachePlugin (pluginConfig) {
  let { ttl: defaultTtl, env } = pluginConfig

  let get, set, del, keys, scan

  return {
    id: 'hyper63-plugin-redis-cache',
    port: 'cache',
    load: portConfig => {
      env = env || view(envLens('cache')(portConfig))

      const client = redis.createClient(env)
      // redis commands
      get = Async.fromNode(client.get.bind(client))
      set = Async.fromNode(client.set.bind(client))
      del = Async.fromNode(client.del.bind(client))
      keys = Async.fromNode(client.keys.bind(client))
      scan = Async.fromNode(client.scan.bind(client))
    },
    link: portConfig => next => ({
      // From slack: maybe should just return a promise
      createStore: name => {
        // Terminating plugin, so does not call next, and simply returns a value
        return Async.of([])
          .map(append(createKey('store', name)))
          .map(append('active'))
          .chain(set)
          .map(always({ ok: true }))
          .toPromise()
      },
      // * Notice this method gets spread onto the top lvl port interface, despite this port being wrapped by a partially implemented port
      destroyStore: async name => {
        return del(createKey('store', name))
          .chain(() => keys(name + '_*'))
          .chain(
            ifElse(
              (keys) => keys.length > 0,
              del,
              (keys) => Async.of(keys)
            )
          )
          .map(always({ ok: true }))
          .toPromise()
      }
      // other Adapter methods
    })
  }
}

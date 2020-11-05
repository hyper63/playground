
import { EnvironmentPlugin } from './plugins/EnvironmentPlugin'
import { RedisCachePlugin } from './plugins/redisCachePlugin'
import { TracingPlugin } from './plugins/TracingPlugin'

export const config = {
  // some other config for hyper63 ...
  ports: [
    {
      port: 'cache',
      // plugins per port
      plugins: [
        EnvironmentPlugin({ url: process.env.REDIS || 'redis://redis:6379' }),
        TracingPlugin(['createStore']),
        RedisCachePlugin({ ttl: '5m' })
      ]
    }
  ],
  // ? plugins for whole hyper63 server, ie. GQL plugin
  plugins: [

  ]
}

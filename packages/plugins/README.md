
# Adapter Plugin PoC

This is an RFC for a proof of concept of Hyper63 adapter plugins. Multiple decisions were made in this PoC:

- The decision to use a JS config file
- The layout of the hyper63.config.js file
- The lifecycle of plugins
- The approach for how plugins are implemented and what they can do

All of these decisions are open to scrutiny and examination

## How to run

Prerequisite: a compatable node version. If you use `nvm`, simply run `nvm` to set the node version

```bash
yarn && yarn start
```

## Config file

Hyper63 would be configured via a Javascript config file, the `hyper63.config.js` file. This could potentially also be an `.rc` with a bit of additional boilerplate to require and load the correct plugins from `node_modules`. This file exports a configuartion object. The important bit for this RFC is the `ports` field, which contains an array of `portNode`, which are simple POJOs. Each node describes the configuration of a particular port in Hyper63. Each node may specify an array of `plugins`, that are picked up by Hyper63 and used at various points in the Hyper63 lifecycle. Subsequently each plugin has a particular API.

## Plugin API

A plugin is simply an object. This object first has an `id` that should be prefixed with `hyper63-plugin-`. Additionally, the plugin can specify a `port` to inform Hyper63 which port the plugin supports. For example if a plugin with port `cache` was invoked in a `portNode` for `data`, Hyper63 could throw an error on startup, allowing for early feedback.

Since most plugins will accept some sort of configuration, the recommendation is to create plugin factories (similar to Rollup plugins), which are simply functions that accept plugin specific configuration and then return the plugin object.

The order of plugins matters, and dictates how Hyper63 will compose the plugins to create the port interface (more on this later)

Currently, plugins can implement two method, both are optional, but at least one is required:

`load (portConfig: {}) -> {} | void`: `load` is invoked by Hyper63 on **startup**. This method can be used to perform side effects necessary for the plugin to run ie. instantiating a database client, fetching configuration from a remote service, processing environment variables, etc (See `RedisCachePlugin` for an example of this). Additionally this method can return an object, which is provided to subsequent `plugin.load()` invocations in the chain and subsequently to each plugins `link` method (See `EnvironmentPlugin` for an example of this).

`link (portConfig: {}) -> (next: Port) -> Port`: `link` is invoked and then composed by Hyper63 on `startup`. `link` receives the `portConfig` created by `load` as its arguement (an empty object if `load` is not defined). What is returned is a function that receives the next `link` in the chain. This function returns the actual port interface. In words, Hyper63 composes a port where each method follows the "Onion Pattern", wrapping the next port adapter implemented by the next plugin in the chain. A plugin may terminate by simply returning a value, instead using `next` to invoke the next plugin the chain. Because the port interface is built at startup, Hyper63 can validate whether the port interface is implemented at startup, allowing for early feedback.

An important note is that the port returned from `link` may only partially implement the port interface. This allows users to "mix and match" plugins to achieve the full port adapter implementation. It also enables plugin developers to only have to worry about implementing the methods they care about. **Ultimately Hyper63 should validate that the plugin combination provided by the user produces a complete port interface** (this would fairly simple to accomplish)

## Outstanding questions

- Could/Should there be server lvl plugins? ie. a plugin that adds a `/graphql` endpoint on Hyper63
- Could/Should there be multiple `portNode` of the same port type?

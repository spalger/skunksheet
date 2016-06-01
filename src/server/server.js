import express from 'express'
import horizon from '@horizon/server'
import hzServe from 'horizon/src/serve'
import { resolve } from 'path'
import { attempt } from 'bluebird'

attempt(async function main() {
  const rel = resolve.bind(null, __dirname, '../../')

  const config = hzServe.read_config_from_file(null, rel('.hz/config.toml'))
  if (process.env.NODE_ENV !== 'production') {
    Object.assign(config, hzServe.read_config_from_file(null, rel('.hz/config.dev.toml')))
  }

  const app = express()
  const httpServer = app.listen(8181)

  if (config.serve_static) {
    app.use(express.static(rel(config.serve_static)))
  }

  const hzServer = new horizon.Server(httpServer, {
    auto_create_collection: config.auto_create_collection,
    auto_create_index: config.auto_create_index,
    permissions: config.permissions,
    rdb_host: config.rdb_host,
    rdb_port: config.rdb_port,
    project_name: config.project_name,
    auth: {
      token_secret: config.token_secret,
      allow_unauthenticated: config.allow_unauthenticated,
      allow_anonymous: config.allow_anonymous,
      success_redirect: config.auth_redirect,
      failure_redirect: config.auth_redirect,
    },
  })

  await hzServer.ready()
  process.stdout.write('listening on port 8181\n')
})
.done()

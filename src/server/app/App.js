import express from 'express'
import { format as urlFormat } from 'url'
import Boom from 'boom'

import { Config } from '../config'
import { createLog } from '../log'

export class App {
  constructor(configPath) {
    this.express = express()
    this.config = new Config(configPath, process.env)
    this.log = createLog(this.config)
  }

  route({ path, method = 'get', handler }) {
    if (!this.route.pass) {
      // expose a symbol that route handlers can
      // resolve with to delegate to the pass handler
      this.route.pass = Symbol('Next route symbol')
    }

    this.express[method.toLowerCase()](path, async (req, res, next) => {
      try {
        if (await handler(req, res) === this.route.pass) {
          next()
          return
        }

        if (res.headersSent) return

        throw Boom.badImplementation(
          `Route for ${path} was resolved without sending a ` +
          'response! Either maintain the promise chain or ' +
          'resolve with app.route.pass to pass control to the ' +
          'next route'
        )
      } catch (err) {
        try {
          const berr = Boom.wrap(err)

          if (berr.isServer) {
            this.log.error(berr)
          }

          const { statusCode, payload, headers } = berr.output
          res.status(statusCode).set(headers).json(payload)
        } catch (errErr) {
          this.log.error(

`error handling error:
  original:
    ${!err ? undefined : err.stack}

  caused:
    ${errErr.stack}

`

          )
          next(new Error())
        }
      }
    })
  }

  getUri(overrides = {}) {
    const secure = this.config('server.secure')
    const hostname = this.config('server.hostname')
    const port = this.config('server.port')
    const protocol = secure ? 'https:' : 'http:'
    const showPort = (secure && port !== 443) || (!secure && port !== 80)

    return urlFormat({
      protocol,
      hostname,
      port: showPort ? port : undefined,
      ...overrides,
    })
  }

  getBotAccess() {
    return {
      github: {
        token: this.config('github.botAccountToken'),
      },
    }
  }
}


App.prototype.route.pass = Symbol('Route Skip Symbol')

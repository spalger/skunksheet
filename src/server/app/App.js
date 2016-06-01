import express from 'express'

import { createConfig } from '../config'
import { createLog } from '../log'
import { resolve } from 'path'

export class App {
  constructor() {
    this.express = express()
    this.config = createConfig('config.toml', process.env)
    this.log = createLog(this.config)

    this.log.debug('loaded config:', this.config())

    // serve the client bundle output
    const publicDir = resolve(__dirname, '../../client')
    this.express.use(express.static(publicDir))

    // enable "html5" style routing
    this.express.use((req, res, next) => {
      if (req.url.startsWith('/api/')) {
        this.log.debug('ignoring request for', req.url)
        next()
      } else {
        this.log.debug('sending index.html')
        res.sendFile(resolve(publicDir, 'index.html'))
      }
    })
  }
}

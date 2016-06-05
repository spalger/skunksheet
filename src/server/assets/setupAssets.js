import { resolve } from 'path'
import express from 'express'

export const setupAssets = app => {
  // serve the client bundle output
  const publicDir = resolve('client')
  app.express.use(express.static(publicDir))

  // enable "html5" style routing
  app.express.use((req, res, next) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/auth/')) {
      app.log.debug('ignoring request for', req.url)
      next()
    } else {
      app.log.debug('sending index.html')
      res.sendFile(resolve(publicDir, './index.html'))
    }
  })
}

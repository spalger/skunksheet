import { resolve } from 'path'
import { static as serveStatic } from 'express'
import pug from 'pug'

export const setupViews = app => {
  const { express } = app

  express.engine('jade', pug.__express)
  express.set('views', resolve('server/views'))
  express.locals.assetManifest = __non_webpack_require__(resolve('client/manifest.json')) // eslint-disable-line

  // serve assets for the views
  express.use(serveStatic(resolve('client')))

  // enable "html5" style routing
  express.use((req, res, next) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/auth/')) {
      next()
    } else {
      res.render('index.jade')
    }
  })
}

import { readFileSync } from 'fs'
import https from 'https'
import http from 'http'
import { fromNode as fn } from 'bluebird'

export const setupHttp = async (app) => {
  if (app.config('server.secure')) {
    app.server = https.createServer({
      cert: readFileSync(app.config('server.certFile')),
      key: readFileSync(app.config('server.keyFile')),
    }, app.express)
  } else {
    app.server = http.createServer(app.express)
  }

  await fn(cb => app.server.listen(app.config('server.port'), cb))
  app.log.info('Server listening at', app.getUri())
}

import { readFileSync } from 'fs'
import https from 'https'
import http from 'http'

export const createServer = (config, onRequest) => {
  if (config('server.secure')) {
    return https.createServer({
      cert: readFileSync(config('server.certFile')),
      key: readFileSync(config('server.keyFile')),
    }, onRequest)
  }

  return http.createServer(onRequest)
}

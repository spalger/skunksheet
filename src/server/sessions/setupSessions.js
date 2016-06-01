import session from 'express-session'
import sessionstore from 'sessionstore'
import { v4 } from 'uuid'

const hour = 3600000
const day = 24 * hour

export const setupSessions = app => {
  app.express.use(session({
    secret: app.config('sessions.secret'),
    resave: false,
    saveUninitialized: false,
    genid: () => v4(),
    cookie: {
      path: '/',
      httpOnly: true,
      secure: app.config('server.secure'),
      maxAge: 30 * day,
    },
    unset: 'destroy',
    store: sessionstore.createSessionStore({
      type: 'elasticsearch',
      host: app.config('es.uri'),
      prefix: '',
      index: 'sessions',
      typeName: 'session',
      pingInterval: 1010,
      timeout: 10000,
    }),
  }))
}

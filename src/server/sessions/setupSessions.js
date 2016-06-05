import cookieSession from 'cookie-session'

export const setupSessions = app => {
  app.express.set('trust proxy', 1) // trust first proxy

  app.express.use(cookieSession({
    name: 'session',
    secret: app.config('session.secret'),
    domain: app.config('server.hostname'),
    secure: app.config('server.secure'),
    httpOnly: true,
  }))
}
